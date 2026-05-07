import {
	DrawingUtils,
	FilesetResolver,
	PoseLandmarker,
} from "@mediapipe/tasks-vision";

const WASM_URL =
	"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const MODEL_URL =
	"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

export const LANDMARKS = {
	LEFT_SHOULDER: 11,
	RIGHT_SHOULDER: 12,
	LEFT_ELBOW: 13,
	RIGHT_ELBOW: 14,
	LEFT_WRIST: 15,
	RIGHT_WRIST: 16,
	LEFT_HIP: 23,
	RIGHT_HIP: 24,
	LEFT_KNEE: 25,
	RIGHT_KNEE: 26,
	LEFT_ANKLE: 27,
	RIGHT_ANKLE: 28,
};

export const createPoseLandmarker = async () => {
	const vision = await FilesetResolver.forVisionTasks(WASM_URL);

	const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
		baseOptions: {
			modelAssetPath: MODEL_URL,
			delegate: "GPU",
		},
		runningMode: "VIDEO",
		numPoses: 1,
		minPoseDetectionConfidence: 0.5,
		minPosePresenceConfidence: 0.5,
		minTrackingConfidence: 0.5,
	});

	return poseLandmarker;
};

export const detectPose = (poseLandmarker, videoEl, timestamp) => {
	if (!poseLandmarker || !videoEl) return null;
	if (videoEl.readyState < 2) return null;

	const result = poseLandmarker.detectForVideo(videoEl, timestamp);

	if (!result.landmarks || result.landmarks.length === 0) return null;

	const landmarks = result.landmarks[0];

	return landmarks;
};

export const drawSkeleton = (ctx, canvasEl, landmarks, formCorrect) => {
	if (!ctx || !landmarks) return;

	ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

	const drawingUtils = new DrawingUtils(ctx);
	const colour = formCorrect ? "#22c55e" : "#ef4444";

	drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
		color: colour,
		lineWidth: 3,
	});

	drawingUtils.drawLandmarks(landmarks, {
		color: colour,
		fillColor: colour,
		lineWidth: 1,
		radius: 4,
	});
};

export const calculateAngle = (A, B, C) => {
	const radians =
		Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
	let angle = Math.abs(radians * (180 / Math.PI));
	if (angle > 180) angle = 360 - angle;
	return angle;
};

export const smoothAngle = (buffer, newAngle, N = 5) => {
	buffer.push(newAngle);
	if (buffer.length > N) buffer.shift();
	return buffer.reduce((a, b) => a + b, 0) / buffer.length;
};
