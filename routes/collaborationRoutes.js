import express from "express";
import {
  healthCheck,
  inviteCollaborator,
  getCollaborators,
  getActivityLog,
  acceptInvitation,
  declineInvitation,
  removeCollaborator,
  updateCollaboratorRole
} from "../controllers/collaborationController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/health", healthCheck);
router.use(verifyToken);

router.post("/trips/:tripId/invite", inviteCollaborator);
router.get("/trips/:tripId/collaborators", getCollaborators);
router.get("/trips/:tripId/activity-log", getActivityLog);
router.post("/invitations/:invitationId/accept", acceptInvitation);
router.post("/invitations/:invitationId/decline", declineInvitation);
router.delete("/trips/:tripId/collaborators/:userId", removeCollaborator);
router.put("/trips/:tripId/collaborators/:userId/role", updateCollaboratorRole);

export default router;