import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        console.log("Signup request received:", { body: req.body });
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            console.log("Missing required fields");
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists:", email);
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "1h" });

        console.log("User created successfully:", user.email);
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
        console.error("Signup error:", err);
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

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ 
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                onboardingCompleted: user.onboardingCompleted,
                notifications: user.notifications,
                personalizedRecommendations: user.personalizedRecommendations,
                currency: user.currency
            }
        });
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, password, notifications } = req.body;

        const updateData = {};
        if (email) updateData.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 12);
            updateData.password = hashedPassword;
        }
        if (notifications !== undefined) updateData.notifications = notifications;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                onboardingCompleted: updatedUser.onboardingCompleted,
                notifications: updatedUser.notifications
            }
        });
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const updatePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notifications, personalizedRecommendations, currency } = req.body;

        const updateData = {};
        if (notifications !== undefined) updateData.notifications = notifications;
        if (personalizedRecommendations !== undefined) updateData.personalizedRecommendations = personalizedRecommendations;
        if (currency) updateData.currency = currency;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Preferences updated successfully",
            preferences: {
                notifications: updatedUser.notifications,
                personalizedRecommendations: updatedUser.personalizedRecommendations,
                currency: updatedUser.currency
            }
        });
    } catch (err) {
        console.error("Update preferences error:", err);
        res.status(500).json({ message: err.message });
    }
};
