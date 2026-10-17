export const notFoundHandler = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

export const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

    const isProduction = process.env.NODE_ENV === "production";
    let message = err.message || "Internal Server Error";

    if (isProduction && statusCode >= 500) {
        console.error("[ServerError]", err);
        message = "An unexpected error occurred. Please try again later.";
    }

    const response = {
        success: false,
        message,
    };

    if (!isProduction && err.stack) {
        response.stack = err.stack;
    }

    if (err.errors && (!isProduction || statusCode < 500)) {
        response.errors = err.errors;
    }

    res.status(statusCode).json(response);
};

export default { notFoundHandler, errorHandler };
