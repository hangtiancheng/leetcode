import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { cn } from "#/lib/utils.ts";

export function Markdown({
	children,
	className,
}: {
	children: string;
	className?: string;
}) {
	return (
		<div className={cn("prose-playground prose max-w-none", className)}>
			<ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
				{children}
			</ReactMarkdown>
		</div>
	);
}
