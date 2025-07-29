import express from "express";
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  updatePackingList,
  regeneratePackingList
} from "../controllers/tripController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getTrips);
router.get("/:id", getTripById);
router.post("/", createTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);
router.put("/:id/packing-list", updatePackingList);
router.post("/:id/regenerate-packing-list", regeneratePackingList);

export default router; 