/**
 * Canonical service types supported by Priest Services.
 */
export const SERVICE_TYPES = Object.freeze({
    PUJA: "Puja",
    POOJA: "Puja", // backward compatibility alias
    HOMA: "Homa",
});

/**
 * Normalizes any variation of service type string to canonical "Puja" or "Homa".
 * Accepts: "puja", "pooja", "pujas", "poojas", "homa", "homas" in any casing.
 *
 * @param {string} serviceType
 * @returns {"Puja" | "Homa"}
 */
export const normalizeServiceType = (serviceType) => {
    const s = String(serviceType || "").trim().toUpperCase();
    if (s === "HOMA" || s === "HOMAS") {
        return SERVICE_TYPES.HOMA;
    }
    if (s === "PUJA" || s === "POOJA" || s === "PUJAS" || s === "POOJAS" || !s) {
        return SERVICE_TYPES.PUJA;
    }
    return s;
};
