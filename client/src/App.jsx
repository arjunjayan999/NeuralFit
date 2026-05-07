import { Zap } from "lucide-react";
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

import { useLocation } from "react-router-dom";
import UseAnimationsImport from "react-useanimations";
import loading2Import from "react-useanimations/lib/loading2";
import RouteLoader from "./components/RouteLoader";

const UseAnimations = UseAnimationsImport.default || UseAnimationsImport;

const loading2 = loading2Import.default || loading2Import;

const AppLoader = () => (
	<div className="min-h-screen bg-background flex items-center justify-center">
		<div className="flex flex-col items-center gap-4">
			<div className="w-12 h-12 bg-transparent rounded-xl flex items-center justify-center">
				<Zap className="w-96 h-96 text-primary-foreground zap-draw stroke-primary" />
			</div>
			<div className="flex items-center">
				<UseAnimations
					animation={loading2}
					strokeColor="var(--background)"
					fillColor="#efb100"
				/>
				<p className="text-sm pl-2 text-muted-foreground">
					Checking Your Session
				</p>
			</div>
		</div>
	</div>
);

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
