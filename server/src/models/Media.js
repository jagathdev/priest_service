import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mediaSchema.index({ filename: 1 }, { unique: true });
mediaSchema.index({ createdAt: -1 });

export default mongoose.model("Media", mediaSchema);
