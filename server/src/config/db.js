const { Pool } = require("pg");
const config = process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined } : {};
const pool = new Pool(config);
pool.on("error", (err) => console.error("Unexpected PostgreSQL pool error:", err.message));
module.exports = { query: (text, params) => pool.query(text, params), pool };
