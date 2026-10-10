// @ts-check

import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(".output/public");
const shell = resolve(dir, "index.html");

if (!existsSync(shell)) {
	console.error(`Missing SPA shell: ${shell}`);
	process.exit(1);
}
if (!existsSync(resolve(dir, "snapshot.json"))) {
	console.error(`Missing snapshot.json in ${dir}. Run "pnpm db:export" first.`);
	process.exit(1);
}

copyFileSync(shell, resolve(dir, "404.html"));

writeFileSync(resolve(dir, ".nojekyll"), "");

console.log(`static site ready: ${dir}`);
