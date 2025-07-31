import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { 
    type: String, 
    enum: ["owner", "edit", "view"], 
    default: "view" 
  },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

collaborationSchema.index({ tripId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Collaboration", collaborationSchema);