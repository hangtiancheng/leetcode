import type * as React from "react";

import { cn } from "#/lib/utils.ts";

function Input({ className, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			data-slot="input"
			className={cn(
				"flex h-9 w-full min-w-0 rounded-lg border border-line-strong bg-bg-panel px-3 py-1 text-sm text-fg transition-colors outline-none",
				"placeholder:text-fg-faint",
				"focus-visible:border-ctp-mauve focus-visible:ring-2 focus-visible:ring-ctp-mauve/25",
				"disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
