import mongoose from "mongoose";

const notificationRecipientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Recipient email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    role: {
      type: String,
      default: "Admin",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "notification_recipients",
  }
);

notificationRecipientSchema.index({ email: 1 }, { unique: true });

const NotificationRecipient =
  mongoose.models.NotificationRecipient ||
  mongoose.model("NotificationRecipient", notificationRecipientSchema);

export default NotificationRecipient;

