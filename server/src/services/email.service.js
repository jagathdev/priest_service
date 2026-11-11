import nodemailer from "nodemailer";
import NotificationRecipient from "../models/NotificationRecipient.js";

/**
 * Creates and returns the nodemailer transporter using environment variables.
 * Uses standard SMTP Host, Port, User and Password.
 */
export const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.pepipost.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = port === 465 || process.env.SMTP_SECURE === "true";

  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    console.warn("[email.service] Warning: SMTP_USER or SMTP_PASS not set. Emails may fail to send.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/**
 * Checks if the SMTP credentials are configured and connects successfully.
 */
export const verifySmtpConnection = async () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    return {
      connected: false,
      message: "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in server .env",
    };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    return {
      connected: true,
      user,
      host: process.env.SMTP_HOST || "smtp.pepipost.com",
      message: "SMTP Server is ready and authenticated successfully.",
    };
  } catch (error) {
    return {
      connected: false,
      message: error.message || "Failed to connect to SMTP server",
    };
  }
};

/**
 * Generates an elegant, mobile-friendly HTML email template for an order confirmation.
 */
export const generateOrderEmailHtml = (order) => {
  const orderNumber = order.orderNumber || `PS-${order._id}`;
  const serviceName = order.itemName || order.pooja || "Sacred Vedic Ritual";
  const serviceType = (order.serviceType || "PUJA").toUpperCase();
  const customerName = order.customerName || "Devotee";
  const whatsappNumber = order.whatsappNumber || order.mobileNumber || "Not Provided";
  const totalAmount = Number(order.pricing?.total || order.amount || 0).toLocaleString("en-IN");
  const transactionId = order.paymentDetails?.transactionId;
  const paymentMethod = order.paymentDetails?.paymentMethod;
  const promo = order.promo || null;
  const wish = order.wish || null;

  // Format booking date & time
  const rawDate = order.createdAt || order.bookingDate || new Date();
  const dateObj = new Date(rawDate);
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Participants list HTML
  const participants = Array.isArray(order.participants) && order.participants.length > 0
    ? order.participants
    : [{ name: customerName, gotra: order.gotra }];

  const participantsRows = participants
    .map(
      (p, idx) => `
      <tr style="border-bottom: 1px solid #f1e6d4;">
        <td style="padding: 10px 12px; font-weight: 700; color: #1a1a1a;">${idx + 1}. ${p.name || customerName}</td>
        <td style="padding: 10px 12px; color: #78350f; font-weight: 600;">${p.doesNotKnowGotra || !p.gotra ? "Does not know Gotra (Kashyapa recited)" : p.gotra}</td>
      </tr>`
    )
    .join("");

  // Offerings list HTML
  const offerings = Array.isArray(order.offerings) ? order.offerings : [];
  const offeringsSection = offerings.length > 0
    ? `
      <div style="margin-top: 20px; background-color: #fefcf8; border: 1px solid #f0dec5; border-radius: 12px; padding: 14px 18px;">
        <h4 style="margin: 0 0 10px 0; color: #9a3412; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Special Offerings Selected</h4>
        <ul style="margin: 0; padding-left: 20px; color: #44403c; font-size: 13px; line-height: 1.6;">
          ${offerings.map((o) => `<li><strong>${o.name}</strong> - ₹${o.priceINR || 0}</li>`).join("")}
        </ul>
      </div>`
    : "";

  const adminBaseUrl = process.env.CLIENT_URL || "http://localhost:8564";
  const orderUrl = `${adminBaseUrl}/admin/orders/${order._id}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Confirmation - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f2eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #292524;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f2eb; padding: 30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #ebd9c0;">
          
          <!-- Top Header Strip with Auspicious Temple Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #00B05F 100%); padding: 26px 30px; text-align: center; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.9; margin-bottom: 4px;">
                PRIEST SERVICES • ASTROVED
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                🕉️ New Ritual Order Confirmed!
              </h1>
              <div style="margin-top: 8px; display: inline-block; background-color: rgba(255,255,255,0.22); padding: 4px 14px; rounded-radius: 20px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                Order ID: ${orderNumber}
              </div>
            </td>
          </tr>

          <!-- Key Booking Summary Pill -->
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <table role="presentation" width="100%" style="background-color: #fffbf5; border: 1px solid #f2dfc7; border-radius: 14px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; color: #c2410c; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${serviceType} SERVICE
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #0c1a2e; margin: 2px 0 6px 0;">
                      ${serviceName}
                    </div>
                    <div style="font-size: 13px; color: #57534e;">
                      📅 <strong>Date:</strong> ${formattedDate} &nbsp;|&nbsp; ⏰ <strong>Time:</strong> ${formattedTime}
                    </div>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 700; color: #78716c; text-transform: uppercase;">
                      Amount Paid
                    </div>
                    <div style="font-size: 24px; font-weight: 900; color: #00B05F; line-height: 1.2;">
                      ₹${totalAmount}
                    </div>
                    <div style="font-size: 10px; font-weight: 700; color: #166534; background-color: #dcfce7; padding: 2px 8px; border-radius: 10px; display: inline-block; margin-top: 4px;">
                      PAID / CONFIRMED
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Devotee & Contact Information -->
          <tr>
            <td style="padding: 10px 30px;">
              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #9a3412; margin: 16px 0 10px 0; border-bottom: 2px solid #fed7aa; padding-bottom: 6px;">
                👤 Devotee Contact Details
              </h3>
              <table role="presentation" width="100%" style="font-size: 13px; color: #292524;">
                <tr>
                  <td style="padding: 6px 0; color: #78716c; width: 140px;">Primary Devotee:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #1c1917;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c;">WhatsApp Number:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #047857;">
                    <a href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}" style="color: #047857; text-decoration: none;">
                      💬 ${whatsappNumber}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #78716c;">Payment Method:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #44403c;">${paymentMethod} (Txn: ${transactionId})</td>
                </tr>
                ${promo ? `
                <tr>
                  <td style="padding: 6px 0; color: #78716c;">Promo :</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #c2410c;">${promo}}</td>
                </tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- Participants & Sankalpam Details -->
          <tr>
            <td style="padding: 10px 30px;">
              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #9a3412; margin: 16px 0 10px 0; border-bottom: 2px solid #fed7aa; padding-bottom: 6px;">
                🙏 Sankalpam Devotees &amp; Gotra
              </h3>
              <table role="presentation" width="100%" style="font-size: 13px; border-collapse: collapse; background-color: #faf8f5; border-radius: 10px; overflow: hidden; border: 1px solid #ebd9c0;">
                <thead>
                  <tr style="background-color: #f5eedf; text-align: left; color: #78350f; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                    <th style="padding: 8px 12px;">Devotee Name</th>
                    <th style="padding: 8px 12px;">Gotra</th>
                  </tr>
                </thead>
                <tbody>
                  ${participantsRows}
                </tbody>
              </table>

              ${wish ? `
              <div style="margin-top: 14px; background-color: #fff9ed; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 6px;">
                <span style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase;">Sacred Prayer / Wish (Sankalpam Intention):</span>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #451a03; font-style: italic;">
                  "${wish}"
                </p>
              </div>` : ""}

              ${offeringsSection}
            </td>
          </tr>

          <!-- Action Button: Open in Admin -->
          <tr>
            <td style="padding: 26px 30px 30px 30px; text-align: center;">
              <a href="${orderUrl}" target="_blank" style="display: inline-block; background-color: #00B05F; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 13px 32px; border-radius: 50px; box-shadow: 0 4px 14px rgba(0, 176, 95, 0.35);">
                View Full Order in Admin Portal &rarr;
              </a>
              <div style="margin-top: 12px; font-size: 11px; color: #a8a29e;">
                This automated notification was generated by the Priest Services Booking System.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Sends order confirmation emails to all active recipients stored in the database.
 * If no recipients are in the database yet, falls back to ADMIN_EMAIL or SMTP_USER from .env.
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    // 1. Fetch all active recipients from MongoDB
    const recipients = await NotificationRecipient.find({ isActive: true }).lean();
    let emailList = recipients.map((r) => r.email.trim()).filter(Boolean);

    // Fallback if database has no recipients yet
    if (emailList.length === 0) {
      const fallback = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (fallback) {
        emailList = fallback.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
      }
    }

    if (emailList.length === 0) {
      console.warn("[email.service] No active email recipients found to receive order confirmation.");
      return { success: false, reason: "no_recipients" };
    }

    const transporter = getTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || "orders@priestservices.astroved.com";
    const orderNumber = order.orderNumber || `PS-${order._id}`;
    const serviceName = order.itemName || order.pooja || "Sacred Ritual";
    const subject = `🕉️ New Order Confirmed: ${serviceName} [${orderNumber}] - ₹${Number(order.pricing?.total || 0).toLocaleString("en-IN")}`;
    const html = generateOrderEmailHtml(order);

    console.log(`[email.service] Sending order confirmation email for ${orderNumber} to: ${emailList.join(", ")}`);

    // Send in parallel to all recipients via SMTP
    const results = await Promise.allSettled(
      emailList.map((toEmail) =>
        transporter.sendMail({
          from: `"Priest Services Order Alert" <${fromAddress}>`,
          to: toEmail,
          subject,
          html,
        })
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`[email.service] Order confirmation dispatch complete. Success: ${successful}, Failed: ${failed}`);

    return {
      success: successful > 0,
      total: emailList.length,
      successful,
      failed,
    };
  } catch (error) {
    console.error("[email.service] Critical error sending order confirmation emails:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a test email to a specific address or all active recipients.
 */
export const sendTestEmail = async (targetEmail = null) => {
  let recipients = [];
  if (targetEmail && typeof targetEmail === "string") {
    recipients = [targetEmail.trim()];
  } else {
    const list = await NotificationRecipient.find({ isActive: true }).lean();
    recipients = list.map((r) => r.email.trim()).filter(Boolean);
    if (recipients.length === 0) {
      const fallback = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (fallback) recipients = [fallback];
    }
  }

  if (recipients.length === 0) {
    throw new Error("No recipient email address specified and none found in active database list.");
  }

  const transporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || "orders@priestservices.astroved.com";
  const now = new Date();

  // Create mock order data for test mail preview
  const mockOrder = {
    _id: "test_order_preview_id",
    orderNumber: `PS-${now.getFullYear()}-TEST01`,
    itemName: "Rameshwaram Tharpanam (Test Order)",
    serviceType: "Puja",
    customerName: "Devotee (Test Preview)",
    whatsappNumber: "+91 98765 43210",
    mobileNumber: "+91 98765 43210",
    participants: [
      { name: "Devotee One", gotra: "Kashyapa" },
      { name: "Devotee Two", gotra: "Bharadwaja" },
    ],
    wish: "Family wellbeing, health, ancestral peace and prosperity.",
    pricing: {
      total: 1001,
      currency: "INR",
    },
    paymentDetails: {
      transactionId: "pay_test_SAMPLE123456",
      paymentMethod: "UPI / Razorpay (Sample)",
    },
    createdAt: now,
    bookingDate: now,
  };

  const html = generateOrderEmailHtml(mockOrder);
  const testSubject = `[TEST EMAIL] Priest Services Order Notification System is Working! 🔔`;

  const results = await Promise.allSettled(
    recipients.map((toEmail) =>
      transporter.sendMail({
        from: `"Priest Services Order Alert" <${fromAddress}>`,
        to: toEmail,
        subject: testSubject,
        html,
      })
    )
  );

  const failed = results.find((r) => r.status === "rejected");
  if (failed) {
    throw new Error(`Email sending failed: ${failed.reason?.message || "Check SMTP credentials"}`);
  }

  return {
    success: true,
    sentTo: recipients,
    timestamp: now.toISOString(),
  };
};
