import express from "express";
import cors from "cors";
import db from "./database.js";
import { getPlaceNameFromCoords } from "./geocodeHelper.js";
import { sendWhatsAppNotification } from './twilioService.mjs';
import { generateOtp,validateOtp } from './otpService.js'; 
import nodemailer from "nodemailer";
import { sendEmail } from './emailService.js';
import createCheckoutSession from "./createCheckoutSession.js";

const app = express();
app.use(cors());
app.use(express.json());

//registering for payment 
app.use("/api",createCheckoutSession);

// REGISTER endpoint
app.post("/api/register", (req, res) => {
  const { name, type, email, password, contact, address } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (row) return res.json({ message: "Email already registered" });

    db.run(
      "INSERT INTO users (name, type, email, password, contact, address) VALUES (?, ?, ?, ?, ?, ?)",
      [name, type, email, password, contact, address],
      function (err) {
        if (err) return res.status(500).json({ message: "DB insert error" });
        res.json({ message: "Registration successful", userId: this.lastID });
      }
    );
  });
});


// LOGIN endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, row) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!row) return res.json({ message: "Invalid credentials" });
      res.json({ message: "Login successful", user: row });
    }
  );
});

app.post('/api/donate-food', (req, res) => {
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
    locationLng
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
      notes || '',
      image || null,
      locationLat,
      locationLng
    ],
    async function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      // Construct notification message
      let locationText = 'N/A';
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
        // sendWhatsAppNotification('+919060268964', notificationMessage);

      res.json({ message: 'Food donation recorded successfully', donationId: this.lastID });
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
    rows.forEach(row => {
      if (row.freshness) {
        const createdAtUTC = new Date(row.createdAt);
        const expiryTimeUTC = new Date(createdAtUTC.getTime() + row.freshness * 60 * 60 * 1000);
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
      console.error('Error fetching donations:', err);
      return;
    }

    rows.forEach(row => {
      if (row.freshness) {
        const createdAtUTC = new Date(row.createdAt);
        const expiryTimeUTC = new Date(createdAtUTC.getTime() + row.freshness * 60 * 60 * 1000);
        console.log(`Donation ID ${row.id} - Donated At: ${createdAtUTC.toISOString()} - Expires At: ${expiryTimeUTC.toISOString()}`);
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
    if (err) console.error('Error expiring donations:', err);
    else console.log('Expired donations updated at', new Date().toISOString());
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
  const otp = (deliveryMethod === "pickup") ? generateOtp() : null;

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

  db.run(query, [requesterId, requesterLat || null, requesterLng || null, now, deliveryMethod || null, otp, donationId], async function(err) {
    if (err) return res.status(500).json({ message: "Database error" });
    // Fetch donation & user details for email
    db.get(`
      SELECT d.*, donor.email AS donorEmail, donor.name AS donorName, req.name AS requesterName, req.email AS requesterEmail
      FROM donations d
      LEFT JOIN users donor ON d.userId = donor.id
      LEFT JOIN users req ON d.requesterId = req.id
      WHERE d.id = ?
    `, [donationId], async (err, row) => {
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
        if (row.requesterEmail) await sendEmail(row.requesterEmail, subject, requesterText);
        if (row.donorEmail) await sendEmail(row.donorEmail, subject, donorText);
      }
    });
    res.json({ message: "Request recorded. OTP sent for pickup.", requestedAt: now });
  });
});



// server.js
app.get('/api/donation-stats', (req, res) => {
  const MEAL_KG = 0.4;
  const totalDonatedQuery = `SELECT SUM(quantity) AS totalDonated FROM donations`;
  const totalTakenQuery = `SELECT SUM(quantity) AS totalTaken FROM donations WHERE status = 'Requested'`;

  db.get(totalDonatedQuery, [], (err, donatedRow) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    db.get(totalTakenQuery, [], (err, takenRow) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      const totalDonated = Number(donatedRow.totalDonated) || 0;
      const totalTaken = Number(takenRow.totalTaken) || 0;
      const totalPeopleFed = Math.floor(totalDonated / MEAL_KG);

      res.json({
        totalDonated,
        totalTaken,
        totalPeopleFed
      });
    });
  });
});


// server.js
// Updated donation-stats endpoint
app.get('/api/donation-stats', (req, res) => {
  const MEAL_KG = 0.4;
  const totalDonatedQuery = `SELECT SUM(CAST(quantity AS REAL)) AS totalDonated FROM donations WHERE quantity IS NOT NULL`;
  const totalTakenQuery = `SELECT SUM(CAST(quantity AS REAL)) AS totalTaken FROM donations WHERE status = 'Requested' AND quantity IS NOT NULL`;
  
  db.get(totalDonatedQuery, [], (err, donatedRow) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    db.get(totalTakenQuery, [], (err, takenRow) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      
      const totalDonated = Number(donatedRow.totalDonated) || 0;
      const totalTaken = Number(takenRow.totalTaken) || 0;
      const totalPeopleFed = Math.floor(totalTaken / MEAL_KG);
      
      console.log('Backend stats:', { totalDonated, totalTaken, totalPeopleFed });
      
      res.json({
        totalDonated,
        totalTaken,
        totalPeopleFed
      });
    });
  });
});

