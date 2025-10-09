import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import db from "./database.js";
import bcrypt from "bcrypt";
import { getPlaceNameFromCoords } from "./geocodeHelper.js";
import { sendWhatsAppNotification } from "./twilioService.mjs";
import { generateOtp, validateOtp } from "./otpService.js";
import nodemailer from "nodemailer";
import { sendEmail } from "./emailService.js";
import createCheckoutSession from "./createCheckoutSession.js";
import impactAPI from "./impactAPI.js";
import collaborationRoutes from "./collaborationRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

//registering for payment
app.use("/api", createCheckoutSession);

// Register environmental impact API routes
app.use("/api", impactAPI);

//Collaboration routes
app.use("/api", collaborationRoutes);

// REGISTER endpoint
app.post("/api/register", async (req, res) => {
  const { name, type, email, password, contact, address } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (row) return res.json({ message: "Email already registered" });
    try {
      // Hash password before saving
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      db.run(
        "INSERT INTO users (name, type, email, password, contact, address) VALUES (?, ?, ?, ?, ?, ?)",
        [name, type, email, hashedPassword, contact, address],
        function (err) {
          if (err) return res.status(500).json({ message: "DB insert error" });
          res.json({ message: "Registration successful", userId: this.lastID });
        }
      );
    } catch (error) {
      console.error("Hashing error:", error);
      res.status(500).json({ message: "Error hashing password" });
    }
  });
});

// LOGIN endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!row) return res.json({ message: "Invalid credentials" });
    try {
      // Check if stored password is hashed or plain
      const isMatch = await bcrypt.compare(password, row.password);

      if (!isMatch) return res.json({ message: "Invalid credentials" });

      res.json({ message: "Login successful", user: row });
    } catch (error) {
      console.error("Compare error:", error);
      res.status(500).json({ message: "Error verifying password" });
    }
  });
});

// ADMIN LOGIN endpoint
app.post("/api/admin-login", (req, res) => {
  const { email, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE email = ? AND type = 'Admin'",
    [email],
    async (err, row) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!row) return res.json({ message: "Invalid admin credentials" });
      try {
        const isMatch = await bcrypt.compare(password, row.password);
        if (!isMatch) {
          return res.json({ message: "Invalid admin credentials" });
        }
        res.json({ message: "Admin login successful", user: row });
      } catch (error) {
        console.error("Compare error:", error);
        res.status(500).json({ message: "Error verifying password" });
      }
    }
  );
});

// Update user profile
app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const { name, email, contact, address, password } = req.body;

  const query = `
    UPDATE users
    SET name = COALESCE(?, name),
        email = COALESCE(?, email),
        contact = COALESCE(?, contact),
        address = COALESCE(?, address),
        password = COALESCE(?, password)
    WHERE id = ?
  `;

  db.run(
    query,
    [name, email, contact, address, password, userId],
    function (err) {
      if (err) {
        console.error("DB error updating user:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // fetch updated user and return
      db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
          console.error("DB fetch error:", err);
          return res.status(500).json({ message: "Database fetch error" });
        }
        res.json(row);
      });
    }
  );
});

app.post("/api/donate-food", (req, res) => {
  const {
    userId,
    donorName,
    contact,
    foodType,
    quantity,
    freshness,
    notes,
    image,
    locationLat,
    locationLng,
  } = req.body;

  // (Input validation omitted for brevity)

  const query = `
    INSERT INTO donations (
      userId,
      donorName,
      contact,
      foodType,
      quantity,
      freshness,
      notes,
      status,
      image,
      locationLat,
      locationLng
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Available', ?, ?, ?)
  `;

  db.run(
    query,
    [
      userId || null,
      donorName,
      contact,
      foodType,
      quantity,
      freshness,
      notes || "",
      image || null,
      locationLat,
      locationLng,
    ],
    async function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      // Construct notification message
      let locationText = "N/A";
      if (locationLat && locationLng) {
        locationText = `https://www.google.com/maps/search/?api=1&query=${locationLat},${locationLng}`;
      }

      const notificationMessage = `New Food Available 😋
        Food: ${foodType}
        Quantity: ${quantity}
        Freshness: ${freshness}
        Donor: ${donorName}
        Contact: ${contact}
        Location: ${locationText}`;

      // Change number to one that has joined your Twilio sandbox
      sendWhatsAppNotification("+919060268964", notificationMessage);

      res.json({
        message: "Food donation recorded successfully",
        donationId: this.lastID,
      });
    }
  );
});

