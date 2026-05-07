import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

const EXERCISES = [
	{ value: "squat", label: "Squat", cue: "Hip → Knee → Ankle" },
	{ value: "push-up", label: "Push-Up", cue: "Shoulder → Elbow → Wrist" },
];

const ExerciseSelector = ({ value, onChange, disabled }) => (
	<div className="space-y-1.5 flex flex-col items-center">
		<label
			htmlFor="exercise-select"
			className="text-sm font-medium text-muted-foreground"
		>
			Exercise
		</label>
		<Select value={value} onValueChange={onChange} disabled={disabled}>
			<SelectTrigger id="exercise-select" className="w-full sm:w-52">
				<SelectValue />
			</SelectTrigger>
			<SelectContent position="popper">
				{EXERCISES.map((ex) => (
					<SelectItem key={ex.value} value={ex.value}>
						<span className="font-medium">{ex.label}</span>
						<span className="ml-2 text-xs text-muted-foreground">{ex.cue}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	</div>
);

export default ExerciseSelector;
