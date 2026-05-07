import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import './config/passport.js';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import settingsRoutes from './routes/settings.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
  res.json({success:true, data: {message: 'NeuralFit API is running!'}});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});