// Helper: Convert UTC Date object to IST Date object
function toIST(date) {
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000); // add 5 hrs 30 mins
}

app.get("/api/donations", (req, res) => {
  const userId = req.query.userId;

  let query = `
    SELECT d.*,
      donor.name AS donorName,
      donor.contact AS donorContact,
      requester.name AS requesterName,
      requester.contact AS requesterContact
    FROM donations d
    LEFT JOIN users donor ON d.userId = donor.id
    LEFT JOIN users requester ON d.requesterId = requester.id
  `;

  const params = [];
  if (userId) {
    query += " WHERE d.userId = ?";
    params.push(userId);
  }
  query += " ORDER BY d.createdAt DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    // Add expiryTimeIST for frontend display
    rows.forEach((row) => {
      if (row.freshness) {
        const createdAtUTC = new Date(row.createdAt);
        const expiryTimeUTC = new Date(
          createdAtUTC.getTime() + row.freshness * 60 * 60 * 1000
        );
        row.expiryTimeIST = toIST(expiryTimeUTC).toISOString();
      }
    });

    res.json(rows);
  });
});

// Background task to expire donations whose expiry has passed
const expireOldDonations = () => {
  const nowUTC = new Date();

  console.log(`Current UTC time: ${nowUTC.toISOString()}`);

  db.all("SELECT * FROM donations", [], (err, rows) => {
    if (err) {
      console.error("Error fetching donations:", err);
      return;
    }

    rows.forEach((row) => {
      if (row.freshness) {
        const createdAtUTC = new Date(row.createdAt);
        const expiryTimeUTC = new Date(
          createdAtUTC.getTime() + row.freshness * 60 * 60 * 1000
        );
        console.log(
          `Donation ID ${
            row.id
          } - Donated At: ${createdAtUTC.toISOString()} - Expires At: ${expiryTimeUTC.toISOString()}`
        );
      }
    });
  });
  const query = `
  UPDATE donations
  SET status = 'Expired'
  WHERE status = 'Available'
    AND datetime(createdAt, '+' || freshness || ' hours') <= datetime('now')
  `;

  db.run(query, (err) => {
    if (err) console.error("Error expiring donations:", err);
    else console.log("Expired donations updated at", new Date().toISOString());
  });
};

// Run expiry check every 5 minutes
setInterval(expireOldDonations, 5 * 60 * 1000);

// Run once on server start to clean up old entries
expireOldDonations();

