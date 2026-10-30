import PreOrderLead from "../models/PreOrderLead.js";

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * GET /api/admin/pre-orders
 * Fetches all incomplete pre-order leads (users who clicked Continue with Payment but haven't paid)
 */
export const getAdminPreOrders = async (req, res) => {
  try {
    const { search, serviceType, fromDate, toDate, page = 1, limit = 10, sort = "latest" } = req.query;

    const query = {};

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { userName: regex },
        { mobileNumber: regex },
        { whatsappNumber: regex },
        { serviceName: regex },
        { wish: regex },
        { "participants.name": regex },
      ];
    }

    if (serviceType && serviceType !== "All") {
      const escapedType = escapeRegex(serviceType.trim());
      query.serviceType = new RegExp(`^${escapedType}$`, "i");
    }

    // Date range filter (createdAt)
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Calculate KPI Stats
    const totalCount = await PreOrderLead.countDocuments({});
    const pujaCount = await PreOrderLead.countDocuments({
      serviceType: { $in: ["Puja", "Pooja", "puja", "POOJA"] },
    });
    const homaCount = await PreOrderLead.countDocuments({
      serviceType: { $in: ["Homa", "homa", "HOMA"] },
    });

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "name_asc") sortOption = { userName: 1 };
    else if (sort === "name_desc") sortOption = { userName: -1 };
    else if (sort === "amount_desc") sortOption = { totalAmount: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const totalFiltered = await PreOrderLead.countDocuments(query);
    const leads = await PreOrderLead.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const formattedLeads = leads.map((l) => ({
      _id: l._id,
      userName: l.userName || "Devotee",
      mobileNumber: l.mobileNumber || l.whatsappNumber || "N/A",
      whatsappNumber: l.whatsappNumber || l.mobileNumber || "",
      email: l.email || "",
      serviceType: l.serviceType || "Puja",
      serviceId: l.serviceId,
      serviceName: l.serviceName || "Sacred Ritual",
      packageName: l.packageName || "Standard Package",
      packagePrice: l.packagePrice || 0,
      totalAmount: l.totalAmount || 0,
      preferredDate: l.preferredDate || "",
      participants: l.participants || [],
      gotra: l.gotra || "",
      doesNotKnowGotra: Boolean(l.doesNotKnowGotra),
      wish: l.wish || "",
      offerings: l.offerings || [],
      createdAt: l.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        leads: formattedLeads,
        pagination: {
          total: totalFiltered,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalFiltered / limitNum) || 1,
        },
        stats: {
          totalLeads: totalCount,
          pujaLeads: pujaCount,
          homaLeads: homaCount,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAdminPreOrders:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch pre-orders" });
  }
};

/**
 * DELETE /api/admin/pre-orders/:id
 * Delete a single pre-order lead manually
 */
export const deleteAdminPreOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PreOrderLead.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Pre-order lead not found" });
    }
    return res.status(200).json({ success: true, message: "Pre-order lead removed successfully" });
  } catch (error) {
    console.error("Error deleting pre-order lead:", error);
    return res.status(500).json({ success: false, message: "Failed to delete pre-order lead" });
  }
};

/**
 * POST /api/admin/pre-orders/bulk-delete
 * Delete multiple pre-order leads manually
 */
export const bulkDeleteAdminPreOrders = async (req, res) => {
  try {
    const { leadIds } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ success: false, message: "leadIds array is required" });
    }
    const result = await PreOrderLead.deleteMany({ _id: { $in: leadIds } });
    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} pre-order lead(s) removed`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in bulkDeleteAdminPreOrders:", error);
    return res.status(500).json({ success: false, message: "Failed to delete pre-order leads" });
  }
};

