import express from "express";
import { getUsers, getUserById } from "../controllers/userController.js";
import { verifyToken as authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getUsers);
router.get("/:id", authenticateToken, getUserById);

export default router; 