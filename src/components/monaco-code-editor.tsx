import { Editor, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/editor/editor.worker.js?worker";
import tsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import type { LanguageId } from "#/lib/languages.ts";
import { useTheme } from "#/lib/theme.ts";

self.MonacoEnvironment = {
	getWorker(_workerId, label) {
		if (label === "typescript" || label === "javascript") {
			return new tsWorker();
		}
		return new editorWorker();
	},
};

loader.config({ monaco });

monaco.editor.defineTheme("playground-latte", {
	base: "vs",
	inherit: true,
	rules: [
		{ token: "comment", foreground: "8c8fa1", fontStyle: "italic" },
		{ token: "keyword", foreground: "8839ef" },
		{ token: "string", foreground: "40a02b" },
		{ token: "number", foreground: "fe640b" },
		{ token: "type", foreground: "df8e1d" },
		{ token: "type.identifier", foreground: "df8e1d" },
		{ token: "delimiter", foreground: "7c7f93" },
		{ token: "identifier", foreground: "4c4f69" },
	],
	colors: {
		"editor.background": "#ffffff",
		"editor.foreground": "#4c4f69",
		"editorLineNumber.foreground": "#bcc0cc",
		"editorLineNumber.activeForeground": "#6c6f85",
		"editorCursor.foreground": "#8839ef",
		"editor.lineHighlightBackground": "#eff1f5",
		"editor.selectionBackground": "#ccd0da99",
		"editor.inactiveSelectionBackground": "#ccd0da55",
		"editorIndentGuide.background1": "#e6e9ef",
		"editorIndentGuide.activeBackground1": "#ccd0da",
		"editorWidget.background": "#eff1f5",
		"editorWidget.border": "#ccd0da",
		"editorSuggestWidget.background": "#eff1f5",
		"editorSuggestWidget.selectedBackground": "#dce0e8",
		"scrollbarSlider.background": "#4c4f691f",
		"scrollbarSlider.hoverBackground": "#4c4f6933",
		"scrollbarSlider.activeBackground": "#4c4f6945",
		"editorBracketMatch.border": "#8839ef66",
		"editorOverviewRuler.border": "#ffffff",
	},
});

monaco.editor.defineTheme("playground-mocha", {
	base: "vs-dark",
	inherit: true,
	rules: [
		{ token: "comment", foreground: "6c7086", fontStyle: "italic" },
		{ token: "keyword", foreground: "cba6f7" },
		{ token: "string", foreground: "a6e3a1" },
		{ token: "number", foreground: "fab387" },
		{ token: "type", foreground: "f9e2af" },
		{ token: "type.identifier", foreground: "f9e2af" },
		{ token: "delimiter", foreground: "9399b2" },
		{ token: "identifier", foreground: "cdd6f4" },
	],
	colors: {
		"editor.background": "#1e1e2e",
		"editor.foreground": "#cdd6f4",
		"editorLineNumber.foreground": "#45475a",
		"editorLineNumber.activeForeground": "#a6adc8",
		"editorCursor.foreground": "#cba6f7",
		"editor.lineHighlightBackground": "#31324466",
		"editor.selectionBackground": "#585b7080",
		"editor.inactiveSelectionBackground": "#45475a66",
		"editorIndentGuide.background1": "#313244",
		"editorIndentGuide.activeBackground1": "#45475a",
		"editorWidget.background": "#181825",
		"editorWidget.border": "#313244",
		"editorSuggestWidget.background": "#181825",
		"editorSuggestWidget.selectedBackground": "#313244",
		"scrollbarSlider.background": "#45475a80",
		"scrollbarSlider.hoverBackground": "#585b7099",
		"scrollbarSlider.activeBackground": "#6c7086b3",
		"editorBracketMatch.border": "#cba6f766",
		"editorOverviewRuler.border": "#1e1e2e",
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
	const { resolved } = useTheme();

	return (
		<Editor
			theme={resolved === "dark" ? "playground-mocha" : "playground-latte"}
			path={`problem-${problemId}.${FILE_EXT[language]}`}
			language={MONACO_LANGUAGE[language]}
			value={value}
			onChange={(code) => onChange(code ?? "")}
			loading={
				<span className="font-mono text-fg-faint text-xs">Loading editor…</span>
			}
			onMount={() => {
				document.fonts.ready.then(() => monaco.editor.remeasureFonts());
			}}
			options={{
				fontFamily:
					"'Geist Mono', 'Maple Mono', Menlo, 'Cascadia Code', ui-monospace, monospace",
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
