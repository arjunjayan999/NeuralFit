export const updateRepCount = (
	angle,
	stage,
	repCount,
	halfRepCount,
	upThreshold,
	downThreshold,
) => {
	let newStage = stage;
	let newRepCount = repCount;
	let newHalfRepCount = halfRepCount;
	let repCompleted = false;

	if (stage === "up" && angle < upThreshold) {
		newStage = "mid";
	} else if (stage === "mid" && angle < downThreshold) {
		newStage = "down";
	} else if (stage === "mid" && angle > upThreshold) {
		newStage = "up";
		newHalfRepCount = halfRepCount + 1;
		repCompleted = true;
	} else if (stage === "down" && angle > upThreshold) {
		newStage = "up";
		newRepCount = repCount + 1;
		repCompleted = true;
	}

	return {
		stage: newStage,
		repCount: newRepCount,
		halfRepCount: newHalfRepCount,
		repCompleted,
	};
};
