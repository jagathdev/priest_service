import crypto from "crypto";
import Order from "../models/Order.js";
import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";
import Pooja from "../models/Pooja.js";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
    fetchRazorpayPayment,
} from "../services/payment.service.js";
import { markOrderPaid } from "../services/orderPayment.service.js";
import { validatePromoCode } from "../services/promoCode.service.js";
import { toPaise } from "../utils/currency.js";
import { sendOrderConfirmation } from "../services/whatsapp.service.js";
import { recordPromoUsage } from "./promoCode.controller.js";

/**
 * Computes exact package and extra participant pricing on the server,
 * mirroring client calculations in sankalp/page.tsx.
 */
const computeServerPrice = async ({ serviceId, serviceType, packageId, participantsCount, offerings, promoCode, userId }) => {
    let service = null;
    const typeUpper = (serviceType || "").toUpperCase();

    if (typeUpper === "HOMA") {
        service = await Homa.findById(serviceId).lean();
    } else if (typeUpper === "POOJA" || typeUpper === "PUJA") {
        service = await Puja.findById(serviceId).lean() || await Pooja.findById(serviceId).lean();
    } else if (serviceId) {
        service = await Puja.findById(serviceId).lean() ||
                  await Homa.findById(serviceId).lean() ||
                  await Pooja.findById(serviceId).lean();
    }

    if (!service) {
        const err = new Error("Selected service not found");
        err.statusCode = 400;
        throw err;
    }

    // Determine package
    const packages = service.packages || [];
    let selectedPackage = null;
    if (packageId && packages.length > 0) {
        const cleanPkgId = String(packageId).trim().toLowerCase();
        selectedPackage = packages.find((p, idx) => {
            const pId = String(p.id || p._id || "").toLowerCase();
            return pId === cleanPkgId || `pkg-${idx + 1}` === cleanPkgId;
        }) || packages.find((p) => {
            const pName = String(p.name || "").toLowerCase();
            if (cleanPkgId.includes("couple") && pName.includes("couple")) return true;
            if (cleanPkgId.includes("family") && pName.includes("family")) return true;
            if (cleanPkgId.includes("individual") && pName.includes("individual")) return true;
            return pName.includes(cleanPkgId);
        });
    }

    if (!selectedPackage && packages.length > 0) {
        selectedPackage = packages[0];
    }

    const basePrice = selectedPackage?.priceINR ??
                      selectedPackage?.price ??
                      service.basePrice ??
                      service.price;

    // Default devotees calculation
    let defaultDevotees = 1;
    if (selectedPackage) {
        const pkgName = String(selectedPackage.name || "").toLowerCase();
        const devoteeStr = String(selectedPackage.devoteeCount || selectedPackage.devotees || "");
        if (pkgName.includes("family") || devoteeStr.includes("4")) {
            defaultDevotees = 4;
        } else if (pkgName.includes("couple") || devoteeStr.includes("2")) {
            defaultDevotees = 2;
        }
    }

    const count = Math.max(1, Number(participantsCount) || 1);
    const extraParticipantCount = Math.max(0, count - defaultDevotees);
    const extraParticipantFee = extraParticipantCount * 300;

    // Calculate offerings
    let offeringsTotal = 0;
    const validatedOfferings = [];
    const availableOfferings = Array.isArray(service.offerings) ? service.offerings : [];

    if (Array.isArray(offerings) && offerings.length > 0) {
        for (const item of offerings) {
            if (!item) continue;
            const requestedName = String(item.name || item.title || "").trim().toLowerCase();
            const requestedId = String(item.id || item._id || "").trim().toLowerCase();

            // Match offering against service offerings defined in database
            const matched = availableOfferings.find((off) => {
                const offId = String(off.id || off._id || "").trim().toLowerCase();
                const offName = String(off.name || off.title || "").trim().toLowerCase();
                return (requestedId && offId === requestedId) || (requestedName && offName === requestedName);
            });

            // Use verified price from DB offering if available; fallback to item price if positive number
            const unitPrice = matched
                ? (matched.priceINR ?? matched.price ?? 0)
                : (Number(item.priceINR ?? item.price) || 0);

            if (unitPrice > 0) {
                offeringsTotal += unitPrice;
                validatedOfferings.push({
                    name: (matched?.name || matched?.title || item.name || item.title || "Offering").trim(),
                    priceINR: unitPrice,
                    description: matched?.description || item.description || "",
                    imageUrl: matched?.imageUrl || item.imageUrl || "",
                });
            }
        }
    }

    const originalAmount = basePrice + extraParticipantFee + offeringsTotal;

    let discountAmount = 0;
    let promoCodeId = null;

    if (promoCode && String(promoCode).trim()) {
        const promoRes = await validatePromoCode({
            code: promoCode,
            orderAmount: originalAmount,
            serviceType: serviceType || "Puja",
            packageId: selectedPackage?.id || selectedPackage?._id || packageId,
            userId: userId || null,
        });

        discountAmount = promoRes.discountAmount || 0;
        promoCodeId = promoRes.promo?._id || null;
    }

    const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);

    return {
        service,
        basePrice,
        extraParticipantCount,
        extraParticipantFee,
        offeringsTotal,
        validatedOfferings,
        originalAmount,
        discountAmount,
        finalAmount,
        promoCodeId,
    };
};

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

            if (!customer) {
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
                    userId: customer,
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
                    customer,
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

        // Path B: Old client without orderDetails
        const finalAmount = amount || totalamount;

        if (!finalAmount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        if (Number(finalAmount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0",
            });
        }

        const razorpayOrder = await createRazorpayOrder({
            amount: Number(finalAmount),
            receipt: orderReceipt,
            notes: {
                uniqueId: customUniqueId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Payment order created successfully",
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                notes: razorpayOrder.notes,
                keyId: process.env.RAZORPAY_KEY_ID,
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
            orderDetails,
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

        // Fetch payment entity from Razorpay inside try/catch so an API failure never blocks
        let fetchedPayment = null;
        try {
            fetchedPayment = await fetchRazorpayPayment(razorpayPaymentId);
        } catch (fetchErr) {
            console.warn(`[verifyPayment] Could not fetch Razorpay payment ${razorpayPaymentId}:`, fetchErr.message);
        }

        // Check if an Order with that razorpayOrderId already exists
        const existingOrder = await Order.findOne({ razorpayOrderId });

        if (existingOrder) {
            const paymentPayload = fetchedPayment || {
                id: razorpayPaymentId,
                order_id: razorpayOrderId,
                amount: toPaise(existingOrder.pricing?.total),
                currency: "INR",
                method: "Razorpay",
                created_at: Math.floor(Date.now() / 1000),
            };

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
        }

        // Fallback for old client: no existing pending order
        if (!orderDetails) {
            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                data: {
                    razorpayOrderId,
                    razorpayPaymentId,
                    orderId: null,
                    orderNumber: null,
                },
            });
        }

        // Check fetched payment amount against orderDetails if available
        if (fetchedPayment && orderDetails.pricing?.total !== undefined) {
            const expectedPaise = toPaise(orderDetails.pricing.total);
            if (Number(fetchedPayment.amount) !== expectedPaise) {
                console.error(
                    `[verifyPayment] Old client amount mismatch. Razorpay: ${fetchedPayment.amount} paise, orderDetails: ${expectedPaise} paise`
                );
                return res.status(409).json({
                    success: false,
                    message: "Payment amount mismatch",
                });
            }
        }

        // Whitelist allowed fields, never spread raw req.body, remove gatewayResponse
        const sanitizedDetails = {
            pooja: orderDetails.pooja,
            serviceId: orderDetails.serviceId,
            serviceType: orderDetails.serviceType,
            customer: orderDetails.customer,
            customerName: orderDetails.customerName,
            itemName: orderDetails.itemName,
            mobileNumber: orderDetails.mobileNumber,
            whatsappNumber: orderDetails.whatsappNumber,
            participants: orderDetails.participants,
            gotra: orderDetails.gotra,
            doesNotKnowGotra: orderDetails.doesNotKnowGotra,
            wish: orderDetails.wish,
            promoCode: orderDetails.promoCode,
            promoCodeId: orderDetails.promoCodeId,
            offerings: Array.isArray(orderDetails.offerings) ? orderDetails.offerings : [],
            pricing: orderDetails.pricing,
            originalAmount: orderDetails.originalAmount,
            discountAmount: orderDetails.discountAmount,
        };

        const savedOrder = await Order.create({
            ...sanitizedDetails,
            razorpayOrderId,
            bookingDate: new Date(),
            paymentStatus: "paid",
            orderStatus: "confirmed",
            paymentDetails: {
                transactionId: razorpayPaymentId,
                paymentMethod: "Razorpay",
                paymentDate: new Date(),
            },
        });

        if (savedOrder.promoCodeId) {
            try {
                await recordPromoUsage({
                    promoCodeId: savedOrder.promoCodeId,
                    userId: savedOrder.customer,
                    orderId: savedOrder._id,
                    discountAmount: savedOrder.discountAmount || 0,
                });
            } catch (promoErr) {
                console.error("[verifyPayment] Failed to record promo usage:", promoErr.message);
            }
        }

        try {
            await sendOrderConfirmation({
                mobileNumber: savedOrder.whatsappNumber || savedOrder.mobileNumber,
                orderId: savedOrder.orderNumber,
                customerName: savedOrder.customerName,
                serviceName: savedOrder.itemName || savedOrder.pooja,
                bookingDate: savedOrder.bookingDate,
                amount: savedOrder.pricing?.total,
            });
        } catch (waError) {
            console.error("[WhatsApp] Failed to dispatch order confirmation:", waError.message);
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                razorpayOrderId,
                razorpayPaymentId,
                orderId: savedOrder._id,
                orderNumber: savedOrder.orderNumber,
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