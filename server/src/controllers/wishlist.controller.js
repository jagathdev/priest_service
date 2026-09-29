import mongoose from "mongoose";

import Wishlist from "../models/wishList.js";
import Pooja from "../models/Pooja.js";
import Homa from "../models/homaModel.js";

export const updateWishList = async (req, res) => {
    try {
        const { userId, serviceId } = req.body;

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

        // Check Pooja first
        let service = await Pooja.findOne({
            _id: serviceId,
            isActive: true,
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
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const wishlist = await Wishlist.find({
            userId,
        }).sort({
            createdAt: -1,
        });

        const result = [];

        for (const item of wishlist) {
            let service = null;

            if (item.serviceType === "pooja") {
                service = await Pooja.findOne({
                    _id: item.serviceId,
                    isActive: true,
                });
            }

            if (item.serviceType === "homa") {
                service = await Homa.findOne({
                    _id: item.serviceId,
                    status: "active",
                });
            }

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