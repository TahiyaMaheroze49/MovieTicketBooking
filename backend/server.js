
// Import Express
const express = require("express");

// Import CORS
const cors = require("cors");

// Import database connection
const db = require("./db");

// Load environment variables
require("dotenv").config();

const movieRoutes = require("./routes/movies");

// Create Express application
const app = express();

const cinemaRoutes = require("./routes/cinemas");

const authRoutes = require("./routes/auth");

const bookingRoutes = require("./routes/bookings");
 
const showRoutes = require("./routes/shows");

// Middleware

app.use(cors());
app.use(express.json());
app.use("/movies", movieRoutes);
app.use("/cinemas", cinemaRoutes);
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);
app.use("/shows", showRoutes);
// Test API route
app.get("/", (req, res) => {
    res.send("CineBook Backend is Running!");
});

// Test database API
app.get("/test-db", (req, res) => {

    db.query("SHOW TABLES", (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database query failed",
                error: err.message
            });
        }

        res.json({
            message: "Database connected successfully!",
            tables: results
        });
    });

});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`CineBook Server running on port ${PORT}`);
});
