import mongoose from "mongoose";
import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";
import Order from "../models/Order.js";
import User from "../models/user.js";
import { calculateServicePrice } from "../services/pricing.service.js";
import { validatePromoCode } from "../services/promoCode.service.js";
import { createRazorpayOrder } from "../services/payment.service.js";
import { toPaise } from "../utils/money.js";

/**
 * POST /api/orders (requireAuth)
 * body: { serviceId, serviceType, participants, whatsappNumber, gotra, doesNotKnowGotra, wish, bookingDate, promoCode? }
 */
export const createOrder = async (req, res) => {
    try {
        const {
            serviceId,
            serviceType,
            participants,
            whatsappNumber,
            gotra,
            doesNotKnowGotra,
            wish,
            bookingDate,
            promoCode,
        } = req.body;

        const customerId = req.user?.id;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // 1. Validate serviceType & serviceId
        if (!serviceType || !["Puja", "Homa"].includes(serviceType)) {
            return res.status(400).json({
                success: false,
                message: "serviceType must be either 'Puja' or 'Homa'",
            });
        }

        if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({
                success: false,
                message: "Valid serviceId is required",
            });
        }

        // 2. Validate bookingDate not past
        if (!bookingDate) {
            return res.status(400).json({
                success: false,
                message: "bookingDate is required",
            });
        }

        const chosenBookingDate = new Date(bookingDate);
        if (isNaN(chosenBookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid bookingDate",
            });
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (chosenBookingDate < todayStart) {
            return res.status(400).json({
                success: false,
                message: "bookingDate cannot be in the past",
            });
        }

        // 3. Validate participants
        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one participant is required",
            });
        }

        if (!whatsappNumber) {
            return res.status(400).json({
                success: false,
                message: "whatsappNumber is required",
            });
        }

        // 4. Load service (Puja then Homa by type) & validate active
        let service = null;
        if (serviceType === "Puja") {
            service = await Puja.findById(serviceId);
        } else if (serviceType === "Homa") {
            service = await Homa.findById(serviceId);
        }

        if (!service) {
            return res.status(404).json({
                success: false,
                message: `${serviceType} service not found`,
            });
        }

        const isServiceActive =
            service.status === "active" ||
            service.isActive === true;

        if (!isServiceActive) {
            return res.status(400).json({
                success: false,
                message: "The selected service is currently inactive",
            });
        }

        // 5. Validate maxParticipants
        const maxParticipants = service.maxParticipants || 10;
        if (participants.length > maxParticipants) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${maxParticipants} participants allowed`,
            });
        }

        // 6. Compute price ONLY on the server
        const priceCalculation = calculateServicePrice({
            service,
            participantCount: participants.length,
        });

        const originalTotalRupees = priceCalculation.total;
        let discountRupees = 0;
        let finalPayableRupees = originalTotalRupees;
        let appliedPromo = null;

        if (promoCode) {
            const promoResult = await validatePromoCode({
                code: promoCode,
                orderAmount: originalTotalRupees,
                serviceType: serviceType.toUpperCase(),
                userId: customerId,
            });
            discountRupees = promoResult.discountAmount || 0;
            finalPayableRupees = Math.max(0, originalTotalRupees - discountRupees);
            appliedPromo = promoResult.promo;
        }

        // Convert all financial values to integer paise
        const basePricePaise = toPaise(priceCalculation.basePrice);
        const extraPaise = toPaise(priceCalculation.extraParticipantAmount);
        const originalTotalPaise = toPaise(originalTotalRupees);
        const discountPaise = toPaise(discountRupees);
        const finalTotalPaise = toPaise(finalPayableRupees);

        // Fetch customer details if available
        const user = await User.findById(customerId).lean();
        const customerName = user?.name || user?.fullName || participants[0]?.name || "Customer";

        const snapshot = {
            title: service.title || service.name || `${serviceType} Booking`,
            imageUrl: service.imageUrl || service.image || service.additionalImages?.[0] || "",
        };

        // 7. Create Order pending
        const order = new Order({
            serviceId: service._id,
            serviceType,
            snapshot,
            customer: customerId,
            customerName,
            itemName: snapshot.title,
            mobileNumber: user?.mobileNumber || whatsappNumber,
            whatsappNumber,
            participants,
            gotra: gotra || "Kashyapa",
            doesNotKnowGotra: Boolean(doesNotKnowGotra),
            wish: wish || "",
            bookingDate: chosenBookingDate,
            pricing: {
                basePrice: basePricePaise,
                extraParticipantCount: priceCalculation.extraParticipantCount,
                extraParticipantAmount: extraPaise,
                convenienceFee: 0,
                panditFee: 0,
                recordingFee: 0,
                total: finalTotalPaise,
                currency: "INR",
            },
            originalAmount: originalTotalPaise,
            discountAmount: discountPaise,
            promoCode: promoCode || "",
            promoCodeId: appliedPromo?._id || null,
            paymentStatus: "pending",
            orderStatus: "created",
        });

        await order.save();

        // 8. Create Razorpay order for order.pricing.total
        const razorpayOrder = await createRazorpayOrder({
            amountInPaise: finalTotalPaise,
            receipt: String(order.orderNumber || order._id),
            notes: {
                orderId: String(order._id),
                orderNumber: order.orderNumber,
                serviceType,
            },
        });

        // 9. Save razorpayOrderId
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(201).json({
            success: true,
            data: {
                orderId: order._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount, // in paise
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create order",
        });
    }
};

/**
 * GET /api/orders/:id (owner only)
 */
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findById(id).lean();
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Owner check (or admin)
        const isOwner = String(order.customer) === String(userId);
        const isAdmin = req.user?.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this order",
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error("Get Order By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order",
        });
    }
};

/**
 * GET /api/orders/user/:userId
 */
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;

        if (String(userId) !== String(currentUserId) && req.user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view these orders",
            });
        }

        let query = { customer: userId };

        if (mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findById(userId);
            if (user && user.mobileNumber) {
                const strippedMobile = user.mobileNumber.replace(/^\+91/, "").trim();
                query = {
                    $or: [
                        { customer: userId },
                        { whatsappNumber: { $regex: new RegExp(strippedMobile + "$") } },
                        { mobileNumber: { $regex: new RegExp(strippedMobile + "$") } },
                    ],
                };
            }
        }

        const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error("Get User Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};