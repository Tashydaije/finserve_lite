import jwt from "jsonwebtoken";
import User from "../models/User.js";

// -------------------------------------------------------
// PROTECT MIDDLEWARE
// Reads the access token from the HTTP-only cookie,
// verifies it, finds the user, and attaches them to
// req.user so any route handler can access the logged-in user.
//
// If token is missing or expired, we reject the request.
// The frontend should then call /auth/refresh to get a new one.
// -------------------------------------------------------

export const protect = async (req, res, next) => {
    try {
        // Read access token from cookie
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated, please login" });
        }

        // Verify token (if expired or tampered with)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user & attach to request
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User no longer exist" });      
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token expired or invalid, please refresh" });
    }
       
};