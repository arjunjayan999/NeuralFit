import express from 'express';
import WorkoutSession from '../models/WorkoutSession.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
    try {
        const {
      exercise,
      mode,
      startTime,
      endTime,
      durationSeconds,
      totalReps,
      halfReps,
      averageAngle,
      feedbackLog,
    } = req.body;
    if(!exercise || !mode || !startTime || !endTime || durationSeconds == null){
        return res.status(400).json({ success: false, error: 'Missing required session fields' });
    }
    const session = await WorkoutSession.create({
        userId: req.user.id,
        exercise,
        mode,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        durationSeconds,
        totalReps: totalReps ?? 0,
        halfReps: halfReps ?? 0,
        averageAngle: averageAngle ?? 0,
        feedbackLog: feedbackLog ?? [],
    });
    return res.status(201).json({ success: true, data: { session } });
    } catch (err) {
        console.error('Error creating workout session:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

router.get('/', protect,  async (req, res) => {
    try {
        const { exercise, limit = 20, page = 1 } = req.query;
        const filter = {userId: req.user.id};
        if(exercise) filter.exercise = exercise;
        const skip = (Number(page) - 1) * Number(limit);
        const [sessions, total] = await Promise.all([
            WorkoutSession.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            WorkoutSession.countDocuments(filter),
        ]);
        return res.json({ success: true, data: { sessions, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } } });
    } catch (err) {
        console.error('Error fetching workout sessions:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const session = await WorkoutSession.findOne({_id: req.params.id, userId: req.user.id});
        if(!session) return res.status(404).json({ success: false, error: 'Session not found' });
        return res.json({ success: true, data: { session } });
    } catch (err) {
        console.error('Error fetching workout session:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

router.delete('/:id',protect,  async (req, res) => {
    try {
        const session = await WorkoutSession.findOneAndDelete({_id: req.params.id, userId: req.user.id});
        if(!session) return res.status(404).json({ success: false, error: 'Session not found' });
        return res.json({ success: true, data: { message: 'Session deleted' } });
    } catch (err) {
        console.error('Error deleting workout session:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

export default router;