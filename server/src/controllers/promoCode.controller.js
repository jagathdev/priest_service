import PromoCode from "../models/PromoCode.js";
import PromoCodeUsage from "../models/PromoCodeUsage.js";
import Order from "../models/Order.js";

import {
    validatePromoCode,
} from "../services/promoCode.service.js";

// CREATE


export const createPromoCode = async (
    req,
    res
) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            maxDiscount,
            minimumOrderAmount,
            startDate,
            endDate,
            usageLimit,
            usageLimitPerUser,
            applicableServices,
            applicablePackages,
            isActive,
        } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message:
                    "Promo code is required",
            });
        }

        if (
            !["PERCENTAGE", "FIXED"].includes(
                discountType
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid discount type",
            });
        }

        if (
            Number(discountValue) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Discount value must be greater than 0",
            });
        }

        if (
            discountType ===
            "PERCENTAGE" &&
            Number(discountValue) > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Percentage discount cannot exceed 100%",
            });
        }

        if (
            new Date(startDate) >
            new Date(endDate)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Start date cannot be after end date",
            });
        }

        const normalizedCode =
            String(code)
                .trim()
                .toUpperCase();

        const existing =
            await PromoCode.findOne({
                code: normalizedCode,
            });

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "Promo code already exists",
            });
        }

        const promo =
            await PromoCode.create({
                code: normalizedCode,

                description:
                    description || "",

                discountType,

                discountValue:
                    Number(discountValue),

                maxDiscount:
                    maxDiscount !== null &&
                        maxDiscount !== undefined &&
                        maxDiscount !== ""
                        ? Number(maxDiscount)
                        : null,

                minimumOrderAmount:
                    Number(
                        minimumOrderAmount || 0
                    ),

                startDate,

                endDate,

                usageLimit:
                    usageLimit !== null &&
                        usageLimit !== undefined &&
                        usageLimit !== ""
                        ? Number(usageLimit)
                        : null,

                usageLimitPerUser:
                    Number(
                        usageLimitPerUser || 1
                    ),

                applicableServices:
                    applicableServices ||
                    "ALL",

                applicablePackages:
                    applicablePackages || [],

                isActive:
                    isActive !== undefined
                        ? Boolean(isActive)
                        : true,
            });

        return res.status(201).json({
            success: true,
            message:
                "Promo code created successfully",
            data: promo,
        });
    } catch (error) {
        console.error(
            "Create Promo Code Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create promo code",
        });
    }
};

// GET ALL

export const getPromoCodes = async (
    req,
    res
) => {
    try {
        const promos =
            await PromoCode.find()
                .sort({
                    createdAt: -1,
                })
                .lean();

        // Calculate usage metrics (ordersCount, totalRevenue, totalDiscount) for each promo code
        const promoIds = promos.map((p) => p._id);
        const promoCodes = promos.map((p) => p.code);

        // Aggregate orders matching promoCodeId or promoCode string
        const orderMetrics = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { promoCodeId: { $in: promoIds } },
                        { promoCode: { $in: promoCodes } }
                    ],
                    paymentStatus: "paid"
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $ifNull: ["$promoCodeId", false] },
                            { $toString: "$promoCodeId" },
                            "$promoCode"
                        ]
                    },
                    ordersCount: { $sum: 1 },
                    totalRevenue: { $sum: { $ifNull: ["$pricing.total", 0] } },
                    totalDiscount: { $sum: { $ifNull: ["$discountAmount", 0] } }
                }
            }
        ]);

        const metricsMap = new Map();
        orderMetrics.forEach((m) => {
            if (m._id) {
                metricsMap.set(String(m._id), m);
            }
        });

        const promosWithMetrics = promos.map((promo) => {
            const byId = metricsMap.get(String(promo._id));
            const byCode = metricsMap.get(promo.code);
            const metric = byId || byCode;

            return {
                ...promo,
                ordersCount: metric?.ordersCount || promo.usedCount || 0,
                totalRevenue: metric?.totalRevenue || 0,
                totalDiscount: metric?.totalDiscount || 0,
            };
        });

        return res.status(200).json({
            success: true,
            count: promosWithMetrics.length,
            data: promosWithMetrics,
        });
    } catch (error) {
        console.error(
            "Get Promo Codes Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch promo codes",
        });
    }
};

