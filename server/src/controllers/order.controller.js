import mongoose from "mongoose";
import Pooja from "../models/Pooja.js";
import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";
import { computeServerPrice } from "../services/pricing.service.js";
import { normalizeServiceType } from "../utils/serviceType.js";
import Order from "../models/Order.js";
import { escapeRegex } from "../utils/escapeRegex.js";

export const previewOrder = async (req, res) => {
    try {
        const targetServiceId = req.body.serviceId || req.body.poojaId;
        const {
            serviceType,
            packageId,
            participants,
            offerings,
            promoCode,
            whatsappNumber,
            gotra,
            doesNotKnowGotra,
            wish,
            bookingDate,
        } = req.body;

        // 1. Validate ID
        if (!targetServiceId) {
            return res.status(400).json({
                success: false,
                message: "Service ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(targetServiceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Service ID",
            });
        }

        // 2. Validate participants
        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one participant is required",
            });
        }

        // 3. Validate booking date if provided
        let parsedBookingDate = new Date();
        if (bookingDate) {
            const candidate = new Date(bookingDate);
            if (isNaN(candidate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking date format",
                });
            }
            parsedBookingDate = candidate;
        }

        const authenticatedUserId = req.user?.id || req.body.userId || req.body.customer || null;

        // 4. Calculate pricing using unified server pricing engine
        const pricingCalculation = await computeServerPrice({
            serviceId: targetServiceId,
            serviceType,
            packageId,
            participantsCount: participants.length,
            offerings,
            promoCode,
            userId: authenticatedUserId,
        });

        const service = pricingCalculation.service;
        const canonicalType = pricingCalculation.serviceType || normalizeServiceType(serviceType);

        // 5. Return standardized preview
        return res.status(200).json({
            success: true,
            data: {
                type: canonicalType.toLowerCase(),
                service: {
                    id: service._id,
                    name: service.name || service.title,
                    image: service.image || service.imageUrl,
                },
                booking: {
                    whatsappNumber: whatsappNumber || "",
                    participants,
                    gotra: gotra || "",
                    doesNotKnowGotra: Boolean(doesNotKnowGotra),
                    wish: wish || "",
                    bookingDate: parsedBookingDate,
                },
                pricing: {
                    basePrice: pricingCalculation.basePrice,
                    extraParticipantCount: pricingCalculation.extraParticipantCount,
                    extraParticipantPrice: 300,
                    extraParticipantAmount: pricingCalculation.extraParticipantFee,
                    offeringsAmount: pricingCalculation.offeringsTotal,
                    convenienceFee: 0,
                    panditFee: 0,
                    recordingFee: 0,
                    discountAmount: pricingCalculation.discountAmount,
                    originalAmount: pricingCalculation.originalAmount,
                    total: pricingCalculation.finalAmount,
                    currency: service.currency || "INR",
                },
                promoCode: promoCode || "",
                promoCodeId: pricingCalculation.promoCodeId,
            },
        });
    } catch (error) {
        console.error("Preview Order Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to calculate order",
        });
    }
};


export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user?.role === "admin" && req.params?.userId
            ? req.params?.userId
            : req.user?.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
            });
        }

        // Retrieve strictly by verified account identifier
        const finalQuery = {
            customer: userId,
            paymentStatus: { $nin: ["pending", "failed"] }
        };

        const orders = await Order.find(finalQuery).sort({ createdAt: -1 }).lean();

        // Batch query any missing service images/temples with $in to eliminate N+1 queries
        const missingServiceIds = orders
            .filter((o) => (!o.imageUrl && !o.image) || !o.temple)
            .map((o) => o.serviceId)
            .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

        const [pujasBatch, poojasBatch, homasBatch] = await Promise.all([
            missingServiceIds.length > 0 ? Puja.find({ _id: { $in: missingServiceIds } }).lean() : [],
            missingServiceIds.length > 0 ? Pooja.find({ _id: { $in: missingServiceIds } }).lean() : [],
            missingServiceIds.length > 0 ? Homa.find({ _id: { $in: missingServiceIds } }).lean() : [],
        ]);

        const serviceMap = new Map();
        [...pujasBatch, ...poojasBatch, ...homasBatch].forEach((s) => {
            if (s && s._id) serviceMap.set(String(s._id), s);
        });

        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                // 1. Use the imageUrl saved directly on the order (set at payment time)
                let image = order.imageUrl || order.image || "";
                let temple = order.temple || "";

                if (!image || !temple) {
                    let service = null;
                    if (order.serviceId && mongoose.Types.ObjectId.isValid(order.serviceId)) {
                        service = serviceMap.get(String(order.serviceId));
                    }
                    if (!service && (order.itemName || order.pooja)) {
                        const nameToSearch = escapeRegex(order.itemName || order.pooja);
                        service = await Puja.findOne({ title: { $regex: new RegExp(nameToSearch, "i") } }).lean() ||
                                  await Pooja.findOne({ name: { $regex: new RegExp(nameToSearch, "i") } }).lean() ||
                                  await Homa.findOne({ title: { $regex: new RegExp(nameToSearch, "i") } }).lean();
                    }

                    if (service) {
                        image = image || service.imageUrl || service.image || service.additionalImages?.[0] || "";
                        temple = temple || service.templeLocation || service.templeVenue || service.location || "";
                    }
                }

                return {
                    ...order,
                    imageUrl: image || "",
                    image: image || "",
                    temple: temple || "Shri Rahu Temple, Paithani,"
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: enrichedOrders
        });
    } catch (error) {
        console.error("Get User Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

/**
 * GET /api/orders/status?razorpayOrderId=...
 * Returns only { paymentStatus, orderStatus, orderNumber, itemName, amount (rupees) }
 * Exposes NO personal identifiable information (no email, phone, participants).
 */
export const getOrderStatus = async (req, res) => {
    try {
        const { razorpayOrderId } = req.query;

        if (!razorpayOrderId || !String(razorpayOrderId).trim()) {
            return res.status(400).json({
                success: false,
                message: "razorpayOrderId query parameter is required",
            });
        }

        const order = await Order.findOne({ razorpayOrderId: String(razorpayOrderId).trim() }).lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                orderNumber: order.orderNumber,
                itemName: order.itemName || order.pooja || "Sacred Ritual",
                amount: order.pricing?.total || 0,
            },
        });
    } catch (error) {
        console.error("Get Order Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order status",
        });
    }
};