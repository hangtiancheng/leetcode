import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "#/components/ui/button.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import { Textarea } from "#/components/ui/textarea.tsx";
import { DIFFICULTIES, type Difficulty } from "#/lib/languages.ts";
import { cn } from "#/lib/utils.ts";

export type ProblemFormValue = {
	title: string;
	difficulty: Difficulty;
	description: string;
	examples: Array<{ input: string; output: string }>;
};

type ExampleRow = { key: string; input: string; output: string };

function makeRow(input = "", output = ""): ExampleRow {
	return { key: crypto.randomUUID(), input, output };
}

const DIFFICULTY_SELECTED: Record<Difficulty, string> = {
	Easy: "border-pine bg-pine-wash text-pine-deep",
	Medium: "border-amber bg-amber-wash text-amber",
	Hard: "border-rose bg-rose-wash text-rose",
};

const GROUP_CAPTION = "block font-medium text-[13px] text-ink-soft";

export function ProblemFormDialog({
	open,
	onOpenChange,
	initial,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initial?: ProblemFormValue;
	onSubmit: (value: ProblemFormValue) => Promise<void>;
}) {
	const [title, setTitle] = React.useState("");
	const [difficulty, setDifficulty] = React.useState<Difficulty>("Easy");
	const [description, setDescription] = React.useState("");
	const [examples, setExamples] = React.useState<Array<ExampleRow>>([]);
	const [error, setError] = React.useState<string | null>(null);
	const [busy, setBusy] = React.useState(false);
	const isEdit = initial !== undefined;

	React.useEffect(() => {
		if (open) {
			setTitle(initial?.title ?? "");
			setDifficulty(initial?.difficulty ?? "Easy");
			setDescription(initial?.description ?? "");
			setExamples(
				initial && initial.examples.length > 0
					? initial.examples.map((e) => makeRow(e.input, e.output))
					: [makeRow()],
			);
			setError(null);
		}
	}, [open, initial]);

	const setExample = (
		key: string,
		patch: Partial<{ input: string; output: string }>,
	) => {
		setExamples((prev) =>
			prev.map((e) => (e.key === key ? { ...e, ...patch } : e)),
		);
	};

	const validate = (): string | null => {
		if (!title.trim()) return "请填写题目标题";
		if (!description.trim()) return "请填写题目描述";
		if (examples.length === 0) return "至少需要一个示例";
		for (let i = 0; i < examples.length; i++) {
			if (!examples[i].input.trim() || !examples[i].output.trim()) {
				return `示例 ${i + 1} 的输入和输出都不能为空`;
			}
		}
		return null;
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const message = validate();
		if (message) {
			setError(message);
			return;
		}
		setBusy(true);
		setError(null);
		try {
			await onSubmit({
				title,
				difficulty,
				description,
				examples: examples.map(({ input, output }) => ({ input, output })),
			});
			onOpenChange(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : "提交失败，请重试");
		} finally {
			setBusy(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!busy) onOpenChange(next);
			}}
		>
			<DialogContent className="w-[min(640px,calc(100vw-2rem))]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{isEdit ? "编辑题目" : "新建题目"}</DialogTitle>
						<DialogDescription>
							{isEdit
								? "修改题面与示例。参考答案请在题目预览页编辑。"
								: "创建后会自动生成 TS / JS / Go 三份参考答案骨架，可在预览页补充。"}
						</DialogDescription>
					</DialogHeader>

					<div className="scroll-quiet max-h-[62dvh] space-y-5 overflow-y-auto pr-1">
						<div className="space-y-1.5">
							<Label htmlFor="problem-title">标题</Label>
							<Input
								id="problem-title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="例如：两数之和"
							/>
						</div>

						<fieldset className="space-y-1.5">
							<legend className={GROUP_CAPTION}>难度</legend>
							<div className="flex gap-2 pt-1.5">
								{DIFFICULTIES.map((d) => {
									const selected = difficulty === d.id;
									return (
										<label
											key={d.id}
											className={cn(
												"cursor-pointer rounded-full border px-3.5 py-1 font-medium text-sm transition-colors",
												"has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pine",
												selected
													? DIFFICULTY_SELECTED[d.id]
													: "border-line-strong text-ink-soft hover:bg-ink/[0.04]",
											)}
										>
											<input
												type="radio"
												name="difficulty"
												value={d.id}
												checked={selected}
												onChange={() => setDifficulty(d.id)}
												className="sr-only"
											/>
											{d.label}
										</label>
									);
								})}
							</div>
						</fieldset>

						<div className="space-y-1.5">
							<Label htmlFor="problem-description">题目描述</Label>
							<Textarea
								id="problem-description"
								rows={6}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="题面正文，空行分段。"
							/>
						</div>

						<div className="space-y-3">
							<span className={GROUP_CAPTION}>示例</span>
							{examples.map((example, i) => (
								<div
									key={example.key}
									className="space-y-3 rounded-xl border border-line bg-paper p-3.5"
								>
									<div className="flex items-center justify-between">
										<span className="font-medium font-mono text-ink-soft text-xs">
											示例 {i + 1}
										</span>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label={`删除示例 ${i + 1}`}
											disabled={examples.length <= 1}
											onClick={() =>
												setExamples((prev) =>
													prev.filter((e) => e.key !== example.key),
												)
											}
										>
											<Trash2 />
										</Button>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor={`example-input-${example.key}`}>输入</Label>
										<Textarea
											id={`example-input-${example.key}`}
											rows={2}
											className="font-mono text-[13px]"
											value={example.input}
											onChange={(e) =>
												setExample(example.key, { input: e.target.value })
											}
											placeholder="nums = [2,7,11,15], target = 9"
										/>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor={`example-output-${example.key}`}>
											输出
										</Label>
										<Input
											id={`example-output-${example.key}`}
											className="font-mono text-[13px]"
											value={example.output}
											onChange={(e) =>
												setExample(example.key, { output: e.target.value })
											}
											placeholder="[0,1]"
										/>
									</div>
								</div>
							))}
							<Button
								variant="outline"
								size="sm"
								className="w-full border-dashed"
								onClick={() => setExamples((prev) => [...prev, makeRow()])}
							>
								<Plus />
								添加示例
							</Button>
						</div>
					</div>

					{error && <p className="mt-4 text-rose text-sm">{error}</p>}

					<DialogFooter>
						<Button
							variant="ghost"
							onClick={() => onOpenChange(false)}
							disabled={busy}
						>
							取消
						</Button>
						<Button type="submit" disabled={busy}>
							{busy ? "提交中…" : isEdit ? "保存修改" : "创建题目"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
