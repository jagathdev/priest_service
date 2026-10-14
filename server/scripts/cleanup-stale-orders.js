/**
 * Cleanup Stale Orders Script
 *
 * Finds orders with paymentStatus "pending" and orderStatus "created" older than
 * STALE_ORDER_HOURS (default 48 hours) where no captured Payment exists, and updates
 * their orderStatus to "cancelled".
 *
 * Usage:
 *   node scripts/cleanup-stale-orders.js [--dry-run]
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/Order.js";
import Payment from "../src/models/Payment.js";

dotenv.config();

const isDryRun = process.argv.includes("--dry-run");
const staleHours = parseInt(process.env.STALE_ORDER_HOURS || "48", 10);

async function run() {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("MONGO_URI / MONGODB_URI is not set in environment.");
        process.exit(1);
    }

    console.log(`Connecting to MongoDB...`);
    console.log(`Stale threshold: ${staleHours} hours`);
    console.log(`Mode: ${isDryRun ? "DRY-RUN (no modifications made)" : "LIVE CLEANUP"}`);

    await mongoose.connect(mongoUri);

    const cutoffDate = new Date(Date.now() - staleHours * 60 * 60 * 1000);

    const staleCandidates = await Order.find({
        paymentStatus: "pending",
        orderStatus: "created",
        createdAt: { $lt: cutoffDate },
    });

    console.log(`Found ${staleCandidates.length} candidate stale orders older than ${cutoffDate.toISOString()}`);

    let cancelledCount = 0;

    for (const order of staleCandidates) {
        // Verify no captured payment exists for this order
        const capturedPayment = await Payment.findOne({
            $or: [
                { razorpayOrderId: order.razorpayOrderId },
                { uniqueId: order.uniqueId },
                { order: order._id },
            ],
            status: "captured",
        });

        if (capturedPayment) {
            console.log(
                `Skipping order ${order._id} (${order.orderNumber}): captured payment ${capturedPayment.razorpayPaymentId} found.`
            );
            continue;
        }

        if (isDryRun) {
            console.log(`[DRY-RUN] Would cancel stale order: ${order._id} (${order.orderNumber}), created at ${order.createdAt}`);
            cancelledCount++;
        } else {
            order.orderStatus = "cancelled";
            await order.save();
            console.log(`Cancelled stale order: ${order._id} (${order.orderNumber})`);
            cancelledCount++;
        }
    }

    console.log(`\nCleanup finished: ${cancelledCount} orders ${isDryRun ? "identified to cancel" : "cancelled"}.`);
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("Cleanup script error:", err);
    process.exit(1);
});
