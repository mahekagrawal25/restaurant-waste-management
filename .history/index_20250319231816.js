const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");  
const bcrypt = require("bcryptjs");
const authRoutes = require("./routes/auth");
const authenticateToken = require("./middleware/authMiddleware");

require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// ✅ Database Connection (MySQL)
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "restaurant_management",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise(); 

// ✅ Dashboard Route
app.get("/api/dashboard", authenticateToken, async (req, res) => {
    try {
        const [wasteResult] = await pool.query("SELECT COUNT(*) AS totalWaste FROM waste_entries");
        const [donationResult] = await pool.query("SELECT COUNT(*) AS totalDonations FROM food_donations");
        const [pickupResult] = await pool.query("SELECT COUNT(*) AS totalPickups FROM waste_collection");

        res.json({
            totalWaste: wasteResult[0].totalWaste,
            totalDonations: donationResult[0].totalDonations,
            totalPickups: pickupResult[0].totalPickups
        });
    } catch (error) {
        console.error("Dashboard fetch error:", error);
        res.status(500).json({ message: "Error fetching dashboard data" });
    }
});

// ✅ Use Auth Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = pool; // Export pool to use in other files
