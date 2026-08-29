import {
	createFileRoute,
	Link,
	notFound,
	useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, CloudCheck, Undo2 } from "lucide-react";
import * as React from "react";

import { CodeEditor } from "#/components/code-editor.tsx";
import { DifficultyBadge } from "#/components/difficulty-badge.tsx";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import { getProblem, rollbackSolution, saveSolution } from "#/data/problems.ts";
import { LANGUAGES, type LanguageId } from "#/lib/languages.ts";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/problems/$problemId")({
	loader: async ({ params }) => {
		const id = Number(params.problemId);
		if (!Number.isInteger(id) || id <= 0) throw notFound();
		const problem = await getProblem({ data: { id } });
		if (!problem) throw notFound();
		return problem;
	},
	head: ({ loaderData }) => ({
		meta: [{ title: `${loaderData?.title ?? "Playground"}` }],
	}),
	notFoundComponent: ProblemNotFound,
	component: ProblemPage,
});

function ProblemNotFound() {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-4">
			<p className="font-mono text-xs tracking-[0.28em] text-fg-faint uppercase">
				404 · Not Found
			</p>
			<h1 className="font-display text-2xl font-semibold text-fg">
				Problem not found
			</h1>
			<Link to="/">
				<Button variant="outline" size="sm">
					<ArrowLeft />
					Back to library
				</Button>
			</Link>
		</main>
	);
}

type Stamp_ = { text: string; at: number };