app.post("/api/request-food/:id", async (req, res) => {
  const donationId = req.params.id;
  const { requesterId, requesterLat, requesterLng, deliveryMethod } = req.body;
  const now = new Date().toISOString();
  const contextId = `donation-${donationId}`;
  const otp = deliveryMethod === "pickup" ? generateOtp() : null;

  // First, get the donation details to check coordinates
  db.get(
    "SELECT locationLat, locationLng FROM donations WHERE id = ? AND status = 'Available'",
    [donationId],
    async (err, donation) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (!donation)
        return res
          .status(404)
          .json({ message: "Donation not found or not available" });

      // Import the distance calculation function
      const { calculateDistance } = await import("./geocodeHelper.js");

      // Calculate distance between donator and requester
      const distance = calculateDistance(
        donation.locationLat,
        donation.locationLng,
        requesterLat,
        requesterLng
      );

      // Check if distance is within 50 KM
      if (distance > 50) {
        return res.status(400).json({
          message:
            "This donation is not available for you as it's more than 50 KM away from your location.",
          distance: distance.toFixed(2),
        });
      }

      const query = `
    UPDATE donations
    SET status = 'Requested',
        requesterId = ?,
        requesterLat = ?,
        requesterLng = ?,
        requestedAt = ?,
        deliveryMethod = ?,
        otp = ?
    WHERE id = ? AND status = 'Available'
    `;

      db.run(
        query,
        [
          requesterId,
          requesterLat || null,
          requesterLng || null,
          now,
          deliveryMethod || null,
          otp,
          donationId,
        ],
        async function (err) {
          if (err) return res.status(500).json({ message: "Database error" });
          // Fetch donation & user details for email
          db.get(
            `
        SELECT d.*, donor.email AS donorEmail, donor.name AS donorName, req.name AS requesterName, req.email AS requesterEmail
        FROM donations d
        LEFT JOIN users donor ON d.userId = donor.id
        LEFT JOIN users req ON d.requesterId = req.id
        WHERE d.id = ?
      `,
            [donationId],
            async (err, row) => {
              if (err || !row) return;
              // Compose emails
              if (deliveryMethod === "pickup" && otp) {
                const subject = "Feedaily In-person Pickup Confirmation";
                const requesterText = `
          Hello ${row.requesterName},
          Your OTP for in-person pickup of food "${row.foodType}" from donor ${row.donorName} is: ${otp}
          Show this OTP to the donor at the time of pickup.
          Details:
          Food: ${row.foodType}
          Quantity: ${row.quantity}
          Pickup location: ${row.locationLat},${row.locationLng}
          Thank you for helping reduce food waste!
          `;
                const donorText = `
          Hello ${row.donorName},
          Your food donation has been requested for in-person pickup by ${row.requesterName}.
          The requester will provide you OTP.
          Confirm the pickup by entering this code at Feedaily website to mark as delivered.
          Details:
          Food: ${row.foodType}
          Quantity: ${row.quantity}
          Pickup location: ${row.locationLat},${row.locationLng}
          Thank you for your generosity!
          `;
                if (row.requesterEmail)
                  await sendEmail(row.requesterEmail, subject, requesterText);
                if (row.donorEmail)
                  await sendEmail(row.donorEmail, subject, donorText);
              }
            }
          );
          res.json({
            message: "Request recorded. OTP sent for pickup.",
            requestedAt: now,
            distance: distance.toFixed(2) + " KM",
          });
        }
      );
    }
  );
});

// server.js
// Updated donation-stats endpoint (removing duplicate and fixing calculation)
app.get("/api/donation-stats", (req, res) => {
  const MEAL_KG = 0.4;
  const totalDonatedQuery = `SELECT SUM(CAST(quantity AS REAL)) AS totalDonated FROM donations WHERE quantity IS NOT NULL`;
  const totalTakenQuery = `SELECT SUM(CAST(quantity AS REAL)) AS totalTaken FROM donations WHERE status IN ('Requested', 'Delivered') AND quantity IS NOT NULL`;

  db.get(totalDonatedQuery, [], (err, donatedRow) => {
    if (err) return res.status(500).json({ message: "Database error" });
    db.get(totalTakenQuery, [], (err, takenRow) => {
      if (err) return res.status(500).json({ message: "Database error" });

      const totalDonated = Number(donatedRow.totalDonated) || 0;
      const totalTaken = Number(takenRow.totalTaken) || 0;
      const totalPeopleFed = Math.floor(totalTaken / MEAL_KG);

      console.log("Backend stats:", {
        totalDonated,
        totalTaken,
        totalPeopleFed,
      });

      res.json({
        totalDonated,
        totalTaken,
        totalPeopleFed,
      });
    });
  });
});

