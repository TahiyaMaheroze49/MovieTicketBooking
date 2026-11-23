
// Import MySQL package
const mysql = require("mysql2");

// Import dotenv
require("dotenv").config();

// Create database connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
});

// Check database connection
db.getConnection((err, connection) => {

    if (err) {
        console.log("Database connection failed:", err.message);
        return;
    }

    console.log("MySQL Database Connected Successfully!");

    connection.release();
});

// Export database connection
module.exports = db;
