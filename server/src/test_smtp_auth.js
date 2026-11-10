import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.pepipost.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP_FAILED:', err.message);
  } else {
    console.log('SMTP_SUCCESS_AUTHENTICATED', success);
  }
  process.exit(0);
});
