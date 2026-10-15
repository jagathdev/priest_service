import crypto from "crypto";
import Order from "../models/Order.js";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
    fetchRazorpayPayment,
} from "../services/payment.service.js";
import { markOrderPaid } from "../services/orderPayment.service.js";
import { computeServerPrice } from "../services/pricing.service.js";

export const createPaymentOrder = async (req, res) => {
    try {
        const {
            amount,
            totalamount,
            receipt,
            orderDetails,
        } = req.body;

        const customUniqueId = `${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
        const orderReceipt = receipt ? String(receipt) : customUniqueId;

        // Path A: New client sending orderDetails
        if (orderDetails && typeof orderDetails === "object") {
            const {
                pooja,
                serviceId,
                serviceType,
                customer,
                customerName,
                itemName,
                mobileNumber,
                whatsappNumber,
                participants,
                gotra,
                doesNotKnowGotra,
                wish,
                promoCode,
                packageId,
                offerings,
            } = orderDetails;

            if (!whatsappNumber || !String(whatsappNumber).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "WhatsApp number is required",
                });
            }

            const authenticatedUserId = req.user?.role === "admin" && customer
                ? customer
                : (req.user?.id || customer);

            if (!authenticatedUserId) {
                return res.status(400).json({
                    success: false,
                    message: "Customer ID is required",
                });
            }

            if (!Array.isArray(participants) || participants.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one participant is required",
                });
            }

            // Recompute price on server
            let pricingCalculation;
            try {
                pricingCalculation = await computeServerPrice({
                    serviceId,
                    serviceType,
                    packageId,
                    participantsCount: participants.length,
                    offerings,
                    promoCode,
                    userId: authenticatedUserId,
                });
            } catch (priceErr) {
                return res.status(priceErr.statusCode || 400).json({
                    success: false,
                    message: priceErr.message || "Failed to calculate order pricing",
                });
            }

            const clientTotal = orderDetails.pricing?.total ?? totalamount ?? amount;
            if (clientTotal !== undefined && clientTotal !== null) {
                const clientVal = Number(clientTotal);
                if (Math.abs(clientVal - pricingCalculation.finalAmount) > 0.01) {
                    return res.status(400).json({
                        success: false,
                        message: `Price mismatch: Client requested ₹${clientVal}, but server verified amount is ₹${pricingCalculation.finalAmount}.`,
                    });
                }
            }

            // Create Razorpay Order
            const razorpayOrder = await createRazorpayOrder({
                amount: pricingCalculation.finalAmount,
                receipt: orderReceipt,
                notes: {
                    uniqueId: customUniqueId,
                },
            });

            // Create pending Order in Mongo
            let createdOrder;
            try {
                createdOrder = await Order.create({
                    pooja: pooja || itemName || "Sacred Ritual",
                    serviceId: serviceId || null,
                    serviceType: serviceType || "Pooja",
                    customer: authenticatedUserId,
                    customerName: customerName || "Devotee",
                    itemName: itemName || pooja || "Sacred Ritual",
                    mobileNumber: mobileNumber || "",
                    whatsappNumber: String(whatsappNumber).trim(),
                    participants: participants.map((p) => ({
                        name: typeof p === "string" ? p.trim() : (p.name || "").trim(),
                    })),
                    gotra: gotra || "Kashyapa",
                    doesNotKnowGotra: Boolean(doesNotKnowGotra),
                    wish: wish || "",
                    bookingDate: orderDetails.bookingDate ? new Date(orderDetails.bookingDate) : new Date(),
                    razorpayOrderId: razorpayOrder.id,
                    uniqueId: customUniqueId,
                    promoCode: promoCode || "",
                    promoCodeId: pricingCalculation.promoCodeId,
                    offerings: pricingCalculation.validatedOfferings,
                    originalAmount: pricingCalculation.originalAmount,
                    discountAmount: pricingCalculation.discountAmount,
                    pricing: {
                        basePrice: pricingCalculation.basePrice,
                        extraParticipantCount: pricingCalculation.extraParticipantCount,
                        extraParticipantAmount: pricingCalculation.extraParticipantFee,
                        offeringsAmount: pricingCalculation.offeringsTotal,
                        convenienceFee: 0,
                        panditFee: 0,
                        recordingFee: 0,
                        total: pricingCalculation.finalAmount,
                        currency: "INR",
                    },
                    paymentStatus: "pending",
                    orderStatus: "created",
                });
            } catch (valErr) {
                console.error("Order creation validation error:", valErr.message);
                return res.status(400).json({
                    success: false,
                    message: valErr.message || "Invalid order details",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Payment order created successfully",
                data: {
                    orderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    notes: razorpayOrder.notes,
                    keyId: process.env.RAZORPAY_KEY_ID,
                    dbOrderId: createdOrder._id,
                    orderNumber: createdOrder.orderNumber,
                },
            });
        }

        // Path B removed: arbitrary client amount not permitted
        return res.status(400).json({
            success: false,
            message: "orderDetails are required to create a payment order",
        });
    } catch (error) {
        console.error("Create Payment Order Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create payment order",
        });
    }
};

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required",
            });
        }

        const isValid = verifyRazorpayPayment({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        // Fetch payment entity from Razorpay to guarantee authentic amount and status
        let fetchedPayment;
        try {
            fetchedPayment = await fetchRazorpayPayment(razorpayPaymentId);
        } catch (fetchErr) {
            console.error(`[verifyPayment] Razorpay API error fetching payment ${razorpayPaymentId}:`, fetchErr.message);
            return res.status(502).json({
                success: false,
                message: "Unable to verify payment with payment gateway. Please try again or contact support.",
            });
        }

        if (!fetchedPayment || !fetchedPayment.amount) {
            return res.status(502).json({
                success: false,
                message: "Payment gateway returned invalid payment details.",
            });
        }

        // Check if an Order with that razorpayOrderId already exists
        const existingOrder = await Order.findOne({ razorpayOrderId });

        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found for the provided payment.",
            });
        }

        const paymentPayload = fetchedPayment;

        const markResult = await markOrderPaid({ payment: paymentPayload });

        if (markResult.status === "amount_mismatch") {
            return res.status(409).json({
                success: false,
                message: "Payment amount mismatch with order",
            });
        }

        const finalizedOrder = markResult.order || existingOrder;

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                razorpayOrderId,
                razorpayPaymentId,
                orderId: finalizedOrder._id,
                orderNumber: finalizedOrder.orderNumber,
            },
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};

export const razorpayWebhookResponse = async (req, res) => {
    try {
        const { razorpayres } = req.body;

        if (!razorpayres) {
            return res.status(400).json({
                success: false,
                message: "razorpayres is required",
            });
        }

        let razorpayData = razorpayres;
        if (typeof razorpayres === "string") {
            try {
                razorpayData = JSON.parse(razorpayres);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "razorpayres must contain valid JSON",
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Razorpay webhook response received",
            data: razorpayData,
        });
    } catch (error) {
        console.error("Razorpay Webhook Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process Razorpay webhook response",
        });
    }
};