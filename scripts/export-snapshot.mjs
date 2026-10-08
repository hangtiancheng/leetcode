// @ts-check

// Dumps the MongoDB database straight into public/snapshot.json. The committed
// snapshot is what the GitHub Pages build ships, and the static client seeds it
// into IndexedDB on first load (or whenever the version hash changes).

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { MongoClient } from "mongodb";

/**
 * Mongo document shapes, mirrored from `src/db.ts`. The numeric `_id` doubles as
 * the app-facing `id`.
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
 */

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "leetcode";
const outPath = resolve("public/snapshot.json");

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const problems = /** @type {import("mongodb").Collection<ProblemDoc>} */ (
	db.collection("problems")
);
const examples = /** @type {import("mongodb").Collection<ExampleDoc>} */ (
	db.collection("examples")
);
const solutions = /** @type {import("mongodb").Collection<SolutionDoc>} */ (
	db.collection("solutions")
);

const [problemDocs, exampleDocs, solutionDocs] = await Promise.all([
	problems.find().sort({ _id: 1 }).toArray(),
	examples.find().sort({ problemId: 1, order: 1, _id: 1 }).toArray(),
	solutions.find().sort({ problemId: 1, _id: 1 }).toArray(),
]);
await client.close();

/**
 * Numeric `_id` is the app-facing `id`; everything else is already plain JSON.
 *
 * @template {{ _id: number }} T
 * @param {T[]} docs
 * @returns {(Omit<T, "_id"> & { id: number })[]}
 */
const withIds = (docs) => docs.map(({ _id, ...doc }) => ({ id: _id, ...doc }));

const data = {
	problems: withIds(problemDocs),
	examples: withIds(exampleDocs),
	solutions: withIds(solutionDocs),
};

const version = createHash("sha256")
	.update(JSON.stringify(data))
	.digest("hex")
	.slice(0, 16);

mkdirSync(dirname(outPath), { recursive: true });
const json = JSON.stringify({ version, ...data });
writeFileSync(outPath, json);

console.log(
	`snapshot ${version} → ${outPath} (${(json.length / 1024).toFixed(1)} kB)\n` +
		`  ${data.problems.length} problems, ${data.examples.length} examples, ` +
		`${data.solutions.length} solutions`,
);