// Updated daily-donation-stats endpoint
app.get("/api/daily-donation-stats", (req, res) => {
  const MEAL_KG = 0.4;
  const query = `
    SELECT
      DATE(createdAt) as dateOnly,
      SUM(CAST(quantity AS REAL)) as totalDonated,
      SUM(CASE WHEN status IN ('Requested', 'Delivered') THEN CAST(quantity AS REAL) ELSE 0 END) as totalTaken
    FROM donations
    WHERE quantity IS NOT NULL
    GROUP BY DATE(createdAt)
    ORDER BY DATE(createdAt) ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("DB error", err);
      return res.status(500).json({ message: "Database error" });
    }

    const data = [["Date", "Donations (kg)", "Taken (kg)", "People Fed"]];
    rows.forEach((row) => {
      const donationKg = Number(row.totalDonated) || 0;
      const takenKg = Number(row.totalTaken) || 0;
      const peopleFed = Math.floor(takenKg / MEAL_KG);

      console.log(
        `Date: ${row.dateOnly}, Donated: ${donationKg}, Taken: ${takenKg}, People Fed: ${peopleFed}`
      );

      data.push([row.dateOnly, donationKg, takenKg, peopleFed]);
    });

    console.log("Sending data:", data);
    res.json(data);
  });
});

// server.js or your routes file
app.get("/api/sender-rankings", (req, res) => {
  db.all(
    `
    SELECT u.id, u.name, u.contact, u.email, SUM(d.quantity) as totalSent
    FROM donations d
    LEFT JOIN users u ON d.userId = u.id
    WHERE d.status = 'Requested'
    GROUP BY d.userId
    ORDER BY totalSent DESC
    LIMIT 20
  `,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(rows);
    }
  );
});

// Endpoint to get donations requested by a user
app.get("/api/donations/requested", (req, res) => {
  const requesterId = req.query.requesterId;
  if (!requesterId) {
    return res.status(400).json({ message: "Missing requesterId" });
  }

  const query = `
    SELECT d.*, u.name AS donorName, u.contact AS donorContact
    FROM donations d
    LEFT JOIN users u ON d.userId = u.id
    WHERE d.requesterId = ?
    ORDER BY d.requestedAt DESC
  `;

  db.all(query, [requesterId], (err, rows) => {
    if (err) {
      console.error("DB error fetching requested donations:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.setHeader("Content-Type", "application/json");
    res.json(rows);
  });
});

const ONE_WEEK_AGO = () => {
  const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

app.get("/api/sender-weekly-rankings", (req, res) => {
  db.all(
    `
    SELECT u.id, u.name, u.contact, u.email, SUM(d.quantity) as weeklyTotalSent
    FROM donations d
    LEFT JOIN users u ON d.userId = u.id
    WHERE d.status IN ('Requested', 'Delivered')
      AND d.requestedAt >= datetime('now', '-7 days')
    GROUP BY d.userId
    ORDER BY weeklyTotalSent DESC
    LIMIT 20
  `,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(rows);
    }
  );
});

app.get("/api/deliveries", (req, res) => {
  const { donorId, receiverId, status } = req.query;
  let query = `
    SELECT d.*,
           donor.name as donorName,
           receiver.name as receiverName
    FROM deliveries d
    LEFT JOIN users donor ON d.donorId = donor.id
    LEFT JOIN users receiver ON d.receiverId = receiver.id
    WHERE 1=1
  `;
  let params = [];

  if (donorId) {
    query += " AND d.donorId = ?";
    params.push(donorId);
  }
  if (receiverId) {
    query += " AND d.receiverId = ?";
    params.push(receiverId);
  }
  if (status) {
    query += " AND d.status = ?";
    params.push(status);
  }

  query += " ORDER BY d.createdAt DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("DB error fetching deliveries:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
});
app.put("/api/deliveries/:id", (req, res) => {
  const deliveryId = req.params.id;
  const { status, deliveryPerson, estimatedDeliveryDate, deliveredAt, notes } =
    req.body;

  const query = `
    UPDATE deliveries SET
      status = COALESCE(?, status),
      deliveryPerson = COALESCE(?, deliveryPerson),
      estimatedDeliveryDate = COALESCE(?, estimatedDeliveryDate),
      deliveredAt = COALESCE(?, deliveredAt),
      notes = COALESCE(?, notes)
    WHERE id = ?
  `;

  db.run(
    query,
    [
      status,
      deliveryPerson,
      estimatedDeliveryDate,
      deliveredAt,
      notes,
      deliveryId,
    ],
    function (err) {
      if (err) {
        console.error("DB error updating delivery:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      res.json({ message: "Delivery updated" });
    }
  );
});

app.post("/api/confirm-pickup", (req, res) => {
  const { donationId, otp } = req.body;

  db.get("SELECT otp FROM donations WHERE id = ?", [donationId], (err, row) => {
    if (err || !row || !row.otp)
      return res.status(400).json({ message: "OTP not found!" });

    if (otp.trim() === row.otp.trim()) {
      db.run(
        "UPDATE donations SET status = 'Delivered', deliveredAt = ?, otp = NULL WHERE id = ?",
        [new Date().toISOString(), donationId],
        (err) => {
          if (err)
            return res.status(500).json({ message: "Error updating status." });
          // Fetch full delivery info
          db.get(
            `
            SELECT d.*, 
                   donor.name AS donorName, donor.contact AS donorContact, donor.email AS donorEmail,
                   receiver.name AS receiverName, receiver.contact AS receiverContact, receiver.email AS receiverEmail
            FROM donations d
            LEFT JOIN users donor ON d.userId = donor.id
            LEFT JOIN users receiver ON d.requesterId = receiver.id
            WHERE d.id = ?;
          `,
            [donationId],
            async (err, deliveryDetails) => {
              if (err || !deliveryDetails) {
                return res.json({
                  message: "Pickup confirmed but details unavailable.",
                });
              }

              // Internal backend POST: send details (do not expose to user)
              try {
                await fetch("http://localhost:5000/api/record-delivery", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(deliveryDetails),
                });
              } catch (e) {
                console.error("Failed to send delivery details internally:", e);
              }

              res.json({
                message: "Pickup confirmed. Status is now Delivered.",
              });
            }
          );
        }
      );
    } else {
      res.status(400).json({ message: "Invalid OTP." });
    }
  });
});

app.put("/api/expire-donation/:id", (req, res) => {
  const donationId = req.params.id;
  const { reason } = req.body;

  // You can ignore 'reason' for now or log it elsewhere if needed

  const now = new Date().toISOString();

  const query = `
    UPDATE donations
    SET status = 'Expired',
        expiredAt = ?
    WHERE id = ? AND status = 'Available'
  `;

  db.run(query, [now, donationId], function (err) {
    if (err) {
      console.error("DB error expiring donation:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ message: "Donation not found or not available" });
    }
    res.json({ message: "Donation expired successfully" });
  });
});

//add a column only if it doesn't exist (SQLite)
function addColumnIfNotExists(table, column, type) {
  db.all(`PRAGMA table_info(${table});`, [], (err, rows) => {
    if (err) return console.error("PRAGMA error:", err);
    const has = rows.some((r) => r.name === column);
    if (!has) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`, (e) => {
        if (e) console.error(`Failed to add ${column}:`, e.message);
        else console.log(`Column ${column} added to ${table}`);
      });
    }
  });
}
//columns for password reset flow
addColumnIfNotExists("users", "resetOtp", "TEXT");
addColumnIfNotExists("users", "resetOtpExpires", "DATETIME");

