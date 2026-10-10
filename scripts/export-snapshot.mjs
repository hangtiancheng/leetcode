// @ts-check

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "leetcode";
const outPath = resolve("public/snapshot.json");

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const problems = db.collection("problems");
const examples = db.collection("examples");
const solutions = db.collection("solutions");

const [problemDocs, exampleDocs, solutionDocs] = await Promise.all([
	problems.find().sort({ _id: 1 }).toArray(),
	examples.find().sort({ problemId: 1, order: 1, _id: 1 }).toArray(),
	solutions.find().sort({ problemId: 1, _id: 1 }).toArray(),
]);
await client.close();

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
