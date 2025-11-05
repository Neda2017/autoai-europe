import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import EU routes
import { vinScan, dtcLookup, symptomSearch, diagnosticSearch } from "./routes.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ ok: true, service: "autoai-europe-backend" });
});

// ✅ Serve OpenAPI file
app.get("/openapi/autoai.yaml", (req, res) => {
  return res.sendFile(path.join(__dirname, "openapi", "autoai-openapi.yaml"));
});

// ✅ VIN Scan
app.post("/vin/scan", async (req, res) => {
  try {
    const out = await vinScan(req.body);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: "vin_failed", detail: String(err) });
  }
});

// ✅ EU DTC Lookup
app.post("/dtc/lookup", async (req, res) => {
  try {
    const out = await dtcLookup(req.body);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: "dtc_failed", detail: String(err) });
  }
});

// ✅ EU Symptom Search
app.post("/symptom/search", async (req, res) => {
  try {
    const out = await symptomSearch(req.body);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: "symptom_failed", detail: String(err) });
  }
});

// ✅ EU Diagnostic Search (AI reasoning + DB)
app.post("/diagnostic/search", async (req, res) => {
  try {
    const out = await diagnosticSearch(req.body);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: "diagnostic_failed", detail: String(err) });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AutoAI Europe backend running on port ${PORT}`);
});
