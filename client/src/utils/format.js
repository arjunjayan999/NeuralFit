export const formatDuration = (seconds) => {
	if (seconds < 60) return `${seconds}s`;
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	if (h > 0) return `${h}h ${m}m`;
	return `${m}m ${s}s`;
};

export const formatDate = (date) =>
	new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

export const formatDateTime = (date) =>
	new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});

export const formPercent = (session) => {
	if (!session.totalReps) return "—";
	return `${Math.round((session.totalReps / (session.totalReps + session.halfReps)) * 100)}%`;
};
