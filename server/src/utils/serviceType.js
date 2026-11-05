/**
 * Canonical service types supported by Priest Services.
 */
export const SERVICE_TYPES = Object.freeze({
    POOJA: "POOJA",
    PUJA: "POOJA", // canonical alias
    HOMA: "HOMA",
});

/**
 * Normalizes any variation of service type string to canonical "POOJA" or "HOMA".
 * Accepts: "puja", "pooja", "pujas", "poojas", "homa", "homas" in any casing.
 *
 * @param {string} serviceType
 * @returns {"POOJA" | "HOMA" | string}
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

/**
 * Converts a service type to title-case display format ("Puja" | "Homa").
 *
 * @param {string} serviceType
 * @returns {"Puja" | "Homa" | string}
 */
export const toDisplayServiceType = (serviceType) => {
    const normalized = normalizeServiceType(serviceType);
    if (normalized === SERVICE_TYPES.HOMA) {
        return "Homa";
    }
    if (normalized === SERVICE_TYPES.POOJA) {
        return "Puja";
    }
    return serviceType;
};
