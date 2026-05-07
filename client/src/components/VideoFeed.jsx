import { Upload, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";

const VideoFeed = ({
	mode,
	videoRef,
	cameraReady,
	cameraError,
	isActive,
	hasVideoFile,
	setHasVideoFile,
	onRefsReady,
	onFileSelected,
	onVideoLoaded,
	onStop,
}) => {
	const canvasRef = useRef(null);
	const fileInputRef = useRef(null);

	useEffect(() => {
		if (canvasRef.current) {
			onRefsReady(canvasRef.current);
		}
	}, [onRefsReady]);

	useEffect(() => {
		if (mode === "upload") {
			setHasVideoFile(false);
		}
	}, [mode, setHasVideoFile]);

	const handleFileChange = useCallback(
		(e) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const video = videoRef.current;
			if (!video) return;
			const url = URL.createObjectURL(file);
			video.src = url;
			video.load();
			setHasVideoFile(true);

			video.onloadeddata = () => {
				onVideoLoaded?.();
			};

			video.onended = () => {
				onStop?.();
			};

			onFileSelected?.(file);
		},
		[videoRef, onFileSelected, onVideoLoaded, onStop, setHasVideoFile],
	);

	return (
		<div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video">
			<video
				ref={videoRef}
				className="w-full h-full object-contain"
				autoPlay
				playsInline
				muted
			/>
			<canvas
				ref={canvasRef}
				className="absolute inset-0 w-full h-full"
				style={{ pointerEvents: "none" }}
			/>
			{mode === "upload" && !hasVideoFile && !cameraReady && !cameraError && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80">
					<Upload className="w-12 h-12 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						Select a video file to analyse
					</p>
					<Button
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
					>
						Choose Video
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept="video/mp4,video/webm,video/quicktime"
						className="hidden"
						onChange={handleFileChange}
					/>
				</div>
			)}
			{cameraError && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 p-6 text-center">
					<VideoOff className="w-10 h-10 text-destructive" />
					<p className="text-sm text-destructive font-medium">{cameraError}</p>
				</div>
			)}
			{isActive && mode === "live" && (
				<div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
					<span className="w-2 h-2 rounded-full bg-white animate-pulse" />
					LIVE
				</div>
			)}
		</div>
	);
};

export default VideoFeed;
