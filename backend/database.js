import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    email TEXT UNIQUE,
    password TEXT,
    contact TEXT,
    address TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    donorName TEXT,
    contact TEXT,
    foodType TEXT,
    quantity TEXT,
    freshness INTEGER,
    notes TEXT,
    status TEXT DEFAULT 'Available',
    image TEXT,
    locationLat REAL,
    locationLng REAL,
    locationName TEXT,      
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requesterId INTEGER,   
    requesterLat REAL,
    requesterLng REAL,
    requestedAt DATETIME,
    deliveryMethod TEXT,
    otp TEXT,
    deliveredAt DATETIME,
    emailSent INTEGER DEFAULT 0,
    expiryReason TEXT,
    expiredAt DATETIME
    )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donationId INTEGER NOT NULL,
    donorId INTEGER NOT NULL,
    receiverId INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- e.g. pending, in-transit, delivered
    deliveryPerson TEXT,
    estimatedDeliveryDate DATETIME,
    deliveredAt DATETIME,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(donationId) REFERENCES donations(id),
    FOREIGN KEY(donorId) REFERENCES users(id),
    FOREIGN KEY(receiverId) REFERENCES users(id)
  )
`);

// Ensure collaborations table exists at server start
db.run(
  `CREATE TABLE IF NOT EXISTS collaborations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    formData TEXT,
    filePath TEXT,
    acceptedByAdmin TEXT DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  (err) => {
    if (err) console.error("Failed to create collaborations table:", err);
    else console.log("Collaborations table ready");
  }
);

// Ensure pro_subscriptions table exists at server start
db.run(
  `CREATE TABLE IF NOT EXISTS pro_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    contact TEXT NOT NULL,
    subscriptionType TEXT DEFAULT 'whatsapp_pro',
    status TEXT DEFAULT 'active',
    stripeSessionId TEXT,
    stripeCustomerId TEXT,
    subscriptionStartDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    subscriptionEndDate DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`,
  (err) => {
    if (err) console.error("Failed to create pro_subscriptions table:", err);
    else console.log("Pro subscriptions table ready");
  }
);


// db.serialize(() => {
//   db.run(`DROP TABLE IF EXISTS users;`);
//   db.run(`DROP TABLE IF EXISTS donations;`);
//   db.run(`DROP TABLE IF EXISTS deliveries;`);
//   console.log('Both tables dropped ');
//   db.close();});

export default db;