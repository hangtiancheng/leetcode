import type * as React from "react";

import { cn } from "#/lib/utils.ts";

function Label({ className, ...props }: React.ComponentProps<"label">) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: htmlFor 由调用方通过 props 传入
		<label
			data-slot="label"
			className={cn(
				"block text-[13px] font-medium text-ink-soft select-none",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
