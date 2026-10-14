/**
 * Currency conversion helpers between Rupees and Paise.
 * Order model money fields (pricing.total) are in RUPEES.
 * Razorpay payload amounts are in PAISE.
 */

export const toPaise = (rupees) => {
    if (rupees === null || rupees === undefined || isNaN(rupees)) {
        return 0;
    }
    return Math.round(Number(rupees) * 100);
};

export const toRupees = (paise) => {
    if (paise === null || paise === undefined || isNaN(paise)) {
        return 0;
    }
    return Math.round(Number(paise)) / 100;
};
