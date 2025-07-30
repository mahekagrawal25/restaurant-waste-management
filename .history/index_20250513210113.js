const express = require("express");
const cors = require("cors"); //f
const bodyParser = require("body-parser"); //json requests
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





// ... your existing code

// ✅ Request Waste Collection
app.post("/api/request-collection", authenticateToken, async (req, res) => {
  const { waste_entry_id, description } = req.body;
  const user_id = req.user.id;

  if (!waste_entry_id || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await pool.query(
      `INSERT INTO waste_collection (description, status, user_id, waste_entry_id)
       VALUES (?, 'Pending', ?, ?)`,
      [description, user_id, waste_entry_id]
    );

    res.status(201).json({ message: "Collection request submitted successfully" });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// ✅ Fetch User's Waste Entries
app.get("/api/waste-entries", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [entries] = await pool.query(
      "SELECT id, description FROM waste_entries WHERE user_id = ?",
      [userId]
    );

    res.json(entries);
  } catch (err) {
    console.error("Error fetching waste entries:", err);
    res.status(500).json({ message: "Error fetching entries" });
  }
});















app.post('/api/food-donations', authenticateToken, async (req, res) => {
  const { description, quantity, donor_name, contact } = req.body;
  const user_id = req.user.id; // assuming login stores userId in session

  if (!user_id) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  try {
    await pool.query(
      'INSERT INTO food_donations (description, quantity, donor_name, contact, user_id) VALUES (?, ?, ?, ?, ?)',
      [description, quantity, donor_name, contact, user_id]
    );
    res.status(201).json({ message: "Food donation submitted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});











// ✅ Fetch Pending Pickup Requests
app.get("/api/waste-collection/pending", authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT wc.id, wc.description, we.category, we.quantity, wc.created_at
       FROM waste_collection wc
       JOIN waste_entries we ON wc.waste_entry_id = we.id
       WHERE wc.status = 'Pending'`
    );

    res.json(results);
  } catch (err) {
    console.error("Error fetching pending pickups:", err);
    res.status(500).json({ message: "Error fetching pickup requests" });
  }
});


// ✅ Mark Request as Collected
app.post("/api/waste-collection/mark-collected/:id", authenticateToken, async (req, res) => {
  const collectorName = req.user.username; // assuming `req.user.name` is the authenticated user's name
  const collectionId = req.params.id;

  try {
    // Log the request for debugging
    console.log(`Marking collection ${collectionId} as collected by ${collectorName}`);

    const [result] = await pool.query(
      `UPDATE waste_collection
       SET status = 'Collected',
           pickup_date = NOW(),
           collector_name = ?
       WHERE id = ?`,
      [collectorName, collectionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Collection request not found" });
    }

    res.json({ message: "Marked as collected successfully" });
  } catch (err) {
    console.error("Error updating pickup status:", err);
    res.status(500).json({ message: "Error marking as collected" });
  }
});












// ✅ Fetch Pending Donation Requests
app.get("/api/food-donations/pending", authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT fd.id, fd.description, fd.quantity, fd.donor_name, fd.contact, fd.created_at
       FROM food_donations fd
       WHERE fd.status = 'Pending'`
    );

    res.json(results);
  } catch (err) {
    console.error("Error fetching pending donations:", err);
    res.status(500).json({ message: "Error fetching donation requests" });
  }
});

// ✅ Mark Donation as Collected
// ✅ Mark Donation as Collected
app.post("/api/food-donations/mark-collected/:id", authenticateToken, async (req, res) => {
  const collectedBy = req.user.username; // Make sure this is being set correctly in authenticateToken middleware
  const donationId = req.params.id;

  try {
    const [result] = await pool.query(
      `UPDATE food_donations
       SET status = 'collected',
           collected_by = ?
       WHERE id = ?`,
      [collectedBy, donationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.json({ message: "Donation marked as collected successfully" });
  } catch (err) {
    console.error("Error marking donation as collected:", err);
    res.status(500).json({ message: "Error updating donation status" });
  }
});





















// ✅ Collector Pickup History API
app.get("/api/waste-collection/history", authenticateToken, async (req, res) => {
  const collectorName = req.user.username;

  try {
    const [results] = await pool.query(
      `SELECT wc.id, wc.description, we.category, we.quantity, wc.pickup_date
       FROM waste_collection wc
       JOIN waste_entries we ON wc.waste_entry_id = we.id
       WHERE wc.status = 'Collected' AND wc.collector_name = ?
       ORDER BY wc.pickup_date DESC`,
      [collectorName]
    );

    res.json(results);
  } catch (err) {
    console.error("Error fetching pickup history:", err);
    res.status(500).json({ message: "Error retrieving pickup history" });
  }
});













app.get("/api/food-donations/history", authenticateToken, async (req, res) => {
  const NGOName = req.user.username;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM food_donations WHERE collected_by = ? ORDER BY created_at DESC",
      [NGOName]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching donation history:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ Protected Route: View Waste Statistics
app.get("/api/reports/waste", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT category, SUM(quantity) AS total_quantity
      FROM waste_entries
      WHERE user_id = ?
      GROUP BY category
    `, [req.user.id]); // Only the logged-in user's waste

    res.json(rows);
  } catch (error) {
    console.error("Error fetching waste report:", error);
    res.status(500).json({ message: "Error fetching waste report" });
  }
});





// ✅ Protected Route: View Donation Statistics
app.get("/api/reports/donations", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS total_donations
      FROM food_donations
      WHERE user_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [req.user.id]); // Only the logged-in user's donations

    res.json(rows);
  } catch (error) {
    console.error("Error fetching donation report:", error);
    res.status(500).json({ message: "Error fetching donation report" });
  }
});




// Corrected Summary API
app.get("/api/reports/summary", authenticateToken, async (req, res) => {
  try {
    // Step 1: Fetch all waste entries for the current user
    const [wasteEntries] = await pool.query(`
      SELECT category, quantity
      FROM waste_entries
      WHERE user_id = ?
    `, [req.user.id]);

    // Step 2: Fetch total donation count
    const [donationRows] = await pool.query(`
      SELECT COUNT(*) AS total_donations
      FROM food_donations
      WHERE user_id = ?
    `, [req.user.id]);

    let totalWaste = 0;
    let categoryTotals = {}; // { "Plastic": 10, "Food": 15, ... }

    wasteEntries.forEach(entry => {
      totalWaste += entry.quantity;

      if (categoryTotals[entry.category]) {
        categoryTotals[entry.category] += entry.quantity;
      } else {
        categoryTotals[entry.category] = entry.quantity;
      }
    });

    // Prepare wasteByCategory for chart
    const wasteByCategory = {
      labels: Object.keys(categoryTotals),
      values: Object.values(categoryTotals)
    };

    // Find the most common waste category
    let commonCategory = "-";
    if (Object.keys(categoryTotals).length > 0) {
      commonCategory = Object.entries(categoryTotals).reduce((prev, curr) => 
        (prev[1] > curr[1]) ? prev : curr
      )[0];
    }

    // Final response
    res.json({
      totalWaste: totalWaste,
      totalDonations: donationRows[0].total_donations,
      commonCategory: commonCategory,
      wasteByCategory: wasteByCategory
    });

  } catch (error) {
    console.error("Error fetching summary report:", error);
    res.status(500).json({ message: "Error fetching summary report" });
  }
});





// ✅ Use Auth Routes
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = pool;  // ✅ Exporting the pool


