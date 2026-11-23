
const express = require("express");
const router = express.Router();
const db = require("../db");

// Save a confirmed booking
router.post("/", async (req, res) => {
    let connection;

    try {
        // Get booking details from the frontend
    const {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    showId,
    seats,
    paymentMethod
} = req.body;

        // Check required details
        if (
    !customerName || !customerEmail || !customerPhone ||
    !showId ||
    !Array.isArray(seats) || seats.length === 0
) {
    return res.status(400).json({
        message: "Please provide all booking details."
    });
}
        if (!["UPI", "Card", "Cash"].includes(paymentMethod)) {
    return res.status(400).json({
        message: "Please select a valid payment method."
    });
}      
// Generate simulated payment details
const paymentStatus =
    paymentMethod === "Cash" ? "Pending" : "Paid";

const transactionId =
    paymentMethod === "Cash"
        ? null
        : "DEMO" + Date.now() + Math.floor(Math.random() * 1000);  

        if (!/^\d{10}$/.test(customerPhone)) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit phone number."
            });
        }

        // Prevent repeated seat numbers in the same request
        if (new Set(seats).size !== seats.length) {
            return res.status(400).json({
                message: "Duplicate seats were selected."
            });
        }

        // Calculate seat prices on the server
        function getSeatPrice(seat) {
            const row = String(seat).charAt(0).toUpperCase();

            if (row === "A" || row === "B") return 150;
            if (row === "C" || row === "D") return 180;
            if (row === "E" || row === "F") return 220;

            return 0;
        }

        const seatDetails = seats.map(seat => ({
            seat: String(seat),
            price: getSeatPrice(seat)
        }));

        if (seatDetails.some(seat => seat.price === 0)) {
            return res.status(400).json({
                message: "Invalid seat selected."
            });
        }

        const totalAmount = seatDetails.reduce(
            (total, seat) => total + seat.price,
            0
        );

        // Connect to MySQL and begin a transaction
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // Find the selected show in the database
const [shows] = await connection.query(
    `SELECT show_id FROM shows WHERE show_id = ?`,
    [showId]
);

if (shows.length === 0) {
    await connection.rollback();

    return res.status(404).json({
        message: "This show is not available."
    });
}

const actualShowId = shows[0].show_id;

        // Generate a unique ticket ID
        const ticketId =
            "CB" + Date.now() + Math.floor(Math.random() * 1000);

     const [bookingResult] = await connection.query(
    `INSERT INTO bookings
    (ticket_id, user_id, show_id, customer_name,
     customer_email, customer_phone, total_amount,
     booking_status, payment_method, payment_status,
     transaction_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        ticketId,
        userId || null,
        actualShowId,
        customerName,
        customerEmail,
        customerPhone,
        totalAmount,
        "Confirmed",
        paymentMethod,
        paymentStatus,
        transactionId
    ]
);

        const bookingId = bookingResult.insertId;

        // Save every selected seat
        for (const seat of seatDetails) {
            await connection.query(
                `INSERT INTO booking_seats
                (booking_id, show_id, seat_number, seat_price)
                VALUES (?, ?, ?, ?)`,
                [bookingId, showId, seat.seat, seat.price]
            );
        }

        // Commit only if all inserts succeed
        await connection.commit();

        res.status(201).json({
    message: "Booking successful!",
    bookingId: bookingId,
    ticketId: ticketId,
    seats: seats,
    totalAmount: totalAmount,
    paymentMethod: paymentMethod,
    paymentStatus: paymentStatus,
    transactionId: transactionId
});

    } catch (error) {
        // Undo incomplete booking if something goes wrong
        if (connection) {
            await connection.rollback();
        }

        console.error("Booking error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "One or more selected seats are already booked. Please choose different seats."
            });
        }

        res.status(500).json({
            message: "Unable to complete booking. Please try again."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// Get all bookings for a particular user
// Example: GET /bookings/user/1

router.get("/user/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
            b.booking_id,
            b.ticket_id,
            b.customer_name,
            b.customer_email,
            b.customer_phone,
            b.total_amount,
            b.booking_status,
            b.booking_date,
            m.title AS movie_name,
            c.cinema_name,
            c.location,
            s.show_date,
            s.show_time,
            GROUP_CONCAT(
                bs.seat_number
                ORDER BY bs.seat_number
                SEPARATOR ', '
            ) AS seats

        FROM bookings b

        LEFT JOIN shows s
            ON b.show_id = s.show_id

        LEFT JOIN movies m
            ON s.movie_id = m.movie_id

        LEFT JOIN cinemas c
            ON s.cinema_id = c.cinema_id

        LEFT JOIN booking_seats bs
            ON b.booking_id = bs.booking_id

        WHERE b.user_id = ?

        GROUP BY b.booking_id

        ORDER BY b.booking_date DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.log("My Bookings error:", err.message);

            return res.status(500).json({
                message: "Unable to fetch bookings."
            });
        }

        res.json(results);
    });
});

module.exports = router;
