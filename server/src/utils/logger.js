import pino from 'pino';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: [
        'req.headers.authorization',
        'req.body.password',
        'req.body.otp',
        'req.body.razorpaySignature',
        'body.password',
        'body.otp',
        'body.razorpaySignature'
    ]
});
