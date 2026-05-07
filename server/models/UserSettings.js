import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
  preferredExercise: {
    type: String, enum: ['squat', 'push-up'],
    default: 'squat',
  },
  angleSmoothing: { type: Number, default: 5, min: 1, max: 20 },
}, { timestamps: true });

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;