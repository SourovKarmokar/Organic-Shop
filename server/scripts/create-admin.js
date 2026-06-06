const { pool, id } = require("../db");
const { hashPassword } = require("../password");
require("dotenv").config();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding an admin.");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [users] = await connection.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    const userId = users[0]?.id || id();

    if (!users.length) {
      await connection.query(
        "INSERT INTO users (id, email, full_name, password_hash) VALUES (?, ?, ?, ?)",
        [userId, email, fullName, hashPassword(password)]
      );

      await connection.query(
        "INSERT INTO profiles (id, user_id, full_name, email) VALUES (?, ?, ?, ?)",
        [id(), userId, fullName, email]
      );
    }

    await connection.query(
      "INSERT IGNORE INTO user_roles (id, user_id, role) VALUES (?, ?, 'admin')",
      [id(), userId]
    );

    await connection.commit();
    console.log(`Admin ready: ${email}`);
  } catch (error) {
    await connection.rollback();
    console.error(error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

main();
