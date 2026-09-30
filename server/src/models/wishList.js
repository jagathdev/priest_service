import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        serviceType: {
            type: String,
            enum: ["pooja", "homa"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Same service cannot be added twice for the same user
wishlistSchema.index(
    {
        userId: 1,
        serviceId: 1,
    },
    {
        unique: true,
    }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;