import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "#/components/ui/button.tsx";

export function NotFound({ title = "Page not found" }: { title?: string }) {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-4">
			<p className="font-mono text-xs tracking-[0.28em] text-fg-faint uppercase">
				404 · Not Found
			</p>
			<h1 className="font-display font-semibold text-2xl text-fg">{title}</h1>
			<Link to="/">
				<Button variant="outline" size="sm">
					<ArrowLeft />
					Back to library
				</Button>
			</Link>
		</main>
	);
}
