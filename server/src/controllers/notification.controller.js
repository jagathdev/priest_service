import NotificationRecipient from "../models/NotificationRecipient.js";
import {
  sendTestEmail,
  verifySmtpConnection,
  sendOrderConfirmationEmail,
} from "../services/email.service.js";
import Order from "../models/Order.js";

/**
 * Get all notification recipients + SMTP connection status
 */
export const getRecipients = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type === "ORDERS") {
      filter.$or = [
        { alertTypes: { $in: ["ORDERS"] } },
        { alertTypes: { $exists: false } },
        { alertTypes: { $size: 0 } },
      ];
    } else if (type === "CUSTOMER_QUERIES") {
      filter.alertTypes = { $in: ["CUSTOMER_QUERIES"] };
    }

    const recipients = await NotificationRecipient.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const smtpStatus = await verifySmtpConnection();

    return res.status(200).json({
      success: true,
      data: recipients,
      smtpStatus,
    });
  } catch (error) {
    console.error("Error fetching notification recipients:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch email recipients",
    });
  }
};

/**
 * Add a new recipient email
 */
export const addRecipient = async (req, res) => {
  try {
    const { name, email, role, alertTypes, isActive, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email address format" });
    }

    const existing = await NotificationRecipient.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Recipient with email ${cleanEmail} already exists`,
      });
    }

    const validAlertTypes = Array.isArray(alertTypes) && alertTypes.length > 0
      ? alertTypes.filter((t) => ["ORDERS", "CUSTOMER_QUERIES"].includes(t))
      : ["ORDERS"];

    const recipient = await NotificationRecipient.create({
      name: name.trim(),
      email: cleanEmail,
      role: role ? role.trim() : "Admin",
      alertTypes: validAlertTypes.length > 0 ? validAlertTypes : ["ORDERS"],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      notes: notes ? notes.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Recipient added successfully",
      data: recipient,
    });
  } catch (error) {
    console.error("Error adding notification recipient:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add recipient",
    });
  }
};

/**
 * Update an existing recipient (e.g. edit name, email, role, active status)
 */
export const updateRecipient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, alertTypes, isActive, notes } = req.body;

    const recipient = await NotificationRecipient.findById(id);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await NotificationRecipient.findOne({
        email: cleanEmail,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Another recipient with email ${cleanEmail} already exists`,
        });
      }
      recipient.email = cleanEmail;
    }

    if (name && name.trim()) recipient.name = name.trim();
    if (role !== undefined) recipient.role = role.trim();
    if (Array.isArray(alertTypes)) {
      const validAlertTypes = alertTypes.filter((t) => ["ORDERS", "CUSTOMER_QUERIES"].includes(t));
      recipient.alertTypes = validAlertTypes.length > 0 ? validAlertTypes : ["ORDERS"];
    }
    if (isActive !== undefined) recipient.isActive = Boolean(isActive);
    if (notes !== undefined) recipient.notes = notes.trim();

    await recipient.save();

    return res.status(200).json({
      success: true,
      message: "Recipient updated successfully",
      data: recipient,
    });
  } catch (error) {
    console.error("Error updating recipient:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update recipient",
    });
  }
};

/**
 * Delete a recipient
 */
export const deleteRecipient = async (req, res) => {
  try {
    const { id } = req.params;
    const recipient = await NotificationRecipient.findByIdAndDelete(id);

    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Recipient ${recipient.email} removed successfully`,
    });
  } catch (error) {
    console.error("Error deleting recipient:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete recipient",
    });
  }
};

/**
 * Trigger a Test Mail
 */
export const triggerTestMail = async (req, res) => {
  try {
    const { email, alertType } = req.body;
    const result = await sendTestEmail(email || null, alertType || "ORDERS");

    return res.status(200).json({
      success: true,
      message: `Test ${alertType === "CUSTOMER_QUERIES" ? "Customer Query" : "Order"} email sent successfully to ${result.sentTo.join(", ")}`,
      data: result,
    });
  } catch (error) {
    console.error("Error triggering test mail:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send test mail. Please verify SMTP settings.",
    });
  }
};

/**
 * Resend order confirmation email manually for any specific order ID
 */
export const resendOrderEmail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const result = await sendOrderConfirmationEmail(order);
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Order confirmation email sent to ${result.successful} recipient(s)`,
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || "Could not send email. Check recipients or SMTP setup.",
      });
    }
  } catch (error) {
    console.error("Error resending order email:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resend order email",
    });
  }
};

