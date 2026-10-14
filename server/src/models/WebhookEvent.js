import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
        },
        event: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["received", "processed", "failed", "ignored"],
            default: "received",
            index: true,
        },
        attempts: {
            type: Number,
            default: 1,
        },
        error: {
            type: String,
            default: null,
        },
        rawBody: {
            type: String,
        },
        receivedAt: {
            type: Date,
            default: Date.now,
        },
        processedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// 90-day TTL index on receivedAt for automatic cleanup of webhook payload records
webhookEventSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model("WebhookEvent", webhookEventSchema);
