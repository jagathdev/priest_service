import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    devoteeName: {
      type: String,
      default: "Devotee",
      trim: true,
    },
    mobileNumber: {
      type: String,
      default: "",
      trim: true,
    },
    serviceName: {
      type: String,
      default: "Puja Ritual",
      trim: true,
    },
    serviceType: {
      type: String,
      default: "Puja",
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    ratingLabel: {
      type: String,
      enum: ["Poor", "Fair", "Good", "Very good", "Excellent"],
      default: "Good",
    },
    review: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    collection: "feedbacks",
  }
);

feedbackSchema.index({ order: 1, createdAt: -1 });
feedbackSchema.index({ user: 1, createdAt: -1 });

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

export default Feedback;

