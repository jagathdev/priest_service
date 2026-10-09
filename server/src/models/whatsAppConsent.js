
import mongoose from "mongoose";

const whatsappConsentSchema = new mongoose.Schema(
    {
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        optedIn: {
            type: Boolean,
            default: false,
        },
        consentedAt: {
            type: Date,
            default: null,
        },
        source: {
            type: String,
            default: "WEB",
        },
    },
    { timestamps: true }
);

const WhatsAppConsent =
    mongoose.models.WhatsAppConsent ||
    mongoose.model("WhatsAppConsent", whatsappConsentSchema);

export default WhatsAppConsent;