import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import request from "supertest";
import app from "../src/app.js";
import WebhookEvent from "../src/models/WebhookEvent.js";
import Payment from "../src/models/Payment.js";
import Order from "../src/models/Order.js";
import PromoCode from "../src/models/PromoCode.js";
import { normalizeServiceType } from "../src/utils/serviceType.js";
import { otpSendLimiter, otpVerifyLimiter, globalLimiter } from "../src/middlewares/rateLimiters.js";
import { validatePromoCode } from "../src/services/promoCode.service.js";

test("Phase 1 Validation: Service Type Casing & Normalization", async (t) => {
    await t.test("Normalizes puja variants to POOJA", () => {
        assert.equal(normalizeServiceType("puja"), "POOJA");
        assert.equal(normalizeServiceType("pooja"), "POOJA");
        assert.equal(normalizeServiceType("pujas"), "POOJA");
        assert.equal(normalizeServiceType("poojas"), "POOJA");
        assert.equal(normalizeServiceType("Puja"), "POOJA");
        assert.equal(normalizeServiceType("Pooja"), "POOJA");
        assert.equal(normalizeServiceType("POOJA"), "POOJA");
    });

    await t.test("Normalizes homa variants to HOMA", () => {
        assert.equal(normalizeServiceType("homa"), "HOMA");
        assert.equal(normalizeServiceType("homas"), "HOMA");
        assert.equal(normalizeServiceType("Homa"), "HOMA");
        assert.equal(normalizeServiceType("HOMA"), "HOMA");
    });

    await t.test("Handles empty or other service types gracefully", () => {
        assert.equal(normalizeServiceType(""), "POOJA");
        assert.equal(normalizeServiceType(null), "POOJA");
        assert.equal(normalizeServiceType(undefined), "POOJA");
        assert.equal(normalizeServiceType("astrology"), "ASTROLOGY");
    });
});

test("Phase 1 Validation: Promo Codes Applicability for POOJA and HOMA", async (t) => {
    const origFindOne = PromoCode.findOne;

    try {
        const createMockPromo = (applicableServices, discountType = "PERCENTAGE", discountValue = 10) => ({
            code: "TESTPROMO",
            isActive: true,
            startDate: new Date(Date.now() - 100000),
            endDate: new Date(Date.now() + 100000),
            usageLimit: 100,
            usedCount: 0,
            minimumOrderAmount: 100,
            applicableServices,
            applicablePackages: [],
            discountType,
            discountValue,
            maxDiscount: 500,
            perUserLimit: 5,
        });

        // 1. POOJA-only promo code
        await t.test("POOJA-only promo succeeds with 'puja', 'pooja', and 'POOJA'", async () => {
            PromoCode.findOne = async () => createMockPromo("POOJA");

            const resPuja = await validatePromoCode({
                code: "TESTPROMO",
                orderAmount: 1000,
                serviceType: "puja",
            });
            assert.equal(resPuja.discountAmount, 100);

            const resPooja = await validatePromoCode({
                code: "TESTPROMO",
                orderAmount: 1000,
                serviceType: "pooja",
            });
            assert.equal(resPooja.discountAmount, 100);

            const resUpper = await validatePromoCode({
                code: "TESTPROMO",
                orderAmount: 1000,
                serviceType: "POOJA",
            });
            assert.equal(resUpper.discountAmount, 100);
        });

        await t.test("POOJA-only promo fails with 'homa'", async () => {
            PromoCode.findOne = async () => createMockPromo("POOJA");

            await assert.rejects(
                async () => {
                    await validatePromoCode({
                        code: "TESTPROMO",
                        orderAmount: 1000,
                        serviceType: "homa",
                    });
                },
                /This promo code is not valid for Homas/
            );
        });

        // 2. HOMA-only promo code
        await t.test("HOMA-only promo succeeds with 'homa' and 'HOMA'", async () => {
            PromoCode.findOne = async () => createMockPromo("HOMA");

            const resHoma = await validatePromoCode({
                code: "TESTPROMO",
                orderAmount: 1000,
                serviceType: "homa",
            });
            assert.equal(resHoma.discountAmount, 100);

            const resUpperHoma = await validatePromoCode({
                code: "TESTPROMO",
                orderAmount: 1000,
                serviceType: "HOMA",
            });
            assert.equal(resUpperHoma.discountAmount, 100);
        });

        await t.test("HOMA-only promo fails with 'puja'", async () => {
            PromoCode.findOne = async () => createMockPromo("HOMA");

            await assert.rejects(
                async () => {
                    await validatePromoCode({
                        code: "TESTPROMO",
                        orderAmount: 1000,
                        serviceType: "puja",
                    });
                },
                /This promo code is not valid for Pujas/
            );
        });

        // 3. ALL promo code
        await t.test("ALL promo succeeds with both puja and homa", async () => {
            PromoCode.findOne = async () => createMockPromo("ALL");

            const resPuja = await validatePromoCode({
                code: "TESTPROMO",
                orderAmount: 1000,
                serviceType: "puja",
            });
            assert.equal(resPuja.discountAmount, 100);

            const resHoma = await validatePromoCode({
                code: "TESTPROMO",
                orderAmount: 1000,
                serviceType: "homa",
            });
            assert.equal(resHoma.discountAmount, 100);
        });
    } finally {
        PromoCode.findOne = origFindOne;
    }
});

