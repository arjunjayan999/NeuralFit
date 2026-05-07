import { verifyAccessToken } from "../utils/jwt.js";

const protect = (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        return res.status(401).json({success: false, error: 'Not authorized - no token'});
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        if(err.name === 'TokenExpiredError') {
            return res.status(401).json({success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({success: false, error: 'Not authorized - invalid token'});
    }
};
export default protect;