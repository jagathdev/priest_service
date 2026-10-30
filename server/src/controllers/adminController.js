import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";
import Order from "../models/Order.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import { escapeRegex } from "../utils/escapeRegex.js";
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Valid email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const admin = await Admin.findOne({ email: cleanEmail });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

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
    console.error("Admin login error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 5, service = "All", status = "All", search = "", paymentStatus } = req.query;
    const limitNum = parseInt(limit, 10) || 5;
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * limitNum;

    const query = {};
    const andConditions = [];

    // Filter unpaid orders: default hides unpaid (pending/failed), admin can supply paymentStatus filter
    if (paymentStatus && paymentStatus !== "All") {
      query.paymentStatus = paymentStatus;
    } else if (!paymentStatus) {
      query.paymentStatus = { $nin: ["pending", "failed"] };
    }

    if (service !== "All") {
      andConditions.push({ $or: [{ itemName: service }, { pooja: service }] });
    }
    if (status !== "All") {
      query.orderStatus = new RegExp(`^${escapeRegex(status)}$`, "i");
    }
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");
      andConditions.push({
        $or: [
          { customerName: searchRegex },
          { "participants.name": searchRegex },
          { orderNumber: searchRegex }
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const [totalOrders, orders, activePujas, activeHomas, statusesRaw] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("pooja", "title name imageUrl"),
      Puja.find({ status: "active" }).select("title").lean(),
      Homa.find({ status: "active" }).select("title").lean(),
      Order.distinct("orderStatus")
    ]);

    const formattedOrders = orders.map(ord => ({
      ...ord.toObject(),
      serviceName: ord.itemName || ord.pooja?.title || ord.pooja?.name || ord.pooja || "Sacred Ritual",
      devoteeName: ord.customerName || ord.participants?.[0]?.name || "Devotee"
    }));

    return res.status(200).json({
      success: true,
      data: formattedOrders,
      totalOrders,
      totalPages: Math.max(1, Math.ceil(totalOrders / limitNum)),
      currentPage: parseInt(page, 10),
      limit: limitNum,
      services: ["All", ...new Set([...activePujas.map(p => p.title), ...activeHomas.map(h => h.title)].filter(Boolean))],

      statuses: ["All", ...new Set(statusesRaw.filter(Boolean))]
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

export const updateAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, scheduledDate, videoLink } = req.body;

    const updateData = {};
    if (orderStatus !== undefined) {
      updateData.orderStatus = orderStatus;
      if (orderStatus === "refunded" || orderStatus === "refund") {
        updateData.paymentStatus = "refunded";
      }
    }
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    if (videoLink !== undefined) updateData.videoLink = videoLink;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, message: "Order updated successfully", data: updatedOrder });
  } catch (error) {
    console.error("Error updating admin order:", error);
    return res.status(500).json({ success: false, message: "Failed to update order" });
  }
};

export const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (id.startsWith("PS-")) {
      order = await Order.findOne({ orderNumber: id }).populate("customer", "name email mobileNumber whatsappNumber addresses");
    } else {
      order = await Order.findById(id).populate("customer", "name email mobileNumber whatsappNumber addresses");
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const serviceName = order.itemName || order.pooja?.title || order.pooja?.name || order.pooja || "Sacred Ritual";
    const devoteeName = order.customerName || order.participants?.[0]?.name || "Devotee";

    return res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        serviceName,
        devoteeName
      }
    });
  } catch (error) {
    console.error("Error fetching admin order details:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch order details" });
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

export const bulkScheduleOrders = async (req, res) => {
  try {
    const { service, scheduledDate } = req.body;
    if (!service || service === "All" || !scheduledDate) {
      return res.status(400).json({ success: false, message: "Valid service name and scheduledDate are required." });
    }

    const selectedDate = new Date(scheduledDate);
    const newStatus = "scheduled";
    const query = { $or: [{ itemName: service }, { pooja: service }] };

    const result = await Order.updateMany(query, {
      $set: {
        orderStatus: newStatus,
        scheduledDate: selectedDate.toISOString()
      }
    });

    return res.status(200).json({ success: true, message: `Successfully updated ${result.modifiedCount} orders.`, count: result.modifiedCount });
  } catch (error) {
    console.error("Error bulk updating orders:", error);
    return res.status(500).json({ success: false, message: "Failed to bulk update orders" });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const { search, status, sort, fromDate, toDate, page = 1, limit = 10 } = req.query;

    const query = { role: "user" };

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, "i");
      query.$or = [{ name: regex }, { email: regex }, { mobileNumber: regex }, { whatsappNumber: regex }];
    }

    if (status && status !== "All") {
      if (status.toLowerCase() === "active") {
        query.isVerified = true;
      } else if (status.toLowerCase() === "inactive") {
        query.isVerified = false;
      }
    }

    // Date range filter on user registration (createdAt)
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

    // Get all completed/confirmed orders aggregated by customer ID to calculate total amount spent
    const spendAgg = await Order.aggregate([
      {
        $match: {
          $or: [
            { paymentStatus: "paid" },
            { paymentStatus: "captured" },
            { paymentStatus: "successful" },
            { orderStatus: { $in: ["confirmed", "scheduled", "performed", "completed"] } }
          ]
        }
      },
      {
        $group: {
          _id: "$customer",
          totalSpent: { $sum: { $ifNull: ["$pricing.total", 0] } },
          ordersCount: { $sum: 1 }
        }
      }
    ]);

    const spendMap = new Map();
    spendAgg.forEach((item) => {
      if (item._id) {
        spendMap.set(String(item._id), item.totalSpent);
      }
    });

    const totalUsersCount = await User.countDocuments({ role: "user" });
    const activeUsersCount = await User.countDocuments({ role: "user", isVerified: true });

    let totalRevenueAllUsers = 0;
    spendAgg.forEach((item) => {
      totalRevenueAllUsers += item.totalSpent || 0;
    });

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "name_asc") sortOption = { name: 1 };
    else if (sort === "name_desc") sortOption = { name: -1 };

    const totalFiltered = await User.countDocuments(query);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select("-password")
      .lean();

    const formattedUsers = users.map((u) => {
      const uId = String(u._id);
      const totalSpent = spendMap.get(uId) || 0;
      return {
        _id: u._id,
        name: u.name || "Devotee",
        email: u.email || "N/A",
        mobileNumber: u.mobileNumber || "N/A",
        whatsappNumber: u.whatsappNumber || "",
        totalAmountSpent: totalSpent,
        isVerified: u.isVerified !== false,
        status: u.isVerified !== false ? "Active" : "Inactive",
        createdAt: u.createdAt,
        addresses: u.addresses || []
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          total: totalFiltered,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalFiltered / limitNum) || 1
        },
        stats: {
          totalUsers: totalUsersCount,
          activeUsers: activeUsersCount,
          totalRevenue: totalRevenueAllUsers
        }
      }
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobileNumber, whatsappNumber, isVerified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber.trim();
    if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber.trim();
    if (isVerified !== undefined) user.isVerified = Boolean(isVerified);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Admin users cannot be deleted" });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};
