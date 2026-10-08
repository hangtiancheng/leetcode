// @ts-check

// Seeds MongoDB from a snapshot.json (default: public/snapshot.json). This is
// the migration path off SQLite — the committed snapshot was exported from the
// old database — and stays useful for re-seeding any environment. Idempotent:
// rows are upserted by id and the id counters only ever move forward.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";

/**
 * JSON snapshot shapes, mirrored from `src/data/problems.static.ts` (dates are
 * serialized as ISO strings there).
 *
 * @typedef {object} SnapshotProblem
 * @property {number} id
 * @property {string} title
 * @property {string} difficulty
 * @property {string} description
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {object} SnapshotExample
 * @property {number} id
 * @property {number} problemId
 * @property {string} input
 * @property {string} output
 * @property {number} order
 *
 * @typedef {object} SnapshotSolution
 * @property {number} id
 * @property {number} problemId
 * @property {string} language
 * @property {string} code
 * @property {string} updatedAt
 *
 * @typedef {object} Snapshot
 * @property {string} version
 * @property {SnapshotProblem[]} problems
 * @property {SnapshotExample[]} examples
 * @property {SnapshotSolution[]} solutions
 */

/**
 * Mongo document shapes, mirrored from `src/db.ts`.
 *
 * @typedef {object} ProblemDoc
 * @property {number} _id
 * @property {string} title
 * @property {string} difficulty
 * @property {string} description
 * @property {Date} createdAt
 * @property {Date} updatedAt
 *
 * @typedef {object} ExampleDoc
 * @property {number} _id
 * @property {number} problemId
 * @property {string} input
 * @property {string} output
 * @property {number} order
 *
 * @typedef {object} SolutionDoc
 * @property {number} _id
 * @property {number} problemId
 * @property {string} language
 * @property {string} code
 * @property {Date} updatedAt
 *
 * @typedef {ProblemDoc | ExampleDoc | SolutionDoc} Doc
 *
 * @typedef {object} CounterDoc
 * @property {string} _id
 * @property {number} seq
 */

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "leetcode";
const inPath = resolve(process.argv[2] ?? "public/snapshot.json");

/** @type {Snapshot} */
const snapshot = JSON.parse(readFileSync(inPath, "utf8"));

const problems = snapshot.problems.map(
	({ id, createdAt, updatedAt, ...p }) => ({
		_id: id,
		...p,
		createdAt: new Date(createdAt),
		updatedAt: new Date(updatedAt),
	}),
);
const examples = snapshot.examples.map(({ id, ...e }) => ({ _id: id, ...e }));
const solutions = snapshot.solutions.map(({ id, updatedAt, ...s }) => ({
	_id: id,
	...s,
	updatedAt: new Date(updatedAt),
}));

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

/**
 * @param {string} name
 * @param {Doc[]} docs
 */
async function upsertAll(name, docs) {
	if (docs.length === 0) return;
	const bulk = db.collection(name).initializeUnorderedBulkOp();
	for (const doc of docs) bulk.find({ _id: doc._id }).upsert().replaceOne(doc);
	await bulk.execute();
}

await upsertAll("problems", problems);
await upsertAll("examples", examples);
await upsertAll("solutions", solutions);

// Keep the autoincrement counters ahead of everything that was imported.
/**
 * @template {{ _id: number }} T
 * @param {T[]} docs
 * @returns {number}
 */
const maxId = (docs) => docs.reduce((max, d) => Math.max(max, d._id), 0);
const counters = /** @type {import("mongodb").Collection<CounterDoc>} */ (
	db.collection("counters")
);
for (const [name, docs] of /** @type {[string, { _id: number }[]][]} */ ([
	["problems", problems],
	["examples", examples],
	["solutions", solutions],
])) {
	await counters.updateOne(
		{ _id: name },
		[
			{
				$set: {
					seq: { $max: [maxId(docs), { $ifNull: ["$seq", 0] }] },
				},
			},
		],
		{ upsert: true },
	);
}

await db.collection("examples").createIndex({ problemId: 1, order: 1 });
await db
	.collection("solutions")
	.createIndex({ problemId: 1, language: 1 }, { unique: true });

await client.close();

console.log(
	`imported ${inPath} → ${uri}/${dbName}\n` +
		`  ${problems.length} problems, ${examples.length} examples, ` +
		`${solutions.length} solutions`,
);
