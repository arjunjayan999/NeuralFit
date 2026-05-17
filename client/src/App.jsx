
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Settings = lazy(() => import("./pages/Settings"));
const Workout = lazy(() => import("./pages/Workout"));
const OAuthSuccess = lazy(() => import("./pages/OAuthSuccess"));

import { useLocation } from "react-router-dom";
import RouteLoader from "./components/RouteLoader";
import AppLoader from "./components/AppLoader";

const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();
	if (loading) return <AppLoader />;
	if (!user) return <Navigate to="/login" replace />;
	return children;
};

const PublicRoute = ({ children }) => {
	const { user } = useAuth();
	if (user) return <Navigate to="/dashboard" replace />;
	return children;
};

const AppRoutes = () => {
	const location = useLocation();
	return (
		<Routes>
			<Route
				path="/login"
				element={
					<PublicRoute>
						<Login />
					</PublicRoute>
				}
			/>
			<Route
				path="/register"
				element={
					<PublicRoute>
						<Register />
					</PublicRoute>
				}
			/>
			<Route
				path="/oauth-success"
				element={
					<PublicRoute>
					    <OAuthSuccess />
					</PublicRoute>
				}
			/>
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<Layout>
							<Suspense fallback={<RouteLoader />} key={location.pathname}>
								<Dashboard />
							</Suspense>
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/workout"
				element={
					<ProtectedRoute>
						<Layout>
							<Suspense fallback={<RouteLoader />} key={location.pathname}>
								<Workout />
							</Suspense>
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/history"
				element={
					<ProtectedRoute>
						<Layout>
							<Suspense fallback={<RouteLoader />} key={location.pathname}>
								<History />
							</Suspense>
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/settings"
				element={
					<ProtectedRoute>
						<Layout>
							<Suspense fallback={<RouteLoader />} key={location.pathname}>
								<Settings />
							</Suspense>
						</Layout>
					</ProtectedRoute>
				}
			/>
			<Route path="/" element={<Navigate to="/dashboard" replace />} />
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
};

const App = () => {
	useEffect(() => {
		const loader = document.getElementById("initial-loader");
		if (loader) loader.remove();
	}, []);

	return (
		<BrowserRouter>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</BrowserRouter>
	);
};

export default App;
