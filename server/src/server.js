import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pujaRoutes from './routes/pujaRoutes.js';
import homaRoutes from './routes/homaRoutes.js';
import otpRoutes from './routes/otp.routes.js';
import orderRoutes from './routes/order.routes.js';
import poojaDetailsRoutes from './routes/pooja.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';
import customerQueryRoutes from './routes/customerQuery.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import heroBannerRoutes from './routes/heroBannerRoutes.js';

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is Running on http://localhost:${PORT}`);
});
