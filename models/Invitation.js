import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  inviterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  inviteeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  inviteeEmail: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["view", "edit"], 
    default: "view" 
  },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "declined"], 
    default: "pending" 
  },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
  }
}, { timestamps: true });

invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

invitationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

invitationSchema.methods.accept = async function() {
  this.status = "accepted";
  this.acceptedAt = new Date();
  return await this.save();
};

invitationSchema.methods.decline = async function() {
  this.status = "declined";
  this.declinedAt = new Date();
  return await this.save();
};

invitationSchema.statics.getPendingForUser = async function(userId) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  if (!user) return [];
  
  return this.find({
    inviteeId: userId,
    status: "pending",
    expiresAt: { $gt: new Date() }
  }).populate("tripId", "destination country startDate endDate")
    .populate("inviterId", "name email")
    .populate("inviteeId", "name email")
    .sort({ createdAt: -1 });
};

invitationSchema.statics.getSentByUser = async function(userId) {
  return this.find({
    inviterId: userId
  }).populate("tripId", "destination country startDate endDate")
    .populate("inviterId", "name email")
    .populate("inviteeId", "name email")
    .sort({ createdAt: -1 });
};

invitationSchema.statics.getForTrip = async function(tripId) {
  return this.find({
    tripId: tripId
  }).populate("inviterId", "name email")
    .populate("inviteeId", "name email")
    .sort({ createdAt: -1 });
};

export default mongoose.model("Invitation", invitationSchema); 