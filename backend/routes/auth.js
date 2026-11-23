
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");

// Register a new user
router.post("/register", async (req, res) => {
    try {
        // Get details sent from the frontend
        const { fullName, email, phone, password } = req.body;

        // Check required fields
        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        // Check whether the email already exists
        db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email],
            async (err, results) => {
                if (err) {
                    return res.status(500).json({
                        message: "Database error."
                    });
                }

                if (results.length > 0) {
                    return res.status(409).json({
                        message: "This email is already registered."
                    });
                }

                // Securely hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Save the new user in MySQL
                db.query(
                    `INSERT INTO users
                    (full_name, email, phone, password)
                    VALUES (?, ?, ?, ?)`,
                    [fullName, email, phone, hashedPassword],
                    (insertError, result) => {
                        if (insertError) {
                            return res.status(500).json({
                                message: "Could not register user."
                            });
                        }

                        res.status(201).json({
                            message: "Account created successfully!",
                            userId: result.insertId
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error during registration."
        });
    }
});


// Login an existing user
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter email and password."
        });
    }

    // Find the user using their email
    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error."
                });
            }

            // Check whether the user exists
            if (results.length === 0) {
                return res.status(401).json({
                    message: "Account not found. Please register first."
                });
            }

            const user = results[0];

            // Compare entered password with the saved hashed password
            const passwordMatches = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatches) {
                return res.status(401).json({
                    message: "Incorrect password."
                });
            }

            // Login successful
            res.json({
                message: "Login successful!",
                user: {
                    user_id: user.user_id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone
                }
            });
        }
    );
});


module.exports = router;
