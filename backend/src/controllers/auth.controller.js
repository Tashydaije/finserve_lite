import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

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

        //generate a token
        const token = generateToken(user);

        res.status(201).json({
            message: "User created successfully",
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
        //generate token
        const token = generateToken(user);

        res.status(200).json({ 
            message: "Logged In successfully",
            token
         });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};