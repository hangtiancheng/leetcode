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
			<BaseAlertDialog.Backdrop className="ui-backdrop z-50" />
			<BaseAlertDialog.Popup
				className={cn(
					"ui-popup z-50 w-[min(440px,calc(100vw-2rem))] rounded-2xl border border-line bg-paper-raised p-6 shadow-[0_28px_70px_rgba(24,26,31,0.22)] outline-none",
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
				"font-display text-lg font-semibold tracking-tight text-ink",
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
			className={cn("mt-1.5 text-sm leading-relaxed text-ink-soft", className)}
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
