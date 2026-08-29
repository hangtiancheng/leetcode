export const LANGUAGES = [
	{ id: "typescript", label: "TypeScript", short: "TS" },
	{ id: "javascript", label: "JavaScript", short: "JS" },
	{ id: "go", label: "Go", short: "GO" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const LANGUAGE_IDS = LANGUAGES.map((l) => l.id) as [
	"typescript",
	"javascript",
	"go",
];

export const STARTER_CODE: Record<LanguageId, string> = {
	typescript:
		"function solve(): void {\n  // TODO: add reference solution\n}\n",
	javascript: "function solve() {\n  // TODO: add reference solution\n}\n",
	go: "func solve() {\n\t// TODO: add reference solution\n}\n",
};

export const DIFFICULTIES = [
	{ id: "Easy", label: "Easy" },
	{ id: "Medium", label: "Medium" },
	{ id: "Hard", label: "Hard" },
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number]["id"];

export function difficultyLabel(id: string): string {
	return DIFFICULTIES.find((d) => d.id === id)?.label ?? id;
}
