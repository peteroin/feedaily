import express from "express";
import Stripe from "stripe";
import db from "./database.js";
import { generateOtp } from "./otpService.js";
import { sendEmail } from "./emailService.js";

const router = express.Router();
const stripe = new Stripe(
  "sk_test_51RmVXrAWOstO0AeCoPU4OHcORGcR02IN6i5Jdo3HUH1EVU0wntm5pzV0zurFWAF1z5kfX4rfpXiNJO7NlxEPqtsa00dSSouXFF"
); // Replace with your secret key

router.post("/create-checkout-session", async (req, res) => {
  const { amount, productName, donationId, receiverEmail, orderDetails } =
    req.body;

  console.log("[create-checkout-session] API called");
  console.log("  Incoming body:", req.body);

  try {
    // Check if this is a merchandise order or donation
    const isMerchandise = orderDetails && !donationId;

    if (!isMerchandise && !donationId) {
      console.error("  ERROR: donationId missing in request body!");
      return res.status(400).json({ error: "Missing donationId" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: productName || "Delivery Charge" },
            unit_amount: Number(amount) * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: isMerchandise
        ? "http://localhost:5173/merchandise/success?session_id={CHECKOUT_SESSION_ID}"
        : "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/cancel",
      customer_email: receiverEmail,
      metadata: isMerchandise
        ? { type: "merchandise" }
        : { donationId: String(donationId) },
    });
    console.log(
      "  Stripe session created. ID:",
      session.id,
      " Metadata:",
      session.metadata
    );
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session creation error:", err);
    res.status(500).json({ error: "Stripe session error" });
  }
});

router.post("/payment-success", async (req, res) => {
  const { sessionId } = req.body;
  console.log("[payment-success] API called, got sessionId:", sessionId);

  if (!sessionId) {
    console.error("ERROR: No sessionId in body");
    return res.status(400).json({ message: "Missing sessionId" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Stripe session object received", session);
    const donationId = session.metadata?.donationId;

    if (!donationId) {
      console.error("ERROR: No donationId in metadata");
      return res
        .status(400)
        .json({ message: "No donationId in payment metadata" });
    }

    // Fetch the donation and user info
    db.get(
      `SELECT d.*, donor.email AS donorEmail, donor.name AS donorName, donor.contact AS donorContact, receiver.email AS receiverEmail, receiver.name AS receiverName, receiver.contact AS receiverContact 
       FROM donations d 
       LEFT JOIN users donor ON d.userId = donor.id 
       LEFT JOIN users receiver ON d.requesterId = receiver.id 
       WHERE d.id = ?;`,
      [donationId],
      (err, row) => {
        if (err) {
          console.error("DB error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        if (!row) {
          console.error("Donation not found for id:", donationId);
          return res.status(404).json({ message: "Donation not found" });
        }

        if (row.emailSent) {
          console.log("Emails already sent for donation", donationId);
          return res.status(200).json({ message: "Emails already sent" });
        }

        const otp = generateOtp();

        // Update OTP, emailSent flag, and status to "Delivering"
        db.run(
          `UPDATE donations SET otp = ?, emailSent = 1, status = "Delivering" WHERE id = ?`,
          [otp, donationId],
          async (updateErr) => {
            if (updateErr) {
              console.error("Failed updating donation:", updateErr);
              return res
                .status(500)
                .json({ message: "Failed to update donation" });
            }
            // Prepare emails
            const subjectReceiver = "Feedaily: Payment Successful & Pickup OTP";
            const textReceiver = `Hello ${row.receiverName || "Receiver"},
            
Your payment of ₹${(session.amount_total / 100).toFixed(2)} was successful.
Pickup from: ${row.donorName} (${row.donorContact})
Location: ${row.locationLat}, ${row.locationLng}
Your OTP: ${otp}`;

            const subjectDonor =
              "Feedaily: Your food donation has been requested";
            const textDonor = `Hello ${row.donorName || "Donor"},

Your donation "${row.foodType}" has been requested by ${row.receiverName}.
Pickup OTP: ${otp}
Pickup location: ${row.locationLat}, ${row.locationLng}`;

            try {
              let receiverEmailSent = null;
              let donorEmailSent = null;

              if (row.receiverEmail) {
                receiverEmailSent = await sendEmail(
                  row.receiverEmail,
                  subjectReceiver,
                  textReceiver
                );
              }
              if (row.donorEmail) {
                donorEmailSent = await sendEmail(
                  row.donorEmail,
                  subjectDonor,
                  textDonor
                );
              }

              return res.json({
                message:
                  "Payment confirmed; Emails sent; Status updated to Delivering",
                receiverEmailSent,
                donorEmailSent,
              });
            } catch (emailErr) {
              console.error("Email sending error:", emailErr);
              return res
                .status(500)
                .json({
                  message: "Failed to send emails",
                  error: emailErr.message,
                });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    res
      .status(500)
      .json({ message: "Payment processing failed", error: error.message });
  }
});

export default router;
