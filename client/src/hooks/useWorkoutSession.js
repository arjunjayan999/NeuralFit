import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/client";
import { analyseFrame, getThresholds } from "../utils/exerciseAnalysis";
import {
	createPoseLandmarker,
	detectPose,
	drawSkeleton,
} from "../utils/poseUtils";
import { updateRepCount } from "../utils/repCounter";

const useWorkoutSession = ({ exercise, smoothingN = 5 }) => {
	const [repCount, setRepCount] = useState(0);
	const [halfRepCount, setHalfRepCount] = useState(0);
	const [currentAngle, setCurrentAngle] = useState(0);
	const [formCorrect, setFormCorrect] = useState(true);
	const [feedback, setFeedback] = useState("Get into position to start");
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isActive, setIsActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState("");
	const [sessionSaved, setSessionSaved] = useState(false);

	const poseLandmarkerRef = useRef(null);
	const rafIdRef = useRef(null);
	const angleBufferRef = useRef([]);
	const repStageRef = useRef("up");
	const repCountRef = useRef(0);
	const halfRepCountRef = useRef(0);
	const angleAccumRef = useRef(0);
	const frameCountRef = useRef(0);
	const feedbackLogRef = useRef([]);
	const startTimeRef = useRef(null);
	const timerRef = useRef(null);

	useEffect(() => {
		let cancelled = false;

		const init = async () => {
			setIsLoading(true);
			try {
				const landmarker = await createPoseLandmarker();
				if (!cancelled) {
					poseLandmarkerRef.current = landmarker;
				}
			} catch (err) {
				console.error("Failed to initialise PoseLandmarker:", err);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		init();

		return () => {
			cancelled = true;
			poseLandmarkerRef.current?.close();
		};
	}, []);

	const processFrame = useCallback(
		(videoEl, canvasEl) => {
			const timestamp = performance.now();
			const landmarks = detectPose(
				poseLandmarkerRef.current,
				videoEl,
				timestamp,
			);

			const ctx = canvasEl.getContext("2d");

			if (
				canvasEl.width !== videoEl.videoWidth ||
				canvasEl.height !== videoEl.videoHeight
			) {
				canvasEl.width = videoEl.videoWidth;
				canvasEl.height = videoEl.videoHeight;
			}
			if (!landmarks) {
				ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
				rafIdRef.current = requestAnimationFrame(() =>
					processFrame(videoEl, canvasEl),
				);
				return;
			}

			const result = analyseFrame(
				exercise,
				landmarks,
				angleBufferRef.current,
				smoothingN,
			);

			if (!result) {
				rafIdRef.current = requestAnimationFrame(() =>
					processFrame(videoEl, canvasEl),
				);
				return;
			}

			const { angle, formCorrect: correct, feedback: msg } = result;

			const { downThreshold, upThreshold } = getThresholds(exercise);
			const {
				stage,
				repCount: newCount,
				halfRepCount: newHalfCount,
				repCompleted,
			} = updateRepCount(
				angle,
				repStageRef.current,
				repCountRef.current,
				halfRepCountRef.current,
				upThreshold,
				downThreshold,
			);

			repStageRef.current = stage;

			if (repCompleted) {
				repCountRef.current = newCount;
				halfRepCountRef.current = newHalfCount;
				setRepCount(newCount);
				setHalfRepCount(newHalfCount);
			}

			angleAccumRef.current += angle;
			frameCountRef.current += 1;

			const lastLog = feedbackLogRef.current.at(-1);
			if (!lastLog || lastLog.message !== msg) {
				feedbackLogRef.current.push({
					timestamp: Date.now() - startTimeRef.current,
					message: msg,
					formCorrect: correct,
				});
			}

			drawSkeleton(ctx, canvasEl, landmarks, correct);

			setCurrentAngle(Math.round(angle));
			setFormCorrect(correct);
			setFeedback(msg);

			rafIdRef.current = requestAnimationFrame(() =>
				processFrame(videoEl, canvasEl),
			);
		},
		[exercise, smoothingN],
	);

	const startSession = useCallback(
		(videoEl, canvasEl) => {
			if (!poseLandmarkerRef.current) return;
			repCountRef.current = 0;
			halfRepCountRef.current = 0;
			repStageRef.current = "up";
			angleAccumRef.current = 0;
			frameCountRef.current = 0;
			feedbackLogRef.current = [];
			angleBufferRef.current = [];

			setRepCount(0);
			setHalfRepCount(0);
			setCurrentAngle(0);
			setFormCorrect(true);
			setFeedback("Go! 🚀");
			setElapsedSeconds(0);
			setSessionSaved(false);
			setSaveError("");

			startTimeRef.current = Date.now();
			setIsActive(true);

			timerRef.current = setInterval(() => {
				setElapsedSeconds((s) => s + 1);
			}, 1000);

			rafIdRef.current = requestAnimationFrame(() =>
				processFrame(videoEl, canvasEl),
			);
			window.scrollTo({
				top: document.body.scrollHeight,
				behavior: "smooth",
			});
		},
		[processFrame],
	);

	const stopSession = useCallback(() => {
		if (rafIdRef.current) {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setIsActive(false);
	}, []);

	const resetSession = useCallback(() => {
		stopSession();

		repCountRef.current = 0;
		halfRepCountRef.current = 0;
		repStageRef.current = "up";
		angleAccumRef.current = 0;
		frameCountRef.current = 0;
		feedbackLogRef.current = [];
		angleBufferRef.current = [];
		startTimeRef.current = null;

		setRepCount(0);
		setHalfRepCount(0);
		setCurrentAngle(0);
		setFormCorrect(true);
		setFeedback("Get into position to start");
		setElapsedSeconds(0);
		setSessionSaved(false);
		setSaveError("");
		setIsActive(false);
	}, [stopSession]);

	const saveSession = useCallback(
		async (mode) => {
			setIsSaving(true);
			setSaveError("");

			const endTime = new Date();
			const startTime = new Date(startTimeRef.current);
			const totalFrames = frameCountRef.current;
			const averageAngle =
				totalFrames > 0 ? Math.round(angleAccumRef.current / totalFrames) : 0;

			const payload = {
				exercise,
				mode,
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString(),
				durationSeconds: Math.round((endTime - startTime) / 1000),
				totalReps: repCountRef.current,
				halfReps: halfRepCountRef.current,
				averageAngle,
				feedbackLog: feedbackLogRef.current,
			};
			try {
				await api.post("/sessions", payload);
				setSessionSaved(true);
			} catch (err) {
				setSaveError(err.message || "Failed to save session");
			} finally {
				setIsSaving(false);
			}
		},
		[exercise],
	);

	useEffect(() => {
		return () => {
			stopSession();
		};
	}, [stopSession]);

	return {
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
	};
};

export default useWorkoutSession;
