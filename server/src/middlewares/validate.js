export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            if (typeof schema === 'function') {
                const errorMsg = schema(req.body);
                if (errorMsg) {
                    return res.status(400).json({
                        success: false,
                        message: errorMsg,
                    });
                }
            } else if (typeof schema?.parse === 'function') {
                const parsed = schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });

                req.body = parsed.body;
                req.query = parsed.query;
                req.params = parsed.params;
            }

            next();
        } catch (error) {
            if (error?.errors) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: error.errors.map(err => ({
                        path: Array.isArray(err.path) ? err.path.join('.') : err.path,
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};
