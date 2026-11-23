
// Import Express
const express = require("express");

// Create router
const router = express.Router();

// Import database connection
const db = require("../db");

// GET API to fetch all movies
router.get("/", (req, res) => {

    // Fetch movies from MySQL
    db.query("SELECT * FROM movies", (err, results) => {

        // Handle database error
        if (err) {
            return res.status(500).json({
                message: "Error fetching movies",
                error: err.message
            });
        }

        // Send movie details as JSON
        res.json(results);
    });
});

// Export router
module.exports = router;
