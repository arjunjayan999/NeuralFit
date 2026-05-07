import {
	ChevronLeft,
	ChevronRight,
	Clock,
	Dumbbell,
	Filter,
	Repeat,
	Trash2,
	TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { formatDateTime, formatDuration, formPercent } from "../utils/format";

const HistorySkeleton = () => (
	<div className="space-y-3">
		{Array.from({ length: 5 }).map((_, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list, order never changes
			<Skeleton key={i} className="h-28 rounded-xl" />
		))}
	</div>
);

const SessionCard = ({ session, onDelete }) => {
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		setDeleting(true);
		try {
			await api.delete(`/sessions/${session._id}`);
			onDelete(session._id);
		} catch (err) {
			console.error("Delete failed:", err);
			alert("Could not delete session. Please try again.");
			setDeleting(false);
		}
	};

	const goodFormPct = session.totalReps
		? Math.round(
				(session.totalReps / (session.totalReps + session.halfReps)) * 100,
			)
		: 0;

	const formColour =
		goodFormPct >= 70
			? "text-green-500"
			: goodFormPct >= 40
				? "text-yellow-500"
				: "text-red-500";

	return (
		<div className="rounded-xl border bg-card pt-5 pr-5 pl-5 pb-3 space-y-4">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
						<Dumbbell className="w-5 h-5 text-primary" />
					</div>
					<div>
						<div className="flex items-center gap-2 flex-wrap">
							<p className="font-semibold capitalize">{session.exercise}</p>
							<Badge variant="secondary" className="text-xs capitalize">
								{session.mode}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground">
							{formatDateTime(session.createdAt)}
						</p>
					</div>
				</div>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={deleting}
							className="text-muted-foreground hover:text-destructive shrink-0"
							aria-label="Delete session"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<div className="flex items-center gap-2">
								<div className="rounded-full bg-red-100 p-2 dark:bg-red-950">
									<Trash2 className="h-4 w-4 text-red-600" />
								</div>

								<AlertDialogTitle className="text-red-600">
									Delete this session?
								</AlertDialogTitle>
							</div>

							<AlertDialogDescription className="pt-2">
								This action cannot be undone. All data from this session will be
								permanently removed.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel
								className="
			border-border
			bg-background
			text-foreground
			hover:bg-muted
			hover:text-foreground
		"
							>
								Cancel
							</AlertDialogCancel>

							<AlertDialogAction
								onClick={handleDelete}
								disabled={deleting}
								className="bg-red-600
			text-white
			hover:bg-red-700
			focus:ring-red-500
			disabled:opacity-50"
							>
								{deleting ? "Deleting..." : "Delete Session"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t">
				<div className="space-y-1">
					<p className="text-xs text-muted-foreground flex items-center gap-1">
						<Repeat className="w-3 h-3" /> Total Reps
					</p>
					<p className="text-xl font-bold">{session.totalReps}</p>
				</div>

				<div className="space-y-1">
					<p className="text-xs text-muted-foreground flex items-center gap-1">
						<Clock className="w-3 h-3" /> Duration
					</p>
					<p className="text-xl font-bold">
						{formatDuration(session.durationSeconds)}
					</p>
				</div>

				<div className="space-y-1">
					<p className="text-xs text-muted-foreground flex items-center gap-1">
						<TrendingUp className="w-3 h-3" /> Good Form
					</p>
					<p className={`text-xl font-bold ${formColour}`}>
						{formPercent(session)}
					</p>
				</div>

				<div className="space-y-1">
					<p className="text-xs text-muted-foreground">Avg Angle</p>
					<p className="text-xl font-bold">
						{session.averageAngle
							? `${Math.round(session.averageAngle)}°`
							: "—"}
					</p>
				</div>
			</div>
		</div>
	);
};

const Pagination = ({ page, totalPages, onPrev, onNext }) => (
	<div className="flex items-center justify-center gap-4 pt-2">
		<Button variant="outline" size="sm" onClick={onPrev} disabled={page === 1}>
			<ChevronLeft className="w-4 h-4 mr-1" />
			Prev
		</Button>
		<span className="text-sm text-muted-foreground">
			Page {page} of {totalPages}
		</span>
		<Button
			variant="outline"
			size="sm"
			onClick={onNext}
			disabled={page === totalPages}
		>
			Next
			<ChevronRight className="w-4 h-4 ml-1" />
		</Button>
	</div>
);

const ITEMS_PER_PAGE = 8;

const History = () => {
	const [sessions, setSessions] = useState([]);
	const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
	const [exercise, setExercise] = useState("all");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchSessions = useCallback(async (page, exerciseFilter) => {
		setLoading(true);
		setError("");
		try {
			const exerciseParam =
				exerciseFilter !== "all" ? `&exercise=${exerciseFilter}` : "";
			const data = await api.get(
				`/sessions?limit=${ITEMS_PER_PAGE}&page=${page}${exerciseParam}`,
			);
			setSessions(data.data.sessions);
			setPagination(data.data.pagination);
		} catch (err) {
			setError("Could not load workout history.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSessions(1, "all");
	}, [fetchSessions]);

	const handleExerciseChange = (value) => {
		setExercise(value);
		fetchSessions(1, value);
	};

	const handlePrev = () => fetchSessions(pagination.page - 1, exercise);
	const handleNext = () => fetchSessions(pagination.page + 1, exercise);

	const handleDelete = (deletedId) => {
		setSessions((prev) => prev.filter((s) => s._id !== deletedId));
		setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Workout History</h1>
					<p className="text-muted-foreground mt-1">
						{pagination.total} session{pagination.total !== 1 ? "s" : ""}{" "}
						recorded
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Filter className="w-4 h-4 text-muted-foreground" />
					<Select value={exercise} onValueChange={handleExerciseChange}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Filter exercise" />
						</SelectTrigger>
						<SelectContent position="popper">
							<SelectItem value="all">All exercises</SelectItem>
							<SelectItem value="squat">Squats</SelectItem>
							<SelectItem value="push-up">Push-ups</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{error && (
				<div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm">
					{error}
				</div>
			)}

			{loading ? (
				<HistorySkeleton />
			) : sessions.length === 0 ? (
				<div className="rounded-xl border border-dashed bg-card p-16 text-center space-y-3">
					<Dumbbell className="w-10 h-10 text-muted-foreground mx-auto" />
					<p className="font-medium">No sessions found</p>
					<p className="text-sm text-muted-foreground">
						{exercise !== "all"
							? `No ${exercise} sessions recorded yet.`
							: "Complete your first workout and it will appear here."}
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{sessions.map((session) => (
						<SessionCard
							key={session._id}
							session={session}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}

			{!loading && pagination.pages > 1 && (
				<Pagination
					page={pagination.page}
					totalPages={pagination.pages}
					onPrev={handlePrev}
					onNext={handleNext}
				/>
			)}
		</div>
	);
};

export default History;
