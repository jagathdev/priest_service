import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";
import Order from "../models/Order.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || "admin_secret", { expiresIn: "1d" });

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate("pooja", "title name imageUrl");
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

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

export const getAdminPayments = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate("customer");
    
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let successfulPayments = 0;
    let pendingPayments = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    orders.forEach((ord) => {
      if (ord.paymentStatus === "paid") {
        totalRevenue += (ord.pricing?.total || 0);
        successfulPayments++;
        
        const orderDate = new Date(ord.createdAt);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          monthlyRevenue += (ord.pricing?.total || 0);
        }
      } else if (ord.paymentStatus === "pending") {
        pendingPayments++;
      }
    });

    const recentTransactions = orders.slice(0, 10).map((ord) => ({
      transactionId: ord.paymentDetails?.transactionId || `TXN-${ord.orderNumber}`,
      devoteeName: ord.customerName || (ord.participants && ord.participants.length > 0 ? ord.participants[0].name : "Devotee"),
      method: ord.paymentDetails?.paymentMethod || "Online Payment",
      amount: ord.pricing?.total || 0,
      status: ord.paymentStatus || "pending",
      currency: ord.pricing?.currency || "INR"
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue,
        successfulPayments,
        pendingPayments,
        recentTransactions
      }
    });
  } catch (error) {
    console.error("Error fetching admin payments:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};
