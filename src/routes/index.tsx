import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, BookOpenText } from "lucide-react";

import { AppHeader } from "#/components/app-header.tsx";
import { DifficultyBadge } from "#/components/difficulty-badge.tsx";
import { Button } from "#/components/ui/button.tsx";
import { listProblems } from "#/data/problems.ts";
import { LANGUAGES } from "#/lib/languages.ts";

export const Route = createFileRoute("/")({
	loader: () => listProblems(),
	component: ProblemIndex,
});

function formatDate(value: Date | string) {
	const d = new Date(value);
	return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function ProblemIndex() {
	const problems = Route.useLoaderData();
	const latest = problems.reduce<Date | null>((acc, p) => {
		const d = new Date(p.updatedAt);
		return acc === null || d > acc ? d : acc;
	}, null);
	const langs = LANGUAGES.filter((l) =>
		problems.some((p) => p.solutions.some((s) => s.language === l.id)),
	);

	return (
		<div className="min-h-dvh">
			<AppHeader
				right={
					<Link to="/dashboard">
						<Button variant="outline" size="sm">
							Dashboard
							<ArrowUpRight />
						</Button>
					</Link>
				}
			/>

			<main className="mx-auto w-[min(920px,calc(100%-2rem))] pt-8 pb-16">
				{/* Statusline */}
				<div className="animate-rise-in flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-line bg-bg-panel px-3.5 py-2.5 font-mono text-xs text-fg-soft">
					<span className="rounded-sm bg-ctp-mauve px-1.5 py-0.5 font-semibold text-[10px] uppercase tracking-[0.14em] text-primary-foreground">
						Playground
					</span>
					<span>
						<span className="font-semibold text-fg">{problems.length}</span>{" "}
						problems
					</span>
					{langs.length > 0 && (
						<>
							<span className="text-fg-faint">·</span>
							<span className="tracking-wide text-fg-faint">
								{langs.map((l) => l.short).join(" ")}
							</span>
						</>
					)}
					{latest && (
						<span className="ml-auto text-fg-faint">
							updated {formatDate(latest)}
						</span>
					)}
				</div>

				<section className="mt-5">
					{problems.length === 0 ? (
						<div className="animate-rise-in flex flex-col items-center gap-4 rounded-xl border border-dashed border-line-strong bg-bg-panel px-8 py-14 text-center">
							<BookOpenText className="size-8 text-fg-faint" />
							<p className="text-sm text-fg-soft">Playground is empty.</p>
							<Link to="/dashboard">
								<Button size="sm">New problem</Button>
							</Link>
						</div>
					) : (
						<div className="overflow-hidden rounded-xl border border-line bg-bg-panel shadow-[0_1px_2px_rgba(17,17,27,0.05)]">
							<div className="flex items-center gap-4 border-b border-line px-5 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-faint">
								<span className="w-12 shrink-0">#</span>
								<span className="min-w-0 flex-1">Title</span>
								<span className="shrink-0">Difficulty</span>
								<span className="hidden w-40 shrink-0 sm:block">Solutions</span>
								<span className="hidden w-20 shrink-0 text-right md:block">
									Updated
								</span>
								<span className="size-4 shrink-0" />
							</div>
							<ol>
								{problems.map((p, i) => (
									<li
										key={p.id}
										className="animate-rise-in border-b border-line last:border-b-0"
										style={{ animationDelay: `${60 + i * 45}ms` }}
									>
										<Link
											to="/problems/$problemId"
											params={{ problemId: String(p.id) }}
											className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-fg/4"
										>
											<span className="w-12 shrink-0 font-mono text-xs text-fg-faint">
												#{String(p.id).padStart(3, "0")}
											</span>
											<span className="font-display min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight text-fg transition-colors group-hover:text-ctp-mauve">
												{p.title}
											</span>
											<DifficultyBadge
												difficulty={p.difficulty}
												className="shrink-0"
											/>
											<span className="hidden w-40 shrink-0 gap-1.5 font-mono text-[11px] whitespace-nowrap text-fg-faint sm:flex">
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
															<span className="text-fg-soft">
																{" "}
																v{s.version}
															</span>
														</span>
													);
												})}
											</span>
											<span className="hidden w-20 shrink-0 text-right font-mono text-[11px] text-fg-faint md:block">
												{formatDate(p.updatedAt)}
											</span>
											<ArrowRight className="size-4 shrink-0 text-fg-faint transition-all group-hover:translate-x-0.5 group-hover:text-ctp-mauve" />
										</Link>
									</li>
								))}
							</ol>
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
