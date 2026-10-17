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
        const { orderDetails } = req.body;

        if (!orderDetails || typeof orderDetails !== "object") {
            return res.status(400).json({
                success: false,
                message: "orderDetails are required to create a payment order",
            });
        }

        const customUniqueId = `${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
        const orderReceipt = `rcpt_${customUniqueId}`;

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

            const cleanParticipants = (participants || [])
                .map((p) => ({ name: typeof p === "string" ? p.trim() : (p?.name || "").trim() }))
                .filter((p) => p.name.length > 0);

            if (cleanParticipants.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one participant with a valid name is required",
                });
            }

            // Validate booking date if provided
            let parsedBookingDate = new Date();
            if (orderDetails.bookingDate) {
                const candidate = new Date(orderDetails.bookingDate);
                if (!isNaN(candidate.getTime())) {
                    parsedBookingDate = candidate;
                }
            }

            // Recompute price on server
            let pricingCalculation;
            try {
                pricingCalculation = await computeServerPrice({
                    serviceId,
                    serviceType,
                    packageId,
                    participantsCount: cleanParticipants.length,
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

            const clientTotal = orderDetails.pricing?.total;
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
            let razorpayOrder;
            try {
                razorpayOrder = await createRazorpayOrder({
                    amount: pricingCalculation.finalAmount,
                    receipt: orderReceipt,
                    notes: {
                        uniqueId: customUniqueId,
                    },
                });
            } catch (rzpErr) {
                console.error("Razorpay order creation error:", rzpErr.message);
                return res.status(502).json({
                    success: false,
                    message: "Payment gateway error creating order. Please try again.",
                });
            }

            // Create pending Order in Mongo
            let createdOrder;
            try {
                createdOrder = await Order.create({
                    pooja: pooja || itemName || "Sacred Ritual",
                    serviceId: serviceId || null,
                    serviceType: pricingCalculation.serviceType || serviceType || "POOJA",
                    customer: authenticatedUserId,
                    customerName: customerName || "Devotee",
                    itemName: itemName || pooja || "Sacred Ritual",
                    mobileNumber: mobileNumber || "",
                    whatsappNumber: String(whatsappNumber).trim(),
                    participants: cleanParticipants,
                    gotra: gotra || "Kashyapa",
                    doesNotKnowGotra: Boolean(doesNotKnowGotra),
                    wish: wish || "",
                    bookingDate: parsedBookingDate,
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
            return res.status(202).json({
                success: false,
                status: "inconclusive",
                message: "Payment verification is in progress with the payment gateway. Please check status shortly.",
                data: { razorpayOrderId, razorpayPaymentId },
            });
        }

        if (!fetchedPayment || !fetchedPayment.amount) {
            return res.status(202).json({
                success: false,
                status: "inconclusive",
                message: "Payment gateway returned pending payment details. Status check in progress.",
                data: { razorpayOrderId, razorpayPaymentId },
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

        if (req.user && req.user.role !== "admin" && String(existingOrder.customer) !== String(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: access denied to requested order",
            });
        }

        const paymentStatus = fetchedPayment.status;

        if (paymentStatus === "captured") {
            const markResult = await markOrderPaid({ payment: fetchedPayment });

            if (markResult.status === "amount_mismatch") {
                return res.status(409).json({
                    success: false,
                    message: "Payment amount mismatch with order",
                });
            }

            const finalizedOrder = markResult.order || existingOrder;

            return res.status(200).json({
                success: true,
                status: "captured",
                message: "Payment verified successfully",
                data: {
                    razorpayOrderId,
                    razorpayPaymentId,
                    orderId: finalizedOrder._id,
                    orderNumber: finalizedOrder.orderNumber,
                },
            });
        } else if (paymentStatus === "authorized") {
            await Order.updateOne(
                { _id: existingOrder._id, paymentStatus: { $ne: "paid" } },
                {
                    $set: {
                        paymentStatus: "authorized",
                        orderStatus: "confirmed",
                        "paymentDetails.transactionId": razorpayPaymentId,
                        "paymentDetails.paymentMethod": fetchedPayment.method || "Razorpay",
                        "paymentDetails.paymentDate": new Date(),
                    },
                }
            );

            return res.status(200).json({
                success: true,
                status: "authorized",
                message: "Payment authorized successfully",
                data: {
                    razorpayOrderId,
                    razorpayPaymentId,
                    orderId: existingOrder._id,
                    orderNumber: existingOrder.orderNumber,
                },
            });
        } else if (paymentStatus === "failed") {
            await Order.updateOne(
                { _id: existingOrder._id, paymentStatus: { $ne: "paid" } },
                { $set: { paymentStatus: "failed" } }
            );

            return res.status(400).json({
                success: false,
                status: "failed",
                message: fetchedPayment.error_description || "Payment failed at bank or gateway",
            });
        } else {
            // "pending" or unknown status: return 202 to guide client to bounded polling
            return res.status(202).json({
                success: false,
                status: "pending",
                message: "Payment is currently processing at payment gateway",
                data: {
                    razorpayOrderId,
                    razorpayPaymentId,
                    orderId: existingOrder._id,
                    orderNumber: existingOrder.orderNumber,
                },
            });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};