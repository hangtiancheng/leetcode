import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "#/components/ui/button.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { type ThemeMode, useTheme } from "#/lib/theme.ts";

const OPTIONS: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
	const { mode, resolved, setMode } = useTheme();
	const TriggerIcon = resolved === "dark" ? Moon : Sun;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="icon-sm" aria-label="Toggle theme" />
				}
			>
				<TriggerIcon />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuRadioGroup
					value={mode}
					onValueChange={(value) => setMode(value as ThemeMode)}
				>
					{OPTIONS.map(({ value, label, icon: Icon }) => (
						<DropdownMenuRadioItem key={value} value={value}>
							<Icon className="size-4 text-fg-soft" />
							{label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
