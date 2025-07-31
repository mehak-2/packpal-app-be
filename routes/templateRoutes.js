import express from "express";
import {
  createTemplate,
  getTemplates,
  deleteTemplate
} from "../controllers/tripController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createTemplate);
router.get("/", getTemplates);
router.delete("/:id", deleteTemplate);

export default router;