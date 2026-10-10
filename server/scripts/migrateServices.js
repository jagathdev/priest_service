import mongoose from "mongoose";
import dotenv from "dotenv";
import Puja from "../src/models/pujaModel.js";
import Homa from "../src/models/homaModel.js";
import Pooja from "../src/models/Pooja.js";
import Service from "../src/models/Service.js";
import Order from "../src/models/Order.js";

dotenv.config();

const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        // DD-MM-YYYY -> YYYY-MM-DD
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00.000Z`);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

const runMigration = async () => {
    const isDryRun = process.argv.includes("--dry-run");

    if (isDryRun) {
        console.log("=== DRY RUN MODE: No changes will be saved ===");
    } else {
        console.log("=== EXECUTING MIGRATION ===");
        console.log("WARNING: Please ensure you have backed up the database.");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const pujas = await Puja.find({});
        const homas = await Homa.find({});
        const poojas = await Pooja.find({});

        console.log(`Found ${pujas.length} Pujas, ${homas.length} Homas, ${poojas.length} Poojas.`);

        const idMapping = {}; // oldId -> newId

        let processed = 0;

        for (const puja of pujas) {
            const poojaData = poojas.find(p => String(p._id) === String(puja._id) || p.slug === puja.slug);
            const basePrice = poojaData ? poojaData.basePrice : 1251; // Fallback or logic
            
            const eventDate = parseDateString(puja.date);

            const newService = new Service({
                ...puja.toObject(),
                _id: new mongoose.Types.ObjectId(),
                type: "puja",
                basePrice,
                extraParticipantPrice: poojaData ? poojaData.pricing?.extraParticipant || 300 : 300,
                maxParticipants: poojaData ? poojaData.maxParticipants : 10,
                isActive: puja.status === "active",
                eventDate
            });

            idMapping[String(puja._id)] = String(newService._id);

            if (!isDryRun) {
                await newService.save();
            }
            processed++;
        }

        for (const homa of homas) {
            const poojaData = poojas.find(p => String(p._id) === String(homa._id) || p.slug === homa.slug);
            const basePrice = poojaData ? poojaData.basePrice : 1500;
            
            const eventDate = parseDateString(homa.date);

            const newService = new Service({
                ...homa.toObject(),
                _id: new mongoose.Types.ObjectId(),
                type: "homa",
                basePrice,
                extraParticipantPrice: poojaData ? poojaData.pricing?.extraParticipant || 300 : 300,
                maxParticipants: poojaData ? poojaData.maxParticipants : 10,
                isActive: homa.status === "active",
                eventDate
            });

            idMapping[String(homa._id)] = String(newService._id);

            if (!isDryRun) {
                await newService.save();
            }
            processed++;
        }

        console.log(`Successfully mapped ${processed} services.`);

        const orders = await Order.find({ serviceId: { $exists: false } }); // Find orders needing migration
        let orderUpdates = 0;
        
        for (const order of orders) {
            // Find matched new ID using old string/ObjectId in pooja field
            const matchedNewId = idMapping[order.pooja] || null;
            if (matchedNewId) {
                if (!isDryRun) {
                    await Order.updateOne(
                        { _id: order._id },
                        { $set: { serviceId: matchedNewId, serviceType: "Service" } }
                    );
                }
                orderUpdates++;
            }
        }

        console.log(`Orders updated: ${orderUpdates}`);
        
        // Similarly for wishlists... (Placeholder since Wishlist schema isn't fully loaded in context)

    } catch (err) {
        console.error("Migration Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Migration complete.");
    }
};

runMigration();
