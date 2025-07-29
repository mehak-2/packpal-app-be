import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Trip", 
    required: true 
  },
  inviterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  inviteeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "expired"],
    default: "pending"
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
invitationSchema.index({ tripId: 1, inviteeId: 1 }, { unique: true });
invitationSchema.index({ status: 1, expiresAt: 1 });

// Method to check if invitation is expired
invitationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to accept invitation
invitationSchema.methods.accept = function() {
  this.status = "accepted";
  this.respondedAt = new Date();
  return this.save();
};

// Method to decline invitation
invitationSchema.methods.decline = function() {
  this.status = "declined";
  this.respondedAt = new Date();
  return this.save();
};

// Static method to get pending invitations for a user
invitationSchema.statics.getPendingForUser = function(userId) {
  return this.find({
    inviteeId: userId,
    status: "pending",
    expiresAt: { $gt: new Date() }
  }).populate("tripId", "destination country startDate endDate")
    .populate("inviterId", "name email");
};

// Static method to get invitations sent by a user
invitationSchema.statics.getSentByUser = function(userId) {
  return this.find({
    inviterId: userId
  }).populate("tripId", "destination country startDate endDate")
    .populate("inviteeId", "name email");
};

// Static method to get invitations for a trip
invitationSchema.statics.getForTrip = function(tripId) {
  return this.find({ tripId })
    .populate("inviteeId", "name email")
    .populate("inviterId", "name email");
};

export default mongoose.model("Invitation", invitationSchema); 