import { LogOut, Palette, Save, Shield, Sliders, User } from "lucide-react";
import { useEffect, useState } from "react";
import UseAnimationsImport from "react-useanimations";
import loading2Import from "react-useanimations/lib/loading2";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "../api/client";
import ThemeToggle from "../components/ThemeToggle";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../context/AuthContext";

const UseAnimations = UseAnimationsImport.default || UseAnimationsImport;

const loading2 = loading2Import.default || loading2Import;

const SettingsSection = ({ icon: Icon, title, description, children }) => (
	<div className="space-y-4">
		<div className="flex items-center gap-3">
			<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
				<Icon className="w-5 h-5 text-primary" strokeWidth={2.5} />
			</div>
			<div>
				<h2 className="font-semibold">{title}</h2>
				{description && (
					<p className="text-xs text-muted-foreground">{description}</p>
				)}
			</div>
		</div>
		<div className="pl-12 space-y-4">{children}</div>
	</div>
);

const Settings = () => {
	const { user, theme, setTheme } = useAuth();

	const [preferredExercise, setPreferredExercise] = useState("squat");
	const [angleSmoothing, setAngleSmoothing] = useState(5);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const data = await api.get("/settings");
				const s = data.data.settings;
				setPreferredExercise(s.preferredExercise ?? "squat");
				setAngleSmoothing(s.angleSmoothing ?? 5);
			} catch (err) {
				setError(err.message || "Could not load settings.");
			} finally {
				setLoading(false);
			}
		};
		loadSettings();
	}, []);

	const handleSave = async () => {
		setSaving(true);
		setSaved(false);
		setError("");

		try {
			await api.put("/settings", {
				preferredExercise,
				angleSmoothing: Number(angleSmoothing),
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (err) {
			setError(err.message || "Failed to save settings.");
		} finally {
			setSaving(false);
		}
	};

	const handleSmoothingChange = (e) => {
		const val = Math.min(20, Math.max(1, Number(e.target.value)));
		setAngleSmoothing(val);
	};

	if (loading) {
		return (
			<div className="space-y-8 max-w-2xl">
				<Skeleton className="h-8 w-32" />
				<div className="space-y-6">
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list, order never changes
						<Skeleton key={i} className="h-24 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-2xl">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground mt-1">
					Manage your account preferences and workout configuration.
				</p>
			</div>

			{error && (
				<div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm">
					{error}
				</div>
			)}

			<div className="space-y-8">
				<SettingsSection
					icon={User}
					title="Account"
					description="Your profile information"
				>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Name</Label>
							<Input
								value={user?.name ?? ""}
								disabled
								className="bg-muted/50"
							/>
						</div>
						<div className="space-y-2">
							<Label>Email</Label>
							<Input
								value={user?.email ?? ""}
								disabled
								className="bg-muted/50"
							/>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						Account details are managed through your login provider.{" "}
						{user?.googleId && "Connected via Google."}
					</p>
				</SettingsSection>

				<Separator />

				<SettingsSection
					icon={Palette}
					title="Appearance"
					description="Choose how NeuralFit looks"
				>
					<div className="flex items-center justify-between rounded-xl border bg-card p-4">
						<div>
							<p className="text-sm font-medium">Theme</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								Synced to your account and restored on every login
							</p>
						</div>
						<ThemeToggle theme={theme} onChange={setTheme} />
					</div>
				</SettingsSection>

				<Separator />

				<SettingsSection
					icon={Sliders}
					title="Workout"
					description="Default workout configuration"
				>
					<div className="space-y-2">
						<Label htmlFor="preferred-exercise">Default Exercise</Label>
						<Select
							value={preferredExercise}
							onValueChange={setPreferredExercise}
						>
							<SelectTrigger id="preferred-exercise" className="w-full sm:w-64">
								<SelectValue />
							</SelectTrigger>
							<SelectContent position="popper">
								<SelectItem value="squat">Squat</SelectItem>
								<SelectItem value="push-up">Push-Up</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">
							Pre-selected when you open the Workout page.
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="smoothing">
							Angle Smoothing{" "}
							<span className="text-muted-foreground font-normal">
								(window: {angleSmoothing} frames)
							</span>
						</Label>
						<Input
							id="smoothing"
							type="number"
							min={1}
							max={20}
							value={angleSmoothing}
							onChange={handleSmoothingChange}
							className="w-32"
						/>
						<p className="text-xs text-muted-foreground">
							Higher values make rep counting more stable but slightly less
							responsive. Range: 1-20. Default: 5.
						</p>
					</div>
				</SettingsSection>

				<Separator />

				<SettingsSection
					icon={Shield}
					title="Security"
					description="Session and device management"
				>
					<div className="rounded-xl border bg-card p-4 space-y-3">
						<div>
							<p className="text-sm font-medium">Active Sessions</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								Log out from all devices at once if you think your account has
								been compromised.
							</p>
						</div>
						<LogoutAllButton />
					</div>
				</SettingsSection>
			</div>

			<div className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 py-4 bg-background/80 backdrop-blur border-t flex items-center justify-between gap-4">
				{saved ? (
					<p className="text-sm text-green-600 dark:text-green-400 font-medium">
						Settings saved ✓
					</p>
				) : (
					<p className="text-sm text-muted-foreground">
						Changes to Appearance are saved instantly.
					</p>
				)}
				<Button onClick={handleSave} disabled={saving} className="shrink-0">
					{saving ? (
						<div className="flex items-center gap-1">
							<UseAnimations
								animation={loading2}
								strokeColor="#efb100"
								fillColor="var(--background)"
							/>
							<p>Saving</p>
						</div>
					) : (
						<div className="flex items-center">
							<Save className="w-4 h-4 mr-2" />
							<p>Save Changes</p>
						</div>
					)}
				</Button>
			</div>
		</div>
	);
};

const LogoutAllButton = () => {
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	const handleLogoutAll = async () => {
		setLoading(true);
		try {
			await api.post("/auth/logout-all");
			setDone(true);
			setTimeout(() => {
				window.location.href = "/login";
			}, 3060);
		} catch {
			setLoading(false);
		}
	};

	if (done) {
		return (
			<div className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
				<UseAnimations
					animation={loading2}
					strokeColor="var(--card)"
					fillColor="#efb100"
				/>
				<span className="ml-2">
					Logged out from all devices, redirecting ~^^~
				</span>
			</div>
		);
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" size="sm" disabled={loading}>
					{loading ? "Logging out..." : "Log out all devices"}
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-red-100 p-2 dark:bg-red-950">
							<LogOut className="h-4 w-4 text-red-600" />
						</div>

						<div>
							<AlertDialogTitle className="text-red-600">
								Log out all devices?
							</AlertDialogTitle>
						</div>
					</div>

					<AlertDialogDescription className="pt-3">
						This will immediately sign you out from every device, including this
						one.
						<br />
						<br />
						You’ll need to log in again on all devices.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel
						className="
					border-border
					bg-background
					text-foreground
					hover:bg-muted
				"
					>
						Cancel
					</AlertDialogCancel>

					<AlertDialogAction
						onClick={handleLogoutAll}
						disabled={loading}
						className="
					bg-red-600
					text-white
					hover:bg-red-700
					focus:ring-red-500
					disabled:opacity-50
				"
					>
						{loading ? "Logging out..." : "Log out everywhere"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default Settings;
