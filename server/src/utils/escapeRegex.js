/**
 * Escapes special regex characters in a string to prevent ReDoS or regex injection.
 * @param {string} str
 * @returns {string}
 */
export const escapeRegex = (str) => {
    if (typeof str !== "string") return "";
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export default escapeRegex;
