import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "1h" });

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "1h" });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const completeOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;
        await User.findByIdAndUpdate(userId, { onboardingCompleted: true });
        res.json({ message: "Onboarding completed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
