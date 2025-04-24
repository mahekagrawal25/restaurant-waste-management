const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticateToken = require("./middleware/authMiddleware");
const pool = require("./db");  



require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.json());



app.use(express.static('frontend'));



// ✅ Protected Route: Fetch Dashboard Stats
app.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    const [waste] = await pool.query("SELECT COUNT(*) AS totalWaste FROM waste_entries");
    const [donations] = await pool.query("SELECT COUNT(*) AS totalDonations FROM food_donations");
    const [collections] = await pool.query("SELECT COUNT(*) AS totalCollections FROM waste_collection");

    res.json({
      totalWaste: waste[0].totalWaste,
      totalDonations: donations[0].totalDonations,
      totalCollections: collections[0].totalCollections,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});


app.get("/api/recent-activities", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [waste] = await pool.query(
      "SELECT 'Waste' AS type, description, created_at AS date FROM waste_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const [donations] = await pool.query(
      "SELECT 'Donation' AS type, description, created_at AS date FROM food_donations WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const activities = [...waste, ...donations].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ message: "Error fetching activities" });
  }
});



// ✅ Protected Route: Add Waste Entry
app.post("/api/waste/add", authenticateToken, async (req, res) => {
  const { description, category, quantity, image_url } = req.body;
  const userId = req.user.id;

  if (!description || !category || !quantity) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO waste_entries (user_id, description, category, quantity, image_url) VALUES (?, ?, ?, ?, ?)",
      [userId, description, category, quantity, image_url || null]
    );

    res.status(201).json({ message: "Waste entry added successfully." });
  } catch (error) {
    console.error("Error adding waste entry:", error);
    res.status(500).json({ message: "Failed to add waste entry." });
  }
});








// Route to get all waste entries for the logged-in user
app.get('/api/waste/entries', authenticateToken, async (req, res) => {
  try {
      // Assuming you have a method to get waste entries based on the user id
      const [wasteEntries] = await pool.query(
        "SELECT * FROM waste_entries WHERE user_id = ? ORDER BY created_at DESC",
        [req.user.id]
      );
      res.json({ entries: wasteEntries });
      
      res.json({ entries: wasteEntries });
  } catch (error) {
      console.error('Error fetching waste entries:', error);
      res.status(500).json({ message: 'Error fetching waste entries.' });
  }
});

// Route to request waste collection
app.post('/api/waste/request-collection', authenticateToken, async (req, res) => {
  const { waste_entry_id, description } = req.body;

  if (!waste_entry_id || !description) {
      return res.status(400).json({ message: 'Waste entry ID and description are required.' });
  }

  try {
      // You can add logic here to update the waste entry status or create a new collection request
      const wasteEntry = await WasteEntry.findById(waste_entry_id);
      if (!wasteEntry) {
          return res.status(404).json({ message: 'Waste entry not found.' });
      }

      // Update the waste entry status or create a collection request
      wasteEntry.status = 'Pending Collection';  // Example status change
      await wasteEntry.save();

      // Optionally, you could send an email, push notification, etc.
      res.json({ message: 'Collection requested successfully.' });
  } catch (error) {
      console.error('Error requesting waste collection:', error);
      res.status(500).json({ message: 'Error requesting waste collection.' });
  }
});


















// ✅ Use Auth Routes
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = pool;  // ✅ Exporting the pool


