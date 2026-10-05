import PromoCode from "../models/PromoCode.js";
import PromoCodeUsage from "../models/PromoCodeUsage.js";

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

        return res.status(200).json({
            success: true,
            count: promos.length,
            data: promos,
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
                userId,
            });

        return res.status(200).json({
            success: true,
            message:
                "Promo code applied successfully",
            data: {
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

/*
 RECORD PROMO USAGE

 Call this ONLY after successful payment.

*/

export const recordPromoUsage = async ({
    promoCodeId,
    userId,
    orderId,
    discountAmount,
}) => {
    const existing =
        await PromoCodeUsage.findOne({
            orderId,
        });

    if (existing) {
        return existing;
    }

    const usage =
        await PromoCodeUsage.create({
            promoCodeId,
            userId,
            orderId,
            discountAmount,
        });

    await PromoCode.findByIdAndUpdate(
        promoCodeId,
        {
            $inc: {
                usedCount: 1,
            },
        }
    );

    return usage;
};