// Updated daily-donation-stats endpoint
app.get('/api/daily-donation-stats', (req, res) => {
  const MEAL_KG = 0.4;
  const query = `
    SELECT
      DATE(createdAt) as dateOnly,
      SUM(CAST(quantity AS REAL)) as totalDonated,
      SUM(CASE WHEN status = 'Requested' THEN CAST(quantity AS REAL) ELSE 0 END) as totalTaken
    FROM donations
    WHERE quantity IS NOT NULL
    GROUP BY DATE(createdAt)
    ORDER BY DATE(createdAt) ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('DB error', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    const data = [['Date', 'Donations (kg)', 'Taken (kg)', 'People Fed']];
    rows.forEach(row => {
      const donationKg = Number(row.totalDonated) || 0;
      const takenKg = Number(row.totalTaken) || 0;
      const peopleFed = Math.floor(takenKg / MEAL_KG);
      
      console.log(`Date: ${row.dateOnly}, Donated: ${donationKg}, Taken: ${takenKg}, People Fed: ${peopleFed}`);
      
      data.push([row.dateOnly, donationKg, takenKg, peopleFed]);
    });
    
    console.log('Sending data:', data);
    res.json(data);
  });
});

// server.js or your routes file

app.get('/api/sender-rankings', (req, res) => {
  db.all(`
    SELECT u.id, u.name, u.contact, u.email, SUM(d.quantity) as totalSent
    FROM donations d
    LEFT JOIN users u ON d.userId = u.id
    WHERE d.status = 'Requested'
    GROUP BY d.userId
    ORDER BY totalSent DESC
    LIMIT 20
  `, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

// Endpoint to get donations requested by a user
app.get('/api/donations/requested', (req, res) => {
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
    res.setHeader('Content-Type', 'application/json');
    res.json(rows);
  });
});

const ONE_WEEK_AGO = () => {
  const d = new Date(Date.now() - 7*24*60*60*1000);
  return d.toISOString();
};

app.get('/api/sender-weekly-rankings', (req, res) => {
  db.all(`
    SELECT u.id, u.name, u.contact, u.email, SUM(d.quantity) as weeklyTotalSent
    FROM donations d
    LEFT JOIN users u ON d.userId = u.id
    WHERE d.status IN ('Requested', 'Delivered')
      AND d.requestedAt >= datetime('now', '-7 days')
    GROUP BY d.userId
    ORDER BY weeklyTotalSent DESC
    LIMIT 20
  `, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});



app.get('/api/deliveries', (req, res) => {
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
app.put('/api/deliveries/:id', (req, res) => {
  const deliveryId = req.params.id;
  const { status, deliveryPerson, estimatedDeliveryDate, deliveredAt, notes } = req.body;

  const query = `
    UPDATE deliveries SET
      status = COALESCE(?, status),
      deliveryPerson = COALESCE(?, deliveryPerson),
      estimatedDeliveryDate = COALESCE(?, estimatedDeliveryDate),
      deliveredAt = COALESCE(?, deliveredAt),
      notes = COALESCE(?, notes)
    WHERE id = ?
  `;

  db.run(query, [status, deliveryPerson, estimatedDeliveryDate, deliveredAt, notes, deliveryId], function(err) {
    if (err) {
      console.error("DB error updating delivery:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    res.json({ message: "Delivery updated" });
  });
});

app.post("/api/confirm-pickup", (req, res) => {
  const { donationId, otp } = req.body;

  db.get("SELECT otp FROM donations WHERE id = ?", [donationId], (err, row) => {
    if (err || !row || !row.otp) return res.status(400).json({ message: "OTP not found!" });

    // Use trim and strict compare for safety:
    if (otp.trim() === row.otp.trim()) {
      db.run(
        "UPDATE donations SET status = 'Delivered', deliveredAt = ?, otp = NULL WHERE id = ?",
        [new Date().toISOString(), donationId],
        (err) => {
          if (err) return res.status(500).json({ message: "Error updating status." });
          res.json({ message: "Pickup confirmed. Status is now Delivered." });
        }
      );
    } else {
      res.status(400).json({ message: "Invalid OTP." });
    }
  });
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
