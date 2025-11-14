// --- AutoAI EVHub v1.0 Routes ---
// Clean production version with pagination and error handling

import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const router = express.Router();

// ✅ create a single shared connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }   // required by Render PG
});

// ✅ simple helper to log and format errors
function handleError(res, err, context = "unknown") {
  console.error(`❌ [EVHub:${context}]`, err.message);
  res.status(500).json({ ok: false, error: err.message });
}

// --- List vehicles with pagination ---
router.get("/ev", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 25;
    const offset = parseInt(req.query.offset) || 0;
    const query = `
      SELECT * FROM vehicles
      ORDER BY make, model
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query(query, [limit, offset]);
    res.json({ ok: true, count: rows.length, vehicles: rows });
  } catch (err) {
    handleError(res, err, "list");
  }
});

// --- Get single vehicle ---
router.get("/ev/:make/:model", async (req, res) => {
  try {
    const { make, model } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM vehicles WHERE LOWER(make)=LOWER($1) AND LOWER(model)=LOWER($2) LIMIT 1",
      [make, model]
    );
    res.json(rows[0] || { ok: false, message: "Vehicle not found" });
  } catch (err) {
    handleError(res, err, "single");
  }
});

// --- Components for a specific vehicle ---
router.get("/ev/:make/:model/components", async (req, res) => {
  try {
    const { make, model } = req.params;
    const { rows } = await pool.query(
      `SELECT c.* FROM components c
       JOIN vehicles v ON v.id=c.vehicle_id
       WHERE LOWER(v.make)=LOWER($1) AND LOWER(v.model)=LOWER($2)
       ORDER BY c.type`,
      [make, model]
    );
    res.json({ ok: true, count: rows.length, components: rows });
  } catch (err) {
    handleError(res, err, "components");
  }
});

// --- Faults / DTCs for a specific vehicle ---
router.get("/ev/:make/:model/faults", async (req, res) => {
  try {
    const { make, model } = req.params;
    const { rows } = await pool.query(
      `SELECT f.* FROM faults f
       JOIN vehicles v ON v.id=f.vehicle_id
       WHERE LOWER(v.make)=LOWER($1) AND LOWER(v.model)=LOWER($2)
       ORDER BY f.dtc_code`,
      [make, model]
    );
    res.json({ ok: true, count: rows.length, faults: rows });
  } catch (err) {
    handleError(res, err, "faults");
  }
});

export default router;
