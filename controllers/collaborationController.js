import Invitation from "../models/Invitation.js";
import Collaboration from "../models/Collaboration.js";
import ActivityLog from "../models/ActivityLog.js";
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import emailService from "../services/emailService.js";

export const healthCheck = async (req, res) => {
  try {
    res.json({ 
      status: "ok", 
      message: "Collaboration service is running",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ message: "Health check failed" });
  }
};

export const inviteCollaborator = async (req, res) => {
  let tripId, email, role, inviterId;
  
  try {
    tripId = req.params.tripId;
    email = req.body.email;
    role = req.body.role;
    inviterId = req.user.id;
    
    console.log("=== INVITE COLLABORATOR DEBUG ===");
    console.log("tripId:", tripId);
    console.log("email:", email);
    console.log("role:", role);
    console.log("inviterId:", inviterId);
    console.log("req.params:", req.params);
    console.log("req.body:", req.body);
    console.log("req.user:", req.user);
    console.log("==================================");

    console.log("Looking for trip with ID:", tripId);
    const trip = await Trip.findById(tripId);
    console.log("Trip found:", trip ? "Yes" : "No");
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    console.log("Checking trip ownership...");
    const isTripOwner = trip.userId.toString() === inviterId;
    const existingCollaboration = await Collaboration.findOne({
      tripId,
      userId: inviterId
    });

    if (!isTripOwner && (!existingCollaboration || existingCollaboration.role === "view")) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    console.log("Looking for user with email:", email);
    const invitee = await User.findOne({ email });
    console.log("User found:", invitee ? "Yes" : "No");
    if (!invitee) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingInvitation = await Invitation.findOne({
      tripId,
      inviteeEmail: email,
      status: "pending"
    });

    if (existingInvitation) {
      return res.status(400).json({ message: "Invitation already sent" });
    }

    const invitation = new Invitation({
      tripId,
      inviterId,
      inviteeEmail: email,
      role
    });

    await invitation.save();

    await ActivityLog.create({
      tripId,
      userId: inviterId,
      action: "collaborator_added",
      description: `Invited ${email} as ${role}`,
      metadata: { email, role }
    });

    await emailService.sendInvitationEmail(invitation, trip, req.user, invitee);

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation
    });
  } catch (error) {
    console.error("Error inviting collaborator:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      tripId,
      email,
      role,
      inviterId
    });
    res.status(500).json({ 
      message: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getCollaborators = async (req, res) => {
  try {
    const { tripId } = req.params;

    const collaborations = await Collaboration.find({ tripId })
      .populate("userId", "name email")
      .sort({ joinedAt: 1 });

    const collaborators = collaborations.map(collab => ({
      _id: collab.userId._id,
      name: collab.userId.name,
      email: collab.userId.email,
      role: collab.role,
      joinedAt: collab.joinedAt
    }));

    res.json({ collaborators });
  } catch (error) {
    console.error("Error getting collaborators:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getActivityLog = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const activities = await ActivityLog.find({ tripId })
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments({ tripId });

    const formattedActivities = activities.map(activity => ({
      _id: activity._id,
      action: activity.action,
      description: activity.description,
      user: {
        _id: activity.userId._id,
        name: activity.userId.name,
        email: activity.userId.email
      },
      timestamp: activity.timestamp,
      metadata: activity.metadata
    }));

    res.json({
      activities: formattedActivities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Error getting activity log:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.inviteeEmail !== req.user.email) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation already processed" });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ message: "Invitation expired" });
    }

    invitation.status = "accepted";
    await invitation.save();

    const collaboration = new Collaboration({
      tripId: invitation.tripId,
      userId,
      role: invitation.role
    });
    await collaboration.save();

    await ActivityLog.create({
      tripId: invitation.tripId,
      userId,
      action: "collaborator_added",
      description: `Joined trip as ${invitation.role}`,
      metadata: { role: invitation.role }
    });

    res.json({ message: "Invitation accepted successfully" });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.inviteeEmail !== req.user.email) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    invitation.status = "declined";
    await invitation.save();

    res.json({ message: "Invitation declined successfully" });
  } catch (error) {
    console.error("Error declining invitation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const { tripId, userId } = req.params;
    const requesterId = req.user.id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const isTripOwner = trip.userId.toString() === requesterId;
    const requesterCollaboration = await Collaboration.findOne({
      tripId,
      userId: requesterId
    });

    if (!isTripOwner && (!requesterCollaboration || requesterCollaboration.role === "view")) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const targetCollaboration = await Collaboration.findOne({
      tripId,
      userId
    });

    if (!targetCollaboration) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    if (targetCollaboration.role === "owner") {
      return res.status(403).json({ message: "Cannot remove trip owner" });
    }

    await Collaboration.findByIdAndDelete(targetCollaboration._id);

    await ActivityLog.create({
      tripId,
      userId: requesterId,
      action: "collaborator_removed",
      description: `Removed collaborator`,
      metadata: { removedUserId: userId }
    });

    res.json({ message: "Collaborator removed successfully" });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCollaboratorRole = async (req, res) => {
  try {
    const { tripId, userId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const isTripOwner = trip.userId.toString() === requesterId;
    const requesterCollaboration = await Collaboration.findOne({
      tripId,
      userId: requesterId
    });

    if (!isTripOwner && (!requesterCollaboration || requesterCollaboration.role !== "owner")) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const targetCollaboration = await Collaboration.findOne({
      tripId,
      userId
    });

    if (!targetCollaboration) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    targetCollaboration.role = role;
    await targetCollaboration.save();

    await ActivityLog.create({
      tripId,
      userId: requesterId,
      action: "collaborator_updated",
      description: `Updated collaborator role to ${role}`,
      metadata: { targetUserId: userId, newRole: role }
    });

    res.json({ message: "Collaborator role updated successfully" });
  } catch (error) {
    console.error("Error updating collaborator role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};