/**
 * Maps Razorpay payment entity to the Payment model structure.
 * Security Note: Does NOT store card holder name, token_iin, or card_id.
 */
export const mapRazorpayPayment = (entity, eventId) => {
    if (!entity) return null;

    const card = entity.card || {};
    const acquirerData = entity.acquirer_data || {};

    const paidAtRazorpay = entity.created_at
        ? new Date(entity.created_at * 1000)
        : null;

    return {
        razorpayPaymentId: entity.id,
        razorpayOrderId: entity.order_id,
        uniqueId: entity.notes?.uniqueId || null,
        amount: entity.amount, // in paise
        currency: entity.currency || "INR",
        status: entity.status,
        method: entity.method,
        cardLast4: card.last4 || null,
        cardNetwork: card.network || null,
        cardType: card.type || null,
        international: Boolean(entity.international),
        fee: entity.fee !== undefined ? entity.fee : null,
        tax: entity.tax !== undefined ? entity.tax : null,
        authCode: acquirerData.auth_code || null,
        rrn: acquirerData.rrn || null,
        errorCode: entity.error_code || null,
        errorDescription: entity.error_description || null,
        errorSource: entity.error_source || null,
        errorStep: entity.error_step || null,
        errorReason: entity.error_reason || null,
        paidAtRazorpay,
        email: entity.email || null,
        contact: entity.contact || null,
        lastEventId: eventId || null,
    };
};
