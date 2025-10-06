import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./users.db");

// Sample data
const sampleUsers = [
  {
    name: "Alice Johnson",
    type: "Donor",
    email: "alice@example.com",
    password: "password123",
    contact: "+91-9876543210",
    address: "Bangalore, Karnataka",
  },
  {
    name: "Bob Smith",
    type: "Receiver",
    email: "bob@example.com",
    password: "password123",
    contact: "+91-9876543211",
    address: "Mumbai, Maharashtra",
  },
  {
    name: "Carol Wilson",
    type: "Donor",
    email: "carol@example.com",
    password: "password123",
    contact: "+91-9876543212",
    address: "Delhi, NCR",
  },
  {
    name: "David Brown",
    type: "Receiver",
    email: "david@example.com",
    password: "password123",
    contact: "+91-9876543213",
    address: "Chennai, Tamil Nadu",
  },
  {
    name: "Emma Davis",
    type: "Donor",
    email: "emma@example.com",
    password: "password123",
    contact: "+91-9876543214",
    address: "Pune, Maharashtra",
  },
  {
    name: "Frank Miller",
    type: "Restaurant",
    email: "frank@restaurant.com",
    password: "password123",
    contact: "+91-9876543215",
    address: "Hyderabad, Telangana",
  },
  {
    name: "Grace Lee",
    type: "NGO",
    email: "grace@ngo.org",
    password: "password123",
    contact: "+91-9876543216",
    address: "Kolkata, West Bengal",
  },
  {
    name: "Henry Wilson",
    type: "Donor",
    email: "henry@example.com",
    password: "password123",
    contact: "+91-9876543217",
    address: "Ahmedabad, Gujarat",
  },
  {
    name: "Ivy Chen",
    type: "Receiver",
    email: "ivy@example.com",
    password: "password123",
    contact: "+91-9876543218",
    address: "Jaipur, Rajasthan",
  },
  {
    name: "Jack Taylor",
    type: "Donor",
    email: "jack@example.com",
    password: "password123",
    contact: "+91-9876543219",
    address: "Lucknow, Uttar Pradesh",
  },
];

const foodTypes = [
  "Rice",
  "Dal",
  "Roti/Chapati",
  "Vegetables",
  "Fruit",
  "Cooked Meals",
  "Bread",
  "Pasta",
  "Soup",
  "Curry",
  "Biryani",
  "Pulao",
  "Samosas",
  "Pizza",
  "Sandwiches",
  "Salad",
  "Sweets",
  "Snacks",
  "Noodles",
  "Fried Rice",
];

