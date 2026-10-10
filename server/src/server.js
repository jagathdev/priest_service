import 'dotenv/config';
import connectDB from './config/db.js';
import setupAdmin from './config/setupAdmin.js';
import app from './app.js';

const PORT = process.env.PORT || 8564;

// Connect Database
connectDB().then(() => {
    setupAdmin();
});

const server = app.listen(PORT, () => {
    console.log(`Server is Running on http://localhost:${PORT}`);
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
