import { Link } from "@tanstack/react-router";
import type * as React from "react";

import { ThemeToggle } from "#/components/theme-toggle.tsx";
import { cn } from "#/lib/utils.ts";

export function AppHeader({
	children,
	right,
	className,
}: {
	children?: React.ReactNode;
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
			<div className="flex min-w-0 items-center gap-3">
				<Link
					to="/"
					className="flex shrink-0 items-center gap-2.5 font-mono text-[13px] font-semibold tracking-tight text-fg transition-colors hover:text-ctp-mauve"
				>
					<span className="size-2.5 rounded-[3px] bg-ctp-mauve" />
					playground
				</Link>
				{children}
			</div>
			<div className="flex shrink-0 items-center gap-1.5">
				<ThemeToggle />
				{right}
			</div>
		</header>
	);
}
