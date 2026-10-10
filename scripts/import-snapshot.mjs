// @ts-check

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "leetcode";
const inPath = resolve(process.argv[2] ?? "public/snapshot.json");

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

async function upsertAll(name, docs) {
	if (docs.length === 0) return;
	const bulk = db.collection(name).initializeUnorderedBulkOp();
	for (const doc of docs) bulk.find({ _id: doc._id }).upsert().replaceOne(doc);
	await bulk.execute();
}

await upsertAll("problems", problems);
await upsertAll("examples", examples);
await upsertAll("solutions", solutions);

const maxId = (docs) => docs.reduce((max, d) => Math.max(max, d._id), 0);
const counters = db.collection("counters");
for (const [name, docs] of [
	["problems", problems],
	["examples", examples],
	["solutions", solutions],
]) {
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
