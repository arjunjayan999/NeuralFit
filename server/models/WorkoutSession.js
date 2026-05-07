import mongoose from "mongoose";

const feedbackEventSchema = new mongoose.Schema({
  timestamp: { type: Number, required: true },
  message: { type: String, required: true },
  formCorrect: { type: Boolean, required: true },
}, { _id: false });

const workoutSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exercise: { type: String, required: true, enum: ['squat', 'push-up'] },
  mode: { type: String, required: true, enum: ['live', 'upload'] },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationSeconds: { type: Number, required: true },
  totalReps: { type: Number, default: 0 },
  halfReps: { type: Number, default: 0 },
  averageAngle: { type: Number, default: 0 }, 
  feedbackEvents: { type: [feedbackEventSchema], default: [] },
}, { timestamps: true });

const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);

export default WorkoutSession;