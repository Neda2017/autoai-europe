// ✅ routes.js — exports a real Express router AND functions

import express from "express";
import { sb } from "./supabase.js";

const router = express.Router();

/* ---------------- VIN SCAN ---------------- */
export async function vinScan(req, res) {
  const { vin } = req.body;
  if (!vin) return res.status(400).json({ error: "vin_required" });

  return res.json({
    ok: true,
    vin,
    decoded: {
      market: "EU",
      year: "Unknown",
      manufacturer: "Unknown",
    },
  });
}

router.post("/vin/scan", vinScan);

/* ---------------- DTC LOOKUP ---------------- */
export async function dtcLookup(req, res) {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "code_required" });

  const { data } = await sb.from("dtc_codes").select("*").eq("code", code).maybeSingle();

  return res.json({
    ok: true,
    code,
    result: data || null,
  });
}

router.post("/dtc/lookup", dtcLookup);

/* ✅ MUST EXPORT DEFAULT ROUTER */
export default router;
