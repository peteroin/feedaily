import express from "express";
import Stripe from "stripe";
import db from "./database.js";

const router = express.Router();
const stripe = new Stripe(
  "sk_test_51RmVXrAWOstO0AeCoPU4OHcORGcR02IN6i5Jdo3HUH1EVU0wntm5pzV0zurFWAF1z5kfX4rfpXiNJO7NlxEPqtsa00dSSouXFF"
);

// Test route to verify the module is loaded
router.get("/pro-subscription/test", (req, res) => {
  console.log("Pro subscription test route called");
  res.json({ message: "Pro subscription routes are working!", timestamp: new Date().toISOString() });
});


// Create checkout session for Pro subscription
router.post("/pro-subscription/create-checkout", async (req, res) => {
  const { userId, contact, email } = req.body;

  console.log("[pro-subscription/create-checkout] API called");
  console.log("  Incoming body:", req.body);
  console.log("  UserId:", userId, "Contact:", contact, "Email:", email);

  if (!userId || !contact || !email) {
    console.error("  ERROR: Missing required fields!");
    console.error("  UserId:", userId, "Contact:", contact, "Email:", email);
    return res.status(400).json({ error: "Missing userId, contact, or email" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: {
            name: "Feedaily Pro WhatsApp Subscription",
            description: "Get instant WhatsApp notifications for new food donations"
          },
          unit_amount: 29900, // ₹299
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: "http://localhost:5173/profile?pro_success=true&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/profile?pro_cancelled=true",
      customer_email: email,
      metadata: {
        type: "pro_subscription",
        userId: userId,
        contact: contact
      },
    });

    console.log("  Stripe Pro subscription session created. ID:", session.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Pro subscription session creation error:", err);
    console.error("Error details:", err.message);
    res.status(500).json({ error: `Stripe session error: ${err.message}` });
  }
});

// Handle successful Pro subscription payment
router.post("/pro-subscription/success", async (req, res) => {
  const { sessionId } = req.body;
  console.log("[pro-subscription/success] API called, got sessionId:", sessionId);

  if (!sessionId) {
    console.error("ERROR: No sessionId in body");
    return res.status(400).json({ message: "Missing sessionId" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Stripe Pro subscription session object received", session);

    const { userId, contact } = session.metadata;

    if (!userId || !contact) {
      console.error("ERROR: No userId or contact in metadata");
      return res.status(400).json({ message: "No userId or contact in payment metadata" });
    }

    // Check if user already has an active Pro subscription
    db.get(
      "SELECT * FROM pro_subscriptions WHERE userId = ? AND status = 'active'",
      [userId],
      (err, existingSubscription) => {
        if (err) {
          console.error("DB error checking existing subscription:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (existingSubscription) {
          console.log("User already has active Pro subscription");
          return res.status(200).json({ message: "Pro subscription already active" });
        }

        // Add user to Pro subscriptions table
        db.run(
          `INSERT INTO pro_subscriptions (userId, contact, stripeSessionId, status) VALUES (?, ?, ?, 'active')`,
          [userId, contact, sessionId],
          (err) => {
            if (err) {
              console.error("Failed to create Pro subscription:", err);
              return res.status(500).json({ message: "Database error" });
            }

            console.log("Pro subscription created successfully for user:", userId);
            res.json({ message: "Pro subscription activated successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Pro subscription processing error:", error);
    res.status(500).json({ message: "Pro subscription processing failed", error: error.message });
  }
});

// Check if user has Pro subscription
router.get("/pro-subscriptions/check", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  console.log("🔍 Checking Pro status for user:", userId);

  db.get(
    "SELECT * FROM pro_subscriptions WHERE userId = ? AND status = 'active'",
    [userId],
    (err, row) => {
      if (err) {
        console.error("DB error checking Pro status:", err);
        return res.status(500).json({ message: "Database error" });
      }

      console.log("🔍 Pro status query result:", row);
      console.log("🔍 isPro will be:", !!row);

      res.json({ isPro: !!row });
    }
  );
});

// Get all Pro users (for Twilio service)
router.get("/pro-subscriptions", (req, res) => {
  db.all(
    "SELECT contact FROM pro_subscriptions WHERE status = 'active'",
    (err, rows) => {
      if (err) {
        console.error("DB error fetching Pro users:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const proUsers = rows.map(row => row.contact);
      res.json({ proUsers, count: proUsers.length });
    }
  );
});

// Debug endpoint to see all Pro subscriptions
router.get("/pro-subscriptions/debug", (req, res) => {
  db.all(
    "SELECT * FROM pro_subscriptions ORDER BY createdAt DESC",
    (err, rows) => {
      if (err) {
        console.error("DB error fetching all Pro subscriptions:", err);
        return res.status(500).json({ message: "Database error" });
      }

      console.log("🔍 All Pro subscriptions in database:", rows);
      res.json({ subscriptions: rows, count: rows.length });
    }
  );
});

// Test endpoint to verify router is working
router.get("/pro-subscriptions/test-details", (req, res) => {
  console.log("🚀 [pro-subscriptions/test-details] Test endpoint called");
  res.json({ message: "Pro subscription details endpoint is working!", timestamp: new Date().toISOString() });
});

// Get Pro subscription details for a specific user
router.get("/pro-subscriptions/details", (req, res) => {
  const { userId } = req.query;

  console.log("🚀 [pro-subscriptions/details] Endpoint called with userId:", userId);

  if (!userId) {
    console.log("❌ Missing userId in request");
    return res.status(400).json({ message: "Missing userId" });
  }

  console.log("🔍 Fetching Pro subscription details for user:", userId);

  db.get(
    "SELECT * FROM pro_subscriptions WHERE userId = ? AND status = 'active'",
    [userId],
    (err, row) => {
      if (err) {
        console.error("DB error fetching Pro subscription details:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (!row) {
        return res.status(404).json({ message: "No active Pro subscription found" });
      }

      console.log("🔍 Pro subscription details found:", row);
      res.json({
        id: row.id,
        userId: row.userId,
        contact: row.contact,
        subscriptionType: row.subscriptionType,
        status: row.status,
        subscriptionStartDate: row.subscriptionStartDate,
        subscriptionEndDate: row.subscriptionEndDate,
        createdAt: row.createdAt
      });
    }
  );
});

// Cancel Pro subscription
router.post("/pro-subscription/cancel", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  db.run(
    "UPDATE pro_subscriptions SET status = 'cancelled' WHERE userId = ? AND status = 'active'",
    [userId],
    function (err) {
      if (err) {
        console.error("DB error cancelling Pro subscription:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "No active Pro subscription found" });
      }

      res.json({ message: "Pro subscription cancelled successfully" });
    }
  );
});

// Error handling middleware for this router
router.use((err, req, res, next) => {
  console.error("❌ Pro subscription routes error:", err);
  console.error("   Request URL:", req.url);
  console.error("   Request method:", req.method);
  console.error("   Error stack:", err.stack);
  res.status(500).json({
    error: "Internal server error in pro subscription routes",
    message: err.message,
    timestamp: new Date().toISOString()
  });
});


export default router;
