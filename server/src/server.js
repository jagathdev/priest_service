import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import productRoutes from './routes/productRoutes.js';
import pujaRoutes from './routes/pujaRoutes.js';
import homaRoutes from './routes/homaRoutes.js';
import otpRoutes from './routes/otp.routes.js';
import orderRoutes from './routes/order.routes.js';
import poojaDetailsRoutes from './routes/pooja.routes.js';

import connectDB from './config/db.js';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/pujas', pujaRoutes);
app.use('/api/homas', homaRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pooja-details', poojaDetailsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is Running on http://localhost:${PORT}`);
});
