import express from 'express';
import UserSettings from '../models/UserSettings.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
    try {
        let settings = await UserSettings.findOne({ userId: req.user.id });
        if(!settings) settings = await UserSettings.create({ userId: req.user.id });
        return res.json({ success: true, data: { settings } });
    } catch (err) {
        console.error('Error fetching user settings:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

router.put('/', async (req, res) => {
    try {
        const allowed = ['theme', 'preferredExercise', 'angleSmoothing'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }
        if(Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }
        const settings = await UserSettings.findOneAndUpdate(
            { userId: req.user.id },
            { $set: updates },
            { new: true,runValidators: true, upsert: true });
        return res.json({ success: true, data: { settings } });
    } catch (err) {
        if(err.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: err.message });
        }
        console.error('Error updating user settings:', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

export default router;