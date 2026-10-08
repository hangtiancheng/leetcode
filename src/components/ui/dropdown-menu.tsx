import { Menu } from "@base-ui/react/menu";
import { Check } from "lucide-react";
import type * as React from "react";

import { cn } from "#/lib/utils.ts";

const DropdownMenu = Menu.Root;

function DropdownMenuTrigger({
	className,
	...props
}: React.ComponentProps<typeof Menu.Trigger>) {
	return <Menu.Trigger className={cn(className)} {...props} />;
}

function DropdownMenuContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof Menu.Popup>) {
	return (
		<Menu.Portal>
			<Menu.Positioner align="end" sideOffset={6}>
				<Menu.Popup
					className={cn(
						"min-w-36 rounded-lg border border-line bg-bg-raised p-1 shadow-[0_12px_32px_rgba(17,17,27,0.18)] outline-none",
						"origin-top-right transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
						"data-ending-style:scale-[0.97] data-ending-style:opacity-0",
						"data-starting-style:scale-[0.97] data-starting-style:opacity-0",
						className,
					)}
					{...props}
				>
					{children}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	);
}

function DropdownMenuRadioGroup({
	...props
}: React.ComponentProps<typeof Menu.RadioGroup>) {
	return <Menu.RadioGroup {...props} />;
}

function DropdownMenuRadioItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof Menu.RadioItem>) {
	return (
		<Menu.RadioItem
			className={cn(
				"flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg outline-none select-none",
				"data-highlighted:bg-fg/6",
				className,
			)}
			{...props}
		>
			{children}
			<Menu.RadioItemIndicator className="ml-auto text-ctp-mauve">
				<Check className="size-3.5" />
			</Menu.RadioItemIndicator>
		</Menu.RadioItem>
	);
}

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
};
