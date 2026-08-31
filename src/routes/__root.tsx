import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { NotFound } from "#/components/not-found.tsx";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "theme-color",
				media: "(prefers-color-scheme: light)",
				content: "#e6e9ef",
			},
			{
				name: "theme-color",
				media: "(prefers-color-scheme: dark)",
				content: "#11111b",
			},
			{
				title: "Playground",
			},
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: `${import.meta.env.BASE_URL}favicon.svg`,
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="min-h-full" suppressHydrationWarning>
			<head>
				<HeadContent />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: static theme bootstrap, no user input
					dangerouslySetInnerHTML={{
						__html: `try{var m=localStorage.getItem("playground-theme");if(m==="dark"||(m!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
					}}
				/>
			</head>
			<body className="min-h-full bg-background font-sans text-foreground antialiased selection:bg-ctp-mauve/30">
				{children}
				<Scripts />
			</body>
		</html>
	);
}
