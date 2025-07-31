import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getReminderSettings,
  updateReminderSettings,
  createNotification
} from "../controllers/notificationController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getNotifications);
router.put("/:id/read", markNotificationAsRead);
router.put("/mark-all-read", markAllNotificationsAsRead);
router.delete("/:id", deleteNotification);
router.get("/reminder-settings", getReminderSettings);
router.put("/reminder-settings", updateReminderSettings);
router.post("/", createNotification);

export default router;