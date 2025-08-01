import express from "express";
import { signup, login, logout, completeOnboarding, updateUser, updatePreferences, getMe } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);
router.post("/complete-onboarding", verifyToken, completeOnboarding);
router.put("/update-user", verifyToken, updateUser);
router.put("/update-preferences", verifyToken, updatePreferences);

router.get("/profile", verifyToken, (req, res) => {
    res.json({ message: "Welcome to your profile!", user: req.user });
});

export default router;
