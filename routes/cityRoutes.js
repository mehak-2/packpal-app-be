import express from "express";
import { getCities, getCityById } from "../controllers/cityController.js";

const router = express.Router();

router.get("/", getCities);
router.get("/:id", getCityById);

export default router; 