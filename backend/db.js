
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 4000),

    ssl: {
        ca: fs.readFileSync(
            path.join(__dirname, "isrgrootx1.pem")
        )
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check database connection
db.getConnection((err, connection) => {
    if (err) {
        console.log("Database connection failed:", err.message);
        return;
    }

    console.log("TiDB Cloud Connected Successfully!");
    connection.release();
});

module.exports = db;
