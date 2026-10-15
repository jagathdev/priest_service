# Production Hardening & Launch Checklist

## 1. Environment & Configuration
- [ ] Ensure `validateEnv()` runs and all required environment variables are set in production (`server/.env`).
- [ ] `JWT_SECRET` must be a high-entropy secret at least 32 characters long.
- [ ] `CLIENT_URLS` contains all production and staging frontend domains (comma-separated).
- [ ] `trust proxy` enabled for proper SSL and IP detection behind load balancers / reverse proxies.

## 2. Authentication & Authorization
- [ ] User authentication issues JWT tokens valid for 7 days upon OTP verification.
- [ ] Client stores Bearer token in `localStorage` and includes it in all authorized requests.
- [ ] Protected endpoints verify user resource ownership (matching `req.user.id` or admin privileges).
- [ ] Rate limiters are active on OTP requests (`/api/otp/sendOtp` and `/api/otp/verifyOtp`) per IP and per mobile number.

## 3. Payments & Order Integrity
- [ ] Pricing calculations occur exclusively on the backend (`computeServerPrice`).
- [ ] Razorpay webhook endpoint verifies cryptographic HMAC-SHA256 signatures over raw body.
- [ ] Payment verification compares Razorpay signatures using timing-safe comparisons (`crypto.timingSafeEqual`).
- [ ] Inactive services or invalid base prices are strictly rejected before order creation.

## 4. Operational Safety
- [ ] 404 and global error handlers are mounted last with stack traces omitted in production.
- [ ] Global API rate limiting is enforced on all `/api` routes.
- [ ] Unhandled promise rejections and uncaught exceptions log cleanly without silent failures.
