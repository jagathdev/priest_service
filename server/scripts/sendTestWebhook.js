/**
 * CLI Script: Sends a signed payment.captured webhook to a target URL.
 *
 * Usage:
 *   WEBHOOK_URL="http://localhost:8564/api/payments/getRazorpayWebhook" \
 *   RAZORPAY_WEBHOOK_SECRET="your_secret_here" \
 *   node scripts/sendTestWebhook.js
 *
 * Defaults:
 *   WEBHOOK_URL: env WEBHOOK_URL or "http://localhost:8564/api/payments/getRazorpayWebhook"
 *   RAZORPAY_WEBHOOK_SECRET: env RAZORPAY_WEBHOOK_SECRET or "test_secret"
 */

import crypto from "crypto";
import http from "http";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const webhookUrl = process.env.WEBHOOK_URL || "http://localhost:8564/api/payments/getRazorpayWebhook";
const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_secret";

const eventId = `evt_cli_${Date.now()}`;
const paymentId = `pay_cli_${Date.now()}`;
const orderId = process.env.TEST_RAZORPAY_ORDER_ID || `order_cli_${Date.now()}`;
const amountPaise = parseInt(process.env.TEST_AMOUNT_PAISE || "320000", 10);

const samplePayload = {
    entity: "event",
    account_id: "acc_ISUodk8wlTgpid",
    event: "payment.captured",
    contains: ["payment"],
    payload: {
        payment: {
            entity: {
                id: paymentId,
                entity: "payment",
                amount: amountPaise,
                currency: "INR",
                status: "captured",
                order_id: orderId,
                invoice_id: null,
                international: false,
                method: "card",
                amount_refunded: 0,
                refund_status: null,
                captured: true,
                description: "Test Webhook Dispatch",
                card: {
                    last4: "4242",
                    network: "Visa",
                    type: "credit",
                },
                email: "test@example.com",
                contact: "+919876543210",
                notes: {
                    uniqueId: "CLI_TEST_UNIQUE_ID",
                },
                fee: 11328,
                tax: 1728,
                error_code: null,
                error_description: null,
                acquirer_data: {
                    auth_code: "441130",
                    rrn: "123456789012",
                },
                created_at: Math.floor(Date.now() / 1000),
            },
        },
    },
    created_at: Math.floor(Date.now() / 1000),
};

const payloadString = JSON.stringify(samplePayload);
const signature = crypto.createHmac("sha256", secret).update(payloadString).digest("hex");

console.log("=== Sending Signed Test Webhook ===");
console.log(`Target URL: ${webhookUrl}`);
console.log(`Event ID:   ${eventId}`);
console.log(`Payment ID: ${paymentId}`);
console.log(`Order ID:   ${orderId}`);
console.log(`Amount:     ${amountPaise} paise`);
console.log(`Signature:  ${signature}`);

const urlObj = new URL(webhookUrl);
const client = urlObj.protocol === "https:" ? https : http;

const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payloadString),
        "X-Razorpay-Signature": signature,
        "X-Razorpay-Event-Id": eventId,
    },
};

const req = client.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
        console.log(`Response Status: ${res.statusCode}`);
        console.log(`Response Body:   ${body}`);
    });
});

req.on("error", (err) => {
    console.error("Failed to send webhook request:", err.message);
});

req.write(payloadString);
req.end();
