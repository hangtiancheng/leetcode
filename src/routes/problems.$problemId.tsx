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
import { LANGUAGES, type LanguageId } from "#/lib/languages.ts";
import { cn } from "#/lib/utils.ts";
import {
	getProblem,
	rollbackSolution,
	saveSolution,
} from "#/server/problems.ts";

export const Route = createFileRoute("/problems/$problemId")({
	loader: async ({ params }) => {
		const id = Number(params.problemId);
		if (!Number.isInteger(id) || id <= 0) throw notFound();
		const problem = await getProblem({ data: { id } });
		if (!problem) throw notFound();
		return problem;
	},
	head: ({ loaderData }) => ({
		meta: [{ title: `${loaderData?.title ?? "题目"} · 题簿 CODEBOOK` }],
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
				没有找到这道题
			</h1>
			<Link to="/">
				<Button variant="outline" size="sm">
					<ArrowLeft />
					返回题簿
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
			setStamp({ text: `已保存 · v${updated.version}`, at: Date.now() });
			setConfirm(null);
		} catch (e) {
			setActionError(e instanceof Error ? e.message : "保存失败，请重试");
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
			setStamp({ text: `已回滚 · v${updated.version}`, at: Date.now() });
			setConfirm(null);
		} catch (e) {
			setActionError(e instanceof Error ? e.message : "回滚失败，请重试");
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
						题簿
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
					管理题库
				</Link>
			</header>

			<div className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
				{/* 题面 */}
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
								<header className="border-b border-line bg-ink/[0.03] px-4 py-2 font-mono text-xs font-medium text-ink-soft">
									示例 {i + 1}
								</header>
								<div className="space-y-3 p-4">
									<div>
										<p className="text-xs font-medium text-ink-faint">输入</p>
										<pre className="mt-1.5 rounded-lg bg-ink/[0.04] px-3 py-2 font-mono text-[13px] leading-6 whitespace-pre-wrap text-ink">
											{example.input}
										</pre>
									</div>
									<div>
										<p className="text-xs font-medium text-ink-faint">输出</p>
										<pre className="mt-1.5 rounded-lg bg-ink/[0.04] px-3 py-2 font-mono text-[13px] leading-6 whitespace-pre-wrap text-ink">
											{example.output}
										</pre>
									</div>
								</div>
							</section>
						))}
					</div>

					<p className="mt-10 font-mono text-[11px] text-ink-faint">
						更新于 {new Date(problem.updatedAt).toLocaleString("zh-CN")}
					</p>
				</article>

				{/* 版本操作条（移动端） */}
				<div className="flex items-center gap-3 border-y border-line bg-paper px-4 py-2.5 lg:hidden">
					<span
						className={cn(
							"size-2 rounded-full",
							isDirty ? "dirty-dot bg-amber" : "bg-pine",
						)}
					/>
					<span className="font-mono text-xs text-ink-soft">
						{isDirty ? "未保存" : "已同步"}
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
						回滚
					</Button>
					<Button
						size="sm"
						disabled={!isDirty || busy}
						onClick={() => setConfirm("save")}
					>
						<Stamp />
						保存
					</Button>
				</div>

				{/* 参考答案编辑器 */}
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
								title={isDirty ? "有未保存的编辑" : "与数据库一致"}
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
								回滚·{revisionCount}
							</Button>
							<Button
								size="sm"
								disabled={!isDirty || busy}
								onClick={() => setConfirm("save")}
							>
								<Stamp />
								保存
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

			{/* 保存确认 */}
			<AlertDialog
				open={confirm === "save"}
				onOpenChange={(open) => {
					if (!open) closeConfirm();
				}}
			>
				<AlertDialogContent>
					<AlertDialogTitle>保存新版本？</AlertDialogTitle>
					<AlertDialogDescription>
						将把 {langLabel} 参考答案保存为{" "}
						<span className="font-mono font-semibold text-ink">
							v{version + 1}
						</span>
						，原 v{version} 存入历史，可随时回滚。
					</AlertDialogDescription>
					{actionError && (
						<p className="mt-3 text-sm text-rose">{actionError}</p>
					)}
					<AlertDialogFooter>
						<Button variant="ghost" onClick={closeConfirm} disabled={busy}>
							取消
						</Button>
						<Button onClick={handleSave} disabled={busy}>
							{busy ? "保存中…" : "确认保存"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* 回滚确认 */}
			<AlertDialog
				open={confirm === "rollback"}
				onOpenChange={(open) => {
					if (!open) closeConfirm();
				}}
			>
				<AlertDialogContent>
					<AlertDialogTitle>
						回滚到 v{Math.max(version - 1, 1)}？
					</AlertDialogTitle>
					<AlertDialogDescription>
						{langLabel} 参考答案将恢复为上一版本，当前 v{version}{" "}
						的代码与未保存的编辑都会被丢弃。
					</AlertDialogDescription>
					{actionError && (
						<p className="mt-3 text-sm text-rose">{actionError}</p>
					)}
					<AlertDialogFooter>
						<Button variant="ghost" onClick={closeConfirm} disabled={busy}>
							取消
						</Button>
						<Button
							variant="destructive"
							onClick={handleRollback}
							disabled={busy}
						>
							{busy ? "回滚中…" : "确认回滚"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
