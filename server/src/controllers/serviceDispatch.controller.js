import ExcelJS from "exceljs";
import Order from "../models/Order.js";
import Puja from "../models/pujaModel.js";
import Homa from "../models/homaModel.js";

/**
 * Helper to build query filter for booked devotees based on admin selection
 */
const buildDispatchQuery = async ({ serviceName, serviceType, startDate, endDate, status }) => {
  const query = {};

  // Strictly only confirmed paid orders for dispatch
  query.paymentStatus = "paid";

  // Status filter (exclude cancelled/refunded/created by default unless specified)
  if (status && status !== "All") {
    query.orderStatus = new RegExp(`^${status.trim()}$`, "i");
  } else {
    query.orderStatus = { $nin: ["cancelled", "refunded", "created"] };
  }

  // Service Name filter
  if (serviceName && serviceName !== "All") {
    const escaped = serviceName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { pooja: new RegExp(escaped, "i") },
      { itemName: new RegExp(escaped, "i") },
    ];
  }

  // Service Type filter (Puja or Homa)
  if (serviceType && serviceType !== "All") {
    const cleanType = serviceType.trim().toLowerCase();
    if (cleanType === "puja" || cleanType === "pooja") {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { serviceType: /^(puja|pooja)$/i },
          { serviceType: null },
          { serviceType: { $exists: false } },
        ],
      });
    } else if (cleanType === "homa") {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { serviceType: /^homa$/i },
          { pooja: /homa/i },
          { itemName: /homa/i },
        ],
      });
    }
  }

  // Date range filter (scheduledDate or createdAt or bookingDate)
  if (startDate || endDate) {
    const dateQuery = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateQuery.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateQuery.$lte = end;
    }

    query.$or = [
      { scheduledDate: dateQuery },
      { bookingDate: dateQuery },
      { createdAt: dateQuery },
    ];
  }

  return query;
};

/**
 * 1. GET /api/admin/service-dispatch
 * Returns list of booked devotees with filters & available services list
 */
export const getDispatchDevotees = async (req, res) => {
  try {
    const {
      serviceName = "All",
      serviceType = "All",
      startDate,
      endDate,
      status = "All",
      page = 1,
      limit = 50,
    } = req.query;

    const query = await buildDispatchQuery({ serviceName, serviceType, startDate, endDate, status });

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .sort({ scheduledDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query),
    ]);

    // Fetch distinct active pujas & homas for dropdown filters
    const [pujas, homas] = await Promise.all([
      Puja.find({ status: "active" }).select("title _id").lean(),
      Homa.find({ status: "active" }).select("title _id").lean(),
    ]);

    const serviceOptions = [
      ...pujas.map((p) => ({ id: p._id, name: p.title, type: "Puja" })),
      ...homas.map((h) => ({ id: h._id, name: h.title, type: "Homa" })),
    ];

    return res.status(200).json({
      success: true,
      data: {
        orders,
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
        serviceOptions,
      },
    });
  } catch (error) {
    console.error("Error fetching dispatch devotees:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service dispatch data.",
      error: error.message,
    });
  }
};

/**
 * 2. GET /api/admin/service-dispatch/export
 * Generates and downloads a priest-formatted Excel (.xlsx) file
 */
