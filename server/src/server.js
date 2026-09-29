import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoute from './routes/userRoutes.js'
import poojaRoutes from "./routes/pooja.routes.js";
import orderRoutes from "./routes/order.routes.js";
import connectDB from './config/db.js';

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoute)
app.use("/api/poojas", poojaRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "API is working",
    });
});

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
    console.log(`Server is Running on http://localhost:${PORT}`)
})