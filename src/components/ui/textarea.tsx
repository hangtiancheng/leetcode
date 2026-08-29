import type * as React from "react";

import { cn } from "#/lib/utils.ts";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex w-full min-w-0 rounded-[10px] border border-line-strong bg-white/60 px-3 py-2 text-sm text-ink transition-colors outline-none",
				"placeholder:text-ink-faint",
				"focus-visible:border-pine focus-visible:ring-2 focus-visible:ring-pine/25",
				"disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
