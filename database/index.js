const { Pool } = require("pg");
require("dotenv").config();

/* ***************
 * Connection Pool
 * SSL needed for remote PostgreSQL on Render
 * *************** */

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.NODE_ENV === "development"
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: true },
});

// Wrapper pour log les queries en dev
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    if (process.env.NODE_ENV === "development") {
      console.log("executed query:", { text, params });
    }
    return res;
  } catch (error) {
    console.error("error in query:", { text, params, error });
    throw error;
  }
}

module.exports = { query, pool };
