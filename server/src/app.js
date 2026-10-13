import express from 'express';
import cors from 'cors';

import pujaRoutes from './routes/pujaRoutes.js';
import homaRoutes from './routes/homaRoutes.js';
import otpRoutes from './routes/otp.routes.js';
import orderRoutes from './routes/order.routes.js';
import poojaDetailsRoutes from './routes/pooja.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import userRoutes from './routes/user.routes.js';
import customerQueryRoutes from './routes/customerQuery.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import heroBannerRoutes from './routes/heroBannerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import promoCodeRoutes from "./routes/promoCode.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";

const app = express();

// Middlewares
app.use(
    cors({
        origin: [
            "https://priestservices.astroved.com",
            "http://localhost:8565",
            "https://priest-service.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Razorpay-Signature"],
        credentials: true,
    })
);

// Capture raw body for webhook verification before express.json parsing
app.use("/api/payments/webhook", express.raw({ type: "application/json" }), (req, _res, next) => {
    if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body.toString("utf8");
    }
    next();
});

app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/hero-banners", heroBannerRoutes);
app.use('/api/pujas', pujaRoutes);
app.use('/api/homas', homaRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pooja-details', poojaDetailsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customerQueries", customerQueryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/promos", promoCodeRoutes);
app.use("/api/whatsapp", whatsappRoutes);

export default app;