// GET USERS & ORDERS USAGE DETAILS FOR A PROMO CODE
export const getPromoCodeUsageDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const promo = await PromoCode.findById(id).lean();
        if (!promo) {
            return res.status(404).json({
                success: false,
                message: "Promo code not found",
            });
        }

        // 1. Fetch from PromoCodeUsage collection
        const usages = await PromoCodeUsage.find({ promoCodeId: id })
            .populate("userId", "name mobileNumber email whatsappNumber")
            .populate("orderId", "orderNumber customerName mobileNumber whatsappNumber pricing discountAmount paymentStatus orderStatus itemName pooja createdAt")
            .sort({ createdAt: -1 })
            .lean();

        // 2. Also check Order collection for any orders with promoCodeId or promoCode that might not have PromoCodeUsage record
        const orders = await Order.find({
            $or: [{ promoCodeId: id }, { promoCode: promo.code }],
            paymentStatus: { $in: ["paid", "pending", "confirmed"] },
        })
            .populate("customer", "name mobileNumber email whatsappNumber")
            .sort({ createdAt: -1 })
            .lean();

        // Merge usage entries to ensure complete devotees list
        const processedOrderIds = new Set();
        const records = [];

        // Process usages first
        for (const u of usages) {
            const order = u.orderId;
            const user = u.userId;
            const orderIdStr = order?._id ? String(order._id) : String(u.orderId);
            processedOrderIds.add(orderIdStr);

            records.push({
                _id: String(u._id),
                discountAmount: u.discountAmount ?? order?.discountAmount ?? 0,
                createdAt: u.createdAt || order?.createdAt || promo.createdAt,
                user: {
                    _id: user?._id ? String(user._id) : null,
                    name: user?.name || order?.customerName || "Devotee",
                    mobileNumber: user?.mobileNumber || order?.mobileNumber || order?.whatsappNumber || "-",
                    email: user?.email || "-",
                },
                order: order
                    ? {
                          _id: String(order._id),
                          orderNumber: order.orderNumber || "-",
                          customerName: order.customerName || user?.name || "Devotee",
                          mobileNumber: order.mobileNumber || order.whatsappNumber || user?.mobileNumber || "-",
                          totalAmount: order.pricing?.total ?? 0,
                          discountAmount: order.discountAmount ?? u.discountAmount ?? 0,
                          paymentStatus: order.paymentStatus || "paid",
                          orderStatus: order.orderStatus || "completed",
                          itemName: order.itemName || order.pooja || "Puja Service",
                          createdAt: order.createdAt,
                      }
                    : null,
            });
        }

        // Process any additional orders not captured in usages
        for (const o of orders) {
            const orderIdStr = String(o._id);
            if (!processedOrderIds.has(orderIdStr)) {
                processedOrderIds.add(orderIdStr);
                const user = o.customer;
                records.push({
                    _id: `ord_${o._id}`,
                    discountAmount: o.discountAmount || 0,
                    createdAt: o.createdAt,
                    user: {
                        _id: user?._id ? String(user._id) : null,
                        name: o.customerName || user?.name || "Devotee",
                        mobileNumber: o.mobileNumber || o.whatsappNumber || user?.mobileNumber || "-",
                        email: user?.email || "-",
                    },
                    order: {
                        _id: String(o._id),
                        orderNumber: o.orderNumber || "-",
                        customerName: o.customerName || user?.name || "Devotee",
                        mobileNumber: o.mobileNumber || o.whatsappNumber || user?.mobileNumber || "-",
                        totalAmount: o.pricing?.total ?? 0,
                        discountAmount: o.discountAmount || 0,
                        paymentStatus: o.paymentStatus || "paid",
                        orderStatus: o.orderStatus || "completed",
                        itemName: o.itemName || o.pooja || "Puja Service",
                        createdAt: o.createdAt,
                    },
                });
            }
        }

        // Calculate summary
        const totalRevenue = records.reduce((sum, r) => sum + (r.order?.totalAmount || 0), 0);
        const totalDiscountGiven = records.reduce((sum, r) => sum + (r.discountAmount || 0), 0);

        return res.status(200).json({
            success: true,
            promo: {
                _id: promo._id,
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                totalOrders: records.length,
                totalRevenue,
                totalDiscountGiven,
            },
            count: records.length,
            data: records,
        });
    } catch (error) {
        console.error("Get Promo Usage Details Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch promo code usage details",
        });
    }
};

