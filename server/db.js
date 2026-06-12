const mysql = require("mysql2/promise");
const crypto = require("crypto");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  port: Number(process.env.MYSQLPORT || 3306),
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "organic_shop",
  waitForConnections: true,
  connectionLimit: 10,
});

function id() {
  return crypto.randomUUID();
}

module.exports = { pool, id };
