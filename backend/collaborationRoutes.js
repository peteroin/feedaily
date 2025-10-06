// collaborationRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import db from "./database.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/collaborations/"); // folder to store files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST /api/collaborate
router.post("/collaborate", upload.single("file"), (req, res) => {
  const { type } = req.body; // 'ngo' or 'event'
  const filePath = req.file ? `/uploads/collaborations/${req.file.filename}` : null;

  if (!type) {
    return res.status(400).json({ message: "Form type is required." });
  }

  const formFields = { ...req.body };
  delete formFields.file; // remove file if accidentally included

  db.run(
    `INSERT INTO collaborations (type, formData, filePath, acceptedByAdmin)
     VALUES (?, ?, ?, NULL)`,
    [type, JSON.stringify(formFields), filePath],
    function (err) {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Collaboration request submitted!", id: this.lastID });
    }
  );
});


// GET /api/collaborations
router.get("/collaborations", (req, res) => {
  db.all(`SELECT * FROM collaborations ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) {
      console.error("DB fetch error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
});

// PUT /api/collaborations/:id/status
router.put("/collaborations/:id/status", (req, res) => {
  const { id } = req.params;
  const { acceptedByAdmin } = req.body;

  if (!["Accepted", "Rejected"].includes(acceptedByAdmin)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  db.run(
    `UPDATE collaborations SET acceptedByAdmin = ? WHERE id = ?`,
    [acceptedByAdmin, id],
    function (err) {
      if (err) {
        console.error("DB update error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Collaboration not found" });
      }
      res.json({ message: "Status updated successfully" });
    }
  );
});

export default router;
