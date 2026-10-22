import User from "../models/user.js";

export const getProfile = async (req, res) => {
    try {
        const userId = (req.user?.role === "admin" && (req.params?.userId || req.query?.userId))
            ? (req.params?.userId || req.query?.userId)
            : req.user?.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobileNumber: user.mobileNumber,
                whatsappNumber: user.whatsappNumber || "",
                addresses: user.addresses,
                gender: user.gender,
                dob: user.dob,
                placeOfBirth: user.placeOfBirth,
                occupation: user.occupation,
            },
        });
    } catch (error) {
        console.error("Get Profile Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = (req.user?.role === "admin" && req.body?.userId)
            ? req.body?.userId
            : req.user?.id;
        const { name, email, gender, dob, placeOfBirth, occupation, addresses, whatsappNumber } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const updateData = {};

        if (name !== undefined) {
            const cleanName = String(name).trim();
            if (cleanName) {
                updateData.name = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            }
        }

        if (email !== undefined) {
            const cleanEmail = String(email).trim().toLowerCase();
            if (cleanEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(cleanEmail)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid email address format",
                    });
                }
                updateData.email = cleanEmail;
            } else {
                updateData.email = "";
            }
        }

        if (whatsappNumber !== undefined) {
            updateData.whatsappNumber = String(whatsappNumber).trim();
        }

        if (gender !== undefined) updateData.gender = gender;
        if (dob !== undefined) updateData.dob = dob;
        if (placeOfBirth !== undefined) updateData.placeOfBirth = placeOfBirth;
        if (occupation !== undefined) updateData.occupation = occupation;
        if (addresses) updateData.addresses = addresses;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobileNumber: user.mobileNumber,
                whatsappNumber: user.whatsappNumber || "",
                addresses: user.addresses,
                gender: user.gender,
                dob: user.dob,
                placeOfBirth: user.placeOfBirth,
                occupation: user.occupation,
            },
        });
    } catch (error) {
        console.error("Update Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};
