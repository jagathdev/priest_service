import Order from "../models/Order.js";
import Feedback from "../models/Feedback.js";
import { escapeRegex } from "../utils/escapeRegex.js";

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
        { returnDocument: "after" }
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
        whatsappNumber: order.whatsappNumber || order.mobileNumber || "",
        email: order.email || order.customerEmail || "",
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

/**
 * Admin: Get all feedback reviews with pagination, search, rating filters, ritual type filters, date ranges, and KPI stats
 * GET /api/admin/feedbacks
 */
export const getAdminFeedbacks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      rating = "All",
      serviceType = "All",
      sort = "latest",
      startDate,
      endDate,
      fromDate,
      toDate,
    } = req.query;

    const effectiveStart = startDate || fromDate;
    const effectiveEnd = endDate || toDate;

    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const skip = (pageNum - 1) * limitNum;

    // Sorting definition
    let sortObj = { createdAt: -1 };
    if (sort === "oldest") {
      sortObj = { createdAt: 1 };
    } else if (sort === "rating_desc") {
      sortObj = { rating: -1, createdAt: -1 };
    } else if (sort === "rating_asc") {
      sortObj = { rating: 1, createdAt: -1 };
    }

    const query = {};
    const andConditions = [];

    // Search by devoteeName, orderNumber, email, mobile, whatsapp, or review
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, "i");
      andConditions.push({
        $or: [
          { devoteeName: regex },
          { orderNumber: regex },
          { email: regex },
          { mobileNumber: regex },
          { whatsappNumber: regex },
          { serviceName: regex },
          { review: regex },
        ],
      });
    }

    // Rating Filter
    if (rating && rating !== "All") {
      const rNum = parseInt(rating, 10);
      if (!isNaN(rNum)) {
        query.rating = rNum;
      }
    }

    // Service Type Filter (handle Puja / Pooja / Homa)
    if (serviceType && serviceType !== "All") {
      const lower = serviceType.toLowerCase();
      if (lower === "puja" || lower === "pooja") {
        query.serviceType = { $in: [/puja/i, /pooja/i] };
      } else {
        query.serviceType = new RegExp(`^${escapeRegex(serviceType)}$`, "i");
      }
    }

    // Date Range Filter
    if (effectiveStart || effectiveEnd) {
      const dateCond = {};
      if (effectiveStart) {
        const start = new Date(effectiveStart);
        start.setHours(0, 0, 0, 0);
        if (!isNaN(start.getTime())) dateCond.$gte = start;
      }
      if (effectiveEnd) {
        const end = new Date(effectiveEnd);
        end.setHours(23, 59, 59, 999);
        if (!isNaN(end.getTime())) dateCond.$lte = end;
      }
      if (Object.keys(dateCond).length > 0) {
        query.createdAt = dateCond;
      }
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const [feedbacks, totalCount, statsAgg] = await Promise.all([
      Feedback.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("order", "orderNumber devoteeName mobileNumber email pricing serviceName serviceType")
        .lean(),
      Feedback.countDocuments(query),
      Feedback.aggregate([
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            fiveStars: {
              $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
            },
            fourStars: {
              $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
            },
            threeStars: {
              $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
            },
            pujaReviews: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      { $toLower: { $ifNull: ["$serviceType", "puja"] } },
                      ["puja", "pooja"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            homaReviews: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      { $toLower: { $ifNull: ["$serviceType", ""] } },
                      "homa",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const stats = statsAgg[0] || {
      totalReviews: 0,
      avgRating: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      pujaReviews: 0,
      homaReviews: 0,
    };

    return res.status(200).json({
      success: true,
      data: feedbacks,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      stats: {
        totalReviews: stats.totalReviews,
        avgRating: Number((stats.avgRating || 0).toFixed(1)),
        fiveStars: stats.fiveStars,
        fourStars: stats.fourStars,
        threeStars: stats.threeStars,
        pujaReviews: stats.pujaReviews,
        homaReviews: stats.homaReviews,
      },
    });
  } catch (error) {
    console.error("[Feedback Controller] Error fetching feedbacks:", error?.stack || error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch feedback records",
    });
  }
};

/**
 * Admin: Delete a feedback record
 * DELETE /api/admin/feedbacks/:id
 */
export const deleteAdminFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Feedback ID is required" });
    }

    const deleted = await Feedback.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Feedback record not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("[Feedback Controller] Error deleting feedback:", error?.stack || error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete feedback record",
    });
  }
};
