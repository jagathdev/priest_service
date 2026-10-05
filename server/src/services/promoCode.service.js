import PromoCode from "../models/PromoCode.js";
import PromoCodeUsage from "../models/PromoCodeUsage.js";

const normalizeCode = (code) => {
    return String(code || "")
        .trim()
        .toUpperCase();
};

export const validatePromoCode = async ({
    code,
    orderAmount,
    serviceType,
    packageId,
    userId = null,
}) => {
    const normalizedCode = normalizeCode(code);

    if (!normalizedCode) {
        const error = new Error(
            "Promo code is required"
        );

        error.statusCode = 400;
        throw error;
    }

    const amount = Number(orderAmount);

    if (!amount || amount <= 0) {
        const error = new Error(
            "Invalid order amount"
        );

        error.statusCode = 400;
        throw error;
    }

    const promo = await PromoCode.findOne({
        code: normalizedCode,
    });

    if (!promo) {
        const error = new Error(
            "Invalid promo code"
        );

        error.statusCode = 404;
        throw error;
    }

    if (!promo.isActive) {
        const error = new Error(
            "Promo code is inactive"
        );

        error.statusCode = 400;
        throw error;
    }

    const now = new Date();

    if (now < promo.startDate) {
        const error = new Error(
            "Promo code is not active yet"
        );

        error.statusCode = 400;
        throw error;
    }

    if (now > promo.endDate) {
        const error = new Error(
            "Promo code has expired"
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        promo.usageLimit !== null &&
        promo.usedCount >= promo.usageLimit
    ) {
        const error = new Error(
            "Promo code usage limit reached"
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        amount < promo.minimumOrderAmount
    ) {
        const error = new Error(
            `Minimum order amount is ₹${promo.minimumOrderAmount}`
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        promo.applicableServices !== "ALL" &&
        promo.applicableServices !== serviceType
    ) {
        const error = new Error(
            `This promo code is not valid for ${serviceType.toLowerCase()}`
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        promo.applicablePackages.length > 0 &&
        !promo.applicablePackages.includes(
            packageId
        )
    ) {
        const error = new Error(
            "This promo code is not valid for the selected package"
        );

        error.statusCode = 400;
        throw error;
    }

    /*
     * Check per-user usage.
     *
     * Only do this when userId exists.
     */
    if (userId) {
        const userUsageCount =
            await PromoCodeUsage.countDocuments({
                promoCodeId: promo._id,
                userId,
            });

        if (
            userUsageCount >=
            promo.usageLimitPerUser
        ) {
            const error = new Error(
                "You have already used this promo code"
            );

            error.statusCode = 400;
            throw error;
        }
    }

    let discountAmount = 0;

    if (
        promo.discountType ===
        "PERCENTAGE"
    ) {
        discountAmount =
            (amount *
                promo.discountValue) /
            100;

        if (
            promo.maxDiscount !== null &&
            discountAmount >
            promo.maxDiscount
        ) {
            discountAmount =
                promo.maxDiscount;
        }
    }

    if (
        promo.discountType === "FIXED"
    ) {
        discountAmount =
            promo.discountValue;
    }

    /*
     * Discount cannot be greater than
     * the order amount.
     */
    discountAmount = Math.min(
        discountAmount,
        amount
    );

    /*
     * Keep INR to 2 decimal places.
     */
    discountAmount =
        Math.round(
            discountAmount * 100
        ) / 100;

    const finalAmount =
        Math.round(
            (amount - discountAmount) * 100
        ) / 100;

    return {
        promo,
        promoCode: promo.code,
        discountType:
            promo.discountType,
        discountValue:
            promo.discountValue,
        orderAmount: amount,
        discountAmount,
        finalAmount,
    };
};