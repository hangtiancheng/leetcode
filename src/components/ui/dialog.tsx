import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type * as React from "react";

import { cn } from "#/lib/utils.ts";

const Dialog = BaseDialog.Root;
const DialogTrigger = BaseDialog.Trigger;
const DialogClose = BaseDialog.Close;

function DialogContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof BaseDialog.Popup>) {
	return (
		<BaseDialog.Portal>
			<BaseDialog.Backdrop className="fixed inset-0 z-50 bg-[#11111b]/55 backdrop-blur-[3px] transition-opacity duration-180 ease-[ease] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
			<BaseDialog.Popup
				className={cn(
					"fixed top-1/2 left-1/2 z-50 w-[min(600px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-bg-raised p-6 shadow-[0_24px_64px_rgba(17,17,27,0.3)] outline-none",
					"transition-[opacity,transform] duration-170 ease-[cubic-bezier(0.16,1,0.3,1)]",
					"data-[ending-style]:translate-y-[calc(-50%+6px)] data-[ending-style]:scale-[0.965] data-[ending-style]:opacity-0",
					"data-[starting-style]:translate-y-[calc(-50%+6px)] data-[starting-style]:scale-[0.965] data-[starting-style]:opacity-0",
					className,
				)}
				{...props}
			>
				{children}
			</BaseDialog.Popup>
		</BaseDialog.Portal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("mb-5 flex flex-col gap-1.5 text-left", className)}
			{...props}
		/>
	);
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("mt-6 flex justify-end gap-2.5", className)}
			{...props}
		/>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
	return (
		<BaseDialog.Title
			className={cn(
				"font-display text-lg font-semibold tracking-tight text-fg",
				className,
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
	return (
		<BaseDialog.Description
			className={cn("text-sm leading-relaxed text-fg-soft", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
