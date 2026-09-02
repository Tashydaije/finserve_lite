import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Helper: access token for protected routes
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
};

// Helper: refresh token to access protected routes
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
}

// -------------------------------------------------------------
// Helper: set tokens as HTTP-only cookies on the response 
//
// secure: true means the cookie only travels over HTTPS
// (set to false in dev since localhost is HTTP)
//
// sameSite: "strict" means the cookie is only sent if the
// request originates from our own site — protects against CSRF
// --------------------------------------------------------------
const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000           // 15mins in milliseconds
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000            // 7days in milliseconds
    });
};

// Register User
export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        //check if the user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "User already exists"});
        }

        //create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        });

        //generate a `access & refresh token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // set tokens as HTTP-only cookies
        setTokenCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password required!" });
        }       
        //check user exists
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        //check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: "User is deactivated" });
        }
        //compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        //generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // set as cookies
        setTokenCookies(res, accessToken, refreshToken);

        res.status(200).json({ 
            message: "Logged In successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
         });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Refresh token route hit silently by frontend when access token expires
// Generates new refresh token to invalidate old one
export const refresh = async (res, req) => {
    try {
        // pull refresh token from cookies
        const token = req.cookies.refreshToken;

        if (!token) {
            res.status(401).json({ message: "No refresh token, please login again" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            res.status(403).json({ message: "Invalid or expired refresh token, please login again" });
        }

        // find user
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            res.status(403).json({ message: "User not found or deactivated" });
        }

        // Rotation: generate new access & refresh token
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Overwrite the set cookies
        setTokenCookies(res, newAccessToken, newRefreshToken);

        res.status(200).json({ message: "Token Refreshed Successfully" });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Logout - clear the cookies
export const logout = async (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({ message: "Logged out successfully" });
};