import Dexie, { type EntityTable } from "dexie";
import type { LanguageId } from "#/lib/languages.ts";
import { LANGUAGE_IDS, STARTER_CODE } from "#/lib/languages.ts";
import type {
	ProblemDetail,
	ProblemListItem,
	SolutionRecord,
} from "#/server/problems.ts";

export type { ProblemDetail, ProblemListItem, SolutionRecord };

type ProblemRow = Omit<ProblemListItem, "examples" | "solutions">;
type ExampleRow = ProblemListItem["examples"][number];
type SolutionRow = SolutionRecord;

interface MetaRow {
	key: string;
	value: string;
}

class LeetCodeDb extends Dexie {
	problems!: EntityTable<ProblemRow, "id">;
	examples!: EntityTable<ExampleRow, "id">;
	solutions!: EntityTable<SolutionRow, "id">;
	meta!: EntityTable<MetaRow, "key">;

	constructor() {
		super("leetcode");
		this.version(1).stores({
			problems: "++id",
			examples: "++id, problemId",
			solutions: "++id, problemId, [problemId+language]",
			meta: "key",
		});
	}
}

let instance: LeetCodeDb | undefined;

function getDb() {
	instance ??= new LeetCodeDb();
	return instance;
}

interface SnapshotJson {
	version: string;
	problems: (Omit<ProblemRow, "createdAt" | "updatedAt"> & {
		createdAt: string;
		updatedAt: string;
	})[];
	examples: ExampleRow[];
	solutions: (Omit<SolutionRow, "updatedAt"> & { updatedAt: string })[];
}

const SNAPSHOT_KEY = "snapshot";

