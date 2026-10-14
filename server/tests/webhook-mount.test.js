import test from "node:test";
import assert from "node:assert/strict";
import app, { RAZORPAY_WEBHOOK_PATH } from "../src/app.js";
import paymentRouter from "../src/routes/payment.routes.js";

test("Webhook route alignment and express.raw middleware mount check", async (t) => {
    await t.test("app.js RAZORPAY_WEBHOOK_PATH constant is exactly '/api/payments/getRazorpayWebhook'", () => {
        assert.equal(RAZORPAY_WEBHOOK_PATH, "/api/payments/getRazorpayWebhook");
    });

    await t.test("payment.routes.js has route matching '/getRazorpayWebhook' mounted at '/api/payments'", () => {
        const routes = paymentRouter.stack
            .filter((layer) => layer.route)
            .map((layer) => ({
                path: layer.route.path,
                methods: Object.keys(layer.route.methods),
            }));

        const webhookRoute = routes.find((r) => r.path === "/getRazorpayWebhook");
        assert.ok(webhookRoute, "Expected /getRazorpayWebhook to be registered in paymentRouter");
        assert.ok(webhookRoute.methods.includes("post"), "Expected POST method on /getRazorpayWebhook");

        const fullRoutePath = `/api/payments${webhookRoute.path}`;
        assert.equal(
            fullRoutePath,
            RAZORPAY_WEBHOOK_PATH,
            "The router path and the raw-body mount path must match exactly"
        );
    });

    await t.test("express.raw is mounted before express.json on the webhook path", () => {
        const stack = app._router?.stack || app.router?.stack || [];
        assert.ok(stack.length > 0, "Express app stack should have middleware registered");

        let rawIndex = -1;
        let jsonIndex = -1;

        stack.forEach((layer, index) => {
            const matchesWebhookPath =
                layer.matchers &&
                layer.matchers.some(
                    (m) => typeof m === "function" && Boolean(m(RAZORPAY_WEBHOOK_PATH))
                );

            if (layer.name === "rawParser" && matchesWebhookPath) {
                rawIndex = index;
            }
            if (layer.name === "jsonParser") {
                jsonIndex = index;
            }
        });

        assert.ok(rawIndex !== -1, "express.raw middleware must match RAZORPAY_WEBHOOK_PATH in app stack");
        assert.ok(jsonIndex !== -1, "express.json middleware must be found in app stack");
        assert.ok(
            rawIndex < jsonIndex,
            `express.raw (index ${rawIndex}) must be mounted BEFORE express.json (index ${jsonIndex})`
        );
    });
});
