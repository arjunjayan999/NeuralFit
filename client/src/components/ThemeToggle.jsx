import { Moon, Sun } from "lucide-react";
import { Switch } from "./ui/switch";

const ThemeToggle = ({ theme, onChange, compact = false }) => {
	const isDark = theme === "dark";

	if (compact) {
		return (
			<button
				type="button"
				onClick={() => onChange(isDark ? "light" : "dark")}
				className="
		relative
		flex items-center justify-center
		w-10 h-10
		rounded-full
		text-muted-foreground
		hover:bg-accent
		hover:text-accent-foreground
		transition-all duration-300 ease-in-out
		hover:scale-105
		active:scale-95
	"
				aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
			>
				<Sun
					className={`
			absolute w-5 h-5
			transition-all duration-300 ease-in-out
			${
				isDark
					? "rotate-0 scale-100 opacity-100"
					: "rotate-90 scale-50 opacity-0"
			}
		`}
				/>
				<Moon
					className={`
			absolute w-5 h-5
			transition-all duration-300 ease-in-out
			${
				isDark
					? "-rotate-90 scale-50 opacity-0"
					: "rotate-0 scale-100 opacity-100"
			}
		`}
				/>
			</button>
		);
	}

	return (
		<div className="flex items-center gap-4">
			<Sun
				className={`
					w-5 h-5 transition-colors duration-300
					${!isDark ? "text-yellow-500" : "text-muted-foreground"}
				`}
			/>
			<Switch
				checked={isDark}
				onCheckedChange={(checked) => onChange(checked ? "dark" : "light")}
				aria-label="Toggle dark mode"
				className="
					transition-all duration-300
					data-[state=checked]:bg-primary
				"
			/>
			<Moon
				className={`
					w-5 h-5 transition-colors duration-300
					${isDark ? "text-blue-400" : "text-muted-foreground"}
				`}
			/>
			<span className="text-sm font-medium capitalize transition-colors duration-300">
				{theme} mode
			</span>
		</div>
	);
};

export default ThemeToggle;
