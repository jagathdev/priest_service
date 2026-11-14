import VisitorHit from "../models/VisitorHit.js";

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
 * Get aggregated visitor analytics for admin dashboard with optional date filtering
 * GET /api/analytics/visitor-stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getVisitorStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate && endDate) {
      matchQuery.dateKey = { $gte: String(startDate).trim(), $lte: String(endDate).trim() };
    } else if (startDate) {
      matchQuery.dateKey = { $gte: String(startDate).trim() };
    } else if (endDate) {
      matchQuery.dateKey = { $lte: String(endDate).trim() };
    }

    const totalVisitors = await VisitorHit.countDocuments(matchQuery);

    const todayDateKey = new Date().toISOString().slice(0, 10);
    const todayVisitors = await VisitorHit.countDocuments({ dateKey: todayDateKey });

    // Group visitors by UTM Source within the date filter
    const sourceBreakdown = await VisitorHit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $ifNull: ["$utmSource", "Direct"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    // Group visitors by UTM Campaign within the date filter
    const campaignBreakdown = await VisitorHit.aggregate([
      {
        $match: {
          ...matchQuery,
          utmCampaign: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: {
            source: "$utmSource",
            campaign: "$utmCampaign",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]);

    // Daily visitor trend for charting
    const dailyTrend = await VisitorHit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$dateKey",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 31 },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalVisitors,
        todayVisitors,
        filteredVisitors: totalVisitors,
        dailyTrend: dailyTrend.map((d) => ({ date: d._id, count: d.count })),
        sourceBreakdown: sourceBreakdown.map((item) => ({
          source: item._id || "Direct",
          count: item.count,
        })),
        campaignBreakdown: campaignBreakdown.map((item) => ({
          source: item._id.source || "Direct",
          campaign: item._id.campaign,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    console.error("[analytics.controller] Error fetching visitor stats:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