async function fetchSnapshot(): Promise<SnapshotJson | null> {
	try {
		const res = await fetch(`${import.meta.env.BASE_URL}snapshot.json`, {
			cache: "no-cache",
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return (await res.json()) as SnapshotJson;
	} catch (error) {
		console.warn("[leetcode] snapshot unavailable, keeping local data", error);
		return null;
	}
}

async function seed(snapshot: SnapshotJson) {
	const db = getDb();
	await db.transaction(
		"rw",
		[db.problems, db.examples, db.solutions, db.meta],
		async () => {
			await Promise.all([
				db.problems.clear(),
				db.examples.clear(),
				db.solutions.clear(),
			]);
			await db.problems.bulkAdd(
				snapshot.problems.map((p) => ({
					...p,
					createdAt: new Date(p.createdAt),
					updatedAt: new Date(p.updatedAt),
				})),
			);
			await db.examples.bulkAdd(snapshot.examples);
			await db.solutions.bulkAdd(
				snapshot.solutions.map((s) => ({
					...s,
					updatedAt: new Date(s.updatedAt),
				})),
			);
			await db.meta.put({ key: SNAPSHOT_KEY, value: snapshot.version });
		},
	);
}

let ready: Promise<void> | undefined;

function ensureReady() {
	ready ??= (async () => {
		const snapshot = await fetchSnapshot();
		if (!snapshot) return;
		const stored = await getDb().meta.get(SNAPSHOT_KEY);
		if (stored?.value === snapshot.version) return;
		await seed(snapshot);
	})();
	return ready;
}

function groupBy<T>(rows: T[], key: (row: T) => number) {
	const groups = new Map<number, T[]>();
	for (const row of rows) {
		const group = groups.get(key(row));
		if (group) group.push(row);
		else groups.set(key(row), [row]);
	}
	return groups;
}

const byId = (a: { id: number }, b: { id: number }) => a.id - b.id;
const byOrder = (a: ExampleRow, b: ExampleRow) => a.order - b.order;

interface ProblemInput {
	title: string;
	difficulty: string;
	description: string;
	examples: { input: string; output: string }[];
}

export async function listProblems(): Promise<ProblemListItem[]> {
	await ensureReady();
	const db = getDb();
	const [problems, examples, solutions] = await Promise.all([
		db.problems.toArray(),
		db.examples.toArray(),
		db.solutions.toArray(),
	]);
	const examplesByProblem = groupBy(examples, (e) => e.problemId);
	const solutionsByProblem = groupBy(solutions, (s) => s.problemId);

	return problems.sort(byId).map((problem) => ({
		...problem,
		examples: (examplesByProblem.get(problem.id) ?? []).sort(byOrder),
		solutions: (solutionsByProblem.get(problem.id) ?? [])
			.sort(byId)
			.map((s) => ({ language: s.language })),
	}));
}

export async function getProblem({
	data,
}: {
	data: { id: number };
}): Promise<ProblemDetail | null> {
	await ensureReady();
	const db = getDb();
	const problem = await db.problems.get(data.id);
	if (!problem) return null;

	const [examples, solutions] = await Promise.all([
		db.examples.where("problemId").equals(data.id).toArray(),
		db.solutions.where("problemId").equals(data.id).toArray(),
	]);

	return {
		...problem,
		examples: examples.sort(byOrder),
		solutions: solutions.sort(byId),
	};
}

export async function createProblem({
	data,
}: {
	data: ProblemInput;
}): Promise<ProblemRow> {
	await ensureReady();
	const db = getDb();
	const now = new Date();

	return db.transaction(
		"rw",
		[db.problems, db.examples, db.solutions],
		async () => {
			const id = await db.problems.add({
				title: data.title,
				difficulty: data.difficulty,
				description: data.description,
				createdAt: now,
				updatedAt: now,
			});
			await db.examples.bulkAdd(
				data.examples.map((example, order) => ({
					problemId: id,
					input: example.input,
					output: example.output,
					order,
				})),
			);
			await db.solutions.bulkAdd(
				LANGUAGE_IDS.map((language) => ({
					problemId: id,
					language,
					code: STARTER_CODE[language],
					updatedAt: now,
				})),
			);
			return {
				id,
				title: data.title,
				difficulty: data.difficulty,
				description: data.description,
				createdAt: now,
				updatedAt: now,
			};
		},
	);
}

export async function updateProblem({
	data,
}: {
	data: ProblemInput & { id: number };
}): Promise<ProblemRow> {
	await ensureReady();
	const db = getDb();

	return db.transaction("rw", [db.problems, db.examples], async () => {
		const problem = await db.problems.get(data.id);
		if (!problem) throw new Error("Problem not found");

		await db.examples.where("problemId").equals(data.id).delete();
		await db.examples.bulkAdd(
			data.examples.map((example, order) => ({
				problemId: data.id,
				input: example.input,
				output: example.output,
				order,
			})),
		);

		const updated: ProblemRow = {
			...problem,
			title: data.title,
			difficulty: data.difficulty,
			description: data.description,
			updatedAt: new Date(),
		};
		await db.problems.put(updated);
		return updated;
	});
}

export async function deleteProblem({
	data,
}: {
	data: { id: number };
}): Promise<{ deleted: true }> {
	await ensureReady();
	const db = getDb();

	await db.transaction(
		"rw",
		[db.problems, db.examples, db.solutions],
		async () => {
			await db.solutions.where("problemId").equals(data.id).delete();
			await db.examples.where("problemId").equals(data.id).delete();
			await db.problems.delete(data.id);
		},
	);

	return { deleted: true };
}

export async function saveSolution({
	data,
}: {
	data: { problemId: number; language: LanguageId; code: string };
}): Promise<SolutionRow> {
	await ensureReady();
	const db = getDb();

	const solution = await db.solutions
		.where({ problemId: data.problemId, language: data.language })
		.first();
	if (!solution) throw new Error("No solution found for this language");

	const updated: SolutionRow = {
		...solution,
		code: data.code,
		updatedAt: new Date(),
	};
	await db.solutions.put(updated);
	return updated;
}
