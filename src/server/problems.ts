import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	type ExampleDoc,
	ensureIndexes,
	examples,
	type ProblemDoc,
	problems,
	reserveIds,
	type SolutionDoc,
	solutions,
} from "#/db.ts";
import { LANGUAGE_IDS, STARTER_CODE } from "#/lib/languages.ts";

const exampleSchema = z.object({
	input: z.string().min(1, "Example input is required"),
	output: z.string().min(1, "Example output is required"),
});

const problemFields = z.object({
	title: z.string().trim().min(1, "Title is required"),
	difficulty: z.enum(["Easy", "Medium", "Hard"]),
	description: z.string().trim().min(1, "Problem description is required"),
	examples: z.array(exampleSchema).min(1, "At least one example is required"),
});

const languageSchema = z.enum(LANGUAGE_IDS);

export interface ExampleRecord {
	id: number;
	problemId: number;
	input: string;
	output: string;
	order: number;
}

export interface SolutionRecord {
	id: number;
	problemId: number;
	language: string;
	code: string;
	updatedAt: Date;
}

export interface ProblemRecord {
	id: number;
	title: string;
	difficulty: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ProblemListItem extends ProblemRecord {
	examples: ExampleRecord[];
	solutions: { language: string }[];
}

export interface ProblemDetail extends ProblemRecord {
	examples: ExampleRecord[];
	solutions: SolutionRecord[];
}

const toProblem = ({ _id, ...doc }: ProblemDoc): ProblemRecord => ({
	id: _id,
	...doc,
});
const toExample = ({ _id, ...doc }: ExampleDoc): ExampleRecord => ({
	id: _id,
	...doc,
});
const toSolution = ({ _id, ...doc }: SolutionDoc): SolutionRecord => ({
	id: _id,
	...doc,
});

function groupBy<T>(rows: T[], key: (row: T) => number) {
	const groups = new Map<number, T[]>();
	for (const row of rows) {
		const group = groups.get(key(row));
		if (group) group.push(row);
		else groups.set(key(row), [row]);
	}
	return groups;
}

export const listProblems = createServerFn({ method: "GET" }).handler(
	async () => {
		await ensureIndexes();
		const [problemDocs, exampleDocs, solutionDocs] = await Promise.all([
			problems().find().sort({ _id: 1 }).toArray(),
			examples().find().sort({ problemId: 1, order: 1, _id: 1 }).toArray(),
			solutions()
				.find({}, { projection: { problemId: 1, language: 1 } })
				.sort({ problemId: 1, _id: 1 })
				.toArray(),
		]);

		const examplesByProblem = groupBy(
			exampleDocs.map(toExample),
			(e) => e.problemId,
		);
		const solutionsByProblem = groupBy(solutionDocs, (s) => s.problemId);

		return problemDocs.map(toProblem).map((problem) => ({
			...problem,
			examples: examplesByProblem.get(problem.id) ?? [],
			solutions: (solutionsByProblem.get(problem.id) ?? []).map((s) => ({
				language: s.language,
			})),
		}));
	},
);

export const getProblem = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.number().int() }))
	.handler(async ({ data }) => {
		await ensureIndexes();
		const doc = await problems().findOne({ _id: data.id });
		if (!doc) return null;

		const [exampleDocs, solutionDocs] = await Promise.all([
			examples()
				.find({ problemId: data.id })
				.sort({ order: 1, _id: 1 })
				.toArray(),
			solutions().find({ problemId: data.id }).sort({ _id: 1 }).toArray(),
		]);

		return {
			...toProblem(doc),
			examples: exampleDocs.map(toExample),
			solutions: solutionDocs.map(toSolution),
		};
	});

export const createProblem = createServerFn({ method: "POST" })
	.validator(problemFields)
	.handler(async ({ data }) => {
		await ensureIndexes();
		const now = new Date();
		const [[problemId], exampleIds, solutionIds] = await Promise.all([
			reserveIds("problems"),
			reserveIds("examples", data.examples.length),
			reserveIds("solutions", LANGUAGE_IDS.length),
		]);

		const doc: ProblemDoc = {
			_id: problemId,
			title: data.title,
			difficulty: data.difficulty,
			description: data.description,
			createdAt: now,
			updatedAt: now,
		};
		await problems().insertOne(doc);
		await examples().insertMany(
			data.examples.map((example, order) => ({
				_id: exampleIds[order],
				problemId,
				input: example.input,
				output: example.output,
				order,
			})),
		);
		await solutions().insertMany(
			LANGUAGE_IDS.map((language, i) => ({
				_id: solutionIds[i],
				problemId,
				language,
				code: STARTER_CODE[language],
				updatedAt: now,
			})),
		);

		return toProblem(doc);
	});

export const updateProblem = createServerFn({ method: "POST" })
	.validator(problemFields.extend({ id: z.number().int() }))
	.handler(async ({ data }) => {
		await ensureIndexes();
		const existing = await problems().findOne({ _id: data.id });
		if (!existing) throw new Error("Problem not found");

		const exampleIds = await reserveIds("examples", data.examples.length);
		await examples().deleteMany({ problemId: data.id });
		await examples().insertMany(
			data.examples.map((example, order) => ({
				_id: exampleIds[order],
				problemId: data.id,
				input: example.input,
				output: example.output,
				order,
			})),
		);

		const updated = await problems().findOneAndUpdate(
			{ _id: data.id },
			{
				$set: {
					title: data.title,
					difficulty: data.difficulty,
					description: data.description,
					updatedAt: new Date(),
				},
			},
			{ returnDocument: "after" },
		);
		if (!updated) throw new Error("Problem not found");
		return toProblem(updated);
	});

export const deleteProblem = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.number().int() }))
	.handler(async ({ data }) => {
		await ensureIndexes();
		await Promise.all([
			solutions().deleteMany({ problemId: data.id }),
			examples().deleteMany({ problemId: data.id }),
			problems().deleteOne({ _id: data.id }),
		]);
		return { deleted: true };
	});

export const saveSolution = createServerFn({ method: "POST" })
	.validator(
		z.object({
			problemId: z.number().int(),
			language: languageSchema,
			code: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		await ensureIndexes();
		const updated = await solutions().findOneAndUpdate(
			{ problemId: data.problemId, language: data.language },
			{ $set: { code: data.code, updatedAt: new Date() } },
			{ returnDocument: "after" },
		);
		if (!updated) throw new Error("No solution found for this language");
		return toSolution(updated);
	});
