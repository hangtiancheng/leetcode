// @ts-check

// Serves the build:static output the way GitHub Pages does: under a base path,
// with unknown paths falling back to 404.html. `vite preview` does neither.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const dir = resolve(".output/public");
const base = (process.env.STATIC_BASE ?? "/leetcode/").replace(/\/$/, "");
const port = Number(process.env.PORT ?? 4321);

/** @type {Record<string, string>} */
const CONTENT_TYPES = {
	".css": "text/css",
	".html": "text/html; charset=utf-8",
	".js": "text/javascript",
	".json": "application/json",
	".map": "application/json",
	".svg": "image/svg+xml",
	".ttf": "font/ttf",
	".woff2": "font/woff2",
};

createServer((req, res) => {
	const { pathname } = new URL(req.url ?? "/", "http://localhost");

	if (base && pathname === base) {
		res.writeHead(301, { location: `${base}/` }).end();
		return;
	}
	if (!pathname.startsWith(`${base}/`)) {
		res.writeHead(404).end("outside base path");
		return;
	}

	let file = join(dir, normalize(pathname.slice(base.length)));
	if (!file.startsWith(dir)) {
		res.writeHead(403).end("forbidden");
		return;
	}
	if (existsSync(file) && statSync(file).isDirectory()) {
		file = join(file, "index.html");
	}

	const status = existsSync(file) ? 200 : 404;
	if (status === 404) file = join(dir, "404.html");

	res.writeHead(status, {
		"content-type": CONTENT_TYPES[extname(file)] ?? "application/octet-stream",
	});
	createReadStream(file).pipe(res);
}).listen(port, () => {
	console.log(`serving ${dir} at http://localhost:${port}${base}/`);
});
