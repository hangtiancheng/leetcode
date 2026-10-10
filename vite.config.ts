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
		noExternal: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
	},
	resolve: {
		tsconfigPaths: true,
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