export const exportDispatchExcel = async (req, res) => {
  try {
    const { serviceName = "All", serviceType = "All", startDate, endDate, status = "All" } = req.query;

    const query = await buildDispatchQuery({ serviceName, serviceType, startDate, endDate, status });

    const orders = await Order.find(query)
      .sort({ scheduledDate: 1, createdAt: -1 })
      .lean();

    // Create Excel Workbook using ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Priest Services Admin";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Devotee List for Sankalpam", {
      pageSetup: { orientation: "landscape" },
      views: [{ state: "frozen", ySplit: 3 }],
    });

    // Configure columns with keys and widths (without setting 'header' to avoid overwriting row 1)
    sheet.columns = [
      { key: "sno", width: 8 },
      { key: "orderNumber", width: 18 },
      { key: "serviceName", width: 28 },
      { key: "scheduledDate", width: 22 },
      { key: "customerName", width: 22 },
      { key: "participants", width: 34 },
      { key: "gotra", width: 18 },
      { key: "wish", width: 32 },
      { key: "package", width: 18 },
      { key: "offerings", width: 24 },
      { key: "phone", width: 20 },
    ];

    // Row 1: Title Banner
    const titleText = `${serviceName !== "All" ? serviceName.toUpperCase() : "ALL RITUALS"} - DEVOTEE SANKALPAM DISPATCH LIST`;
    sheet.mergeCells("A1:K1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = titleText;
    titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00B05F" }, // Priest Services Emerald Theme
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(1).height = 36;

    // Row 2: Subtitle Metadata
    sheet.mergeCells("A2:K2");
    const subCell = sheet.getCell("A2");
    const dateRangeStr = startDate || endDate ? `Filtered: ${startDate || "Earliest"} to ${endDate || "Latest"}` : "All Booking Dates";
    subCell.value = `Total Devotees: ${orders.length} | Exported on: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} | ${dateRangeStr}`;
    subCell.font = { name: "Arial", size: 9.5, italic: true, color: { argb: "FF333333" } };
    subCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0FDF4" },
    };
    subCell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getRow(2).height = 22;

    // Row 3: Column Titles
    const headerRow = sheet.getRow(3);
    headerRow.values = [
      "S.No",
      "Order ID",
      "Service Name",
      "Scheduled Date & Time",
      "User Name",
      "Participant Name",
      "Gotra",
      "Sankalpam Prayer / Wish",
      "Package",
      "Special Offerings",
      "Mobile Number",
    ];
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" }, // Slate dark header
      };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FF94A3B8" } },
        bottom: { style: "medium", color: { argb: "FF00B05F" } },
        left: { style: "thin", color: { argb: "FF94A3B8" } },
        right: { style: "thin", color: { argb: "FF94A3B8" } },
      };
    });

    // Populate rows (Row 4 onwards)
    orders.forEach((ord, index) => {
      // Format Participants List
      const participantsStr = Array.isArray(ord.participants) && ord.participants.length > 0
        ? ord.participants.map((p, i) => `${i + 1}. ${p.name || ""}${p.gotra ? ` (${p.gotra})` : ""}`).join("\n")
        : ord.customerName || "-";

      // Format Gotra
      const gotraStr = ord.gotra || (ord.doesNotKnowGotra ? "Not Provided (Shiva Gotra)" : "-");

      // Format Offerings
      const offeringsStr = Array.isArray(ord.offerings) && ord.offerings.length > 0
        ? ord.offerings.map((o) => `• ${o.name}`).join("\n")
        : "-";

      // Scheduled Date formatted
      let schedDateStr = "-";
      if (ord.scheduledDate || ord.bookingDate) {
        const d = new Date(ord.scheduledDate || ord.bookingDate);
        if (!isNaN(d.getTime())) {
          schedDateStr = d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      }

      // Show ONLY the clean 10-digit mobile number (remove any WA: labels)
      const rawNum = ord.mobileNumber || ord.whatsappNumber || "";
      const digits = rawNum.replace(/\D/g, "");
      const tenDigit = digits.length > 10 && digits.startsWith("91") ? digits.slice(2) : digits;
      const phoneStr = tenDigit ? `+91 ${tenDigit}` : "-";

      const row = sheet.addRow({
        sno: index + 1,
        orderNumber: ord.orderNumber || "-",
        serviceName: ord.pooja || ord.itemName || "-",
        scheduledDate: schedDateStr,
        customerName: ord.customerName || "-",
        participants: participantsStr,
        gotra: gotraStr,
        wish: ord.wish || "-",
        package: ord.itemName?.includes("Package") ? ord.itemName : "Standard Devotee Sankalpam",
        offerings: offeringsStr,
        phone: phoneStr,
      });

      row.height = Math.max(28, (ord.participants?.length || 1) * 16);

      // Zebra striping
      const isEven = index % 2 === 0;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 9.5, color: { argb: "FF1E293B" } };
        cell.alignment = {
          vertical: "middle",
          horizontal: colNumber === 1 || colNumber === 2 || colNumber === 4 ? "center" : "left",
          wrapText: true,
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isEven ? "FFFFFFFF" : "FFF8FAFC" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    // Set Response Headers for direct browser download
    const cleanFileName = `Priest_Dispatch_${serviceName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanFileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel export:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Excel export.",
      error: error.message,
    });
  }
};
