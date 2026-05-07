const StatCard = ({
	icon: Icon,
	label,
	value,
	detail,
	iconClassName = "text-primary",
}) => (
	<div className="rounded-xl border-2 border-black/15 shadow-sm bg-card p-5 space-y-3">
		<div className="flex items-center justify-between">
			<span className="text-sm font-medium text-muted-foreground">{label}</span>
			<div
				className={`w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center`}
			>
				<Icon className={`w-5 h-5 ${iconClassName}`} strokeWidth={2.5} />
			</div>
		</div>
		<div>
			<p className="text-3xl font-bold tracking-tight">{value}</p>
			{detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
		</div>
	</div>
);

export default StatCard;