test("Phase 1 Validation: Rate Limiter Configuration", async (t) => {
    await t.test("OTP send and verify limiters are separate instances", () => {
        assert.ok(otpSendLimiter !== undefined);
        assert.ok(otpVerifyLimiter !== undefined);
        assert.notEqual(otpSendLimiter, otpVerifyLimiter, "OTP send and verify must use distinct limiter instances");
    });

    await t.test("Global limiter is defined", () => {
        assert.ok(globalLimiter !== undefined);
    });
});

test("Phase 1 Validation: Webhook Security & Idempotency", async (t) => {
    const secret = "test_webhook_secret_key_12345";
    process.env.RAZORPAY_WEBHOOK_SECRET = secret;

    const payload = {
        entity: "event",
        account_id: "acc_test",
        event: "payment.captured",
        contains: ["payment"],
        payload: {
            payment: {
                entity: {
                    id: "pay_phase1_test_999",
                    entity: "payment",
                    amount: 250000,
                    currency: "INR",
                    status: "captured",
                    order_id: "order_phase1_test_999",
                    method: "card",
                    captured: true,
                    notes: { uniqueId: "UNIQUE_PHASE1_TEST" },
                    created_at: 1791975389
                }
            }
        }
    };

    const payloadStr = JSON.stringify(payload);
    const validSignature = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");
    const invalidSignature = "invalid_signature_hex_code_1234567890";

    await t.test("Rejects webhook with invalid signature with 400", async () => {
        const res = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("X-Razorpay-Signature", invalidSignature)
            .set("X-Razorpay-Event-Id", "evt_invalid_sig_1")
            .send(payloadStr);

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

    await t.test("Accepts webhook with valid signature and event ID", async () => {
        const origWebhookFindOneAndUpdate = WebhookEvent.findOneAndUpdate;
        const origPaymentFindOneAndUpdate = Payment.findOneAndUpdate;
        const origPaymentFindOne = Payment.findOne;
        const origOrderFindOne = Order.findOne;

        try {
            WebhookEvent.findOneAndUpdate = async () => ({
                eventId: "evt_phase1_valid_1",
                status: "received",
                async save() { this.status = "processed"; }
            });

            Payment.findOne = async () => null;
            Payment.findOneAndUpdate = async (filter, update) => ({ ...filter, ...update.$set });
            Order.findOne = async () => null;

            const res = await request(app)
                .post("/api/payments/getRazorpayWebhook")
                .set("Content-Type", "application/json")
                .set("X-Razorpay-Signature", validSignature)
                .set("X-Razorpay-Event-Id", "evt_phase1_valid_1")
                .send(payloadStr);

            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
        } finally {
            WebhookEvent.findOneAndUpdate = origWebhookFindOneAndUpdate;
            Payment.findOneAndUpdate = origPaymentFindOneAndUpdate;
            Payment.findOne = origPaymentFindOne;
            Order.findOne = origOrderFindOne;
        }
    });

    await t.test("Webhook is idempotent: duplicate event returns duplicate status", async () => {
        const origWebhookFindOneAndUpdate = WebhookEvent.findOneAndUpdate;

        try {
            WebhookEvent.findOneAndUpdate = async () => ({
                eventId: "evt_phase1_dup_1",
                status: "processed"
            });

            const res = await request(app)
                .post("/api/payments/getRazorpayWebhook")
                .set("Content-Type", "application/json")
                .set("X-Razorpay-Signature", validSignature)
                .set("X-Razorpay-Event-Id", "evt_phase1_dup_1")
                .send(payloadStr);

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Duplicate event already processed");
        } finally {
            WebhookEvent.findOneAndUpdate = origWebhookFindOneAndUpdate;
        }
    });
});
