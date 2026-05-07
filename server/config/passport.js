import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0].value?.toLowerCase();
    const avatar = profile.photos?.[0].value;
    const name = profile.displayName;

    let user = await User.findOne({ googleId: profile.id });
    if(user) return done(null, user);

    user = await User.findOne({email});
    if(user) {
        user.googleId = profile.id;
        if(!user.avatar) user.avatar = avatar;
        await user.save();
        return done(null, user);
    }

    user = await User.create({
        name, email, googleId: profile.id, avatar, isVerified: true,
    });

    await UserSettings.create({ userId: user._id });

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

export default passport;