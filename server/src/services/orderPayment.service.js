import PreOrderLead from "../models/PreOrderLead.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import { toPaise } from "../utils/currency.js";
import { sendOrderConfirmation } from "./whatsapp.service.js";
import { recordPromoUsage } from "../controllers/promoCode.controller.js";

/**
 * Atomically marks an Order as paid using payment data.
 * Shared by Razorpay webhook and browser verify endpoint.
 *
 * @param {Object} params
 * @param {Object} params.payment - Razorpay payment object/entity (amount in paise, currency, order_id, notes, etc.)
 * @returns {Promise<{ status: string, order: Object|null }>}
 */
export const markOrderPaid = async ({ payment }) => {
    if (!payment) {
        return { status: "invalid_payment", order: null };
    }

    const razorpayOrderId = payment.order_id;
    const uniqueId = payment.notes?.uniqueId;

    // 1. Find Order by razorpayOrderId, fallback to uniqueId
    let order = null;
    if (razorpayOrderId) {
        order = await Order.findOne({ razorpayOrderId });
    }
    if (!order && uniqueId) {
        order = await Order.findOne({ uniqueId });
    }

    if (!order) {
        console.warn(`[orderPayment] Order not found for razorpayOrderId: ${razorpayOrderId}, uniqueId: ${uniqueId}`);
        return { status: "order_not_found", order: null };
    }

    // 2. Validate currency and amount
    const expectedPaise = toPaise(order.pricing?.total);
    const paymentAmount = Number(payment.amount);
    const paymentCurrency = payment.currency || "INR";

    if (paymentCurrency !== "INR" || paymentAmount !== expectedPaise) {
        console.error(
            `[orderPayment] Amount/currency mismatch for order ${order._id}. Expected INR ${expectedPaise} paise, received ${paymentCurrency} ${paymentAmount} paise.`
        );
        return { status: "amount_mismatch", order };
    }

    // 3. Atomic transition: only updates if paymentStatus is not already "paid"
    const transactionId = payment.id || payment.razorpayPaymentId || null;
    const paymentMethod = payment.method || "Razorpay";
    const paymentDate = payment.created_at
        ? new Date(payment.created_at * 1000)
        : new Date();

    const updatedOrder = await Order.findOneAndUpdate(
        {
            _id: order._id,
            paymentStatus: { $ne: "paid" },
        },
        {
            $set: {
                paymentStatus: "paid",
                orderStatus: "confirmed",
                "paymentDetails.transactionId": transactionId,
                "paymentDetails.paymentMethod": paymentMethod,
                "paymentDetails.paymentDate": paymentDate,
            },
        },
        {
            returnDocument: "after",
        }
    );

    // 4. Link Payment document to Order if payment is saved in Payment collection
    if (transactionId) {
        await Payment.findOneAndUpdate(
            { razorpayPaymentId: transactionId },
            { $set: { order: order._id } }
        ).catch((err) =>
            console.error(`[orderPayment] Failed to link payment ${transactionId} to order ${order._id}:`, err.message)
        );
    }

    // If updatedOrder is null, another process (webhook or verify) already marked it paid
    if (!updatedOrder) {
        const freshOrder = await Order.findById(order._id);
        return { status: "already_paid", order: freshOrder };
    }

    // 5. Run side-effects ONLY once when this atomic transition actually changed the document
    if (updatedOrder.promoCodeId) {
        try {
            await recordPromoUsage({
                promoCodeId: updatedOrder.promoCodeId,
                userId: updatedOrder.customer,
                orderId: updatedOrder._id,
                discountAmount: updatedOrder.discountAmount || 0,
            });
            console.log(`[orderPayment] Promo code usage recorded for order: ${updatedOrder._id}`);
        } catch (promoErr) {
            console.error(`[orderPayment] Failed to record promo usage for order ${updatedOrder._id}:`, promoErr.message);
        }
    }

    try {
        await sendOrderConfirmation({
            mobileNumber: updatedOrder.whatsappNumber || updatedOrder.mobileNumber,
            orderId: updatedOrder.orderNumber,
            customerName: updatedOrder.customerName,
            serviceName: updatedOrder.itemName || updatedOrder.pooja,
            bookingDate: updatedOrder.bookingDate,
            amount: updatedOrder.pricing?.total,
        });
        console.log(`[orderPayment] WhatsApp confirmation dispatched for order: ${updatedOrder._id}`);
    } catch (waError) {
        console.error(`[orderPayment] Failed to dispatch WhatsApp confirmation for order ${updatedOrder._id}:`, waError.message);
    }

    // Delete pre-order lead data once payment is completed (only incomplete orders remain)
    try {
        await PreOrderLead.deleteMany({
            $or: [
                { razorpayOrderId: razorpayOrderId },
                { uniqueId: uniqueId },
                {
                    mobileNumber: updatedOrder.mobileNumber || updatedOrder.whatsappNumber,
                    serviceId: updatedOrder.serviceId
                }
            ]
        });
        console.log(`[orderPayment] Cleaned up pre-order leads for completed order ${updatedOrder._id}`);
    } catch (delLeadErr) {
        console.warn(`[orderPayment] Failed to delete pre-order leads:`, delLeadErr.message);
    }

    return { status: "paid_now", order: updatedOrder };
};
