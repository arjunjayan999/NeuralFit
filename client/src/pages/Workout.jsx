import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import ExerciseSelector from "../components/ExerciseSelector";
import StatsPanel from "../components/StatsPanel";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import VideoFeed from "../components/VideoFeed";
import useCamera from "../hooks/useCamera";
import useWorkoutSession from "../hooks/useWorkoutSession";

const Workout = () => {
	const [exercise, setExercise] = useState("squat");
	const [mode, setMode] = useState("live");
	const [smoothingN, setSmoothingN] = useState(5);
	const [canvasEl, setCanvasEl] = useState(null);
	const [hasVideoFile, setHasVideoFile] = useState(false);

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const data = await api.get("/settings");
				const s = data.data.settings;
				if (s.preferredExercise) setExercise(s.preferredExercise);
				if (s.angleSmoothing) setSmoothingN(s.angleSmoothing);
			} catch {}
		};
		loadSettings();
	}, []);

	const { videoRef, startCamera, stopCamera, cameraError, cameraReady } =
		useCamera();

	const {
		repCount,
		halfRepCount,
		currentAngle,
		formCorrect,
		feedback,
		elapsedSeconds,
		isActive,
		isLoading,
		isSaving,
		saveError,
		sessionSaved,
		startSession,
		stopSession,
		resetSession,
		saveSession,
	} = useWorkoutSession({ exercise, smoothingN });

	const handleRefsReady = useCallback((canvas) => {
		setCanvasEl(canvas);
	}, []);

	const handleStart = useCallback(async () => {
		if (mode === "live") {
			const ok = await startCamera();
			if (!ok) return;
		}

		if (!videoRef.current || !canvasEl) return;
		startSession(videoRef.current, canvasEl);
	}, [mode, startCamera, startSession, videoRef, canvasEl]);

	const handleStop = useCallback(() => {
		stopSession();
		videoRef.current?.pause();
		if (canvasEl) {
			const ctx = canvasEl.getContext("2d");
			ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
		}
	}, [stopSession, canvasEl, videoRef.current?.pause]);

	const handleSave = useCallback(() => {
		saveSession(mode);
	}, [saveSession, mode]);

	const handleReset = useCallback(() => {
		resetSession();
		stopCamera();
		if (videoRef.current) {
			videoRef.current.pause();
			videoRef.current.srcObject = null;
			videoRef.current.src = "";
			videoRef.current.removeAttribute("src");
			videoRef.current.load();
		}
		if (canvasEl) {
			const ctx = canvasEl.getContext("2d");
			ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
		}
		setHasVideoFile(false);
	}, [resetSession, stopCamera, videoRef, canvasEl]);

	const handleModeChange = useCallback(
		(checked) => {
			const newMode = checked ? "upload" : "live";
			if (isActive) {
				stopSession();
			}
			stopCamera();
			setMode(newMode);
			handleReset();
		},
		[isActive, stopSession, stopCamera, handleReset],
	);

	const handleVideoLoaded = useCallback(() => {
		if (!videoRef.current || !canvasEl) return;
		startSession(videoRef.current, canvasEl);
		videoRef.current.play();
	}, [startSession, videoRef, canvasEl]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Workout</h1>
					<p className="text-muted-foreground mt-1">
						Position yourself sideways so the left side of your body is fully
						visible to the camera.
					</p>
				</div>

				<div className="flex flex-wrap items-end justify-evenly gap-6">
					<ExerciseSelector
						value={exercise}
						onChange={setExercise}
						disabled={isActive}
					/>

					<div className="space-y-1.5 flex flex-col items-center">
						<Label
							htmlFor="input-mode"
							className="text-sm font-medium text-muted-foreground"
						>
							Input Mode
						</Label>
						<div className="flex items-center gap-3 h-10">
							<span
								className={`text-sm ${mode === "live" ? "font-semibold" : "text-muted-foreground"}`}
							>
								Live Camera
							</span>
							<Switch
								id="input-mode"
								checked={mode === "upload"}
								onCheckedChange={handleModeChange}
								disabled={isActive}
							/>
							<span
								className={`text-sm ${mode === "upload" ? "font-semibold" : "text-muted-foreground"}`}
							>
								Upload Video
							</span>
						</div>
					</div>
				</div>
				<VideoFeed
					mode={mode}
					videoRef={videoRef}
					cameraReady={cameraReady}
					cameraError={cameraError}
					isActive={isActive}
					hasVideoFile={hasVideoFile}
					setHasVideoFile={setHasVideoFile}
					onRefsReady={handleRefsReady}
					onFileSelected={() => {}}
					onVideoLoaded={handleVideoLoaded}
					onStop={handleStop}
				/>
			</div>
			<div className="lg:min-h-120">
				<StatsPanel
					repCount={repCount}
					halfRepCount={halfRepCount}
					currentAngle={currentAngle}
					formCorrect={formCorrect}
					feedback={feedback}
					elapsedSeconds={elapsedSeconds}
					isActive={isActive}
					isLoading={isLoading}
					isSaving={isSaving}
					saveError={saveError}
					sessionSaved={sessionSaved}
					exercise={exercise}
					mode={mode}
					videoRef={videoRef}
					onStart={handleStart}
					onStop={handleStop}
					onSave={handleSave}
					onReset={handleReset}
				/>
			</div>
		</div>
	);
};

export default Workout;
