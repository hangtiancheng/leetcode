import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "#/db.ts";
import { LANGUAGE_IDS, STARTER_CODE } from "#/lib/languages.ts";

const exampleSchema = z.object({
	input: z.string().min(1, "示例输入不能为空"),
	output: z.string().min(1, "示例输出不能为空"),
});

const problemFields = z.object({
	title: z.string().trim().min(1, "标题不能为空"),
	difficulty: z.enum(["Easy", "Medium", "Hard"]),
	description: z.string().trim().min(1, "题目描述不能为空"),
	examples: z.array(exampleSchema).min(1, "至少需要一个示例"),
});

const languageSchema = z.enum(LANGUAGE_IDS);

export const listProblems = createServerFn({ method: "GET" }).handler(
	async () => {
		return prisma.problem.findMany({
			orderBy: { id: "asc" },
			include: {
				examples: { orderBy: { order: "asc" } },
				solutions: {
					select: { language: true, version: true },
					orderBy: { id: "asc" },
				},
			},
		});
	},
);

export const getProblem = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.number().int() }))
	.handler(async ({ data }) => {
		return prisma.problem.findUnique({
			where: { id: data.id },
			include: {
				examples: { orderBy: { order: "asc" } },
				solutions: {
					orderBy: { id: "asc" },
					include: { _count: { select: { revisions: true } } },
				},
			},
		});
	});

export const createProblem = createServerFn({ method: "POST" })
	.validator(problemFields)
	.handler(async ({ data }) => {
		return prisma.problem.create({
			data: {
				title: data.title,
				difficulty: data.difficulty,
				description: data.description,
				examples: {
					create: data.examples.map((e, i) => ({ ...e, order: i })),
				},
				solutions: {
					create: LANGUAGE_IDS.map((language) => ({
						language,
						code: STARTER_CODE[language],
					})),
				},
			},
		});
	});

export const updateProblem = createServerFn({ method: "POST" })
	.validator(problemFields.extend({ id: z.number().int() }))
	.handler(async ({ data }) => {
		return prisma.$transaction(async (tx) => {
			await tx.example.deleteMany({ where: { problemId: data.id } });
			return tx.problem.update({
				where: { id: data.id },
				data: {
					title: data.title,
					difficulty: data.difficulty,
					description: data.description,
					examples: {
						create: data.examples.map((e, i) => ({ ...e, order: i })),
					},
				},
			});
		});
	});

export const deleteProblem = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.number().int() }))
	.handler(async ({ data }) => {
		await prisma.problem.delete({ where: { id: data.id } });
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
		const solution = await prisma.solution.findUnique({
			where: {
				problemId_language: {
					problemId: data.problemId,
					language: data.language,
				},
			},
		});
		if (!solution) throw new Error("未找到该语言的参考答案");

		return prisma.$transaction(async (tx) => {
			await tx.solutionRevision.create({
				data: {
					solutionId: solution.id,
					code: solution.code,
					version: solution.version,
				},
			});
			return tx.solution.update({
				where: { id: solution.id },
				data: { code: data.code, version: solution.version + 1 },
				include: { _count: { select: { revisions: true } } },
			});
		});
	});

export const rollbackSolution = createServerFn({ method: "POST" })
	.validator(
		z.object({
			problemId: z.number().int(),
			language: languageSchema,
		}),
	)
	.handler(async ({ data }) => {
		const solution = await prisma.solution.findUnique({
			where: {
				problemId_language: {
					problemId: data.problemId,
					language: data.language,
				},
			},
		});
		if (!solution) throw new Error("未找到该语言的参考答案");

		const lastRevision = await prisma.solutionRevision.findFirst({
			where: { solutionId: solution.id },
			orderBy: { version: "desc" },
		});
		if (!lastRevision) throw new Error("没有可回滚的历史版本");

		return prisma.$transaction(async (tx) => {
			await tx.solutionRevision.delete({ where: { id: lastRevision.id } });
			return tx.solution.update({
				where: { id: solution.id },
				data: { code: lastRevision.code, version: lastRevision.version },
				include: { _count: { select: { revisions: true } } },
			});
		});
	});

export type ProblemListItem = Awaited<ReturnType<typeof listProblems>>[number];

export type ProblemDetail = NonNullable<Awaited<ReturnType<typeof getProblem>>>;

export type SolutionWithMeta = ProblemDetail["solutions"][number];
