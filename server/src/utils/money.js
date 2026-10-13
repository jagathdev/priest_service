/**
 * Money helper for integer paise conversions.
 * Storing all monetary values as integer paise avoids IEEE 754 float precision errors.
 */

export const toPaise = (rupees) => {
    if (rupees === null || rupees === undefined || isNaN(rupees)) {
        throw new Error("Invalid rupee amount for paise conversion");
    }
    return Math.round(Number(rupees) * 100);
};

export const toRupees = (paise) => {
    if (paise === null || paise === undefined || isNaN(paise)) {
        throw new Error("Invalid paise amount for rupee conversion");
    }
    return Number(paise) / 100;
};
