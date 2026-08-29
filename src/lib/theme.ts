import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "playground-theme";

const listeners = new Set<() => void>();
let currentMode: ThemeMode | null = null;
let mediaWatched = false;

function readStoredMode(): ThemeMode {
	if (typeof window === "undefined") return "system";
	const value = window.localStorage.getItem(STORAGE_KEY);
	return value === "light" || value === "dark" || value === "system"
		? value
		: "system";
}

function getMode(): ThemeMode {
	currentMode ??= readStoredMode();
	return currentMode;
}

function systemTheme(): ResolvedTheme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function resolveMode(mode: ThemeMode): ResolvedTheme {
	return mode === "system" ? systemTheme() : mode;
}

function getResolved(): ResolvedTheme {
	if (typeof window === "undefined") return "light";
	return resolveMode(getMode());
}

function apply(mode: ThemeMode) {
	document.documentElement.classList.toggle(
		"dark",
		resolveMode(mode) === "dark",
	);
}

function emit() {
	for (const listener of listeners) listener();
}

export function setThemeMode(next: ThemeMode) {
	currentMode = next;
	window.localStorage.setItem(STORAGE_KEY, next);
	apply(next);
	emit();
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	apply(getMode());
	if (!mediaWatched) {
		mediaWatched = true;
		window
			.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", () => {
				if (getMode() === "system") {
					apply("system");
					emit();
				}
			});
	}
	return () => listeners.delete(listener);
}

export function useTheme() {
	const mode = React.useSyncExternalStore(subscribe, getMode, () => "system");
	const resolved = React.useSyncExternalStore(
		subscribe,
		getResolved,
		() => "light",
	);
	return { mode, resolved, setMode: setThemeMode };
}
