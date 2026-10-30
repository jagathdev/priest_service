import 'dotenv/config';
import { validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import setupAdmin from './config/setupAdmin.js';
import app from './app.js';
import { initPujaDateScheduler } from './services/pujaDateCalculator.service.js';

// 1. Validate environment variables at startup
validateEnv();

const PORT = process.env.PORT || 8564;

// 2. Connect Database & setup admin only on success
connectDB()
    .then(async () => {
        await setupAdmin();
        initPujaDateScheduler();
    })
    .catch((err) => {
        console.error("FATAL: Could not connect to Database on startup:", err);
        process.exit(1);
    });

const server = app.listen(PORT, () => {
    console.log(`Server is Running on http://localhost:${PORT}`);
});

// Process-level unhandled exception & rejection handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1);
});

import mongoose from 'mongoose';

// Graceful Shutdown
let isShuttingDown = false;
const gracefulShutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log('Received kill signal, shutting down gracefully.');

    server.close(async () => {
        console.log('Closed out remaining HTTP connections.');
        try {
            await mongoose.connection.close(false);
            console.log('MongoDB connection closed cleanly.');
            process.exit(0);
        } catch (err) {
            console.error('Error closing MongoDB connection during shutdown:', err);
            process.exit(1);
        }
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
