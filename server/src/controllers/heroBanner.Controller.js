import HeroBanner from "../models/heroBanner.js";

// GET ALL ACTIVE HERO BANNERS

export const getHeroBanners = async (req, res) => {
    try {
        const { all } = req.query;
        const filter = all === "true" ? {} : { isActive: true };
        const banners = await HeroBanner.find(filter).sort({
            displayOrder: 1,
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: banners.length,
            data: banners,
        });
    } catch (error) {
        console.error(
            "Get Hero Banners Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch hero banners",
        });
    }
};

// SINGLE HERO BANNER

export const getHeroBannerById = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await HeroBanner.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Hero banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        console.error(
            "Get Hero Banner Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch hero banner",
        });
    }
};

// CREATE HERO BANNER

export const createHeroBanner = async (req, res) => {
    try {
        const {
            tagLine,
            title,
            description,
            cta,
            ctaText,
            ctaUrl,
            imageUrl,
            isActive,
            displayOrder,
        } = req.body;

        const text = (cta?.text || ctaText || "Book Puja Now").trim();
        const url = (cta?.url || ctaUrl || "/puja").trim();

        if (
            !tagLine ||
            !title ||
            !description ||
            !text ||
            !url ||
            !imageUrl
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "tagLine, title, description, CTA and imageUrl are required",
            });
        }

        // Check duplicate banner
        const existingBanner = await HeroBanner.findOne({
            tagLine: tagLine.trim(),
            title: title.trim(),
            imageUrl: imageUrl.trim(),
        });

        if (existingBanner) {
            return res.status(409).json({
                success: false,
                message: "Hero banner already exists",
                data: {
                    id: existingBanner._id,
                },
            });
        }

        const banner = await HeroBanner.create({
            tagLine: tagLine.trim(),
            title: title.trim(),
            description: description.trim(),

            cta: {
                text,
                url,
            },

            imageUrl: imageUrl.trim(),

            isActive:
                isActive !== undefined
                    ? (typeof isActive === "string" ? isActive !== "false" : Boolean(isActive))
                    : true,

            displayOrder:
                displayOrder !== undefined
                    ? Number(displayOrder) || 0
                    : 0,
        });

        return res.status(201).json({
            success: true,
            message:
                "Hero banner created successfully",
            data: banner,
        });
    } catch (error) {
        console.error(
            "Create Hero Banner Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create hero banner",
        });
    }
};


// UPDATE HERO BANNER

export const updateHeroBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.ctaText || updateData.ctaUrl || updateData.cta) {
            const currentText = updateData.cta?.text || updateData.ctaText;
            const currentUrl = updateData.cta?.url || updateData.ctaUrl;

            updateData.cta = {
                text: currentText ? String(currentText).trim() : "Book Puja Now",
                url: currentUrl ? String(currentUrl).trim() : "/puja",
            };

            delete updateData.ctaText;
            delete updateData.ctaUrl;
        }

        if (updateData.isActive !== undefined && typeof updateData.isActive === "string") {
            updateData.isActive = updateData.isActive !== "false";
        }

        if (updateData.displayOrder !== undefined) {
            updateData.displayOrder = Number(updateData.displayOrder) || 0;
        }

        const banner =
            await HeroBanner.findByIdAndUpdate(
                id,
                updateData,
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            );

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Hero banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Hero banner updated successfully",
            data: banner,
        });
    } catch (error) {
        console.error(
            "Update Hero Banner Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update hero banner",
        });
    }
};

//  DELETE HERO BANNER


export const deleteHeroBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner =
            await HeroBanner.findByIdAndDelete(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Hero banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Hero banner deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete Hero Banner Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete hero banner",
        });
    }
};