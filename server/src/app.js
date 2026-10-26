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
import uploadRoutes from "./routes/upload.routes.js";
import { globalLimiter } from "./middlewares/rateLimiters.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const RAZORPAY_WEBHOOK_PATH = "/api/payments/getRazorpayWebhook";

const app = express();

// Trust proxy for reverse proxies (Render, Vercel, Nginx)
app.set('trust proxy', 1);

// Security Headers (Helmet standard equivalent without external binary dependencies)
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});

// Parse CORS origins from CLIENT_URLS environment variable
const allowedOrigins = [
    "http://localhost:8565",
    "http://localhost:3000",
    "https://priestservices.astroved.com",
    "https://priest-service.vercel.app"
];

if (process.env.CLIENT_URLS) {
    process.env.CLIENT_URLS.split(",")
        .map((url) => url.trim())
        .filter(Boolean)
        .forEach((url) => {
            if (!allowedOrigins.includes(url)) {
                allowedOrigins.push(url);
            }
        });
}

// Middlewares
app.use(
    cors({
        origin: [
            "https://priestservices.astroved.com",
            "http://localhost:8565",
            "http://127.0.0.1:8565",
            "https://priest-service.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        optionsSuccessStatus: 200,
    })
);


// Apply global rate limiter to all /api routes
app.use('/api', globalLimiter);

// Raw body parser for Razorpay webhook signature verification (mounted BEFORE express.json())
app.use(RAZORPAY_WEBHOOK_PATH, express.raw({ type: "application/json" }));

app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Serve uploaded images statically
app.use('/images', express.static(path.resolve(__dirname, '../public/images')));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
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

// Error Middlewares (mounted LAST)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
