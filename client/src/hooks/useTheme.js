import { useCallback, useEffect, useState } from "react";
import api from "../api/client";

const useTheme = (isLoggedIn) => {
	const getInitialTheme = () => {
		const stored = localStorage.getItem("neuralfit-theme");
		if (stored === "dark" || stored === "light") return stored;

		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	};

	const [theme, setThemeState] = useState(getInitialTheme);

	const applyTheme = useCallback((newTheme) => {
		const root = document.documentElement;
		if (newTheme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, []);

	useEffect(() => {
		applyTheme(theme);
	}, [applyTheme, theme]);

	useEffect(() => {
		if (!isLoggedIn) return;

		const loadTheme = async () => {
			try {
				const data = await api.get("/settings");
				const serverTheme = data.data.settings.theme;
				if (serverTheme && serverTheme !== theme) {
					setThemeState(serverTheme);
					applyTheme(serverTheme);
					localStorage.setItem("neuralfit-theme", serverTheme);
				}
			} catch {}
		};

		loadTheme();
	}, [isLoggedIn, applyTheme, theme]);

	const setTheme = useCallback(
		(newTheme) => {
			setThemeState(newTheme);
			applyTheme(newTheme);
			localStorage.setItem("neuralfit-theme", newTheme);

			if (isLoggedIn) {
				api.put("/settings", { theme: newTheme }).catch(() => {});
			}
		},
		[isLoggedIn, applyTheme],
	);

	return { theme, setTheme };
};

export default useTheme;
