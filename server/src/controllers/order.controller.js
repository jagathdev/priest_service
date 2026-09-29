import mongoose from "mongoose";
import Pooja from "../models/Pooja.js";
import { calculatePoojaPrice } from "../services/pricing.service.js";

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

        if (!mongoose.Types.ObjectId.isValid(poojaId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pooja ID",
            });
        }

        if (!participants || participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one participant is required",
            });
        }

        const pooja = await Pooja.findOne({
            _id: poojaId,
            isActive: true,
        });

        if (!pooja) {
            return res.status(404).json({
                success: false,
                message: "Pooja not found",
            });
        }

        if (participants.length > pooja.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${pooja.maxParticipants} participants allowed`,
            });
        }

        const pricing = calculatePoojaPrice({
            pooja,
            participantCount: participants.length,
        });

        return res.status(200).json({
            success: true,

            data: {
                pooja: {
                    id: pooja._id,
                    name: pooja.name,
                    image: pooja.image,
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
        return res.status(500).json({
            success: false,
            message: "Failed to calculate order",
            error: error.message,
        });
    }
};