import mongoose from "mongoose";

const visitorHitSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    utmSource: {
      type: String,
      default: "Direct",
      trim: true,
      index: true,
    },
    utmMedium: {
      type: String,
      default: "",
      trim: true,
    },
    utmCampaign: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    utmTerm: {
      type: String,
      default: "",
      trim: true,
    },
    utmContent: {
      type: String,
      default: "",
      trim: true,
    },
    promo: {
      type: String,
      default: "",
      trim: true,
    },
    landingPage: {
      type: String,
      default: "/",
      trim: true,
    },
    referrer: {
      type: String,
      default: "",
      trim: true,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    // YYYY-MM-DD string for high-speed indexing and daily grouping
    dateKey: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure 1 unique hit per session per day per campaign
visitorHitSchema.index({ sessionId: 1, dateKey: 1 }, { unique: true });

const VisitorHit = mongoose.models.VisitorHit || mongoose.model("VisitorHit", visitorHitSchema);

export default VisitorHit;

