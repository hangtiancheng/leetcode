import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#/lib/utils.ts";

const buttonVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "bg-pine text-primary-foreground hover:bg-pine-deep",
				secondary: "bg-pine-wash text-pine-deep hover:bg-[#d5e5db]",
				outline:
					"border border-line-strong bg-transparent text-ink hover:bg-ink/[0.045]",
				ghost: "text-ink-soft hover:bg-ink/[0.05] hover:text-ink",
				destructive: "bg-rose text-white hover:bg-[#a53434]",
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
