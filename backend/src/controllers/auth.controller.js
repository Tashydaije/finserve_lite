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
        const { name, email, password } = req.body;

        //check if the user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "User already exists"});
        }

        //create user
        const user = await User.create({
            name,
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
