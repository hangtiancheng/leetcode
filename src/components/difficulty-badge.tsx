import { difficultyLabel } from "#/lib/languages.ts";
import { cn } from "#/lib/utils.ts";

const STYLES: Record<string, string> = {
	Easy: "bg-pine-wash text-pine-deep",
	Medium: "bg-amber-wash text-amber",
	Hard: "bg-rose-wash text-rose",
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
				"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
				STYLES[difficulty] ?? "bg-muted text-ink-soft",
				className,
			)}
		>
			{difficultyLabel(difficulty)}
		</span>
	);
}
