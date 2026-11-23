
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get available showtimes
// Example: /shows?movieId=1&cinemaId=1&date=2026-11-12

router.get("/", (req, res) => {

    const { movieId, cinemaId, date } = req.query;

    // Check required details
    if (!movieId || !cinemaId || !date) {
        return res.status(400).json({
            message: "Movie ID, Cinema ID and Date are required."
        });
    }

    const sql = `
        SELECT show_id, movie_id, cinema_id, show_date, show_time
        FROM shows
        WHERE movie_id = ?
        AND cinema_id = ?
        AND show_date = ?
        ORDER BY show_time
    `;

    db.query(sql, [movieId, cinemaId, date], (err, results) => {

        if (err) {
            console.log("Showtime error:", err.message);

            return res.status(500).json({
                message: "Error fetching showtimes",
                error: err.message
            });
        }

        res.json(results);
    });
});


// Get already-booked seats for a particular show
// Example: /shows/168/seats

router.get("/:showId/seats", (req, res) => {

    const showId = req.params.showId;

    const sql = `
        SELECT seat_number
        FROM booking_seats
        WHERE show_id = ?
    `;

    db.query(sql, [showId], (err, results) => {

        if (err) {
            console.log("Booked seats error:", err.message);

            return res.status(500).json({
                message: "Error fetching booked seats"
            });
        }

        // Return only the seat numbers
        const bookedSeats = results.map(
            row => row.seat_number
        );

        res.json(bookedSeats);
    });
});

module.exports = router;
