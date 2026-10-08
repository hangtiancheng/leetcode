import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#/lib/utils.ts";

const buttonVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(17,17,27,0.18)] hover:bg-primary-hover",
				secondary: "bg-ctp-mauve/12 text-ctp-mauve hover:bg-ctp-mauve/20",
				outline:
					"border border-line-strong bg-transparent text-fg hover:bg-fg/[0.05]",
				ghost: "text-fg-soft hover:bg-fg/[0.06] hover:text-fg",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive-hover",
			},
			size: {
				default: "h-9 px-4",
				xs: "h-7 gap-1 px-2 text-xs",
				sm: "h-8 gap-1.5 px-3",
				lg: "h-10 px-6",
				icon: "size-9",
				"icon-sm": "size-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	type = "button",
	...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
	return (
		<button
			data-slot="button"
			type={type}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
