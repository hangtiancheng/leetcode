import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { DifficultyBadge } from "#/components/difficulty-badge.tsx";
import {
	ProblemFormDialog,
	type ProblemFormValue,
} from "#/components/problem-form-dialog.tsx";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import { type Difficulty, LANGUAGES } from "#/lib/languages.ts";
import {
	createProblem,
	deleteProblem,
	listProblems,
	type ProblemListItem,
	updateProblem,
} from "#/server/problems.ts";

export const Route = createFileRoute("/dashboard")({
	loader: () => listProblems(),
	head: () => ({ meta: [{ title: "管理台 · 题簿 CODEBOOK" }] }),
	component: Dashboard,
});

function formatDateTime(value: Date | string) {
	const d = new Date(value);
	return d.toLocaleString("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

type FormState =
	| { mode: "create" }
	| { mode: "edit"; problem: ProblemListItem }
	| null;

function Dashboard() {
	const problems = Route.useLoaderData();
	const router = useRouter();

	const [form, setForm] = React.useState<FormState>(null);
	const [pendingDelete, setPendingDelete] =
		React.useState<ProblemListItem | null>(null);
	const [deleting, setDeleting] = React.useState(false);
	const [deleteError, setDeleteError] = React.useState<string | null>(null);

	const handleSubmit = async (value: ProblemFormValue) => {
		if (form?.mode === "edit") {
			await updateProblem({ data: { id: form.problem.id, ...value } });
		} else {
			await createProblem({ data: value });
		}
		await router.invalidate();
	};

	const handleDelete = async () => {
		if (!pendingDelete) return;
		setDeleting(true);
		setDeleteError(null);
		try {
			await deleteProblem({ data: { id: pendingDelete.id } });
			await router.invalidate();
			setPendingDelete(null);
		} catch (e) {
			setDeleteError(e instanceof Error ? e.message : "删除失败，请重试");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<main className="mx-auto w-[min(1000px,calc(100%-2.5rem))] pt-14 pb-20">
			<header className="rise-in">
				<div className="flex items-center justify-between gap-4">
					<p className="font-mono text-[11px] font-medium tracking-[0.28em] text-pine uppercase">
						Dashboard · 管理台
					</p>
					<Link
						to="/"
						className="flex items-center gap-1.5 font-mono text-[11px] text-ink-faint transition-colors hover:text-pine-deep"
					>
						<ArrowLeft className="size-3.5" />
						返回题簿
					</Link>
				</div>
				<div className="mt-5 flex flex-wrap items-end justify-between gap-4">
					<h1 className="font-display font-bold text-4xl text-ink tracking-tight">
						题库管理
					</h1>
					<Button onClick={() => setForm({ mode: "create" })}>
						<Plus />
						新建题目
					</Button>
				</div>
			</header>

			<section className="rise-in mt-8" style={{ animationDelay: "90ms" }}>
				{problems.length === 0 ? (
					<div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong bg-paper-raised px-8 py-16 text-center">
						<p className="text-sm text-ink-soft">
							还没有题目。点击「新建题目」开始收录。
						</p>
						<Button size="sm" onClick={() => setForm({ mode: "create" })}>
							<Plus />
							新建题目
						</Button>
					</div>
				) : (
					<div className="overflow-x-auto rounded-2xl border border-line bg-paper-raised shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_30px_rgba(33,36,43,0.05)]">
						<table className="w-full min-w-[760px] border-collapse text-left">
							<thead>
								<tr className="border-b border-line font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">
									<th className="px-5 py-3.5 font-medium">#</th>
									<th className="px-4 py-3.5 font-medium">题目</th>
									<th className="px-4 py-3.5 font-medium">难度</th>
									<th className="px-4 py-3.5 font-medium">示例</th>
									<th className="px-4 py-3.5 font-medium">答案版本</th>
									<th className="px-4 py-3.5 font-medium">更新时间</th>
									<th className="px-5 py-3.5 text-right font-medium">操作</th>
								</tr>
							</thead>
							<tbody>
								{problems.map((p) => (
									<tr
										key={p.id}
										className="border-b border-line transition-colors last:border-b-0 hover:bg-pine-wash/30"
									>
										<td className="px-5 py-4 font-mono text-xs text-ink-faint">
											{String(p.id).padStart(3, "0")}
										</td>
										<td className="px-4 py-4">
											<Link
												to="/problems/$problemId"
												params={{ problemId: String(p.id) }}
												className="font-medium text-ink transition-colors hover:text-pine-deep"
											>
												{p.title}
											</Link>
										</td>
										<td className="px-4 py-4">
											<DifficultyBadge difficulty={p.difficulty} />
										</td>
										<td className="px-4 py-4 font-mono text-xs text-ink-soft">
											{p.examples.length} 组
										</td>
										<td className="px-4 py-4">
											<div className="flex gap-1.5 font-mono text-[11px] text-ink-faint">
												{p.solutions.map((s) => {
													const lang = LANGUAGES.find(
														(l) => l.id === s.language,
													);
													return (
														<span
															key={s.language}
															className="rounded-md border border-line px-1.5 py-0.5"
														>
															{lang?.short ?? s.language}
															<span className="text-pine"> v{s.version}</span>
														</span>
													);
												})}
											</div>
										</td>
										<td className="px-4 py-4 font-mono text-xs text-ink-soft">
											{formatDateTime(p.updatedAt)}
										</td>
										<td className="px-5 py-4">
											<div className="flex justify-end gap-1">
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label={`编辑《${p.title}》`}
													onClick={() => setForm({ mode: "edit", problem: p })}
												>
													<Pencil />
												</Button>
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label={`删除《${p.title}》`}
													className="text-rose hover:bg-rose-wash hover:text-rose"
													onClick={() => {
														setDeleteError(null);
														setPendingDelete(p);
													}}
												>
													<Trash2 />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<ProblemFormDialog
				open={form !== null}
				onOpenChange={(open) => {
					if (!open) setForm(null);
				}}
				initial={
					form?.mode === "edit"
						? {
								title: form.problem.title,
								difficulty: form.problem.difficulty as Difficulty,
								description: form.problem.description,
								examples: form.problem.examples.map((e) => ({
									input: e.input,
									output: e.output,
								})),
							}
						: undefined
				}
				onSubmit={handleSubmit}
			/>

			<AlertDialog
				open={pendingDelete !== null}
				onOpenChange={(open) => {
					if (!open && !deleting) setPendingDelete(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogTitle>删除《{pendingDelete?.title}》？</AlertDialogTitle>
					<AlertDialogDescription>
						这道题的题面、示例、三份参考答案与全部历史版本都会被删除，且无法恢复。
					</AlertDialogDescription>
					{deleteError && (
						<p className="mt-3 text-sm text-rose">{deleteError}</p>
					)}
					<AlertDialogFooter>
						<Button
							variant="ghost"
							onClick={() => setPendingDelete(null)}
							disabled={deleting}
						>
							取消
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deleting}
						>
							{deleting ? "删除中…" : "确认删除"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</main>
	);
}
