import { Activity, CheckCircle, Repeat, Timer, XCircle } from "lucide-react";
import UseAnimationsImport from "react-useanimations";
import loading2Import from "react-useanimations/lib/loading2";
import { Button } from "./ui/button";

const UseAnimations = UseAnimationsImport.default || UseAnimationsImport;

const loading2 = loading2Import.default || loading2Import;

const formatTime = (seconds) => {
	const m = String(Math.floor(seconds / 60)).padStart(2, "0");
	const s = String(seconds % 60).padStart(2, "0");
	return `${m}:${s}`;
};

const StatsPanel = ({
	repCount,
	halfRepCount,
	currentAngle,
	formCorrect,
	feedback,
	elapsedSeconds,
	isActive,
	isLoading,
	isSaving,
	sessionSaved,
	saveError,
	exercise,
	mode,
	videoRef,
	onStart,
	onStop,
	onSave,
	onReset,
}) => (
	<div className="flex flex-col gap-5 h-full">
		<div className="flex items-center justify-between">
			<h2 className="font-semibold text-lg capitalize">{exercise}</h2>
			<span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full capitalize">
				{mode}
			</span>
		</div>
		<div className="space-y-2">
			{saveError && (
				<p className="text-xs text-destructive text-center">{saveError}</p>
			)}

			{!isActive && elapsedSeconds === 0 && !sessionSaved && (
				<Button
					className="w-full"
					size="lg"
					onClick={onStart}
					disabled={
						isLoading || (mode === "upload" && videoRef.current.src === "")
					}
				>
					{isLoading ? (
						<div className="flex items-center gap-1">
							<UseAnimations
								animation={loading2}
								strokeColor="#efb100"
								fillColor="var(--background)"
							/>
							<p>Loading AI Model</p>
						</div>
					) : (
						"Start Session"
					)}
				</Button>
			)}

			{isActive && (
				<Button
					className="w-full"
					size="lg"
					variant="destructive"
					onClick={onStop}
				>
					Stop Session
				</Button>
			)}

			{!isActive && elapsedSeconds > 0 && !sessionSaved && (
				<div className="space-y-2">
					<Button
						className="w-full"
						size="lg"
						onClick={onSave}
						disabled={isSaving}
					>
						{isSaving ? (
							<div className="flex items-center gap-1">
								<UseAnimations
									animation={loading2}
									strokeColor="#efb100"
									fillColor="var(--background)"
								/>
								<p>Saving Session</p>
							</div>
						) : (
							`Save Session (${repCount} ~ ${halfRepCount} reps)`
						)}
					</Button>
					<Button className="w-full" variant="outline" onClick={onReset}>
						Discard & Start Over
					</Button>
				</div>
			)}

			{sessionSaved && (
				<div className="space-y-2">
					<div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-center">
						<p className="text-sm font-medium text-green-600 dark:text-green-400">
							Session saved! ✓
						</p>
					</div>
					<Button className="w-full" variant="outline" onClick={onReset}>
						Start New Session
					</Button>
				</div>
			)}
		</div>
		<div className="rounded-xl border bg-card p-4 flex items-center gap-3">
			<Timer className="w-5 h-5 text-muted-foreground shrink-0" />
			<div>
				<p className="text-xs text-muted-foreground">Time</p>
				<p className="text-2xl font-bold font-mono">
					{formatTime(elapsedSeconds)}
				</p>
			</div>
		</div>

		<div className="rounded-xl border bg-card p-6 text-center space-y-1">
			<p className="text-sm text-muted-foreground flex items-center justify-center pb-2 gap-2">
				<Repeat className="w-4 h-4" /> Full Reps ~ Half Reps
			</p>
			<p className="text-6xl font-black tracking-tight">
				{repCount} ~ {halfRepCount}
			</p>
		</div>

		<div className="rounded-xl border bg-card p-4 flex items-center gap-3">
			<Activity className="w-5 h-5 text-muted-foreground shrink-0" />
			<div>
				<p className="text-xs text-muted-foreground">Joint Angle</p>
				<p className="text-2xl font-bold">{currentAngle}°</p>
			</div>
		</div>

		<div
			className={[
				"rounded-xl border p-4 flex items-start gap-3 transition-colors",
				formCorrect
					? "bg-green-500/10 border-green-500/30"
					: "bg-red-500/10 border-red-500/30",
			].join(" ")}
		>
			{formCorrect ? (
				<CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
			) : (
				<XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
			)}
			<div>
				<p className="text-xs text-muted-foreground mb-0.5">Feedback</p>
				<p className="text-sm font-medium leading-snug">{feedback}</p>
			</div>
		</div>
	</div>
);

export default StatsPanel;
