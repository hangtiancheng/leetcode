import { type Collection, type Db, MongoClient } from "mongodb";

/**
 * MongoDB is the source of truth for the SSR app. Documents mirror the old
 * SQLite tables: numeric ids stay the primary identifier (routes, the JSON
 * snapshot and the IndexedDB client all key off them), so the numeric id is
 * stored as Mongo's `_id` and mapped back to `id` at the data seam.
 */
export interface ProblemDoc {
	_id: number;
	title: string;
	difficulty: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ExampleDoc {
	_id: number;
	problemId: number;
	input: string;
	output: string;
	order: number;
}

export interface SolutionDoc {
	_id: number;
	problemId: number;
	language: string;
	code: string;
	updatedAt: Date;
}

interface CounterDoc {
	_id: string;
	seq: number;
}

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "leetcode";

declare global {
	var __mongo: MongoClient | undefined;
}

export const mongo = globalThis.__mongo ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
	globalThis.__mongo = mongo;
}

export function db(): Db {
	return mongo.db(dbName);
}

export const problems = (): Collection<ProblemDoc> =>
	db().collection<ProblemDoc>("problems");
export const examples = (): Collection<ExampleDoc> =>
	db().collection<ExampleDoc>("examples");
export const solutions = (): Collection<SolutionDoc> =>
	db().collection<SolutionDoc>("solutions");
const counters = (): Collection<CounterDoc> =>
	db().collection<CounterDoc>("counters");

/**
 * Atomically reserve `count` sequential numeric ids for a collection, keeping
 * the autoincrement behaviour the SQLite schema used to provide.
 */
export async function reserveIds(name: string, count = 1): Promise<number[]> {
	const updated = await counters().findOneAndUpdate(
		{ _id: name },
		{ $inc: { seq: count } },
		{ upsert: true, returnDocument: "after" },
	);
	if (!updated) throw new Error(`Failed to reserve ids for "${name}"`);
	return Array.from({ length: count }, (_, i) => updated.seq - count + 1 + i);
}

let indexesReady: Promise<void> | undefined;

/** Mirrors the SQLite schema's secondary/unique indexes. Runs once per process. */
export function ensureIndexes(): Promise<void> {
	indexesReady ??= Promise.all([
		examples().createIndex({ problemId: 1, order: 1 }),
		solutions().createIndex({ problemId: 1, language: 1 }, { unique: true }),
	]).then(() => undefined);
	return indexesReady;
}
