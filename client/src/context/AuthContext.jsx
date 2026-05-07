import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import api from "../api/client";
import useTheme from "../hooks/useTheme";

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkSession = async () => {
			try {
				const data = await api.get("/auth/me");
				setUser(data.data.user);
			} catch {
				setUser(null);
			} finally {
				setLoading(false);
			}
		};
		checkSession();
	}, []);

	const login = useCallback((userData) => {
		setUser(userData);
	}, []);

	const logout = useCallback(async () => {
		try {
			await api.post("/auth/logout");
		} catch {
		} finally {
			setUser(null);
		}
	}, []);

	const { theme, setTheme } = useTheme(!!user);

	return (
		<AuthContext.Provider
			value={{ user, loading, login, logout, theme, setTheme }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
};
