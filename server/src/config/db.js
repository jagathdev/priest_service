import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo DB Connected");
    } catch (error) {
        console.error("Mongo DB Connection Failed !!", error.message);
        throw error;
    }
};

export default connectDB;
