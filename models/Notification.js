import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  type: { 
    type: String, 
    enum: [
      "trip_reminder",
      "packing_reminder", 
      "weather_update",
      "collaboration_invite",
      "trip_update",
      "general"
    ], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  icon: { type: String },
  read: { type: Boolean, default: false },
  scheduledFor: { type: Date },
  sentAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, sentAt: 1 });

export default mongoose.model("Notification", notificationSchema);