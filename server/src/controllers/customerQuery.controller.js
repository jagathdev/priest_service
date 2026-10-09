import mongoose from "mongoose";
import CustomerQuery from "../models/customerQuery.js";


// CREATE CUSTOMER QUERY / COMPLAINT

export const createCustomerQuery = async (req, res) => {
    try {
        const {
            userId,
            name,
            mobileNumber,
            email,
            bookingId,
            subject,
            message,
            consent,
        } = req.body;

        // Name
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        // Mobile number
        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required",
            });
        }

        const mobile = String(mobileNumber).trim();

        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message:
                    "Mobile number must be exactly 10 digits",
            });
        }

        // Email - optional
        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        // Subject
        const allowedSubjects = [
            "Booking Issue",
            "Puja Video Query",
            "Refund/Cancellation",
            "Other",
        ];

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: "Subject is required",
            });
        }

        if (!allowedSubjects.includes(subject)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject",
            });
        }

        // Message
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        if (message.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message:
                    "Message cannot exceed 1000 characters",
            });
        }

        // Consent
        if (consent !== true) {
            return res.status(400).json({
                success: false,
                message:
                    "Please authorize us to contact you",
            });
        }

        // Optional user ID
        let validUserId = null;

        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
            }

            validUserId = userId;
        }

        // Create query
        const customerQuery = await CustomerQuery.create({
            userId: validUserId,
            name: name.trim(),
            mobileNumber: mobile,
            email: email?.trim().toLowerCase() || "",
            bookingId: bookingId?.trim() || "",
            subject,
            message: message.trim(),
            consent: true,
            status: "OPEN",
        });

        return res.status(201).json({
            success: true,
            message:
                "Your request has been submitted successfully",
            data: {
                queryId: customerQuery._id,
                status: customerQuery.status,
                createdAt: customerQuery.createdAt,
            },
        });
    } catch (error) {
        console.error(
            "Create Customer Query Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to submit your request",
        });
    }
};