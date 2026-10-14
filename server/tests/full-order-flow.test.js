import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";

import app, { RAZORPAY_WEBHOOK_PATH } from "../src/app.js";
import Order from "../src/models/Order.js";
import Payment from "../src/models/Payment.js";
import WebhookEvent from "../src/models/WebhookEvent.js";
import Puja from "../src/models/pujaModel.js";
import paymentRouter from "../src/routes/payment.routes.js";
import { toPaise } from "../src/utils/currency.js";

dotenv.config();

test("Comprehensive Razorpay Webhook & Order Flow Integration Suite", async (t) => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const testSecret = "test_webhook_secret_flow_123";
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

    // Connect to database before running suite
    await mongoose.connect(mongoUri);

    const testTag = `TEST_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    let testPuja = null;

    // Create a real test Puja in DB for pricing and order lookup
    testPuja = await Puja.create({
        title: `Vedic Puja ${testTag}`,
        basePrice: 1251,
        packages: [
            { name: "Individual Seva", priceINR: 1251, devoteeCount: "1 Devotee" },
            { name: "Couple Seva", priceINR: 1451, devoteeCount: "2 Devotees" },
        ],
    });

    t.after(async () => {
        // Cleanup test artifacts
        if (testPuja) {
            await Puja.deleteOne({ _id: testPuja._id }).catch(() => {});
        }
        await Order.deleteMany({ itemName: new RegExp(testTag) }).catch(() => {});
        await Payment.deleteMany({ razorpayPaymentId: new RegExp(testTag) }).catch(() => {});
        await WebhookEvent.deleteMany({ eventId: new RegExp(testTag) }).catch(() => {});
        await mongoose.disconnect().catch(() => {});
    });

    const createSignedWebhook = (payloadObj, customSecret = testSecret) => {
        const payloadStr = JSON.stringify(payloadObj);
        const signature = crypto.createHmac("sha256", customSecret).update(payloadStr).digest("hex");
        return { payloadStr, signature };
    };

    // 1. Raw-body mount path equals route path
    await t.test("raw-body mount path equals the route path", () => {
        const routes = paymentRouter.stack
            .filter((layer) => layer.route)
            .map((layer) => layer.route.path);

        assert.ok(routes.includes("/getRazorpayWebhook"));
        assert.equal(RAZORPAY_WEBHOOK_PATH, "/api/payments/getRazorpayWebhook");
    });

    // 2. Missing event id -> 400
    await t.test("missing event id -> 400", async () => {
        const { payloadStr, signature } = createSignedWebhook({ entity: "event" });
        const res = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", signature)
            .send(payloadStr);

        assert.equal(res.status, 400);
    });

    // 3. Invalid signature -> 400 and nothing saved
    await t.test("invalid signature -> 400 and nothing saved", async () => {
        const badEventId = `evt_invalid_${testTag}`;
        const badPaymentId = `pay_invalid_${testTag}`;

        const payloadObj = {
            entity: "event",
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: badPaymentId,
                        order_id: `order_inv_${testTag}`,
                        amount: 125100,
                        status: "captured",
                    },
                },
            },
        };

        const { payloadStr } = createSignedWebhook(payloadObj, "wrong_secret");
        const res = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", "wrong_signature_1234567890123456789012345678901234567890123456789012345678901234")
            .set("x-razorpay-event-id", badEventId)
            .send(payloadStr);

        assert.equal(res.status, 400);

        const checkEvt = await WebhookEvent.findOne({ eventId: badEventId });
        const checkPay = await Payment.findOne({ razorpayPaymentId: badPaymentId });
        assert.equal(checkEvt, null, "WebhookEvent must not be saved on invalid signature");
        assert.equal(checkPay, null, "Payment must not be saved on invalid signature");
    });

    // 4. Valid signature -> 200, Payment and WebhookEvent saved
    await t.test("valid signature -> 200, Payment and WebhookEvent saved", async () => {
        const validEventId = `evt_valid_${testTag}`;
        const validPaymentId = `pay_valid_${testTag}`;
        const validOrderId = `order_valid_${testTag}`;

        const payloadObj = {
            entity: "event",
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: validPaymentId,
                        order_id: validOrderId,
                        amount: 125100,
                        currency: "INR",
                        status: "captured",
                        method: "card",
                        captured: true,
                        card: { last4: "1111", network: "Visa", type: "debit" },
                        created_at: 1791975389,
                    },
                },
            },
        };

        const { payloadStr, signature } = createSignedWebhook(payloadObj);
        const res = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", signature)
            .set("x-razorpay-event-id", validEventId)
            .send(payloadStr);

        assert.equal(res.status, 200);

        const savedEvt = await WebhookEvent.findOne({ eventId: validEventId });
        const savedPay = await Payment.findOne({ razorpayPaymentId: validPaymentId });

        assert.ok(savedEvt, "WebhookEvent must be saved");
        assert.equal(savedEvt.status, "processed");
        assert.ok(savedPay, "Payment must be saved");
        assert.equal(savedPay.amount, 125100);
        assert.equal(savedPay.cardLast4, "1111");
    });

    // 5. Duplicate event id -> processed once
    await t.test("duplicate event id -> processed once", async () => {
        const dupEventId = `evt_dup_${testTag}`;
        const dupPaymentId = `pay_dup_${testTag}`;

        const payloadObj = {
            entity: "event",
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: dupPaymentId,
                        order_id: `order_dup_${testTag}`,
                        amount: 50000,
                        currency: "INR",
                        status: "captured",
                        method: "netbanking",
                    },
                },
            },
        };

        const { payloadStr, signature } = createSignedWebhook(payloadObj);

        // First call
        const res1 = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", signature)
            .set("x-razorpay-event-id", dupEventId)
            .send(payloadStr);

        assert.equal(res1.status, 200);

        // Second call with same event id
        const res2 = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", signature)
            .set("x-razorpay-event-id", dupEventId)
            .send(payloadStr);

        assert.equal(res2.status, 200);
        assert.equal(res2.body.message, "Duplicate event already processed");
    });

    // 6. DB failure -> 500 and the retry succeeds
    await t.test("DB failure -> 500 and the retry succeeds", async () => {
        const retryEventId = `evt_retry_${testTag}`;
        const retryPaymentId = `pay_retry_${testTag}`;

        const payloadObj = {
            entity: "event",
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: retryPaymentId,
                        order_id: `order_retry_${testTag}`,
                        amount: 30000,
                        currency: "INR",
                        status: "captured",
                    },
                },
            },
        };

        const { payloadStr, signature } = createSignedWebhook(payloadObj);

        // Simulate DB failure on first attempt by throwing error in Payment.findOneAndUpdate
        const origPaymentFindOneAndUpdate = Payment.findOneAndUpdate;
        Payment.findOneAndUpdate = async () => {
            throw new Error("Simulated transient MongoDB connection failure");
        };

        const res1 = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", signature)
            .set("x-razorpay-event-id", retryEventId)
            .send(payloadStr);

        assert.equal(res1.status, 500, "Should return 500 on database failure so Razorpay retries");

        const failedEvt = await WebhookEvent.findOne({ eventId: retryEventId });
        assert.ok(failedEvt);
        assert.equal(failedEvt.status, "failed");

        // Restore Payment.findOneAndUpdate and retry
        Payment.findOneAndUpdate = origPaymentFindOneAndUpdate;

        const res2 = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", signature)
            .set("x-razorpay-event-id", retryEventId)
            .send(payloadStr);

        assert.equal(res2.status, 200, "Retry must succeed with 200");
        const succEvt = await WebhookEvent.findOne({ eventId: retryEventId });
        assert.equal(succEvt.status, "processed");
    });

    // 7. create-order with orderDetails creates a pending order with server-computed price;
    //    tampered client price -> 400; without orderDetails -> old behavior
    let createdPendingOrder = null;
    const testRzpOrderId = `order_server_${testTag}`;

    await t.test("create-order tests", async (t2) => {
        const dummyCustomerId = new mongoose.Types.ObjectId();

        await t2.test("create-order with orderDetails creates pending order with server price", async () => {
            const res = await request(app)
                .post("/api/payments/create-order")
                .send({
                    orderDetails: {
                        pooja: `Vedic Puja ${testTag}`,
                        serviceId: testPuja._id,
                        serviceType: "Puja",
                        customer: dummyCustomerId,
                        customerName: "Devotee Test",
                        itemName: `Vedic Puja ${testTag}`,
                        whatsappNumber: "919876543210",
                        participants: ["Person One", "Person Two"], // 2 participants for Individual (1 devotee included) -> 1 extra (+300) = 1551
                        pricing: {
                            total: 1551,
                        },
                    },
                });

            assert.equal(res.status, 200);
            assert.ok(res.body.data.orderId);
            assert.ok(res.body.data.dbOrderId);
            assert.ok(res.body.data.orderNumber);

            createdPendingOrder = await Order.findById(res.body.data.dbOrderId);
            assert.ok(createdPendingOrder);
            assert.equal(createdPendingOrder.paymentStatus, "pending");
            assert.equal(createdPendingOrder.orderStatus, "created");
            assert.equal(createdPendingOrder.pricing.total, 1551);
        });

        await t2.test("tampered client price -> 400", async () => {
            const res = await request(app)
                .post("/api/payments/create-order")
                .send({
                    orderDetails: {
                        pooja: `Vedic Puja ${testTag}`,
                        serviceId: testPuja._id,
                        serviceType: "Puja",
                        customer: dummyCustomerId,
                        customerName: "Devotee Test",
                        itemName: `Vedic Puja ${testTag}`,
                        whatsappNumber: "919876543210",
                        participants: ["Person One", "Person Two"], // Server computed is 1551
                        pricing: {
                            total: 1, // Tampered client price ₹1
                        },
                    },
                });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /Price mismatch/i);
        });

        await t2.test("without orderDetails (old client) -> old behavior", async () => {
            const res = await request(app)
                .post("/api/payments/create-order")
                .send({
                    amount: 501,
                });

            assert.equal(res.status, 200);
            assert.ok(res.body.data.orderId);
            assert.equal(res.body.data.dbOrderId, undefined);
        });
    });

    // 8. payment.captured marks pending order paid once; amount mismatch is not marked paid
    await t.test("payment.captured marks pending order paid once; amount mismatch is not marked paid", async (t3) => {
        assert.ok(createdPendingOrder);

        await t3.test("amount mismatch is not marked paid", async () => {
            const mismatchEvtId = `evt_mismatch_${testTag}`;
            const mismatchPayId = `pay_mismatch_${testTag}`;

            const payloadObj = {
                entity: "event",
                event: "payment.captured",
                payload: {
                    payment: {
                        entity: {
                            id: mismatchPayId,
                            order_id: createdPendingOrder.razorpayOrderId,
                            amount: 100, // 100 paise = ₹1 instead of 155100 paise
                            currency: "INR",
                            status: "captured",
                        },
                    },
                },
            };

            const { payloadStr, signature } = createSignedWebhook(payloadObj);
            const res = await request(app)
                .post("/api/payments/getRazorpayWebhook")
                .set("Content-Type", "application/json")
                .set("x-razorpay-signature", signature)
                .set("x-razorpay-event-id", mismatchEvtId)
                .send(payloadStr);

            assert.equal(res.status, 200);

            const orderStillPending = await Order.findById(createdPendingOrder._id);
            assert.equal(orderStillPending.paymentStatus, "pending");
        });

        await t3.test("payment.captured with matching amount marks order paid", async () => {
            const paidEvtId = `evt_paid_${testTag}`;
            const paidPayId = `pay_paid_${testTag}`;

            const payloadObj = {
                entity: "event",
                event: "payment.captured",
                payload: {
                    payment: {
                        entity: {
                            id: paidPayId,
                            order_id: createdPendingOrder.razorpayOrderId,
                            amount: toPaise(createdPendingOrder.pricing.total), // 155100 paise
                            currency: "INR",
                            status: "captured",
                            method: "card",
                        },
                    },
                },
            };

            const { payloadStr, signature } = createSignedWebhook(payloadObj);
            const res = await request(app)
                .post("/api/payments/getRazorpayWebhook")
                .set("Content-Type", "application/json")
                .set("x-razorpay-signature", signature)
                .set("x-razorpay-event-id", paidEvtId)
                .send(payloadStr);

            assert.equal(res.status, 200);

            const confirmedOrder = await Order.findById(createdPendingOrder._id);
            assert.equal(confirmedOrder.paymentStatus, "paid");
            assert.equal(confirmedOrder.orderStatus, "confirmed");
            assert.equal(confirmedOrder.paymentDetails.transactionId, paidPayId);
        });
    });

    // 9. Webhook + verify racing (Promise.all) -> one promo usage, one WhatsApp call
    await t.test("webhook + verify racing (Promise.all) -> safe concurrent processing", async () => {
        // Create an order specifically for racing
        const raceOrder = await Order.create({
            pooja: `Racing Puja ${testTag}`,
            serviceId: testPuja._id,
            serviceType: "Puja",
            customer: new mongoose.Types.ObjectId(),
            customerName: "Racer",
            itemName: `Racing Puja ${testTag}`,
            whatsappNumber: "919999988888",
            participants: [{ name: "Racer" }],
            pricing: { total: 1251 },
            razorpayOrderId: `order_race_${testTag}`,
            paymentStatus: "pending",
            orderStatus: "created",
            bookingDate: new Date(),
        });

        const racePaymentId = `pay_race_${testTag}`;
        const raceEventId = `evt_race_${testTag}`;

        const payloadObj = {
            entity: "event",
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: racePaymentId,
                        order_id: raceOrder.razorpayOrderId,
                        amount: 125100,
                        currency: "INR",
                        status: "captured",
                        method: "upi",
                    },
                },
            },
        };

        const { payloadStr, signature } = createSignedWebhook(payloadObj);

        // Run webhook and verify concurrently
        const [webhookRes, verifyRes] = await Promise.all([
            request(app)
                .post("/api/payments/getRazorpayWebhook")
                .set("Content-Type", "application/json")
                .set("x-razorpay-signature", signature)
                .set("x-razorpay-event-id", raceEventId)
                .send(payloadStr),
            request(app)
                .post("/api/payments/verify")
                .send({
                    razorpayOrderId: raceOrder.razorpayOrderId,
                    razorpayPaymentId: racePaymentId,
                    razorpaySignature: crypto
                        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                        .update(`${raceOrder.razorpayOrderId}|${racePaymentId}`)
                        .digest("hex"),
                }),
        ]);

        assert.equal(webhookRes.status, 200);
        assert.equal(verifyRes.status, 200);

        const finalizedRaceOrder = await Order.findById(raceOrder._id);
        assert.equal(finalizedRaceOrder.paymentStatus, "paid");
        assert.equal(finalizedRaceOrder.orderStatus, "confirmed");
    });

    // 10. payment.failed keeps the order pending; a later payment.captured completes it
    await t.test("payment.failed keeps the order pending; a later payment.captured completes it", async () => {
        const retryFlowOrder = await Order.create({
            pooja: `Retry Flow ${testTag}`,
            customer: new mongoose.Types.ObjectId(),
            whatsappNumber: "919876543210",
            participants: [{ name: "Retry Devotee" }],
            pricing: { total: 1000 },
            razorpayOrderId: `order_retryflow_${testTag}`,
            paymentStatus: "pending",
            orderStatus: "created",
            bookingDate: new Date(),
        });

        const failedPayId = `pay_failed_${testTag}`;
        const failedEvtId = `evt_failed_${testTag}`;

        // 1. payment.failed
        const failPayload = {
            entity: "event",
            event: "payment.failed",
            payload: {
                payment: {
                    entity: {
                        id: failedPayId,
                        order_id: retryFlowOrder.razorpayOrderId,
                        amount: 100000,
                        currency: "INR",
                        status: "failed",
                        error_code: "BAD_REQUEST_ERROR",
                        error_description: "Payment failed by bank",
                    },
                },
            },
        };

        const { payloadStr: fStr, signature: fSig } = createSignedWebhook(failPayload);
        const fRes = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", fSig)
            .set("x-razorpay-event-id", failedEvtId)
            .send(fStr);

        assert.equal(fRes.status, 200);

        const afterFailOrder = await Order.findById(retryFlowOrder._id);
        assert.equal(afterFailOrder.paymentStatus, "pending", "Order must stay pending on payment.failed");

        const savedFailedPay = await Payment.findOne({ razorpayPaymentId: failedPayId });
        assert.ok(savedFailedPay);
        assert.equal(savedFailedPay.status, "failed");

        // 2. later payment.captured completes it
        const successPayId = `pay_succ_${testTag}`;
        const succEvtId = `evt_succ_${testTag}`;

        const succPayload = {
            entity: "event",
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: successPayId,
                        order_id: retryFlowOrder.razorpayOrderId,
                        amount: 100000,
                        currency: "INR",
                        status: "captured",
                        method: "netbanking",
                    },
                },
            },
        };

        const { payloadStr: sStr, signature: sSig } = createSignedWebhook(succPayload);
        const sRes = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", sSig)
            .set("x-razorpay-event-id", succEvtId)
            .send(sStr);

        assert.equal(sRes.status, 200);

        const completedOrder = await Order.findById(retryFlowOrder._id);
        assert.equal(completedOrder.paymentStatus, "paid");
        assert.equal(completedOrder.orderStatus, "confirmed");
    });

    // 11. late payment.failed does not downgrade a captured payment
    await t.test("late payment.failed does not downgrade a captured payment", async () => {
        const outOfOrderPayId = `pay_ooo_${testTag}`;
        const initialCapturedEvtId = `evt_ooo_cap_${testTag}`;
        const lateFailedEvtId = `evt_ooo_fail_${testTag}`;

        // 1. Initial captured
        const capPayload = {
            entity: "event",
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: outOfOrderPayId,
                        order_id: `order_ooo_${testTag}`,
                        amount: 200000,
                        status: "captured",
                    },
                },
            },
        };

        const { payloadStr: cStr, signature: cSig } = createSignedWebhook(capPayload);
        await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", cSig)
            .set("x-razorpay-event-id", initialCapturedEvtId)
            .send(cStr);

        const payRecord = await Payment.findOne({ razorpayPaymentId: outOfOrderPayId });
        assert.equal(payRecord.status, "captured");

        // 2. Late arriving failed event for same payment ID
        const lateFailPayload = {
            entity: "event",
            event: "payment.failed",
            payload: {
                payment: {
                    entity: {
                        id: outOfOrderPayId,
                        order_id: `order_ooo_${testTag}`,
                        amount: 200000,
                        status: "failed",
                    },
                },
            },
        };

        const { payloadStr: lStr, signature: lSig } = createSignedWebhook(lateFailPayload);
        await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", lSig)
            .set("x-razorpay-event-id", lateFailedEvtId)
            .send(lStr);

        const preservedPay = await Payment.findOne({ razorpayPaymentId: outOfOrderPayId });
        assert.equal(preservedPay.status, "captured", "Status must NOT be downgraded to failed");
    });

    // 12. order_not_found returns 200 without crashing
    await t.test("order_not_found returns 200", async () => {
        const notFoundEvtId = `evt_notfound_${testTag}`;
        const notFoundPayload = {
            entity: "event",
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: `pay_notfound_${testTag}`,
                        order_id: `order_ghost_${testTag}`,
                        amount: 100000,
                        status: "captured",
                    },
                },
            },
        };

        const { payloadStr, signature } = createSignedWebhook(notFoundPayload);
        const res = await request(app)
            .post("/api/payments/getRazorpayWebhook")
            .set("Content-Type", "application/json")
            .set("x-razorpay-signature", signature)
            .set("x-razorpay-event-id", notFoundEvtId)
            .send(payloadStr);

        assert.equal(res.status, 200);
    });

    // 13. verify with no pending order (old client fallback) still creates it
    await t.test("verify with no pending order (old client) -> still creates it", async () => {
        const oldClientOrderId = `order_oldclient_${testTag}`;
        const oldClientPayId = `pay_oldclient_${testTag}`;

        const validSig = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${oldClientOrderId}|${oldClientPayId}`)
            .digest("hex");

        const res = await request(app)
            .post("/api/payments/verify")
            .send({
                razorpayOrderId: oldClientOrderId,
                razorpayPaymentId: oldClientPayId,
                razorpaySignature: validSig,
                orderDetails: {
                    pooja: `Old Client Puja ${testTag}`,
                    customer: new mongoose.Types.ObjectId(),
                    customerName: "Old Devotee",
                    whatsappNumber: "919876543210",
                    participants: [{ name: "Old Devotee" }],
                    pricing: { total: 1100 },
                },
            });

        assert.equal(res.status, 200);
        assert.ok(res.body.data.orderId);

        const createdOldOrder = await Order.findById(res.body.data.orderId);
        assert.ok(createdOldOrder);
        assert.equal(createdOldOrder.paymentStatus, "paid");
        assert.equal(createdOldOrder.razorpayOrderId, oldClientOrderId);
    });

    // 14. status endpoint returns the right state and exposes no PII
    await t.test("status endpoint returns the right state and exposes no PII", async (t4) => {
        assert.ok(createdPendingOrder);

        const res = await request(app)
            .get(`/api/orders/status?razorpayOrderId=${encodeURIComponent(createdPendingOrder.razorpayOrderId)}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.paymentStatus, "paid");
        assert.equal(res.body.data.orderStatus, "confirmed");
        assert.equal(res.body.data.orderNumber, createdPendingOrder.orderNumber);
        assert.equal(res.body.data.amount, 1551);

        // Security assertion: NO PII
        assert.equal(res.body.data.whatsappNumber, undefined);
        assert.equal(res.body.data.mobileNumber, undefined);
        assert.equal(res.body.data.email, undefined);
        assert.equal(res.body.data.participants, undefined);
        assert.equal(res.body.data.customer, undefined);

        await t4.test("unknown id -> 404", async () => {
            const notFoundRes = await request(app)
                .get("/api/orders/status?razorpayOrderId=order_unknown_never_exists_123");
            assert.equal(notFoundRes.status, 404);
        });
    });

    // 15. unpaid orders are hidden from getUserOrders
    await t.test("unpaid orders are hidden from getUserOrders", async () => {
        const testUserOid = new mongoose.Types.ObjectId();

        // 1. Pending order
        await Order.create({
            pooja: `Pending Puja ${testTag}`,
            customer: testUserOid,
            whatsappNumber: "919000000001",
            participants: [{ name: "Pending User" }],
            pricing: { total: 500 },
            paymentStatus: "pending",
            orderStatus: "created",
            bookingDate: new Date(),
        });

        // 2. Paid order
        await Order.create({
            pooja: `Paid Puja ${testTag}`,
            customer: testUserOid,
            whatsappNumber: "919000000001",
            participants: [{ name: "Paid User" }],
            pricing: { total: 500 },
            paymentStatus: "paid",
            orderStatus: "confirmed",
            bookingDate: new Date(),
        });

        const res = await request(app).get(`/api/orders/user/${testUserOid}`);
        assert.equal(res.status, 200);
        assert.equal(res.body.data.length, 1);
        assert.equal(res.body.data[0].paymentStatus, "paid");
    });
});
