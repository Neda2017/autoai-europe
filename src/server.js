import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import {
  vinScan,
  dtcLookup,
  symptomSearch,
  diagnosticSearch,
  partsSearch,
  presignUpload,
  createDocument
} from "./routes.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "autoai-europe-backend"
  });
});

// ✅ SERVE OPENAPI FILE FOR GPT ACTIONS
app.get("/openapi/autoai-openapi.yaml", (req, res) => {
  const filePath = path.join(__dirname, "openapi", "autoai-openapi.yaml");
  res.setHeader("Content-Type", "text/yaml");
  res.sendFile(filePath);
});

// ✅ VIN SCAN
app.post("/vin/scan", async (req, res) => {
  res.json(await vinScan(req.body));
});

// ✅ DTC LOOKUP (EU database)
app.post("/dtc/lookup", async (req, res) => {
  res.json(await dtcLookup(req.body));
});

// ✅ SYMPTOM SEARCH (EU workshop logic)
app.post("/symptom/search", async (req, res) => {
  res.json(await symptomSearch(req.body));
});

// ✅ ADVANCED DIAGNOSTIC SEARCH
app.post("/diagnostic/search", async (req, res) => {
  res.json(await diagnosticSearch(req.body));
});

// ✅ PARTS LOOKUP (EU suppliers later)
app.post("/search_parts", async (req, res) => {
  res.json(await partsSearch(req.body));
});

// ✅ DOCUMENT PRESIGN (S3 / future use)
app.post("/documents/presign", async (req, res) => {
  res.json(await presignUpload(req.body));
});

// ✅ DOCUMENT STORE METADATA
app.post("/documents", async (req, res) => {
  res.json(await createDocument(req.body));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ AutoAI Europe backend running on port ${PORT}`);
});
