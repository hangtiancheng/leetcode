import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const staticBuild = process.env.STATIC_BUILD === "1";
const base = staticBuild ? (process.env.STATIC_BASE ?? "/") : "/";

const config = defineConfig({
	base,
	ssr: {
		// These ship .css imports Node can't load when externalized.
		noExternal: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
	},
	resolve: {
		tsconfigPaths: true,
		// Swapping the seam keeps Prisma and the server functions out of the
		// static bundle: the UI talks to IndexedDB instead.
		alias: staticBuild
			? { "#/data/problems.ts": resolve("src/data/problems.static.ts") }
			: {},
	},
	plugins: [
		devtools(),
		tailwindcss(),
		tanstackStart({
			router: { basepath: base },
			...(staticBuild
				? { spa: { enabled: true, prerender: { outputPath: "/index" } } }
				: {}),
		}),
		nitro(),
		viteReact(),
	],
});

export default config;