function ProblemPage() {
	const problem = Route.useLoaderData();
	const router = useRouter();

	const [activeLang, setActiveLang] = React.useState<LanguageId>("typescript");
	const [drafts, setDrafts] = React.useState<
		Partial<Record<LanguageId, string>>
	>({});
	const [confirm, setConfirm] = React.useState<null | "save" | "rollback">(
		null,
	);
	const [busy, setBusy] = React.useState(false);
	const [actionError, setActionError] = React.useState<string | null>(null);
	const [stamp, setStamp] = React.useState<Stamp_ | null>(null);
	const [split, setSplit] = React.useState(0.47);
	const [dragging, setDragging] = React.useState(false);
	const splitRef = React.useRef<HTMLDivElement>(null);

	const startSplitDrag = (e: React.PointerEvent) => {
		e.preventDefault();
		const container = splitRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const onMove = (ev: PointerEvent) => {
			const next = (ev.clientX - rect.left) / rect.width;
			setSplit(Math.min(0.7, Math.max(0.3, next)));
		};
		const onUp = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
			setDragging(false);
		};
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		setDragging(true);
	};

	const solutionOf = (lang: LanguageId) =>
		problem.solutions.find((s) => s.language === lang);

	const active = solutionOf(activeLang);
	const savedCode = active?.code ?? "";
	const editorValue = drafts[activeLang] ?? savedCode;
	const isDirty = drafts[activeLang] !== undefined && editorValue !== savedCode;
	const version = active?.version ?? 1;
	const revisionCount = active?._count.revisions ?? 0;
	const langLabel =
		LANGUAGES.find((l) => l.id === activeLang)?.label ?? activeLang;

	const isLangDirty = (lang: LanguageId) => {
		const draft = drafts[lang];
		return draft !== undefined && draft !== (solutionOf(lang)?.code ?? "");
	};

	const clearDraft = (lang: LanguageId) => {
		setDrafts((prev) => {
			const next = { ...prev };
			delete next[lang];
			return next;
		});
	};

	const handleChange = (code: string) => {
		setDrafts((prev) => {
			if (code === savedCode) {
				const next = { ...prev };
				delete next[activeLang];
				return next;
			}
			return { ...prev, [activeLang]: code };
		});
	};

	const handleSave = async () => {
		if (!active) return;
		setBusy(true);
		setActionError(null);
		try {
			const updated = await saveSolution({
				data: {
					problemId: problem.id,
					language: activeLang,
					code: editorValue,
				},
			});
			await router.invalidate();
			clearDraft(activeLang);
			setStamp({ text: `Saved · v${updated.version}`, at: Date.now() });
			setConfirm(null);
		} catch (e) {
			setActionError(
				e instanceof Error ? e.message : "Save failed, please try again",
			);
		} finally {
			setBusy(false);
		}
	};

	const handleRollback = async () => {
		if (!active) return;
		setBusy(true);
		setActionError(null);
		try {
			const updated = await rollbackSolution({
				data: { problemId: problem.id, language: activeLang },
			});
			await router.invalidate();
			clearDraft(activeLang);
			setStamp({ text: `Reverted · v${updated.version}`, at: Date.now() });
			setConfirm(null);
		} catch (e) {
			setActionError(
				e instanceof Error ? e.message : "Revert failed, please try again",
			);
		} finally {
			setBusy(false);
		}
	};

	const closeConfirm = () => {
		setConfirm(null);
		setActionError(null);
	};

	return (
		<div className="flex min-h-dvh flex-col lg:h-dvh">
			<header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line bg-bg-panel px-4 sm:px-5">
				<div className="flex min-w-0 items-center gap-3">
					<Link
						to="/"
						className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-tight text-fg transition-colors hover:text-ctp-mauve"
					>
						<ArrowLeft className="size-3.5" />
						playground
					</Link>
					<span className="h-4 w-px bg-line-strong" />
					<span className="font-mono text-xs text-fg-faint">
						#{String(problem.id).padStart(3, "0")}
					</span>
					<span className="truncate text-sm font-medium text-fg">
						{problem.title}
					</span>
					<DifficultyBadge
						difficulty={problem.difficulty}
						className="hidden shrink-0 sm:inline-flex"
					/>
				</div>
				<Link
					to="/dashboard"
					className="shrink-0 font-mono text-[11px] text-fg-faint transition-colors hover:text-fg"
				>
					Dashboard
				</Link>
			</header>

			<div
				ref={splitRef}
				className="flex flex-1 flex-col lg:grid lg:min-h-0"
				style={{
					gridTemplateColumns: `minmax(0, ${split}fr) 5px minmax(0, ${1 - split}fr)`,
				}}
			>
				{/* Problem statement */}
				<article className="scroll-quiet bg-bg-panel px-6 py-7 sm:px-9 lg:min-h-0 lg:overflow-y-auto">
					<h1 className="font-display text-[26px] font-bold tracking-tight text-fg">
						{problem.title}
					</h1>
					<div className="mt-3">
						<DifficultyBadge difficulty={problem.difficulty} />
					</div>

					<p className="mt-5 text-[15px] leading-7 whitespace-pre-line text-fg/85">
						{problem.description}
					</p>

					<div className="mt-8 space-y-4">
						{problem.examples.map((example, i) => (
							<section
								key={example.id}
								className="overflow-hidden rounded-lg border border-line bg-bg-raised"
							>
								<header className="border-b border-line bg-fg/3 px-4 py-1.5 font-mono text-[11px] font-medium text-fg-soft">
									Example {i + 1}
								</header>
								<div className="space-y-3 p-4">
									<div>
										<p className="text-xs font-medium text-fg-faint">Input</p>
										<pre className="mt-1.5 rounded-md bg-bg-well px-3 py-2 font-mono text-[13px] leading-6 whitespace-pre-wrap text-fg">
											{example.input}
										</pre>
									</div>
									<div>
										<p className="text-xs font-medium text-fg-faint">Output</p>
										<pre className="mt-1.5 rounded-md bg-bg-well px-3 py-2 font-mono text-[13px] leading-6 whitespace-pre-wrap text-fg">
											{example.output}
										</pre>
									</div>
								</div>
							</section>
						))}
					</div>

					<p className="mt-8 font-mono text-[11px] text-fg-faint">
						Updated {new Date(problem.updatedAt).toLocaleString("en-US")}
					</p>
				</article>

				{/* Version action bar (mobile) */}
				<div className="flex items-center gap-3 border-y border-line bg-bg-panel px-4 py-2 lg:hidden">
					<span
						className={cn(
							"size-2 rounded-full",
							isDirty ? "animate-dirty-pulse bg-ctp-peach" : "bg-ctp-green",
						)}
					/>
					<span className="font-mono text-xs text-fg-soft">
						{isDirty ? "Unsaved" : "In sync"}
					</span>
					<span className="rounded-md border border-line-strong bg-bg-raised px-1.5 py-0.5 font-mono text-[11px] font-semibold text-fg">
						v{version}
					</span>
					<div className="flex-1" />
					<Button
						size="sm"
						variant="outline"
						disabled={revisionCount === 0 || busy}
						onClick={() => setConfirm("rollback")}
					>
						<Undo2 />
						Revert
					</Button>
					<Button
						size="sm"
						disabled={!isDirty || busy}
						onClick={() => setConfirm("save")}
					>
						<CloudCheck />
						Save
					</Button>
				</div>

				{/* Split handle (desktop) */}
				<div
					role="separator"
					aria-orientation="vertical"
					onPointerDown={startSplitDrag}
					className={cn(
						"group relative hidden w-[5px] cursor-col-resize lg:block",
						dragging ? "bg-ctp-mauve/20" : "hover:bg-ctp-mauve/10",
					)}
				>
					<span
						className={cn(
							"absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors",
							dragging ? "bg-ctp-mauve" : "bg-line group-hover:bg-ctp-mauve",
						)}
					/>
				</div>

				{/* Solution editor */}
				<section className="flex h-[70dvh] flex-col bg-bg-raised lg:h-auto lg:min-h-0">
					<div className="flex h-11 shrink-0 items-stretch justify-between border-b border-line bg-bg-panel pr-2.5 pl-1">
						<div className="flex items-stretch" role="tablist">
							{LANGUAGES.map((lang) => {
								const selected = lang.id === activeLang;
								return (
									<button
										key={lang.id}
										type="button"
										role="tab"
										aria-selected={selected}
										onClick={() => {
											setActiveLang(lang.id);
											setStamp(null);
										}}
										className={cn(
											"relative cursor-pointer px-4 font-mono text-xs transition-colors outline-none",
											"focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ctp-mauve",
											selected ? "text-fg" : "text-fg-faint hover:text-fg-soft",
										)}
									>
										{lang.label}
										{isLangDirty(lang.id) && (
											<span className="ml-1.5 align-middle text-[8px] text-ctp-peach">
												●
											</span>
										)}
										{selected && (
											<span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-ctp-mauve" />
										)}
									</button>
								);
							})}
						</div>
						<div className="hidden items-center gap-2.5 lg:flex">
							<span
								title={isDirty ? "Unsaved edits" : "In sync with database"}
								className={cn(
									"size-2 rounded-full",
									isDirty ? "animate-dirty-pulse bg-ctp-peach" : "bg-ctp-green",
								)}
							/>
							<span className="rounded-md border border-line-strong bg-bg-raised px-1.5 py-0.5 font-mono text-[11px] font-semibold text-fg">
								v{version}
							</span>
							<Button
								size="sm"
								variant="outline"
								disabled={revisionCount === 0 || busy}
								onClick={() => setConfirm("rollback")}
							>
								<Undo2 />
								Revert · {revisionCount}
							</Button>
							<Button
								size="sm"
								disabled={!isDirty || busy}
								onClick={() => setConfirm("save")}
							>
								<CloudCheck />
								Save
							</Button>
						</div>
					</div>

					<div
						className={cn(
							"relative min-h-0 flex-1",
							dragging && "pointer-events-none",
						)}
					>
						<CodeEditor
							problemId={problem.id}
							language={activeLang}
							value={editorValue}
							onChange={handleChange}
						/>
						{stamp && (
							<div
								key={stamp.at}
								className="animate-stamp-in pointer-events-none absolute top-3 right-4 z-10 rounded-full border border-ctp-green/40 bg-bg-raised/95 px-3 py-1 font-mono text-[11px] text-ctp-green shadow-[0_2px_10px_rgba(17,17,27,0.12)]"
							>
								{stamp.text}
							</div>
						)}
					</div>
				</section>
			</div>

			{/* Save confirmation */}
			<AlertDialog
				open={confirm === "save"}
				onOpenChange={(open) => {
					if (!open) closeConfirm();
				}}
			>
				<AlertDialogContent>
					<AlertDialogTitle>Save as a new version?</AlertDialogTitle>
					<AlertDialogDescription>
						The {langLabel} solution will be saved as{" "}
						<span className="font-mono font-semibold text-fg">
							v{version + 1}
						</span>
					</AlertDialogDescription>
					{actionError && (
						<p className="mt-3 text-sm text-ctp-red">{actionError}</p>
					)}
					<AlertDialogFooter>
						<Button variant="ghost" onClick={closeConfirm} disabled={busy}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={busy}>
							{busy ? "Saving…" : "Save version"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Revert confirmation */}
			<AlertDialog
				open={confirm === "rollback"}
				onOpenChange={(open) => {
					if (!open) closeConfirm();
				}}
			>
				<AlertDialogContent>
					<AlertDialogTitle>
						Revert to v{Math.max(version - 1, 1)}?
					</AlertDialogTitle>
					<AlertDialogDescription>
						The {langLabel} solution will be restored to its previous version.
						The code of the current v{version} and any unsaved edits will be
						discarded.
					</AlertDialogDescription>
					{actionError && (
						<p className="mt-3 text-sm text-ctp-red">{actionError}</p>
					)}
					<AlertDialogFooter>
						<Button variant="ghost" onClick={closeConfirm} disabled={busy}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleRollback}
							disabled={busy}
						>
							{busy ? "Reverting…" : "Revert"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
