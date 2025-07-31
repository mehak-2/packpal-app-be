import mongoose from "mongoose";

const reminderSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  tripReminderDays: { type: Number, default: 1 },
  tripReminderTime: { type: String, default: "09:00" },
  packingReminderDays: { type: Number, default: 2 },
  packingReminderTime: { type: String, default: "18:00" },
  weatherUpdates: { type: Boolean, default: true },
  collaborationUpdates: { type: Boolean, default: true }
}, { timestamps: true });

reminderSettingsSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model("ReminderSettings", reminderSettingsSchema);