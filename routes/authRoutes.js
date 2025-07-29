import express from "express";
import { signup, login, logout, completeOnboarding } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/complete-onboarding", verifyToken, completeOnboarding);

// Protected route example
router.get("/profile", verifyToken, (req, res) => {
    res.json({ message: "Welcome to your profile!", user: req.user });
});

export default router;
