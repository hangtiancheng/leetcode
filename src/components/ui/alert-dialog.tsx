import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import type * as React from "react";

import { cn } from "#/lib/utils.ts";

const AlertDialog = BaseAlertDialog.Root;
const AlertDialogTrigger = BaseAlertDialog.Trigger;
const AlertDialogClose = BaseAlertDialog.Close;

function AlertDialogContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof BaseAlertDialog.Popup>) {
	return (
		<BaseAlertDialog.Portal>
			<BaseAlertDialog.Backdrop className="fixed inset-0 z-50 bg-[#11111b]/55 backdrop-blur-[3px] transition-opacity duration-180 ease-[ease] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
			<BaseAlertDialog.Popup
				className={cn(
					"fixed top-1/2 left-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-bg-raised p-6 shadow-[0_24px_64px_rgba(17,17,27,0.3)] outline-none",
					"transition-[opacity,transform] duration-170 ease-[cubic-bezier(0.16,1,0.3,1)]",
					"data-[ending-style]:translate-y-[calc(-50%+6px)] data-[ending-style]:scale-[0.965] data-[ending-style]:opacity-0",
					"data-[starting-style]:translate-y-[calc(-50%+6px)] data-[starting-style]:scale-[0.965] data-[starting-style]:opacity-0",
					className,
				)}
				{...props}
			>
				{children}
			</BaseAlertDialog.Popup>
		</BaseAlertDialog.Portal>
	);
}

function AlertDialogTitle({
	className,
	...props
}: React.ComponentProps<typeof BaseAlertDialog.Title>) {
	return (
		<BaseAlertDialog.Title
			className={cn(
				"font-display text-lg font-semibold tracking-tight text-fg",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof BaseAlertDialog.Description>) {
	return (
		<BaseAlertDialog.Description
			className={cn("mt-1.5 text-sm leading-relaxed text-fg-soft", className)}
			{...props}
		/>
	);
}

function AlertDialogFooter({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("mt-6 flex justify-end gap-2.5", className)}
			{...props}
		/>
	);
}

export {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
};
