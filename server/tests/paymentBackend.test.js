import "dotenv/config";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app.js";
import Order from "../src/models/Order.js";
import Payment from "../src/models/Payment.js";
import WebhookEvent from "../src/models/WebhookEvent.js";
import Puja from "../src/models/pujaModel.js";
import PromoCode from "../src/models/PromoCode.js";
import PromoCodeUsage from "../src/models/PromoCodeUsage.js";
import User from "../src/models/user.js";

describe("Step 2.1 — Payment Backend Flow & Security Suite", () => {
    let testUserA;
    let testUserB;
    let tokenA;
    let tokenB;
    let testPuja;
    const jwtSecret = "test_jwt_secret_key_1234567890";
    const webhookSecret = "test_webhook_secret_xyz123";
    const randSuffix = Math.floor(100000 + Math.random() * 900000);

    before(async () => {
        process.env.JWT_SECRET = jwtSecret;
        process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

        // Ensure database connection
        const mongoUri = process.env.MONGO_URI;
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }

        // Clean any existing test records with our numbers
        await User.deleteMany({ mobileNumber: { $in: [`987${randSuffix}1`, `987${randSuffix}2`] } });

        // Create test users with distinct mobile numbers
        testUserA = await User.create({
            name: "User A",
            mobileNumber: `987${randSuffix}1`,
        });

        testUserB = await User.create({
            name: "User B",
            mobileNumber: `987${randSuffix}2`,
        });

        tokenA = jwt.sign({ id: testUserA._id, role: "user" }, jwtSecret);
        tokenB = jwt.sign({ id: testUserB._id, role: "user" }, jwtSecret);

        // Create active Puja
        testPuja = await Puja.create({
            title: `Ganesh Mahapuja Test ${randSuffix}`,
            status: "active",
            basePrice: 1500,
            extraParticipantPrice: 300,
            maxParticipants: 4,
        });
    });

    after(async () => {
        if (testUserA) await User.deleteOne({ _id: testUserA._id });
        if (testUserB) await User.deleteOne({ _id: testUserB._id });
        if (testPuja) await Puja.deleteOne({ _id: testPuja._id });
        await Order.deleteMany({ customer: { $in: [testUserA?._id, testUserB?._id] } });
        await PromoCode.deleteMany({ code: /^TESTPROMO/ });
        await mongoose.disconnect();
    });

    test("Past bookingDate is rejected", async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 2);

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                serviceId: testPuja._id,
                serviceType: "Puja",
                participants: [{ name: "Ramesh" }],
                whatsappNumber: testUserA.mobileNumber,
                bookingDate: yesterday.toISOString(),
            });

        assert.strictEqual(res.status, 400);
        assert.match(res.body.message, /past/i);
    });

    test("POST /api/orders computes price on server and ignores client-provided amounts", async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                serviceId: testPuja._id,
                serviceType: "Puja",
                participants: [{ name: "Ramesh" }, { name: "Suresh" }],
                whatsappNumber: testUserA.mobileNumber,
                bookingDate: futureDate.toISOString(),
                // Tampered client price attempt
                amount: 1,
                total: 10,
            });

        assert.strictEqual(res.status, 201);
        assert.ok(res.body.data.orderId);
        assert.ok(res.body.data.razorpayOrderId);
        // Base 1500 + 1 extra (300) = 1800 INR = 180000 paise
        assert.strictEqual(res.body.data.amount, 180000);

        const savedOrder = await Order.findById(res.body.data.orderId);
        assert.strictEqual(savedOrder.pricing.total, 180000);
        assert.strictEqual(savedOrder.paymentStatus, "pending");
        assert.strictEqual(savedOrder.orderStatus, "created");
    });

    test("User B cannot view User A's order", async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);

        const createRes = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                serviceId: testPuja._id,
                serviceType: "Puja",
                participants: [{ name: "Ramesh" }],
                whatsappNumber: testUserA.mobileNumber,
                bookingDate: futureDate.toISOString(),
            });

        const orderId = createRes.body.data.orderId;

        // User B attempts to read order
        const readRes = await request(app)
            .get(`/api/orders/${orderId}`)
            .set("Authorization", `Bearer ${tokenB}`);

        assert.strictEqual(readRes.status, 403);
    });

    test("User B cannot verify User A's order", async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);

        const createRes = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                serviceId: testPuja._id,
                serviceType: "Puja",
                participants: [{ name: "Ramesh" }],
                whatsappNumber: testUserA.mobileNumber,
                bookingDate: futureDate.toISOString(),
            });

        const rzpOrderId = createRes.body.data.razorpayOrderId;
        const fakePaymentId = `pay_fake_${Date.now()}`;
        const validSig = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${rzpOrderId}|${fakePaymentId}`)
            .digest("hex");

        // User B tries to verify User A's order
        const verifyRes = await request(app)
            .post("/api/payments/verify")
            .set("Authorization", `Bearer ${tokenB}`)
            .send({
                razorpayOrderId: rzpOrderId,
                razorpayPaymentId: fakePaymentId,
                razorpaySignature: validSig,
            });

        assert.strictEqual(verifyRes.status, 404);
    });

    test("Verify twice performs only one state transition (idempotent)", async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);

        const createRes = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                serviceId: testPuja._id,
                serviceType: "Puja",
                participants: [{ name: "Ramesh" }],
                whatsappNumber: testUserA.mobileNumber,
                bookingDate: futureDate.toISOString(),
            });

        const rzpOrderId = createRes.body.data.razorpayOrderId;
        const fakePaymentId = `pay_test_idemp_${Date.now()}`;
        const validSig = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${rzpOrderId}|${fakePaymentId}`)
            .digest("hex");

        // First verify
        const res1 = await request(app)
            .post("/api/payments/verify")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                razorpayOrderId: rzpOrderId,
                razorpayPaymentId: fakePaymentId,
                razorpaySignature: validSig,
            });

        assert.strictEqual(res1.status, 200);
        assert.strictEqual(res1.body.data.paymentStatus, "paid");

        // Second verify (idempotent)
        const res2 = await request(app)
            .post("/api/payments/verify")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                razorpayOrderId: rzpOrderId,
                razorpayPaymentId: fakePaymentId,
                razorpaySignature: validSig,
            });

        assert.strictEqual(res2.status, 200);

        const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
        assert.strictEqual(order.paymentStatus, "paid");
        assert.strictEqual(order.orderStatus, "confirmed");
    });

    test("Invalid webhook signature returns 400 with no change to database", async () => {
        const payload = JSON.stringify({
            event: "payment.captured",
            payload: {
                payment: {
                    entity: { id: "pay_fake", order_id: "order_fake" },
                },
            },
        });

        const res = await request(app)
            .post("/api/payments/webhook")
            .set("Content-Type", "application/json")
            .set("X-Razorpay-Signature", "invalid_hmac_signature")
            .send(payload);

        assert.strictEqual(res.status, 400);
    });

    test("Duplicate webhook event processed exactly once", async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);

        const createRes = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                serviceId: testPuja._id,
                serviceType: "Puja",
                participants: [{ name: "Ramesh" }],
                whatsappNumber: testUserA.mobileNumber,
                bookingDate: futureDate.toISOString(),
            });

        const rzpOrderId = createRes.body.data.razorpayOrderId;
        const eventId = `evt_test_dedupe_${Date.now()}`;
        const webhookPayload = JSON.stringify({
            event_id: eventId,
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: `pay_wh_${Date.now()}`,
                        order_id: rzpOrderId,
                        amount: 150000,
                        method: "upi",
                    },
                },
            },
        });

        const validSig = crypto
            .createHmac("sha256", webhookSecret)
            .update(webhookPayload)
            .digest("hex");

        // First delivery
        const res1 = await request(app)
            .post("/api/payments/webhook")
            .set("Content-Type", "application/json")
            .set("X-Razorpay-Signature", validSig)
            .send(webhookPayload);

        assert.strictEqual(res1.status, 200);

        // Second delivery (duplicate)
        const res2 = await request(app)
            .post("/api/payments/webhook")
            .set("Content-Type", "application/json")
            .set("X-Razorpay-Signature", validSig)
            .send(webhookPayload);

        assert.strictEqual(res2.status, 200);
        assert.strictEqual(res2.body.status, "already_processed");

        // Verify WebhookEvent count is 1
        const events = await WebhookEvent.find({ eventId });
        assert.strictEqual(events.length, 1);
    });

    test("Paid-but-browser-closed is completed by webhook", async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);

        const createRes = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                serviceId: testPuja._id,
                serviceType: "Puja",
                participants: [{ name: "Ramesh" }],
                whatsappNumber: testUserA.mobileNumber,
                bookingDate: futureDate.toISOString(),
            });

        const rzpOrderId = createRes.body.data.razorpayOrderId;
        const orderId = createRes.body.data.orderId;

        // Browser closed: no POST /verify was called. Order is pending.
        const orderBefore = await Order.findById(orderId);
        assert.strictEqual(orderBefore.paymentStatus, "pending");

        // Webhook fires from Razorpay server
        const eventId = `evt_browser_closed_${Date.now()}`;
        const payload = JSON.stringify({
            event_id: eventId,
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: `pay_closed_${Date.now()}`,
                        order_id: rzpOrderId,
                        amount: 150000,
                        method: "netbanking",
                    },
                },
            },
        });

        const sig = crypto
            .createHmac("sha256", webhookSecret)
            .update(payload)
            .digest("hex");

        const res = await request(app)
            .post("/api/payments/webhook")
            .set("Content-Type", "application/json")
            .set("X-Razorpay-Signature", sig)
            .send(payload);

        assert.strictEqual(res.status, 200);

        // Allow async processing
        await new Promise((resolve) => setTimeout(resolve, 600));

        const orderAfter = await Order.findById(orderId);
        assert.strictEqual(orderAfter.paymentStatus, "paid");
        assert.strictEqual(orderAfter.orderStatus, "confirmed");

        // Payment model record exists
        const payment = await Payment.findOne({ razorpayOrderId: rzpOrderId });
        assert.ok(payment);
        assert.strictEqual(payment.status, "captured");
    });

    test("Promo limit under 10 parallel requests correctly caps usage limit", async () => {
        // Create promo with usageLimit = 3
        const promoCodeStr = `TESTPROMO_${Date.now()}`;
        const promo = await PromoCode.create({
            code: promoCodeStr,
            discountType: "FIXED",
            discountValue: 100,
            startDate: new Date(Date.now() - 3600000),
            endDate: new Date(Date.now() + 36000000),
            usageLimit: 3,
            usageLimitPerUser: 10,
            isActive: true,
        });

        // Create 10 dummy pending orders with this promo
        const orders = [];
        for (let i = 0; i < 10; i++) {
            const ord = await Order.create({
                serviceId: testPuja._id,
                serviceType: "Puja",
                snapshot: { title: "Promo test" },
                customer: testUserA._id,
                whatsappNumber: testUserA.mobileNumber,
                participants: [{ name: `P ${i}` }],
                pricing: { basePrice: 150000, total: 140000 },
                bookingDate: new Date(Date.now() + 86400000),
                paymentStatus: "pending",
                promoCode: promoCodeStr,
                promoCodeId: promo._id,
                discountAmount: 10000,
                razorpayOrderId: `order_fake_promo_${Date.now()}_${i}`,
            });
            orders.push(ord);
        }

        // Simulate 10 parallel webhook captures on these orders
        const requests = orders.map((ord, idx) => {
            const payload = JSON.stringify({
                event_id: `evt_promo_conc_${Date.now()}_${idx}`,
                event: "payment.captured",
                payload: {
                    payment: {
                        entity: {
                            id: `pay_promo_${Date.now()}_${idx}`,
                            order_id: ord.razorpayOrderId,
                            amount: 140000,
                        },
                    },
                },
            });
            const sig = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");
            return request(app)
                .post("/api/payments/webhook")
                .set("Content-Type", "application/json")
                .set("X-Razorpay-Signature", sig)
                .send(payload);
        });

        await Promise.all(requests);
        await new Promise((r) => setTimeout(r, 1000));

        const updatedPromo = await PromoCode.findById(promo._id);
        const usagesCount = await PromoCodeUsage.countDocuments({ promoCodeId: promo._id });

        // usageLimit was 3, so usedCount must not exceed 3
        assert.strictEqual(updatedPromo.usedCount <= 3, true);
        assert.strictEqual(usagesCount <= 3, true);
    });
});

