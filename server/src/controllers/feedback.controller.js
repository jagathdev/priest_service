import Order from "../models/Order.js";
import Feedback from "../models/Feedback.js";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

/**
 * Submit feedback for a completed order (supports multiple reviews per user & editing)
 * POST /api/orders/:orderId/feedback
 */
export const submitOrderFeedback = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, review, feedbackId } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5 stars.",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const ratingLabel = RATING_LABELS[numRating] || "Good";
    const cleanReview = typeof review === "string" ? review.trim() : "";

    let feedbackDoc;

    if (feedbackId) {
      // User is editing an existing review
      feedbackDoc = await Feedback.findOneAndUpdate(
        { _id: feedbackId, order: order._id },
        {
          rating: numRating,
          ratingLabel,
          review: cleanReview,
        },
        { returnDocument: 'after' }
      );
    }

    // If no existing feedback was updated or it's a new review submission, create a new Feedback document
    if (!feedbackDoc) {
      feedbackDoc = await Feedback.create({
        order: order._id,
        orderNumber: order.orderNumber || "",
        user: order.customer || req.user?._id || null,
        devoteeName: order.customerName || order.participants?.[0]?.name || "Devotee",
        mobileNumber: order.mobileNumber || "",
        serviceName: order.itemName || order.pooja || "Puja Ritual",
        serviceType: order.serviceType || "Puja",
        rating: numRating,
        ratingLabel,
        review: cleanReview,
      });
    }

    // Always update the latest feedback on the order
    order.feedback = {
      rating: numRating,
      ratingLabel,
      review: cleanReview,
      submittedAt: new Date(),
    };

    // Ensure feedbacks array exists
    if (!Array.isArray(order.feedbacks)) {
      order.feedbacks = [];
    }

    // If editing existing item in order.feedbacks array, update it; otherwise append new
    const existingIndex = order.feedbacks.findIndex(
      (f) => f.feedbackId && f.feedbackId.toString() === feedbackDoc._id.toString()
    );

    if (existingIndex > -1) {
      order.feedbacks[existingIndex].rating = numRating;
      order.feedbacks[existingIndex].ratingLabel = ratingLabel;
      order.feedbacks[existingIndex].review = cleanReview;
      order.feedbacks[existingIndex].submittedAt = new Date();
    } else {
      order.feedbacks.push({
        feedbackId: feedbackDoc._id,
        rating: numRating,
        ratingLabel,
        review: cleanReview,
        submittedAt: new Date(),
      });
    }

    await order.save();

    // Fetch all reviews for this order to return complete history
    const allFeedbacks = await Feedback.find({ order: order._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Your feedback is submitted successfully. Thank you!",
      data: feedbackDoc,
      feedbacks: allFeedbacks,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback. Please try again.",
    });
  }
};

/**
 * Get all feedback submissions for a specific order
 * GET /api/orders/:orderId/feedback
 */
export const getOrderFeedback = async (req, res) => {
  try {
    const { orderId } = req.params;
    const feedbacks = await Feedback.find({ order: orderId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: feedbacks[0] || null,
      feedbacks,
    });
  } catch (error) {
    console.error("Error fetching order feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
    });
  }
};

/**
 * Delete a specific feedback review for an order
 * DELETE /api/orders/:orderId/feedback/:feedbackId
 */
export const deleteOrderFeedback = async (req, res) => {
  try {
    const { orderId, feedbackId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Delete from Feedback collection
    await Feedback.findOneAndDelete({ _id: feedbackId, order: order._id });

    // Remove from order.feedbacks array
    if (Array.isArray(order.feedbacks)) {
      order.feedbacks = order.feedbacks.filter(
        (f) => f.feedbackId && f.feedbackId.toString() !== feedbackId.toString()
      );
    }

    // Find the latest remaining feedback
    const remainingFeedbacks = await Feedback.find({ order: order._id }).sort({ createdAt: -1 });

    if (remainingFeedbacks.length > 0) {
      const latest = remainingFeedbacks[0];
      order.feedback = {
        rating: latest.rating,
        ratingLabel: latest.ratingLabel,
        review: latest.review,
        submittedAt: latest.createdAt,
      };
    } else {
      order.feedback = {
        rating: null,
        ratingLabel: "",
        review: "",
        submittedAt: null,
      };
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
      feedbacks: remainingFeedbacks,
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review. Please try again.",
    });
  }
};

