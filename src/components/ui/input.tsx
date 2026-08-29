import type * as React from "react";

import { cn } from "#/lib/utils.ts";

function Input({ className, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			data-slot="input"
			className={cn(
				"flex h-9 w-full min-w-0 rounded-[10px] border border-line-strong bg-white/60 px-3 py-1 text-sm text-ink transition-colors outline-none",
				"placeholder:text-ink-faint",
				"focus-visible:border-pine focus-visible:ring-2 focus-visible:ring-pine/25",
				"disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
