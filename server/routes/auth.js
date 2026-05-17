import express from 'express';
import argon2 from 'argon2';
import passport from 'passport';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';
import protect from '../middleware/authMiddleware.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, setTokenCookies, clearTokenCookies, generateOAuthExchangeToken, verifyOAuthExchangeToken } from '../utils/jwt.js';

const router = express.Router();

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 32768,
  timeCost: 2,
  parallelism: 1,
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({success: false, error: 'An account with this email already exists' });
    }

    const passwordHash = await argon2.hash(password, ARGON2_OPTIONS);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash });
    await UserSettings.create({ userId: user._id });
    const accessToken = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id});

    user.refreshTokens.push(refreshToken);
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    res.status(201).json({ success: true, data: {user} });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshTokens.push(refreshToken);
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    return res.json({ success: true, data: {user} });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, error: 'No refresh token' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(token)) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, error: 'Refresh token reuse detected' });
    }
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const newAccessToken = generateAccessToken({ id: user._id, email: user.email });
    const newRefreshToken = generateRefreshToken({ id: user._id });
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setTokenCookies(res, newAccessToken, newRefreshToken);
    return res.json({ success: true, data: {message: 'Token refreshed'} });
  } catch (err) {
    console.error('Error during token refresh:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/logout', protect, async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    const user = await User.findById(req.user.id);
    if (user && token) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
      await user.save();
    }
    clearTokenCookies(res);
    return res.json({ success: true, data: {message: 'Logged out'} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/logout-all', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }
    clearTokenCookies(res);
    return res.json({ success: true, data: {message: 'Logged out from all devices'} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, data: {user} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`, session: false }), async (req, res) => {
  try {    const user = req.user;
    const exchangeToken = generateOAuthExchangeToken({
        id: user._id
      });
    return res.redirect(`${process.env.CLIENT_URL}/oauth-success?exchangeToken=${exchangeToken}`);
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
});

router.post('/oauth/exchange', async (req, res) => {
  try {
    const { exchangeToken } = req.body;
    if (!exchangeToken) {
      return res.status(400).json({ success: false, error: 'Exchange token is required' });
    }

    let decoded;
    try {
      decoded = verifyOAuthExchangeToken(exchangeToken);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired exchange token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const accessToken = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshTokens.push(refreshToken);
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    return res.json({ success: true, data: {user} });
  } catch (err) {
    console.error('Error during OAuth token exchange:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;