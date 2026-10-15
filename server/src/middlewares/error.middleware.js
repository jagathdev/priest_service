export const notFoundHandler = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

export const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
    const message = err.message || "Internal Server Error";

    const response = {
        success: false,
        message,
    };

    if (process.env.NODE_ENV !== "production" && err.stack) {
        response.stack = err.stack;
    }

    if (err.errors) {
        response.errors = err.errors;
    }

    res.status(statusCode).json(response);
};

export default { notFoundHandler, errorHandler };
