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
 * Extracts pure 10-digit Indian mobile number without any prefix (+91, 91, 0).
 * Examples:
 * - "919360270984" -> "9360270984"
 * - "+91 9360270984" -> "9360270984"
 * - "09360270984" -> "9360270984"
 * - "9360270984" -> "9360270984"
 */
/**
 * Extracts pure 10-digit Indian mobile number without country code.
 *
 * Rules:
 * 1. If 12 or more digits and starts with 91 (e.g. 919092779449, 919360270984):
 *    Takes the LAST 10 digits -> (9092779449, 9360270984).
 * 2. If exactly 10 digits:
 *    NEVER remove 91! Even if the user's mobile number starts with 91 (e.g. 9163809425, 9193602709),
 *    all 10 digits are kept exactly as-is.
 * 3. If 11 digits starting with 0:
 *    Strips the leading 0 (09360270984 -> 9360270984).
 */
export function extract10DigitPhone(phone: string | null | undefined): string {
    if (!phone) return "";
    const digits = String(phone).replace(/\D/g, "");
    if (!digits) return "";

    // 1. If 12 or more digits and starts with 91 (e.g. 919092779449, 919360270984)
    // The subscriber's mobile number is the last 10 digits
    if (digits.length >= 12 && digits.startsWith("91")) {
        return digits.slice(-10);
    }

    // 2. Strip leading 0 if 11 digits
    if (digits.length === 11 && digits.startsWith("0")) {
        return digits.slice(1);
    }

    // 3. If exactly 10 digits, DO NOT remove 91! Keep all 10 digits as-is
    if (digits.length === 10) {
        return digits;
    }

    // 4. Fallback: if more than 10 digits, take the last 10 digits
    if (digits.length > 10) {
        return digits.slice(-10);
    }

    return digits;
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

