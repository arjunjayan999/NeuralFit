import {
	ArrowRight,
	CalendarDays,
	Clock,
	Dumbbell,
	Repeat,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import StatCard from "../components/StatCard";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatDuration, formPercent } from "../utils/format";

const computeStats = (sessions) => {
	const totalSessions = sessions.length;
	const totalReps = sessions.reduce((sum, s) => sum + s.totalReps, 0);
	const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
	const goodReps = sessions.reduce((sum, s) => sum + s.totalReps, 0);
	const allReps = sessions.reduce(
		(sum, s) => sum + s.totalReps + s.halfReps,
		0,
	);
	const avgFormPct = allReps > 0 ? Math.round((goodReps / allReps) * 100) : 0;

	return { totalSessions, totalReps, totalSeconds, avgFormPct };
};

const DashboardSkeleton = () => (
	<div className="space-y-8">
		<Skeleton className="h-8 w-48" />
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{Array.from({ length: 4 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list, order never changes
				<Skeleton key={i} className="h-32 rounded-xl" />
			))}
		</div>
		<Skeleton className="h-6 w-36" />
		<div className="space-y-3">
			{Array.from({ length: 3 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list, order never changes
				<Skeleton key={i} className="h-20 rounded-xl" />
			))}
		</div>
	</div>
);

const RecentSessionRow = ({ session }) => (
	<div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
		<div className="flex items-center gap-4">
			<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
				<Dumbbell className="w-5 h-5 text-primary" />
			</div>
			<div>
				<p className="font-medium capitalize">{session.exercise}</p>
				<p className="text-sm text-muted-foreground">
					{formatDate(session.createdAt)}
				</p>
			</div>
		</div>

		<div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
			<span>{session.totalReps} reps</span>
			<span>{formatDuration(session.durationSeconds)}</span>
			<span>{formPercent(session)} good form</span>
		</div>

		<div className="sm:hidden text-sm text-muted-foreground">
			{session.totalReps} reps
		</div>
	</div>
);

const Dashboard = () => {
	const { user } = useAuth();
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchSessions = async () => {
			try {
				const data = await api.get("/sessions");
				setSessions(data.data.sessions);
			} catch (err) {
				setError("Could not load your workout data.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchSessions();
	}, []);

	if (loading) return <DashboardSkeleton />;

	const stats = computeStats(sessions);

	const hour = new Date().getHours();
	const greeting =
		hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					{greeting}, {user?.name?.split(" ")[0]} 👋
				</h1>
				<p className="text-muted-foreground mt-1">
					Here's an overview of your recent training.
				</p>
			</div>

			{error && (
				<div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm">
					{error}
				</div>
			)}

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					icon={CalendarDays}
					label="Total Sessions"
					value={stats.totalSessions}
					detail="completed sets"
				/>
				<StatCard
					icon={Repeat}
					label="Total Reps"
					value={stats.totalReps.toLocaleString()}
					detail="across all exercises"
				/>
				<StatCard
					icon={Clock}
					label="Time Trained"
					value={formatDuration(stats.totalSeconds)}
					detail="total active time"
				/>
				<StatCard
					icon={TrendingUp}
					label="Good Form"
					value={`${stats.avgFormPct}%`}
					detail="average across sessions"
				/>
			</div>

			<div className="rounded-xl border-primary/20 border-2 bg-primary/10  p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h2 className="font-semibold text-lg">Ready to train?</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Start a live session or upload a video for analysis.
					</p>
				</div>
				<Button
					asChild
					size="lg"
					className="
		group
		relative
		overflow-hidden
		shrink-0
		bg-background
		text-primary
		hover:text-background
		hover:bg-background
		border-primary
		border-2
	"
				>
					<Link to="/workout" className="relative z-10 flex items-center">
						<span
							className="
				absolute inset-0
				-z-10
				scale-x-0
				origin-left
				bg-primary
				transition-transform
				duration-300
				ease-out
				group-hover:scale-x-100
			"
						/>

						<span className="relative z-10">Start Workout</span>

						<ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
					</Link>
				</Button>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Recent Sessions</h2>
					<Button asChild variant="ghost" size="sm">
						<Link to="/history">
							View all
							<ArrowRight className="w-4 h-4 ml-1" />
						</Link>
					</Button>
				</div>

				{sessions.length === 0 ? (
					<div className="rounded-xl border border-dashed bg-card p-12 text-center space-y-3">
						<Dumbbell className="w-10 h-10 text-muted-foreground mx-auto" />
						<p className="font-medium">No workouts yet</p>
						<p className="text-sm text-muted-foreground">
							Complete your first session and it'll show up here.
						</p>
						<Button asChild className="mt-2">
							<Link to="/workout">Start your first workout</Link>
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						{sessions.slice(0, 5).map((session) => (
							<RecentSessionRow key={session._id} session={session} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
