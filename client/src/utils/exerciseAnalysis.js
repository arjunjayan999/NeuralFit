import { calculateAngle, LANDMARKS, smoothAngle } from "./poseUtils";

const EXERCISES = {
	squat: {
		downThreshold: 105,
		upThreshold: 155,

		analyse(landmarks, angleBuffer, smoothingN) {
			const hip = landmarks[LANDMARKS.LEFT_HIP];
			const knee = landmarks[LANDMARKS.LEFT_KNEE];
			const ankle = landmarks[LANDMARKS.LEFT_ANKLE];

			const rawAngle = calculateAngle(hip, knee, ankle);
			const angle = smoothAngle(angleBuffer, rawAngle, smoothingN);

			let feedback = "";
			let formCorrect = true;

			if (angle <= 70) {
				feedback = "Excellent depth 🔥";
				formCorrect = true;
			} else if (angle <= 90) {
				feedback = "Good squat 👍";
				formCorrect = true;
			} else if (angle <= 120) {
				feedback = "Go deeper for full range";
				formCorrect = true;
			} else if (angle <= 160) {
				feedback = "Too shallow — this rep won't count";
				formCorrect = false;
			} else {
				feedback = "Stand tall, then initiate the squat";
				formCorrect = true;
			}

			return { angle, formCorrect, feedback };
		},
	},

	"push-up": {
		downThreshold: 95,
		upThreshold: 160,

		analyse(landmarks, angleBuffer, smoothingN) {
			const shoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
			const elbow = landmarks[LANDMARKS.LEFT_ELBOW];
			const wrist = landmarks[LANDMARKS.LEFT_WRIST];

			const rawAngle = calculateAngle(shoulder, elbow, wrist);
			const angle = smoothAngle(angleBuffer, rawAngle, smoothingN);

			let feedback = "";
			let formCorrect = true;

			if (angle <= 70) {
				feedback = "Excellent depth 🔥";
				formCorrect = true;
			} else if (angle <= 95) {
				feedback = "Great push-up 💪";
				formCorrect = true;
			} else if (angle <= 125) {
				feedback = "Go a little lower";
				formCorrect = true;
			} else if (angle <= 160) {
				feedback = "Too shallow — this rep won't count";
				formCorrect = false;
			} else {
				feedback = "Start in a full plank position";
				formCorrect = true;
			}

			return { angle, formCorrect, feedback };
		},
	},
};

export const analyseFrame = (exercise, landmarks, angleBuffer, smoothingN) => {
	const def = EXERCISES[exercise];
	if (!def || !landmarks) return null;
	return def.analyse(landmarks, angleBuffer, smoothingN);
};

export const getThresholds = (exercise) => {
	const def = EXERCISES[exercise];
	return {
		downThreshold: def?.downThreshold ?? 90,
		upThreshold: def?.upThreshold ?? 160,
	};
};
