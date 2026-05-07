import { useCallback, useRef, useState } from "react";

const useCamera = () => {
	const videoRef = useRef(null);
	const streamRef = useRef(null);
	const [cameraError, setCameraError] = useState("");
	const [cameraReady, setCameraReady] = useState(false);

	const startCamera = useCallback(async () => {
		setCameraError("");
		setCameraReady(false);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 },
					facingMode: "user",
				},
				audio: false,
			});

			streamRef.current = stream;

			if (videoRef.current) {
				videoRef.current.srcObject = stream;

				await new Promise((resolve) => {
					videoRef.current.onloadeddata = resolve;
				});

				await videoRef.current.play();
				setCameraReady(true);
			}

			return true;
		} catch (err) {
			if (err.name === "NotAllowedError") {
				setCameraError(
					"Camera access denied. Please allow camera permissions and try again.",
				);
			} else if (err.name === "NotFoundError") {
				setCameraError("No camera found on this device.");
			} else {
				setCameraError(`Camera error: ${err.message}`);
			}
			return false;
		}
	}, []);

	const stopCamera = useCallback(() => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				track.stop();
			});
			streamRef.current = null;
		}
		if (videoRef.current) {
			videoRef.current.srcObject = null;
			videoRef.current.src = "";
			videoRef.current.removeAttribute("src");
		}
		setCameraReady(false);
	}, []);

	return {
		videoRef,
		startCamera,
		stopCamera,
		cameraError,
		cameraReady,
	};
};

export default useCamera;
