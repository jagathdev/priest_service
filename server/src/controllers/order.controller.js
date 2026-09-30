import mongoose from "mongoose";
import Pooja from "../models/Pooja.js";
import Homa from "../models/homaModel.js";
import { calculateServicePrice } from "../services/pricing.service.js";

export const previewOrder = async (req, res) => {
    try {
        const {
            poojaId,
            participants,
            whatsappNumber,
            gotra,
            doesNotKnowGotra,
            wish,
            bookingDate,
        } = req.body;

        // 1. Validate ID
        if (!poojaId) {
            return res.status(400).json({
                success: false,
                message: "Pooja or Homa ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(poojaId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Pooja or Homa ID",
            });
        }

        // 2. Validate participants
        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one participant is required",
            });
        }

        // 3. First check Pooja
        let service = await Pooja.findOne({
            _id: poojaId,
            isActive: true,
        });

        let serviceType = "pooja";

        // 4. If Pooja not found, check Homa
        if (!service) {
            service = await Homa.findOne({
                _id: poojaId,
                status: "active",
            });

            serviceType = "homa";
        }

        // 5. If neither Pooja nor Homa found
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Pooja or Homa not found",
            });
        }

        // 6. Check maximum participants
        const maxParticipants = service.maxParticipants || 10;

        if (participants.length > maxParticipants) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${maxParticipants} participants allowed`,
            });
        }

        // 7. Calculate pricing
        const pricing = calculateServicePrice({
            service,
            participantCount: participants.length,
        });

        // 8. Return preview
        return res.status(200).json({
            success: true,

            data: {
                type: serviceType,

                service: {
                    id: service._id,
                    name: service.name || service.title,
                    image: service.image || service.imageUrl,
                },

                booking: {
                    whatsappNumber,
                    participants,
                    gotra,
                    doesNotKnowGotra,
                    wish,
                    bookingDate,
                },

                pricing,
            },
        });
    } catch (error) {
        console.error("Preview Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to calculate order",
        });
    }
};