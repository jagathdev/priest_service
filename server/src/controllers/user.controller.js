export const updateProfile = async (req, res) => {
    try {
        const { userId, name, email } = req.body;

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

        const user = await User.findByIdAndUpdate(
            userId,
            {
                name: name.trim(),
                email: email.trim().toLowerCase(),
            },
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