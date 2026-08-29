import { ClientOnly } from "@tanstack/react-router";
import * as React from "react";
import type { MonacoCodeEditorProps } from "#/components/monaco-code-editor.tsx";

const MonacoCodeEditor = React.lazy(
	() => import("#/components/monaco-code-editor.tsx"),
);

function EditorSkeleton() {
	return (
		<div className="flex h-full items-center justify-center bg-bg-raised">
			<span className="font-mono text-fg-faint text-xs">Loading editor…</span>
		</div>
	);
}

export function CodeEditor(props: MonacoCodeEditorProps) {
	return (
		<ClientOnly fallback={<EditorSkeleton />}>
			<React.Suspense fallback={<EditorSkeleton />}>
				<MonacoCodeEditor {...props} />
			</React.Suspense>
		</ClientOnly>
	);
}
