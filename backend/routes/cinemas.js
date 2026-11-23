
const express = require("express");
const router = express.Router();

// Import MySQL connection
const db = require("../db");

// GET API to fetch all cinemas
router.get("/", (req, res) => {

    db.query("SELECT * FROM cinemas", (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching cinemas",
                error: err.message
            });
        }

        res.json(results);
    });

});

// Export router
module.exports = router;
