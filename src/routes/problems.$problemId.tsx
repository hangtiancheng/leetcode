import {
	createFileRoute,
	Link,
	notFound,
	useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Stamp, Undo2 } from "lucide-react";
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
		meta: [{ title: `${loaderData?.title ?? "Problem"} · CODEBOOK` }],
	}),
	notFoundComponent: ProblemNotFound,
	component: ProblemPage,
});

function ProblemNotFound() {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-4">
			<p className="font-mono text-xs tracking-[0.28em] text-ink-faint uppercase">
				404 · Not Found
			</p>
			<h1 className="font-display text-2xl font-semibold text-ink">
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
			<header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-paper px-4 sm:px-6">
				<div className="flex min-w-0 items-center gap-3">
					<Link
						to="/"
						className="font-display flex items-center gap-2 text-sm font-semibold tracking-tight text-ink transition-colors hover:text-pine-deep"
					>
						<ArrowLeft className="size-4" />
						Codebook
					</Link>
					<span className="h-4 w-px bg-line-strong" />
					<span className="font-mono text-xs text-ink-faint">
						#{String(problem.id).padStart(3, "0")}
					</span>
					<span className="truncate text-sm font-medium text-ink">
						{problem.title}
					</span>
					<DifficultyBadge
						difficulty={problem.difficulty}
						className="hidden shrink-0 sm:inline-flex"
					/>
				</div>
				<Link
					to="/dashboard"
					className="shrink-0 font-mono text-[11px] text-ink-faint transition-colors hover:text-pine-deep"
				>
					Manage library
				</Link>
			</header>

			<div className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
				{/* Problem statement */}
				<article className="scroll-quiet px-6 py-8 sm:px-10 lg:min-h-0 lg:overflow-y-auto lg:py-10">
					<h1 className="font-display font-bold text-3xl text-ink tracking-tight">
						{problem.title}
					</h1>
					<div className="mt-3">
						<DifficultyBadge difficulty={problem.difficulty} />
					</div>

					<p className="mt-6 text-[15px] leading-7 whitespace-pre-line text-ink/90">
						{problem.description}
					</p>

					<div className="mt-10 space-y-4">
						{problem.examples.map((example, i) => (
							<section
								key={example.id}
								className="overflow-hidden rounded-xl border border-line bg-paper-raised"
							>
								<header className="border-b border-line bg-ink/3 px-4 py-2 font-mono text-xs font-medium text-ink-soft">
									Example {i + 1}
								</header>
								<div className="space-y-3 p-4">
									<div>
										<p className="text-xs font-medium text-ink-faint">Input</p>
										<pre className="mt-1.5 rounded-lg bg-ink/4 px-3 py-2 font-mono text-[13px] leading-6 whitespace-pre-wrap text-ink">
											{example.input}
										</pre>
									</div>
									<div>
										<p className="text-xs font-medium text-ink-faint">Output</p>
										<pre className="mt-1.5 rounded-lg bg-ink/4 px-3 py-2 font-mono text-[13px] leading-6 whitespace-pre-wrap text-ink">
											{example.output}
										</pre>
									</div>
								</div>
							</section>
						))}
					</div>

					<p className="mt-10 font-mono text-[11px] text-ink-faint">
						Updated {new Date(problem.updatedAt).toLocaleString("en-US")}
					</p>
				</article>

				{/* Version action bar (mobile) */}
				<div className="flex items-center gap-3 border-y border-line bg-paper px-4 py-2.5 lg:hidden">
					<span
						className={cn(
							"size-2 rounded-full",
							isDirty ? "dirty-dot bg-amber" : "bg-pine",
						)}
					/>
					<span className="font-mono text-xs text-ink-soft">
						{isDirty ? "Unsaved" : "In sync"}
					</span>
					<span className="rounded-md border border-line-strong bg-paper-raised px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink">
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
						<Stamp />
						Save
					</Button>
				</div>

				{/* Solution editor */}
				<section className="flex h-[70dvh] flex-col bg-paper-raised lg:h-auto lg:min-h-0 lg:border-line lg:border-l">
					<div className="flex h-11 shrink-0 items-stretch justify-between border-line border-b bg-paper pr-2.5 pl-1">
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
											"focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-pine",
											selected ? "text-ink" : "text-ink-faint hover:text-ink",
										)}
									>
										{lang.label}
										{isLangDirty(lang.id) && (
											<span className="ml-1.5 align-middle text-[8px] text-amber">
												●
											</span>
										)}
										{selected && (
											<span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-pine" />
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
									isDirty ? "dirty-dot bg-amber" : "bg-pine",
								)}
							/>
							<span className="rounded-md border border-line-strong bg-paper-raised px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink">
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
								<Stamp />
								Save
							</Button>
						</div>
					</div>

					<div className="relative min-h-0 flex-1">
						<CodeEditor
							problemId={problem.id}
							language={activeLang}
							value={editorValue}
							onChange={handleChange}
						/>
						{stamp && (
							<div
								key={stamp.at}
								className="stamp-in pointer-events-none absolute top-3 right-4 z-10 rounded-full border border-pine/40 bg-paper-raised/95 px-3 py-1 font-mono text-[11px] text-pine-deep shadow-[0_2px_10px_rgba(33,36,43,0.08)]"
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
						<span className="font-mono font-semibold text-ink">
							v{version + 1}
						</span>
						. The current v{version} is kept in history and can be restored at
						any time.
					</AlertDialogDescription>
					{actionError && (
						<p className="mt-3 text-sm text-rose">{actionError}</p>
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
						<p className="mt-3 text-sm text-rose">{actionError}</p>
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