// Forgot password - request OTP
app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  db.get(
    "SELECT id, name, email FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (err) return res.status(500).json({ message: "Database error" });

      // Always respond 200 to avoid email enumeration
      const safeOk = () =>
        res.json({ message: "If the email exists, we've sent a code." });

      if (!user) return safeOk();

      const otp = generateOtp(); // 6 digits
      const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

      db.run(
        "UPDATE users SET resetOtp = ?, resetOtpExpires = ? WHERE id = ?",
        [otp, expires, user.id],
        async (updErr) => {
          if (updErr)
            return res.status(500).json({ message: "Database error" });

          // send the OTP via email
          const subject = "Feedaily password reset code";
          const text = `Hello ${user.name || "there"},

Use this one-time code to reset your password: ${otp}
It expires in 15 minutes.

If you didn't request this, you can ignore this email.`;

          try {
            await sendEmail(user.email, subject, text);
          } catch (e) {
            console.error("sendEmail error:", e);
            // still return safe OK to not leak info
          }
          return safeOk();
        }
      );
    }
  );
});

// Reset password with email + OTP + new password
app.post("/api/reset-password", (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "email, otp and newPassword are required" });
  }

  db.get(
    "SELECT id, resetOtp, resetOtpExpires FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (!user || !user.resetOtp) {
        return res.status(400).json({ message: "Invalid code or email." });
      }

      const now = new Date();
      const exp = user.resetOtpExpires ? new Date(user.resetOtpExpires) : null;
      const isExpired = !exp || now > exp;

      if (isExpired || String(user.resetOtp).trim() !== String(otp).trim()) {
        return res.status(400).json({ message: "Invalid or expired code." });
      }

      // update password and clear reset fields
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      db.run(
        "UPDATE users SET password = ?, resetOtp = NULL, resetOtpExpires = NULL WHERE id = ?",
        [hashedNewPassword, user.id],
        (uErr) => {
          if (uErr) return res.status(500).json({ message: "Database error" });
          return res.json({ message: "Password updated successfully." });
        }
      );
    }
  );
});

