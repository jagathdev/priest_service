import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Never rate-limit payment webhooks
    const url = req.originalUrl || req.url || '';
    return url.includes('getRazorpayWebhook') || url.includes('/payments/webhook');
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to extract clean 10-digit mobile number for key generator
const extractMobileKey = (req) => {
  if (req.body?.mobileNumber) {
    const digits = String(req.body.mobileNumber).replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }
  return req.ip || 'unknown';
};

// ── Separate OTP Send Limiters ──
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Generous IP limit to prevent blocking shared office/mobile NAT IPs
  message: { success: false, message: 'Too many OTP requests from this network. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpSendPerMobileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 OTP sends per specific mobile number in 15 mins
  keyGenerator: extractMobileKey,
  message: { success: false, message: 'Too many OTP requests for this mobile number. Please wait a few minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Separate OTP Verification Limiters ──
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40,
  message: { success: false, message: 'Too many verification attempts from this network. Please wait a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpVerifyPerMobileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 verification attempts per specific mobile number
  keyGenerator: extractMobileKey,
  message: { success: false, message: 'Too many verification attempts for this mobile number. Please request a new OTP.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Backward-compatible aliases
export const otpLimiter = otpSendLimiter;
export const perMobileOtpLimiter = otpSendPerMobileLimiter;

