import { Link } from "@tanstack/react-router";
import type * as React from "react";

import { ThemeToggle } from "#/components/theme-toggle.tsx";
import { cn } from "#/lib/utils.ts";

export function AppHeader({
	right,
	className,
}: {
	right?: React.ReactNode;
	className?: string;
}) {
	return (
		<header
			className={cn(
				"sticky top-0 z-40 flex h-12 items-center justify-between gap-3 border-b border-line bg-bg-panel/85 px-4 backdrop-blur-md sm:px-6",
				className,
			)}
		>
			<Link
				to="/"
				className="flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-tight text-fg"
			>
				<span className="size-2.5 rounded-[3px] bg-ctp-mauve" />
				playground
			</Link>
			<div className="flex items-center gap-1.5">
				<ThemeToggle />
				{right}
			</div>
		</header>
	);
}
