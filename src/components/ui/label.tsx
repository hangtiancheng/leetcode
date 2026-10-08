import type * as React from "react";

import { cn } from "#/lib/utils.ts";

function Label({ className, ...props }: React.ComponentProps<"label">) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is supplied by the caller via props
		<label
			data-slot="label"
			className={cn(
				"block text-[13px] font-medium text-fg-soft select-none",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
