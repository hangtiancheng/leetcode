import { difficultyLabel } from "#/lib/languages.ts";
import { cn } from "#/lib/utils.ts";

const STYLES: Record<string, string> = {
	Easy: "bg-ctp-green/12 text-ctp-green",
	Medium: "bg-ctp-yellow/14 text-ctp-yellow",
	Hard: "bg-ctp-red/12 text-ctp-red",
};

export function DifficultyBadge({
	difficulty,
	className,
}: {
	difficulty: string;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide",
				STYLES[difficulty] ?? "bg-fg/8 text-fg-soft",
				className,
			)}
		>
			{difficultyLabel(difficulty)}
		</span>
	);
}
