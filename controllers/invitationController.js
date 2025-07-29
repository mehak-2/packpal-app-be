import Invitation from "../models/Invitation.js";
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import emailService from "../services/emailService.js";

export const sendInvitation = async (req, res) => {
  try {
    const { tripId, inviteeEmail } = req.body;
    const inviterId = req.user.id || req.user.userId;

    const trip = await Trip.findOne({ _id: tripId, userId: inviterId });
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or you don't have permission to invite to this trip"
      });
    }

    // Find invitee by email
    const invitee = await User.findOne({ email: inviteeEmail });
    if (!invitee) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email address"
      });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      tripId,
      inviteeId: invitee._id
    });

    if (existingInvitation) {
      if (existingInvitation.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Invitation already sent to this user"
        });
      } else if (existingInvitation.status === "accepted") {
        return res.status(400).json({
          success: false,
          message: "This user is already a collaborator on this trip"
        });
      }
    }

    // Create new invitation
    const invitation = new Invitation({
      tripId,
      inviterId,
      inviteeId: invitee._id
    });

    await invitation.save();

    // Get inviter details
    const inviter = await User.findById(inviterId);

    // Send invitation email
    await emailService.sendInvitationEmail(invitation, trip, inviter, invitee);

    // Populate invitation with user details
    await invitation.populate("inviteeId", "name email");
    await invitation.populate("inviterId", "name email");

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: invitation
    });

  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send invitation"
    });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id || req.user.userId;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found"
      });
    }

    // Check if invitation is for the current user
    if (invitation.inviteeId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only accept invitations sent to you"
      });
    }

    // Check if invitation is still valid
    if (invitation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been responded to"
      });
    }

    if (invitation.isExpired()) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: "Invitation has expired"
      });
    }

    // Accept invitation
    await invitation.accept();

    // Add user to trip collaborators
    const trip = await Trip.findById(invitation.tripId);
    if (trip && !trip.collaborators.includes(userId)) {
      trip.collaborators.push(userId);
      await trip.save();
    }

    // Send acceptance email to inviter
    const inviter = await User.findById(invitation.inviterId);
    const invitee = await User.findById(userId);
    await emailService.sendInvitationAcceptedEmail(invitation, trip, inviter, invitee);

    // Populate invitation with user details
    await invitation.populate("inviteeId", "name email");
    await invitation.populate("inviterId", "name email");

    res.json({
      success: true,
      message: "Invitation accepted successfully",
      data: invitation
    });

  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept invitation"
    });
  }
};

export const declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id || req.user.userId;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found"
      });
    }

    // Check if invitation is for the current user
    if (invitation.inviteeId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only decline invitations sent to you"
      });
    }

    // Check if invitation is still valid
    if (invitation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been responded to"
      });
    }

    if (invitation.isExpired()) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: "Invitation has expired"
      });
    }

    // Decline invitation
    await invitation.decline();

    // Send decline email to inviter
    const trip = await Trip.findById(invitation.tripId);
    const inviter = await User.findById(invitation.inviterId);
    const invitee = await User.findById(userId);
    await emailService.sendInvitationDeclinedEmail(invitation, trip, inviter, invitee);

    // Populate invitation with user details
    await invitation.populate("inviteeId", "name email");
    await invitation.populate("inviterId", "name email");

    res.json({
      success: true,
      message: "Invitation declined successfully",
      data: invitation
    });

  } catch (error) {
    console.error("Error declining invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to decline invitation"
    });
  }
};

export const getPendingInvitations = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const invitations = await Invitation.getPendingForUser(userId);

    res.json({
      success: true,
      data: invitations
    });

  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending invitations"
    });
  }
};

export const getSentInvitations = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const invitations = await Invitation.getSentByUser(userId);

    res.json({
      success: true,
      data: invitations
    });

  } catch (error) {
    console.error("Error fetching sent invitations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sent invitations"
    });
  }
};

export const getTripInvitations = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id || req.user.userId;

    // Check if user has access to this trip
    const trip = await Trip.findOne({
      _id: tripId,
      $or: [
        { userId },
        { collaborators: userId }
      ]
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or you don't have access"
      });
    }

    const invitations = await Invitation.getForTrip(tripId);

    res.json({
      success: true,
      data: invitations
    });

  } catch (error) {
    console.error("Error fetching trip invitations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trip invitations"
    });
  }
};

export const resendInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id || req.user.userId;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found"
      });
    }

    // Check if user is the inviter
    if (invitation.inviterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only resend invitations you sent"
      });
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only resend pending invitations"
      });
    }

    // Update expiration date
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    invitation.sentAt = new Date();
    await invitation.save();

    // Get trip and user details
    const trip = await Trip.findById(invitation.tripId);
    const inviter = await User.findById(invitation.inviterId);
    const invitee = await User.findById(invitation.inviteeId);

    // Resend invitation email
    await emailService.sendInvitationEmail(invitation, trip, inviter, invitee);

    // Populate invitation with user details
    await invitation.populate("inviteeId", "name email");
    await invitation.populate("inviterId", "name email");

    res.json({
      success: true,
      message: "Invitation resent successfully",
      data: invitation
    });

  } catch (error) {
    console.error("Error resending invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend invitation"
    });
  }
}; 