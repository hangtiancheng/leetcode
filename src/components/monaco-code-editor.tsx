import { Editor, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/editor/editor.worker.js?worker";
import tsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import type { LanguageId } from "#/lib/languages.ts";

self.MonacoEnvironment = {
	getWorker(_workerId, label) {
		if (label === "typescript" || label === "javascript") {
			return new tsWorker();
		}
		return new editorWorker();
	},
};

loader.config({ monaco });

monaco.editor.defineTheme("codebook", {
	base: "vs",
	inherit: true,
	rules: [
		{ token: "comment", foreground: "8b9097", fontStyle: "italic" },
		{ token: "keyword", foreground: "0e6b57" },
		{ token: "string", foreground: "9d6a0a" },
		{ token: "number", foreground: "b0501e" },
		{ token: "type", foreground: "2563a8" },
		{ token: "type.identifier", foreground: "2563a8" },
		{ token: "delimiter", foreground: "666c78" },
		{ token: "identifier", foreground: "21242b" },
	],
	colors: {
		"editor.background": "#fdfcf9",
		"editor.foreground": "#21242b",
		"editorLineNumber.foreground": "#c0bdb1",
		"editorLineNumber.activeForeground": "#666c78",
		"editorCursor.foreground": "#106b57",
		"editor.lineHighlightBackground": "#f3f2ea",
		"editor.selectionBackground": "#cfe5da",
		"editor.inactiveSelectionBackground": "#e2ede6",
		"editorIndentGuide.background1": "#edebe2",
		"editorIndentGuide.activeBackground1": "#d9d6c9",
		"editorWidget.background": "#fdfcf9",
		"editorWidget.border": "#e4e1d6",
		"editorSuggestWidget.background": "#fdfcf9",
		"editorSuggestWidget.selectedBackground": "#e2ede6",
		"scrollbarSlider.background": "#21242b1f",
		"scrollbarSlider.hoverBackground": "#21242b33",
		"scrollbarSlider.activeBackground": "#21242b45",
		"editorBracketMatch.border": "#106b5766",
		"editorOverviewRuler.border": "#fdfcf9",
	},
});

const MONACO_LANGUAGE: Record<LanguageId, string> = {
	typescript: "typescript",
	javascript: "javascript",
	go: "go",
};

const FILE_EXT: Record<LanguageId, string> = {
	typescript: "ts",
	javascript: "js",
	go: "go",
};

export type MonacoCodeEditorProps = {
	problemId: number;
	language: LanguageId;
	value: string;
	onChange: (code: string) => void;
};

export default function MonacoCodeEditor({
	problemId,
	language,
	value,
	onChange,
}: MonacoCodeEditorProps) {
	return (
		<Editor
			theme="codebook"
			path={`problem-${problemId}.${FILE_EXT[language]}`}
			language={MONACO_LANGUAGE[language]}
			value={value}
			onChange={(code) => onChange(code ?? "")}
			loading={
				<span className="font-mono text-ink-faint text-xs">
					Loading editor…
				</span>
			}
			onMount={() => {
				document.fonts.ready.then(() => monaco.editor.remeasureFonts());
			}}
			options={{
				fontFamily:
					"'Gesit Mono', 'Maple Mono', Menlo, 'Cascadia Code', ui-monospace, monospace",
				fontSize: 13,
				lineHeight: 21,
				fontLigatures: false,
				minimap: { enabled: false },
				scrollBeyondLastLine: false,
				renderLineHighlight: "all",
				tabSize: 2,
				detectIndentation: true,
				automaticLayout: true,
				padding: { top: 20, bottom: 20 },
				smoothScrolling: true,
				cursorBlinking: "smooth",
				scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
				overviewRulerBorder: false,
				hideCursorInOverviewRuler: true,
				fixedOverflowWidgets: true,
			}}
		/>
	);
}
