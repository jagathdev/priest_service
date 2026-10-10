import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema({
    eventId: { type: String, unique: true, required: true },
    event: { type: String, required: true },
    processed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("WebhookEvent", webhookEventSchema);
