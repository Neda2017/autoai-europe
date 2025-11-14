import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// list all vehicles
router.get("/ev", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM vehicles ORDER BY make, model");
  res.json(rows);
});

// single vehicle
router.get("/ev/:make/:model", async (req, res) => {
  const { make, model } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM vehicles WHERE LOWER(make)=LOWER($1) AND LOWER(model)=LOWER($2)",
    [make, model]
  );
  res.json(rows[0] || {});
});

// components
router.get("/ev/:make/:model/components", async (req, res) => {
  const { make, model } = req.params;
  const { rows } = await pool.query(
    "SELECT c.* FROM components c JOIN vehicles v ON v.id=c.vehicle_id WHERE LOWER(v.make)=LOWER($1) AND LOWER(v.model)=LOWER($2)",
    [make, model]
  );
  res.json(rows);
});

// faults
router.get("/ev/:make/:model/faults", async (req, res) => {
  const { make, model } = req.params;
  const { rows } = await pool.query(
    "SELECT f.* FROM faults f JOIN vehicles v ON v.id=f.vehicle_id WHERE LOWER(v.make)=LOWER($1) AND LOWER(v.model)=LOWER($2)",
    [make, model]
  );
  res.json(rows);
});

export default router;
