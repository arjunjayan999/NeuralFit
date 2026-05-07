import { Eye } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import UseAnimationsImport from "react-useanimations";
import loading2Import from "react-useanimations/lib/loading2";
import api from "../api/client";
import GoogleIcon from "../components/icons/GoogleIcon";
import RippleGrid from "../components/RippleGrid";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

const UseAnimations = UseAnimationsImport.default || UseAnimationsImport;

const loading2 = loading2Import.default || loading2Import;

const Login = () => {
	const { login } = useAuth();
	const [searchParams] = useSearchParams();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const oauthError = searchParams.get("error");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const data = await api.post("/auth/login", { email, password });
			login(data.data.user);
		} catch (err) {
			setError(err.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = () => {
		window.location.href = "http://localhost:5000/api/auth/google";
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<RippleGrid
				enableRainbow={false}
				gridColor="#efb100"
				rippleIntensity={0.02}
				gridSize={12}
				gridThickness={23}
				fadeDistance={5}
				vignetteStrength={5}
				glowIntensity={1.0}
				opacity={1}
				gridRotation={0}
				mouseInteraction
				mouseInteractionRadius={2}
			/>
			<Card className="w-full max-w-md bg-[rgba(239,177,0,0.13)] backdrop-blur-3xl border-2">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-3xl font-bold tracking-tight">
						NeuralFit
					</CardTitle>
					<CardDescription className="font-bold">
						Sign in to your account
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{oauthError && (
						<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
							Google sign-in failed. Please try again.
						</div>
					)}

					<Button
						type="button"
						variant="outline"
						className="w-full gap-3 border-2 border-foreground/20 hover:bg-foreground/10"
						onClick={handleGoogleLogin}
					>
						<GoogleIcon />
						Continue with Google
					</Button>

					<div className="flex items-center">
						<div className="flex-1 border-t border-yellow-600" />

						<span className="mx-4 text-xs uppercase text-foreground">or</span>

						<div className="flex-1 border-t border-yellow-600" />
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								className="border-2 border-foreground/20 hover:bg-foreground/10"
								id="email"
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative border-2 border-foreground/20 hover:bg-foreground/10">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									autoComplete="current-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute inset-y-0 right-2 flex items-center justify-center w-8 text-gray-500 hover:text-gray-700"
								>
									<div className="relative flex items-center justify-center">
										<Eye size={18} />
										<span
											className={`absolute h-0.5 w-6 bg-current rounded-full rotate-45 origin-left transition-transform duration-300 ease-out translate-x-0.75 -translate-y-2.25 ${
												showPassword ? "scale-x-0" : "scale-x-100"
											}`}
										/>
									</div>
								</button>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<div className="flex items-center gap-1">
									<p>Signing In</p>{" "}
									<UseAnimations
										animation={loading2}
										strokeColor="#efb100"
										fillColor="var(--background)"
									/>
								</div>
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</CardContent>

				<CardFooter className="justify-center">
					<p className="text-sm text-muted-foreground">
						Don't have an account?{" "}
						<Link
							to="/register"
							className="font-medium text-yellow-600 hover:underline"
						>
							Create one
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Login;