// --- 🔐 TEMP ADMIN SETUP --- //
const TEMP_ADMIN_EMAIL = "admin@feedaily.com";
const TEMP_ADMIN_PASSWORD = "admin123";

function createTempAdminIfNoneExists() {
  db.get(
    "SELECT * FROM users WHERE type = 'Admin' LIMIT 1",
    [],
    async (err, row) => {
      if (err) {
        console.error("Error checking admin existence:", err);
        return;
      }
      if (!row) {
        try {
          const hashedPassword = await bcrypt.hash(TEMP_ADMIN_PASSWORD, 10);
          db.run(
            "INSERT INTO users (name, type, email, password) VALUES (?, 'Admin', ?, ?)",
            ["Admin", TEMP_ADMIN_EMAIL, hashedPassword],
            function (err) {
              if (err) {
                console.error("Error creating temp admin:", err);
              } else {
                console.log(`✅ Temporary admin created:
Email: ${TEMP_ADMIN_EMAIL}
Password: ${TEMP_ADMIN_PASSWORD} (hashed in DB)`);
              }
            }
          );
        } catch (hashErr) {
          console.error("Error hashing temp admin password:", hashErr);
        }
      } else {
        console.log("✅ Admin user exists, skipping temporary admin creation.");
      }
    }
  );
}

createTempAdminIfNoneExists();

// ======================== MERCHANDISE ENDPOINTS ========================

// Create merchandise_orders table if not exists
db.run(
  `
  CREATE TABLE IF NOT EXISTS merchandise_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    orderData TEXT NOT NULL,
    shippingAddress TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    paymentStatus TEXT DEFAULT 'pending',
    orderStatus TEXT DEFAULT 'processing',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating merchandise_orders table:", err);
    } else {
      console.log("✅ merchandise_orders table ready");
    }
  }
);

// Create a merchandise order
app.post("/api/merchandise/orders", (req, res) => {
  const { userId, orderData, shippingAddress, totalAmount } = req.body;

  if (!userId || !orderData || !shippingAddress || !totalAmount) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO merchandise_orders (userId, orderData, shippingAddress, totalAmount, paymentStatus, orderStatus)
    VALUES (?, ?, ?, ?, 'completed', 'processing')
  `;

  db.run(
    query,
    [
      userId,
      JSON.stringify(orderData),
      JSON.stringify(shippingAddress),
      totalAmount,
    ],
    function (err) {
      if (err) {
        console.error("Error creating merchandise order:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({
        message: "Order placed successfully",
        orderId: this.lastID,
      });
    }
  );
});

// Get user's merchandise orders
app.get("/api/merchandise/orders/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT * FROM merchandise_orders 
    WHERE userId = ? 
    ORDER BY createdAt DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Parse JSON strings back to objects
    const orders = rows.map((row) => ({
      ...row,
      orderData: JSON.parse(row.orderData),
      shippingAddress: JSON.parse(row.shippingAddress),
    }));

    res.json(orders);
  });
});

// Get all merchandise orders (admin)
app.get("/api/merchandise/orders", (req, res) => {
  const query = `
    SELECT mo.*, u.name as userName, u.email as userEmail
    FROM merchandise_orders mo
    JOIN users u ON mo.userId = u.id
    ORDER BY mo.createdAt DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching all orders:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const orders = rows.map((row) => ({
      ...row,
      orderData: JSON.parse(row.orderData),
      shippingAddress: JSON.parse(row.shippingAddress),
    }));

    res.json(orders);
  });
});

// Update order status
app.put("/api/merchandise/orders/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const query = `
    UPDATE merchandise_orders
    SET orderStatus = COALESCE(?, orderStatus),
        paymentStatus = COALESCE(?, paymentStatus)
    WHERE id = ?
  `;

  db.run(query, [orderStatus, paymentStatus, orderId], function (err) {
    if (err) {
      console.error("Error updating order:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order updated successfully" });
  });
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
