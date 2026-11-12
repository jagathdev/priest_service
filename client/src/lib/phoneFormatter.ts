/**
 * Formats any phone/mobile number string into Indian standard:
 * "+91 <10-digit number>"
 *
 * Examples:
 * - "919360270984" -> "+91 9360270984"
 * - "9360270984"   -> "+91 9360270984"
 * - "+919360270984" -> "+91 9360270984"
 * - "+91 9360270984" -> "+91 9360270984"
 * - "09360270984" -> "+91 9360270984"
 */
export function formatIndianPhoneNumber(phone: string | null | undefined): string {
    if (!phone) return "-";
    const digits = String(phone).replace(/\D/g, "");
    if (!digits) return String(phone);

    // If starts with 0 and is 11 digits (e.g. 09360270984)
    if (digits.length === 11 && digits.startsWith("0")) {
        return `+91 ${digits.slice(1)}`;
    }

    // If starts with 91 and has 12 digits (e.g. 919360270984)
    if (digits.length === 12 && digits.startsWith("91")) {
        return `+91 ${digits.slice(2)}`;
    }

    // Standard 10 digit Indian number
    if (digits.length === 10) {
        return `+91 ${digits}`;
    }

    // Fallback if already has a country code or international
    if (String(phone).startsWith("+")) {
        return String(phone);
    }

    return `+91 ${digits}`;
}

/**
 * Extracts clean 10-digit number or international digits for wa.me links
 */
export function getCleanWhatsAppDigits(phone: string | null | undefined): string {
    if (!phone) return "";
    const digits = String(phone).replace(/\D/g, "");
    if (!digits) return "";

    if (digits.length === 10) {
        return `91${digits}`;
    }
    if (digits.length === 11 && digits.startsWith("0")) {
        return `91${digits.slice(1)}`;
    }
    return digits;
}

