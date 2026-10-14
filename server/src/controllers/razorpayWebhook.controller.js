export const getRazorpayWebhook = async (req, res) => {
    try {
        const razorpayWebhookSecret =
            process.env.RAZORPAY_WEBHOOK_SECRET;

        const signatureValues =
            req.headers["x-razorpay-signature"];

        if (!razorpayWebhookSecret) {
            return res.status(500).json({
                success: false,
                message: "Razorpay webhook secret is missing",
            });
        }

        // GET requests generally do not contain a webhook body.
        // This method checks the supplied signature header only.

        if (!signatureValues) {
            return res.status(400).json({
                success: false,
                message: "Razorpay signature header is missing",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Razorpay GET API is working",
        });
    } catch (error) {
        console.error("Razorpay GET error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};