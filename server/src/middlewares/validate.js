import { ZodError } from 'zod';

export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            req.body = parsed.body;
            req.query = parsed.query;
            req.params = parsed.params;
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: error.errors.map(err => ({
                        path: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};
