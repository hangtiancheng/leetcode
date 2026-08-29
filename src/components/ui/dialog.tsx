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
			<BaseDialog.Backdrop className="ui-backdrop z-50" />
			<BaseDialog.Popup
				className={cn(
					"ui-popup z-50 w-[min(600px,calc(100vw-2rem))] rounded-2xl border border-line bg-paper-raised p-6 shadow-[0_28px_70px_rgba(24,26,31,0.22)] outline-none",
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
				"font-display text-lg font-semibold tracking-tight text-ink",
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
			className={cn("text-sm leading-relaxed text-ink-soft", className)}
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
