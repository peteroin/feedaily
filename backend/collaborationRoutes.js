// collaborationRoutes.js
import express from "express";
import db from "./database.js";

const router = express.Router();

// POST /api/collaborate
router.post("/collaborate", async (req, res) => {
  try {
    const { type, file: base64File } = req.body;

    if (!type) return res.status(400).json({ message: "Form type is required." });

    // Keep all form fields except 'file'
    const formFields = { ...req.body };
    delete formFields.file;

    // Insert into DB (store base64 in filePath column or create fileBase64 column)
    db.run(
      `INSERT INTO collaborations (type, formData, filePath, acceptedByAdmin)
       VALUES (?, ?, ?, NULL)`,
      [type, JSON.stringify(formFields), base64File || null],
      function (err) {
        if (err) {
          console.error("DB insert error:", err);
          return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Collaboration request submitted!", id: this.lastID });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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
