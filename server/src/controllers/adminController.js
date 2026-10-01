import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";
import Order from "../models/Order.js";

export const getAdminStats = async (req, res) => {
  try {
    const pujaCount = await Puja.countDocuments({ status: "active" });
    const homaCount = await Homa.countDocuments({ status: "active" });
    const ordersCount = await Order.countDocuments({});

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$pricing.total" } } }
    ]);
    const revenue = revenueResult[0]?.total || 0;

    const recentBookings = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("pooja", "title name imageUrl");

    return res.status(200).json({
      success: true,
      data: {
        pujas: pujaCount,
        homas: homaCount,
        orders: ordersCount,
        revenue,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
    });
  }
};
