import type * as React from "react";

import { cn } from "#/lib/utils.ts";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex w-full min-w-0 rounded-lg border border-line-strong bg-bg-panel px-3 py-2 text-sm text-fg transition-colors outline-none",
				"placeholder:text-fg-faint",
				"focus-visible:border-ctp-mauve focus-visible:ring-2 focus-visible:ring-ctp-mauve/25",
				"disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
