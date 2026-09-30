import User from "../models/user.js";

export const updateProfile = async (req, res) => {
    try {
        const { userId, name, email, mobileNumber } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const updateData = {
            name: name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
            email: email.trim().toLowerCase(),
        };

        if (mobileNumber && mobileNumber.trim()) {
            updateData.mobileNumber = mobileNumber.trim();
        }

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