/**
 * Migration script to inspect and clean up legacy Payment / WebhookEvent schema/indexes.
 *
 * Usage:
 *   node scripts/migrate-payment-models.js [--dry-run]
 *
 * NOTE: Ensure you have backed up your database before running without --dry-run.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const isDryRun = process.argv.includes("--dry-run");

async function run() {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("MONGO_URI is not set in environment.");
        process.exit(1);
    }

    console.log(`Connecting to MongoDB...`);
    console.log(`Mode: ${isDryRun ? "DRY-RUN (no changes will be applied)" : "LIVE MIGRATION"}`);
    if (!isDryRun) {
        console.log("IMPORTANT: Please make sure you have backed up your MongoDB database before proceeding!");
    }

    await mongoose.connect(mongoUri);

    const db = mongoose.connection.db;

    // 1. Inspect payments collection indexes
    console.log("\n--- Inspecting 'payments' collection ---");
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.includes("payments")) {
        const paymentIndexes = await db.collection("payments").indexes();
        console.log("Current indexes on 'payments':", JSON.stringify(paymentIndexes, null, 2));

        // Check if razorpayOrderId is unique in old schema
        const razorpayOrderIdIdx = paymentIndexes.find(
            (idx) => idx.key && idx.key.razorpayOrderId === 1 && idx.unique
        );

        if (razorpayOrderIdIdx) {
            console.log(`Found unique index '${razorpayOrderIdIdx.name}' on razorpayOrderId. Needs to be non-unique.`);
            if (!isDryRun) {
                await db.collection("payments").dropIndex(razorpayOrderIdIdx.name);
                console.log(`Dropped index ${razorpayOrderIdIdx.name}.`);
                await db.collection("payments").createIndex({ razorpayOrderId: 1 });
                console.log("Created non-unique index on { razorpayOrderId: 1 }.");
            } else {
                console.log(`[DRY-RUN] Would drop unique index '${razorpayOrderIdIdx.name}' and recreate as non-unique.`);
            }
        } else {
            console.log("No conflicting unique index found on razorpayOrderId in 'payments'.");
        }
    } else {
        console.log("'payments' collection does not exist yet. No migration needed.");
    }

    // 2. Inspect webhookevents collection indexes
    console.log("\n--- Inspecting 'webhookevents' collection ---");
    if (collectionNames.includes("webhookevents")) {
        const webhookIndexes = await db.collection("webhookevents").indexes();
        console.log("Current indexes on 'webhookevents':", JSON.stringify(webhookIndexes, null, 2));

        const ttlIndex = webhookIndexes.find(
            (idx) => idx.key && idx.key.receivedAt === 1 && idx.expireAfterSeconds !== undefined
        );

        if (!ttlIndex) {
            console.log("TTL index missing on 'webhookevents' ({ receivedAt: 1 }, expireAfterSeconds: 7776000).");
            if (!isDryRun) {
                await db.collection("webhookevents").createIndex(
                    { receivedAt: 1 },
                    { expireAfterSeconds: 90 * 24 * 60 * 60 }
                );
                console.log("Created 90-day TTL index on webhookevents.");
            } else {
                console.log("[DRY-RUN] Would create 90-day TTL index on webhookevents.");
            }
        } else {
            console.log("TTL index already exists on 'webhookevents'.");
        }
    } else {
        console.log("'webhookevents' collection does not exist yet. No migration needed.");
    }

    console.log("\nMigration inspection completed successfully.");
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("Migration script failed:", err);
    process.exit(1);
});
