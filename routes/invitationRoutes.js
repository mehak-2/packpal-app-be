import express from "express";
import {
  sendInvitation,
  acceptInvitation,
  declineInvitation,
  getPendingInvitations,
  getSentInvitations,
  getTripInvitations,
  resendInvitation
} from "../controllers/invitationController.js";
import { verifyToken as authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/send", sendInvitation);

router.post("/:invitationId/accept", acceptInvitation);

router.post("/:invitationId/decline", declineInvitation);

router.post("/:invitationId/resend", resendInvitation);

router.get("/pending", getPendingInvitations);

router.get("/sent", getSentInvitations);

router.get("/trip/:tripId", getTripInvitations);

export default router; 