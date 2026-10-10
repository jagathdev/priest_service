import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";
import Order from "../models/Order.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
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
    console.error("Admin login error:", error);
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 5, service = "All", status = "All", search = "" } = req.query;
    const limitNum = parseInt(limit, 10) || 5;
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * limitNum;

    const query = {};
    const andConditions = [];

    if (service !== "All") {
      andConditions.push({ $or: [{ itemName: service }, { pooja: service }] });
    }
    if (status !== "All") {
      query.orderStatus = new RegExp(`^${status}$`, "i");
    }
    if (search) {
      const searchRegex = new RegExp(search, "i");
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

    const [totalOrders, orders, itemNames, poojaNames, statusesRaw] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("pooja", "title name imageUrl"),
      Order.distinct("itemName"),
      Order.distinct("pooja"),
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
      services: ["All", ...new Set([...itemNames, ...poojaNames].filter(Boolean))],
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
    if (orderStatus !== undefined) updateData.orderStatus = orderStatus;
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    if (videoLink !== undefined) updateData.videoLink = videoLink;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newStatus = selectedDate < today ? "completed" : "scheduled";
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
