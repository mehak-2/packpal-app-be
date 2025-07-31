import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  packingList: {
    clothing: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      packed: { type: Boolean, default: false },
    }],
    accessories: [{
      name: { type: String, required: true },
      packed: { type: Boolean, default: false },
    }],
    essentials: [{
      name: { type: String, required: true },
      packed: { type: Boolean, default: false },
    }],
    electronics: [{
      name: { type: String, required: true },
      packed: { type: Boolean, default: false },
    }],
    toiletries: [{
      name: { type: String, required: true },
      packed: { type: Boolean, default: false },
    }],
    documents: [{
      name: { type: String, required: true },
      packed: { type: Boolean, default: false },
    }],
    activities: [{
      name: { type: String, required: true },
      packed: { type: Boolean, default: false },
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

templateSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Template = mongoose.model("Template", templateSchema);

export default Template;