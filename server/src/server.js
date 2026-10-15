import 'dotenv/config';
import { validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import setupAdmin from './config/setupAdmin.js';
import app from './app.js';

// 1. Validate environment variables at startup
validateEnv();

const PORT = process.env.PORT || 8564;

// 2. Connect Database & setup admin only on success
connectDB()
    .then(async () => {
        await setupAdmin();
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

// Graceful Shutdown
const gracefulShutdown = () => {
    console.log('Received kill signal, shutting down gracefully.');
    server.close(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
