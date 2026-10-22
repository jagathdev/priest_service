/**
 * Canonical service types supported by Priest Services.
 */
export const SERVICE_TYPES = Object.freeze({
    POOJA: "POOJA",
    HOMA: "HOMA",
});

/**
 * Normalizes any variation of service type string to canonical "POOJA" or "HOMA".
 * Accepts: "puja", "pooja", "pujas", "poojas", "homa", "homas" in any casing.
 *
 * @param {string} serviceType
 * @returns {"POOJA" | "HOMA"}
 */
export const normalizeServiceType = (serviceType) => {
    const s = String(serviceType || "").trim().toUpperCase();
    if (s === "HOMA" || s === "HOMAS") {
        return SERVICE_TYPES.HOMA;
    }
    if (s === "PUJA" || s === "POOJA" || s === "PUJAS" || s === "POOJAS" || !s) {
        return SERVICE_TYPES.POOJA;
    }
    return s;
};
