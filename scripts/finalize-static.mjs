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

// GitHub Pages cannot rewrite unknown paths to the shell, so it serves 404.html
// instead. Making that the shell is what lets /problems/3 survive a refresh.
copyFileSync(shell, resolve(dir, "404.html"));

// Without this GitHub Pages runs Jekyll, which drops files starting with "_".
writeFileSync(resolve(dir, ".nojekyll"), "");

console.log(`static site ready: ${dir}`);
