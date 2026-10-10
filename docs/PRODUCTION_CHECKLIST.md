# Production Checklist

Ensure the following criteria are met before going live:

## Credentials & Secrets
- [ ] **Live Razorpay Keys**: Ensure test keys are replaced with live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- [ ] **Razorpay Webhook Registration**: Register the live webhook endpoint URL in Razorpay Dashboard and ensure `RAZORPAY_WEBHOOK_SECRET` matches.
- [ ] **Secret Rotation**: Rotate any secrets (like `JWT_SECRET` or DB passwords) that were ever exposed in the repository or shared over insecure channels.
- [ ] **JWT Secret Length**: Ensure `JWT_SECRET` is heavily randomized and at least 32 characters long.

## Database (MongoDB Atlas)
- [ ] **Backups Enabled**: Ensure automated backups are turned on in MongoDB Atlas.
- [ ] **IP Allowlist**: Restrict the MongoDB Network Access to only allow connections from your production backend servers (remove `0.0.0.0/0`).
- [ ] **Indexing**: Ensure all necessary indexes (e.g., `razorpayOrderId`, `customer/createdAt` compounds, unique `slug`s) are built.

## Network & Security
- [ ] **CORS Origins**: Ensure `CLIENT_URLS` in the server environment restricts cross-origin access strictly to your deployed domains.
- [ ] **HTTPS**: Ensure the backend enforces HTTPS or the load balancer strictly redirects HTTP to HTTPS.
- [ ] **Rate Limiting & Helmet**: Verify that Express rate limiters are active and Helmet is setting security headers properly.

## Legal & Compliance
- [ ] **Privacy Policy**: Present and accessible on the frontend.
- [ ] **Terms & Conditions**: Present and accessible.
- [ ] **Refund Policy**: Clearly stated on the site to comply with Razorpay/Gateway requirements.

## Client / Frontend
- [ ] **Mock Payments Disabled**: Ensure `NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS` is `false` or fully removed for production.
- [ ] **API Base URL**: Ensure `NEXT_PUBLIC_API_BASE_URL` strictly points to the live backend domain with no fallbacks.
- [ ] **Analytics/Sentry**: Confirm Sentry (or equivalent) is initialized properly without tracking PII.
