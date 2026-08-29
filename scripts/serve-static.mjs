import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const dir = resolve(".output/public");
const base = "/leetcode";
const port = 4321;

const TYPES = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript",
	".css": "text/css",
	".json": "application/json",
	".svg": "image/svg+xml",
	".woff2": "font/woff2",
	".map": "application/json",
};

createServer((req, res) => {
	const { pathname } = new URL(req.url, "http://localhost");

	if (pathname === base) {
		res.writeHead(301, { location: `${base}/` }).end();
		return;
	}
	if (!pathname.startsWith(`${base}/`)) {
		res.writeHead(404).end("outside base");
		return;
	}

	const rel = normalize(pathname.slice(base.length)).replace(/^(\.\.[/\\])+/, "");
	let file = join(dir, rel);
	if (!file.startsWith(dir)) {
		res.writeHead(403).end("forbidden");
		return;
	}
	if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");

	const status = existsSync(file) ? 200 : 404;
	if (status === 404) file = join(dir, "404.html");

	res.writeHead(status, {
		"content-type": TYPES[extname(file)] ?? "application/octet-stream",
	});
	createReadStream(file).pipe(res);
}).listen(port, () => {
	console.log(`serving ${dir} at http://localhost:${port}${base}/`);
});