const locations = [
  { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
  { lat: 19.076, lng: 72.8777, name: "Mumbai" },
  { lat: 28.7041, lng: 77.1025, name: "Delhi" },
  { lat: 13.0827, lng: 80.2707, name: "Chennai" },
  { lat: 18.5204, lng: 73.8567, name: "Pune" },
  { lat: 17.385, lng: 78.4867, name: "Hyderabad" },
  { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
  { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
  { lat: 26.9124, lng: 75.7873, name: "Jaipur" },
  { lat: 26.8467, lng: 80.9462, name: "Lucknow" },
];

// Generate dates over the past 60 days
function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// Generate realistic donation data
function generateDonations() {
  const donations = [];
  const statusOptions = ["Available", "Requested", "Delivered", "Expired"];

  // Generate donations for the past 60 days
  for (let day = 0; day < 60; day++) {
    const donationsPerDay = Math.floor(Math.random() * 8) + 3; // 3-10 donations per day

    for (let i = 0; i < donationsPerDay; i++) {
      const userId = Math.floor(Math.random() * 10) + 1; // Random user ID 1-10
      const requesterId =
        Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null; // 70% chance of being requested
      const location = locations[Math.floor(Math.random() * locations.length)];
      const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
      const quantity = (Math.random() * 15 + 0.5).toFixed(1); // 0.5 to 15.5 kg
      const freshness = Math.floor(Math.random() * 48) + 2; // 2-50 hours

      let status = "Available";
      let requestedAt = null;
      let deliveredAt = null;

      // Determine status based on age and probability
      if (requesterId) {
        if (Math.random() > 0.2) {
          // 80% of requested items are delivered
          status = "Delivered";
          requestedAt = getRandomDate(day - Math.random() * 2); // Requested within 2 days of creation
          deliveredAt = new Date(
            new Date(requestedAt).getTime() +
              Math.random() * 24 * 60 * 60 * 1000
          ).toISOString(); // Delivered within 24 hours of request
        } else {
          status = "Requested";
          requestedAt = getRandomDate(day - Math.random() * 2);
        }
      } else if (day > 7 && Math.random() > 0.7) {
        // 30% of old unmatched donations expire
        status = "Expired";
      }

      const donation = {
        userId: userId,
        donorName: sampleUsers[userId - 1].name,
        contact: sampleUsers[userId - 1].contact,
        foodType: foodType,
        quantity: quantity,
        freshness: freshness,
        notes:
          Math.random() > 0.5
            ? `Fresh ${foodType.toLowerCase()} from home kitchen`
            : "",
        status: status,
        locationLat: location.lat + (Math.random() - 0.5) * 0.01, // Small variation
        locationLng: location.lng + (Math.random() - 0.5) * 0.01,
        locationName: location.name,
        createdAt: getRandomDate(day),
        requesterId: requesterId,
        requestedAt: requestedAt,
        deliveredAt: deliveredAt,
        deliveryMethod: requesterId
          ? Math.random() > 0.5
            ? "pickup"
            : "delivery"
          : null,
      };

      donations.push(donation);
    }
  }

  return donations;
}

// Populate database
async function populateDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log("🚀 Starting database population...");

      // Clear existing data
      db.run("DELETE FROM donations", (err) => {
        if (err) {
          console.error("Error clearing donations:", err);
          return reject(err);
        }
        console.log("✅ Cleared existing donations");
      });

      db.run('DELETE FROM users WHERE email NOT LIKE "%admin%"', (err) => {
        if (err) {
          console.error("Error clearing users:", err);
          return reject(err);
        }
        console.log("✅ Cleared existing users (except admin)");
      });

      // Insert users
      const userStmt = db.prepare(`
        INSERT INTO users (name, type, email, password, contact, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleUsers.forEach((user) => {
        userStmt.run([
          user.name,
          user.type,
          user.email,
          user.password,
          user.contact,
          user.address,
        ]);
      });
      userStmt.finalize();
      console.log("✅ Inserted sample users");

      // Generate and insert donations
      const donations = generateDonations();
      const donationStmt = db.prepare(`
        INSERT INTO donations (
          userId, donorName, contact, foodType, quantity, freshness, notes,
          status, locationLat, locationLng, locationName, createdAt,
          requesterId, requestedAt, deliveredAt, deliveryMethod
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      donations.forEach((donation) => {
        donationStmt.run([
          donation.userId,
          donation.donorName,
          donation.contact,
          donation.foodType,
          donation.quantity,
          donation.freshness,
          donation.notes,
          donation.status,
          donation.locationLat,
          donation.locationLng,
          donation.locationName,
          donation.createdAt,
          donation.requesterId,
          donation.requestedAt,
          donation.deliveredAt,
          donation.deliveryMethod,
        ]);
      });
      donationStmt.finalize();
      console.log(`✅ Inserted ${donations.length} sample donations`);

      // Calculate and display statistics
      db.get(
        `
        SELECT 
          COUNT(*) as totalDonations,
          SUM(CAST(quantity AS REAL)) as totalKg,
          COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as delivered,
          SUM(CASE WHEN status = 'Delivered' THEN CAST(quantity AS REAL) ELSE 0 END) as deliveredKg
        FROM donations
      `,
        (err, stats) => {
          if (err) {
            console.error("Error calculating stats:", err);
            return reject(err);
          }

          const peopleFed = Math.floor(stats.deliveredKg / 0.4); // 0.4kg per meal

          console.log("\n📊 DATABASE STATISTICS:");
          console.log(`📦 Total Donations: ${stats.totalDonations}`);
          console.log(`⚖️  Total Food: ${stats.totalKg?.toFixed(1)} kg`);
          console.log(`✅ Delivered: ${stats.delivered} donations`);
          console.log(
            `🍽️  Food Distributed: ${stats.deliveredKg?.toFixed(1)} kg`
          );
          console.log(`👥 People Fed: ${peopleFed}`);
          console.log("\n🎉 Database populated successfully!");
          console.log(
            "💡 You can now view impressive statistics on your frontend!"
          );

          resolve();
        }
      );
    });
  });
}

// Run the population script
populateDatabase()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error populating database:", err);
    db.close();
    process.exit(1);
  });
