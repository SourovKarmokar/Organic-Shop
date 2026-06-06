const mysql = require("mysql2/promise");
const crypto = require("crypto");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "organic_shop",
  waitForConnections: true,
  connectionLimit: 10,
});

function id() {
  return crypto.randomUUID();
}

module.exports = { pool, id };
