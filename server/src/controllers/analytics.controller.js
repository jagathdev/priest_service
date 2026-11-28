import VisitorHit from "../models/VisitorHit.js";
import Otp from "../models/otp.js";
import PreOrderLead from "../models/PreOrderLead.js";
import Order from "../models/Order.js";

/**
 * Record a visitor hit (with deduplication per session per day)
 * POST /api/analytics/track-visitor
 */
export const trackVisitor = async (req, res) => {
  try {
    const {
      sessionId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      promo,
      landingPage,
      referrer,
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required" });
    }

    const todayDateKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    const cleanSource = (utmSource && String(utmSource).trim()) ? String(utmSource).trim() : "Direct";
    const cleanCampaign = (utmCampaign && String(utmCampaign).trim()) ? String(utmCampaign).trim() : "";
    const cleanMedium = (utmMedium && String(utmMedium).trim()) ? String(utmMedium).trim() : "";

    // Upsert so same session on the same day is counted once, but updates latest campaign if user arrived via a new ad
    const doc = await VisitorHit.findOneAndUpdate(
      { sessionId, dateKey: todayDateKey },
      {
        $set: {
          utmSource: cleanSource,
          utmMedium: cleanMedium,
          utmCampaign: cleanCampaign,
          utmTerm: utmTerm ? String(utmTerm).trim() : "",
          utmContent: utmContent ? String(utmContent).trim() : "",
          promo: promo ? String(promo).trim() : "",
          landingPage: landingPage ? String(landingPage).trim() : "/",
          referrer: referrer ? String(referrer).trim() : "",
          ipAddress: Array.isArray(clientIp) ? clientIp[0] : String(clientIp).split(",")[0].trim(),
          userAgent: String(userAgent).slice(0, 255),
        },
        $setOnInsert: {
          sessionId,
          dateKey: todayDateKey,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, recorded: true, id: doc._id });
  } catch (error) {
    // Non-blocking for client analytics
    console.warn("[analytics.controller] Error recording visitor:", error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
};

/**
 * Helper to build continuous date range list (YYYY-MM-DD)
 */
const getDatesArray = (startStr, endStr) => {
  const dates = [];
  const start = new Date(startStr);
  const end = new Date(endStr);
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

const formatLabel = (dateStr) => {
  try {
    const parts = dateStr.split("-");
    if (parts.length < 3) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return `${d} ${months[m - 1] || ""}`;
  } catch {
    return dateStr;
  }
};

const mapTrendToDates = (rawList, dates) => {
  const map = {};
  for (const item of rawList) {
    if (item._id) map[item._id] = item.count;
  }
  return dates.map((d) => ({
    date: d,
    label: formatLabel(d),
    count: map[d] || 0,
  }));
};

/**
 * Get aggregated visitor analytics & 4 dashboard graph metrics
 * GET /api/analytics/visitor-stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getVisitorStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const todayDateKey = new Date().toISOString().slice(0, 10);
    const todayStart = new Date(todayDateKey + "T00:00:00.000Z");
    const todayEnd = new Date(todayDateKey + "T23:59:59.999Z");

    // Determine effective date range for graphs
    let effectiveStartDate = startDate ? String(startDate).trim() : "";
    let effectiveEndDate = endDate ? String(endDate).trim() : "";

    // Default to last 14 days if no date filter specified
    if (!effectiveStartDate || !effectiveEndDate) {
      const past14 = new Date();
      past14.setDate(past14.getDate() - 13);
      effectiveStartDate = effectiveStartDate || past14.toISOString().slice(0, 10);
      effectiveEndDate = effectiveEndDate || todayDateKey;
    }

    const continuousDates = getDatesArray(effectiveStartDate, effectiveEndDate);

    // 1. WEBSITE VIEWS (VisitorHit)
    const visitorMatch = {};
    if (startDate && endDate) {
      visitorMatch.dateKey = { $gte: String(startDate).trim(), $lte: String(endDate).trim() };
    } else if (startDate) {
      visitorMatch.dateKey = { $gte: String(startDate).trim() };
    } else if (endDate) {
      visitorMatch.dateKey = { $lte: String(endDate).trim() };
    }

    const totalVisitors = await VisitorHit.countDocuments(visitorMatch);
    const todayVisitors = await VisitorHit.countDocuments({ dateKey: todayDateKey });

    const visitorTrendRaw = await VisitorHit.aggregate([
      { $match: { dateKey: { $gte: effectiveStartDate, $lte: effectiveEndDate } } },
      {
        $group: {
          _id: "$dateKey",
          count: { $sum: 1 },
        },
      },
    ]);
    const visitorTrend = mapTrendToDates(visitorTrendRaw, continuousDates);

    // 2. OTP GENERATED (Otp) - DO NOT EXPOSE SENSITIVE VALUES
    const effectiveStartD = new Date(effectiveStartDate + "T00:00:00.000Z");
    const effectiveEndD = new Date(effectiveEndDate + "T23:59:59.999Z");

    const otpDateFilter = (startDate || endDate)
      ? { createdAt: { $gte: new Date((startDate || effectiveStartDate) + "T00:00:00.000Z"), $lte: new Date((endDate || effectiveEndDate) + "T23:59:59.999Z") } }
      : {};

    const totalOtps = await Otp.countDocuments(otpDateFilter);
    const todayOtps = await Otp.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });

    const otpTrendRaw = await Otp.aggregate([
      {
        $match: {
          createdAt: { $gte: effectiveStartD, $lte: effectiveEndD },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const otpTrend = mapTrendToDates(otpTrendRaw, continuousDates);

    // 3. PURCHASE INTEREST (PreOrderLead)
    const preOrderDateFilter = (startDate || endDate)
      ? { createdAt: { $gte: new Date((startDate || effectiveStartDate) + "T00:00:00.000Z"), $lte: new Date((endDate || effectiveEndDate) + "T23:59:59.999Z") } }
      : {};

    const totalPreOrders = await PreOrderLead.countDocuments(preOrderDateFilter);
    const todayPreOrders = await PreOrderLead.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });

    const preOrderTrendRaw = await PreOrderLead.aggregate([
      {
        $match: {
          createdAt: { $gte: effectiveStartD, $lte: effectiveEndD },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const preOrderTrend = mapTrendToDates(preOrderTrendRaw, continuousDates);

    // 4. COMPLETED ORDERS & REVENUE (Order: orderStatus === "completed")
    const orderDateFilter = (startDate || endDate)
      ? {
        orderStatus: "completed",
        createdAt: { $gte: new Date((startDate || effectiveStartDate) + "T00:00:00.000Z"), $lte: new Date((endDate || effectiveEndDate) + "T23:59:59.999Z") },
      }
      : { orderStatus: "completed" };

    const totalCompletedOrders = await Order.countDocuments(orderDateFilter);
    const todayCompletedOrders = await Order.countDocuments({
      orderStatus: "completed",
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Calculate total revenue & today's revenue for completed orders
    const revenueAgg = await Order.aggregate([
      { $match: orderDateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$pricing.total", 0] } },
        },
      },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? (revenueAgg[0].totalRevenue || 0) : 0;

    const todayRevenueAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: "completed",
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: { $ifNull: ["$pricing.total", 0] } },
        },
      },
    ]);
    const todayRevenue = todayRevenueAgg.length > 0 ? (todayRevenueAgg[0].todayRevenue || 0) : 0;

    const orderTrendRaw = await Order.aggregate([
      {
        $match: {
          orderStatus: "completed",
          createdAt: { $gte: effectiveStartD, $lte: effectiveEndD },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$pricing.total", 0] } },
        },
      },
    ]);
    const completedOrdersTrend = mapTrendToDates(orderTrendRaw, continuousDates);

    const formatSourceName = (src) => {
      if (!src || !src.trim() || src.trim().toLowerCase() === "direct") return "Direct";
      const s = src.trim().toLowerCase();
      if (s === "facebook" || s === "fb") return "Facebook";
      if (s === "instagram" || s === "ig") return "Instagram";
      if (s === "google") return "Google";
      if (s === "whatsapp" || s === "wa") return "WhatsApp";
      if (s === "youtube" || s === "yt") return "YouTube";
      return src.trim().charAt(0).toUpperCase() + src.trim().slice(1);
    };

    // Group visitors by UTM Source (Normalized case-insensitively)
    const sourceBreakdownRaw = await VisitorHit.aggregate([
      { $match: visitorMatch },
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$utmSource", "direct"] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    const sourceBreakdown = sourceBreakdownRaw.map((item) => ({
      source: formatSourceName(item._id),
      count: item.count,
    }));

    // Group visitors by UTM Campaign (Normalized case-insensitively)
    const campaignBreakdownRaw = await VisitorHit.aggregate([
      {
        $match: {
          ...visitorMatch,
          utmCampaign: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: {
            source: { $toLower: { $ifNull: ["$utmSource", "direct"] } },
            campaign: "$utmCampaign",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]);

    const campaignBreakdown = campaignBreakdownRaw.map((item) => ({
      source: formatSourceName(item._id.source),
      campaign: item._id.campaign,
      count: item.count,
    }));

    return res.status(200).json({
      success: true,
      data: {
        // 4 Core Graphs Data
        graphs: {
          websiteViews: {
            title: "Website Views",
            prefix: "01",
            count: totalVisitors,
            todayCount: todayVisitors,
            subtitle: "Total visitors",
            trend: visitorTrend,
            color: "blue",
          },
          otpGenerated: {
            title: "OTP Generated",
            prefix: "02",
            count: totalOtps,
            todayCount: todayOtps,
            subtitle: "OTP generation events",
            trend: otpTrend,
            color: "purple",
          },
          purchaseInterest: {
            title: "Purchase Interest",
            prefix: "03",
            count: totalPreOrders,
            todayCount: todayPreOrders,
            subtitle: "Preorder requests",
            trend: preOrderTrend,
            color: "orange",
          },
          completedOrders: {
            title: "Completed Orders",
            prefix: "04",
            count: totalCompletedOrders,
            todayCount: todayCompletedOrders,
            subtitle: "Successfully completed",
            revenue: totalRevenue,
            todayRevenue: todayRevenue,
            trend: completedOrdersTrend,
            color: "green",
          },
        },
        // Preserved fields for existing visitor breakdown
        totalVisitors,
        todayVisitors,
        filteredVisitors: totalVisitors,
        dailyTrend: visitorTrend.map((d) => ({ date: d.date, count: d.count })),
        sourceBreakdown: sourceBreakdown,
        campaignBreakdown: campaignBreakdown,
      },
    });
  } catch (error) {
    console.error("[analytics.controller] Error fetching visitor stats:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

