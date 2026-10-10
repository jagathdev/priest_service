import pino from 'pino';
import pinoHttp from 'pino-http';

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

export const httpLogger = pinoHttp({
    logger,
    genReqId: function (req) { return req.id || crypto.randomUUID() },
    autoLogging: {
        ignore: (req) => req.url === '/health'
    }
});
