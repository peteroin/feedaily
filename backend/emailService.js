// backend/services/emailService.js
import nodemailer from "nodemailer";

// Gmail App Password required—do not use Gmail login password!
// If using Gmail, "service: 'gmail'" is preferred.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465; false for 587
  auth: {
    user: "s.victor2205@gmail.com",
    pass: "yutumhqpomuqmqhw",
  },
});

export function sendEmail(to, subject, text) {
  return transporter.sendMail({
    from: '"Feedaily" <s.victor2205@gmail.com>',
    to,
    subject,
    text,
  });
}
