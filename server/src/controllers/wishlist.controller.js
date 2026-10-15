import mongoose from "mongoose";

import Wishlist from "../models/wishList.js";
import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";

export const updateWishList = async (req, res) => {
    try {
        const userId = req.user?.role === "admin" && req.body?.userId
            ? req.body?.userId
            : (req.user?.id || req.body?.userId);
        const { serviceId } = req.body;

        // Validate user ID
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        // Validate service ID
        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "Pooja or Homa ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Pooja or Homa ID",
            });
        }

        // Check Puja first
        let service = await Puja.findOne({
            _id: serviceId,
            status: "active",
        });

        let serviceType = "pooja";

        // If Pooja doesn't exist, check Homa
        if (!service) {
            service = await Homa.findOne({
                _id: serviceId,
                status: "active",
            });

            serviceType = "homa";
        }

        // Neither exists
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Pooja or Homa not found",
            });
        }

        // Check existing wishlist
        const existingWishlist = await Wishlist.findOne({
            userId,
            serviceId,
        });

        // If already added → remove
        if (existingWishlist) {
            await Wishlist.deleteOne({
                _id: existingWishlist._id,
            });

            return res.status(200).json({
                success: true,
                wishlisted: false,
                message: "Removed from wishlist",
            });
        }

        // Add to wishlist
        const wishlist = await Wishlist.create({
            userId,
            serviceId,
            serviceType,
        });

        return res.status(201).json({
            success: true,
            wishlisted: true,
            message: "Added to wishlist",
            data: {
                id: wishlist._id,
                serviceId: wishlist.serviceId,
                serviceType: wishlist.serviceType,
            },
        });
    } catch (error) {
        console.error("Wishlist Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update wishlist",
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const userId = req.user?.role === "admin" && req.params?.userId
            ? req.params?.userId
            : (req.user?.id || req.params?.userId);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const wishlist = await Wishlist.find({
            userId,
        }).sort({
            createdAt: -1,
        }).lean();

        if (!wishlist || wishlist.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
            });
        }

        // Batch query all referenced Pujas and Homas with $in to eliminate N+1
        const pujaIds = wishlist
            .filter((item) => item.serviceType === "pooja")
            .map((item) => item.serviceId);
        const homaIds = wishlist
            .filter((item) => item.serviceType === "homa")
            .map((item) => item.serviceId);

        const [pujas, homas] = await Promise.all([
            pujaIds.length > 0 ? Puja.find({ _id: { $in: pujaIds }, status: "active" }).lean() : [],
            homaIds.length > 0 ? Homa.find({ _id: { $in: homaIds }, status: "active" }).lean() : [],
        ]);

        const pujaMap = new Map(pujas.map((p) => [String(p._id), p]));
        const homaMap = new Map(homas.map((h) => [String(h._id), h]));

        const result = [];

        for (const item of wishlist) {
            const service = item.serviceType === "pooja"
                ? pujaMap.get(String(item.serviceId))
                : homaMap.get(String(item.serviceId));

            // Service may have been deleted/deactivated
            if (!service) {
                continue;
            }

            result.push({
                wishlistId: item._id,
                serviceId: service._id,
                serviceType: item.serviceType,

                name: service.name || service.title,

                image:
                    service.image ||
                    service.imageUrl ||
                    "",

                price:
                    service.basePrice ||
                    service.packages?.[0]?.priceINR ||
                    service.packages?.[0]?.price ||
                    service.price ||
                    0,

                currency: service.currency || "INR",
                
                location: service.location || service.templeVenue || service.filterLocation || "Sacred Temple, India",
                subtitle: service.subtitle || service.description || "Join us for this sacred ritual to seek divine blessings and fulfillment.",
                badge: service.badge || service.shortTitle || "SPECIAL PUJA",
                slug: service.slug || "",

                createdAt: item.createdAt,
            });
        }

        return res.status(200).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (error) {
        console.error("Get Wishlist Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist",
        });
    }
};