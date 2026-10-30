import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    gotra: {
      type: String,
      default: "",
      trim: true,
    },
    doesNotKnowGotra: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const preOrderLeadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: {
      type: String,
      default: "Devotee",
      trim: true,
    },
    mobileNumber: {
      type: String,
      default: "",
      trim: true,
    },
    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ["Puja", "Homa", "Pooja", "puja", "homa", "POOJA", "HOMA"],
      default: "Puja",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    serviceName: {
      type: String,
      default: "",
      trim: true,
    },
    packageName: {
      type: String,
      default: "",
      trim: true,
    },
    packageId: {
      type: String,
      default: "",
      trim: true,
    },
    packagePrice: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    preferredDate: {
      type: String,
      default: "",
      trim: true,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    gotra: {
      type: String,
      default: "",
      trim: true,
    },
    doesNotKnowGotra: {
      type: Boolean,
      default: false,
    },
    wish: {
      type: String,
      default: "",
      trim: true,
    },
    offerings: [
      {
        name: { type: String, trim: true },
        priceINR: { type: Number, default: 0 },
        description: { type: String, default: "" },
        imageUrl: { type: String, default: "" },
      },
    ],
    razorpayOrderId: {
      type: String,
      default: "",
      index: true,
    },
    uniqueId: {
      type: String,
      default: "",
      index: true,
    },
    promoCode: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "pre_order_leads",
  }
);

preOrderLeadSchema.index({ mobileNumber: 1, whatsappNumber: 1, createdAt: -1 });

const PreOrderLead =
  mongoose.models.PreOrderLead || mongoose.model("PreOrderLead", preOrderLeadSchema);

export default PreOrderLead;

