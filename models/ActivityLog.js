import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { 
    type: String, 
    enum: [
      "trip_created",
      "trip_updated", 
      "collaborator_added",
      "collaborator_removed",
      "packing_list_updated",
      "item_added",
      "item_removed",
      "item_toggled",
      "destination_updated",
      "dates_updated",
      "activities_updated"
    ], 
    required: true 
  },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

activityLogSchema.index({ tripId: 1, timestamp: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);