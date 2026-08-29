import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, BookOpenText } from "lucide-react";

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

	return (
		<main className="mx-auto w-[min(880px,calc(100%-2.5rem))] pt-16 pb-20">
			<header className="animate-rise-in">
				<div className="flex items-center justify-between gap-4">
					<p className="font-mono text-[11px] font-medium text-pine">
						LeetCode Problems
					</p>
					<Link to="/dashboard">
						<Button variant="outline" size="sm">
							Manage library
							<ArrowUpRight />
						</Button>
					</Link>
				</div>
				<h1 className="font-display mt-5 text-[clamp(2.6rem,6vw,3.6rem)] leading-none font-bold tracking-tight text-ink">
					Playground
				</h1>
				<p className="mt-6 font-mono text-ink-faint text-xs">
					{problems.length} problems ·{" "}
					{LANGUAGES.map((l) => l.short).join(" / ")}
					{latest ? ` · Last updated ${formatDate(latest)}` : ""}
				</p>
			</header>

			<section className="mt-10">
				{problems.length === 0 ? (
					<div className="animate-rise-in flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong bg-paper-raised px-8 py-16 text-center">
						<BookOpenText className="size-8 text-ink-faint" />
						<p className="text-sm text-ink-soft">
							The library is empty. Head to the dashboard to add the first
							problem.
						</p>
						<Link to="/dashboard">
							<Button size="sm">New problem</Button>
						</Link>
					</div>
				) : (
					<ol className="overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_30px_rgba(33,36,43,0.05)]">
						{problems.map((p, i) => (
							<li
								key={p.id}
								className="animate-rise-in border-b border-line last:border-b-0"
								style={{ animationDelay: `${90 + i * 55}ms` }}
							>
								<Link
									to="/problems/$problemId"
									params={{ problemId: String(p.id) }}
									className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-pine-wash/40"
								>
									<span className="w-12 shrink-0 font-mono text-sm text-ink-faint">
										#{String(p.id).padStart(3, "0")}
									</span>
									<span className="font-display min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-ink transition-colors group-hover:text-pine-deep">
										{p.title}
									</span>
									<DifficultyBadge
										difficulty={p.difficulty}
										className="shrink-0"
									/>
									<span className="hidden shrink-0 gap-2 font-mono text-[11px] text-ink-faint sm:flex">
										{p.solutions.map((s) => {
											const lang = LANGUAGES.find((l) => l.id === s.language);
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
									</span>
									<span className="hidden w-20 shrink-0 text-right font-mono text-[11px] text-ink-faint md:block">
										{formatDate(p.updatedAt)}
									</span>
									<ArrowRight className="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-pine" />
								</Link>
							</li>
						))}
					</ol>
				)}
			</section>
		</main>
	);
}
