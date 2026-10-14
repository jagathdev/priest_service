import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import request from "supertest";
import app from "../src/app.js";
import Payment from "../src/models/Payment.js";
import WebhookEvent from "../src/models/WebhookEvent.js";
import Order from "../src/models/Order.js";

test("Webhook security and persistence verification", async (t) => {
    const secret = "test_webhook_secret_key_12345";
    process.env.RAZORPAY_WEBHOOK_SECRET = secret;

    const samplePayload = {
        entity: "event",
        account_id: "acc_ISUodk8wlTgpid",
        event: "payment.captured",
        contains: ["payment"],
        payload: {
            payment: {
                entity: {
                    id: "pay_test_123456",
                    entity: "payment",
                    amount: 320000,
                    currency: "INR",
                    status: "captured",
                    order_id: "order_test_987654",
                    international: true,
                    method: "card",
                    captured: true,
                    card: {
                        id: "card_hidden_id",
                        name: "Sensitive Cardholder",
                        last4: "4242",
                        network: "Visa",
                        type: "credit",
                        token_iin: "424242424",
                    },
                    email: "test@example.com",
                    contact: "+919999999999",
                    notes: { uniqueId: "UNIQUE_TEST_123" },
                    fee: 11328,
                    tax: 1728,
                    error_code: null,
                    acquirer_data: { auth_code: "441130", rrn: "123456789012" },
                    created_at: 1791975389,
                },
            },
        },
    };

    const payloadString = JSON.stringify(samplePayload);

    const signPayload = (str, customSecret = secret) => {
        return crypto.createHmac("sha256", customSecret).update(str).digest("hex");
    };

    await t.test("Rejects request with 400 when X-Razorpay-Signature is missing", async () => {
        const res = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-event-id", "evt_test_1")
            .send(payloadString);

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

    await t.test("Rejects request with 400 when X-Razorpay-Event-Id is missing", async () => {
        const sig = signPayload(payloadString);
        const res = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", sig)
            .send(payloadString);

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

    await t.test("Rejects request with 400 when signature is invalid", async () => {
        const invalidSig = signPayload(payloadString, "wrong_secret");
        const res = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", invalidSig)
            .set("x-razorpay-event-id", "evt_test_invalid_sig")
            .send(payloadString);

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert.equal(res.body.message, "Invalid webhook signature");
    });

    await t.test("Processes valid signature and persists WebhookEvent & Payment without sensitive card fields", async () => {
        let savedWebhook = null;
        let savedPayment = null;

        const origWebhookFindOneAndUpdate = WebhookEvent.findOneAndUpdate;
        const origPaymentFindOneAndUpdate = Payment.findOneAndUpdate;
        const origPaymentFindOne = Payment.findOne;
        const origOrderFindOne = Order.findOne;

        try {
            WebhookEvent.findOneAndUpdate = async (filter, update) => {
                savedWebhook = {
                    ...filter,
                    ...update.$setOnInsert,
                    status: "received",
                    attempts: 1,
                    async save() {
                        this.saved = true;
                    },
                };
                return savedWebhook;
            };

            Payment.findOne = async () => null;
            Order.findOne = async () => null;

            Payment.findOneAndUpdate = async (filter, update) => {
                savedPayment = { ...filter, ...update.$set };
                return savedPayment;
            };

            const validSig = signPayload(payloadString);
            const res = await request(app)
                .post("/api/payments/getRazorpayWebhook")
                .set("Content-Type", "application/json")
                .set("x-razorpay-signature", validSig)
                .set("x-razorpay-event-id", "evt_test_valid_1")
                .send(payloadString);

            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.equal(savedWebhook.eventId, "evt_test_valid_1");
            assert.equal(savedWebhook.status, "processed");

            assert.ok(savedPayment, "Payment record should be saved");
            assert.equal(savedPayment.razorpayPaymentId, "pay_test_123456");
            assert.equal(savedPayment.razorpayOrderId, "order_test_987654");
            assert.equal(savedPayment.amount, 320000); // in paise
            assert.equal(savedPayment.cardLast4, "4242");
            assert.equal(savedPayment.cardNetwork, "Visa");
            assert.equal(savedPayment.cardType, "credit");
            assert.equal(savedPayment.authCode, "441130");
            assert.equal(savedPayment.rrn, "123456789012");

            // Ensure sensitive fields are NEVER stored
            assert.strictEqual(savedPayment.cardHolderName, undefined);
            assert.strictEqual(savedPayment.card_id, undefined);
            assert.strictEqual(savedPayment.token_iin, undefined);
        } finally {
            WebhookEvent.findOneAndUpdate = origWebhookFindOneAndUpdate;
            Payment.findOneAndUpdate = origPaymentFindOneAndUpdate;
            Payment.findOne = origPaymentFindOne;
            Order.findOne = origOrderFindOne;
        }
    });

    await t.test("Returns 200 duplicate when event was already processed", async () => {
        const origWebhookFindOneAndUpdate = WebhookEvent.findOneAndUpdate;
        try {
            WebhookEvent.findOneAndUpdate = async () => ({
                eventId: "evt_duplicate_test",
                status: "processed",
            });

            const validSig = signPayload(payloadString);
            const res = await request(app)
                .post("/api/payments/getRazorpayWebhook")
                .set("Content-Type", "application/json")
                .set("x-razorpay-signature", validSig)
                .set("x-razorpay-event-id", "evt_duplicate_test")
                .send(payloadString);

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Duplicate event already processed");
        } finally {
            WebhookEvent.findOneAndUpdate = origWebhookFindOneAndUpdate;
        }
    });

    await t.test("Marks unknown events as ignored and returns 200", async () => {
        const origWebhookFindOneAndUpdate = WebhookEvent.findOneAndUpdate;
        let eventSavedAs = null;
        try {
            WebhookEvent.findOneAndUpdate = async () => ({
                eventId: "evt_unknown_test",
                status: "received",
                async save() {
                    eventSavedAs = this.status;
                },
            });

            const unknownPayload = {
                entity: "event",
                event: "some.random.event",
                payload: {},
            };
            const unkStr = JSON.stringify(unknownPayload);
            const validSig = signPayload(unkStr);

            const res = await request(app)
                .post("/api/payments/getRazorpayWebhook")
                .set("Content-Type", "application/json")
                .set("x-razorpay-signature", validSig)
                .set("x-razorpay-event-id", "evt_unknown_test")
                .send(unkStr);

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Event ignored");
            assert.equal(eventSavedAs, "ignored");
        } finally {
            WebhookEvent.findOneAndUpdate = origWebhookFindOneAndUpdate;
        }
    });
});
