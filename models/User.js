import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    onboardingCompleted: { type: Boolean, default: false },
    notifications: { type: Boolean, default: false },
    personalizedRecommendations: { type: Boolean, default: false },
    currency: { type: String, default: "USD" },
}, { timestamps: true });


export default mongoose.model("User", userSchema);