//  GET ONE


export const getPromoCodeById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const promo =
            await PromoCode.findById(id);

        if (!promo) {
            return res.status(404).json({
                success: false,
                message:
                    "Promo code not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: promo,
        });
    } catch (error) {
        console.error(
            "Get Promo Code Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch promo code",
        });
    }
};

//  UPDATE


export const updatePromoCode = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const updates = {
            ...req.body,
        };

        if (updates.code) {
            updates.code = String(
                updates.code
            )
                .trim()
                .toUpperCase();

            const duplicate =
                await PromoCode.findOne({
                    code: updates.code,
                    _id: {
                        $ne: id,
                    },
                });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Promo code already exists",
                });
            }
        }

        if (
            updates.discountType ===
            "PERCENTAGE" &&
            Number(
                updates.discountValue
            ) > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Percentage discount cannot exceed 100%",
            });
        }

        if (
            updates.startDate &&
            updates.endDate &&
            new Date(
                updates.startDate
            ) >
            new Date(
                updates.endDate
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Start date cannot be after end date",
            });
        }

        const promo =
            await PromoCode.findByIdAndUpdate(
                id,
                updates,
                {
                    returnDocument:
                        "after",
                    runValidators: true,
                }
            );

        if (!promo) {
            return res.status(404).json({
                success: false,
                message:
                    "Promo code not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Promo code updated successfully",
            data: promo,
        });
    } catch (error) {
        console.error(
            "Update Promo Code Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update promo code",
        });
    }
};


//  DELETE

export const deletePromoCode = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const promo =
            await PromoCode.findById(id);

        if (!promo) {
            return res.status(404).json({
                success: false,
                message:
                    "Promo code not found",
            });
        }

        /*
         * Don't delete a promo that was
         * already used.
         */
        if (promo.usedCount > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Used promo codes cannot be deleted. Deactivate it instead.",
            });
        }

        await PromoCode.findByIdAndDelete(
            id
        );

        return res.status(200).json({
            success: true,
            message:
                "Promo code deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete Promo Code Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete promo code",
        });
    }
};

//  ACTIVATE / DEACTIVATE

export const updatePromoStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const {
            isActive,
        } = req.body;

        const promo =
            await PromoCode.findByIdAndUpdate(
                id,
                {
                    isActive:
                        Boolean(isActive),
                },
                {
                    returnDocument:
                        "after",
                }
            );

        if (!promo) {
            return res.status(404).json({
                success: false,
                message:
                    "Promo code not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: isActive
                ? "Promo code activated"
                : "Promo code deactivated",
            data: promo,
        });
    } catch (error) {
        console.error(
            "Update Promo Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update promo status",
        });
    }
};


// APPLY PROMO

export const applyPromoCode = async (
    req,
    res
) => {
    try {
        const {
            code,
            orderAmount,
            serviceType,
            packageId,
            userId,
        } = req.body;

        const result =
            await validatePromoCode({
                code,
                orderAmount,
                serviceType,
                packageId,
                userId: userId || req.user?.id || null,
            });

        return res.status(200).json({
            success: true,
            message:
                "Promo code applied successfully",
            data: {
                promoId:
                    result.promo?._id,

                promoCode:
                    result.promoCode,

                discountType:
                    result.discountType,

                discountValue:
                    result.discountValue,

                orderAmount:
                    result.orderAmount,

                discountAmount:
                    result.discountAmount,

                finalAmount:
                    result.finalAmount,
            },
        });
    } catch (error) {
        console.error(
            "Apply Promo Code Error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to apply promo code",
        });
    }
};

export { recordPromoUsage } from "../services/promoCode.service.js";