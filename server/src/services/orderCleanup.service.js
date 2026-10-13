import Order from "../models/Order.js";
import { getRazorpay } from "../services/payment.service.js";

/**
 * Periodically cancel orders that have been pending > 30 minutes after verifying with Razorpay.
 */
export async function cancelStalePendingOrders() {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const staleOrders = await Order.find({
            paymentStatus: "pending",
            createdAt: { $lt: thirtyMinutesAgo },
        });

        if (staleOrders.length === 0) return;

        const razorpay = getRazorpay();

        for (const order of staleOrders) {
            try {
                if (order.razorpayOrderId) {
                    try {
                        const rzpOrder = await razorpay.orders.fetch(order.razorpayOrderId);
                        if (rzpOrder.status === "paid") {
                            // Order actually got paid; update to paid
                            order.paymentStatus = "paid";
                            order.orderStatus = "confirmed";
                            await order.save();
                            continue;
                        }
                    } catch (fetchErr) {
                        console.error(`Failed to fetch Razorpay order ${order.razorpayOrderId}:`, fetchErr.message);
                    }
                }

                // If not paid after 30 min, mark cancelled
                order.paymentStatus = "failed";
                order.orderStatus = "cancelled";
                await order.save();
                console.log(`[Order Cleanup] Stale order ${order._id} cancelled.`);
            } catch (orderErr) {
                console.error(`Error processing stale order ${order._id}:`, orderErr.message);
            }
        }
    } catch (err) {
        console.error("[Order Cleanup Job Error]:", err.message);
    }
}

/**
 * Start recurring cleanup job (every 10 minutes)
 */
export function startPendingOrdersCleanup(intervalMs = 10 * 60 * 1000) {
    const timer = setInterval(cancelStalePendingOrders, intervalMs);
    // Don't keep Node process alive just for the timer if running tests
    if (timer.unref) {
        timer.unref();
    }
    return timer;
}
