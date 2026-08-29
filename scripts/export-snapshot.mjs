// @ts-check

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = (process.env.DATABASE_URL ?? "file:./dev.db").replace(
  /^file:/,
  "",
);
const outPath = resolve("public/snapshot.json");

const db = new DatabaseSync(resolve(dbPath), { readOnly: true });
const all = (/** @type {string} */ sql) => db.prepare(sql).all();

const data = {
  problems: all("SELECT * FROM Problem ORDER BY id"),
  examples: all("SELECT * FROM Example ORDER BY problemId, [order], id"),
  solutions: all("SELECT * FROM Solution ORDER BY problemId, id"),
  revisions: all("SELECT * FROM SolutionRevision ORDER BY solutionId, version"),
};
db.close();

const version = createHash("sha256")
  .update(JSON.stringify(data))
  .digest("hex")
  .slice(0, 16);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify({ version, ...data }, null, "\t")}\n`);

console.log(
  `snapshot ${version} → ${outPath}\n` +
    `  ${data.problems.length} problems, ${data.examples.length} examples, ` +
    `${data.solutions.length} solutions, ${data.revisions.length} revisions`,
);
