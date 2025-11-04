// test change
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/openapi/autoai.yaml", (req, res) => {
  res.setHeader("Content-Type", "application/yaml; charset=utf-8")
  res.sendFile(path.join(__dirname, "openapi", "autoai.yaml"))
})

app.get('/', (req, res) => {
  res.json({ ok: true, service: "autoai-europe-backend" });
});

// -------------------------------------
// EU VIN Decode Endpoint
// -------------------------------------
app.post("/vin/scan", (req, res) => {
  const { vin } = req.body;

  if (!vin) {
    return res.status(400).json({ error: "VIN_REQUIRED" });
  }

  // Basic EU VIN parsing
  const wmi = vin.substring(0, 3);
  const vds = vin.substring(3, 9);
  const vis = vin.substring(9, 17);

  const wmiMap = {
    "WVW": "Volkswagen",
    "WAU": "Audi",
    "WDB": "Mercedes-Benz",
    "WBA": "BMW",
    "VF1": "Renault",
    "VF3": "Peugeot",
    "ZFA": "Fiat",
    "W0L": "Opel"
  };

  const make = wmiMap[wmi] || "Unknown";

  return res.json({
    ok: true,
    vin,
    decoded: {
      make,
      wmi,
      vds,
      vis
    }
  });
});

// -----------------------------------------------------
// EU DTC Lookup Endpoint
// -----------------------------------------------------
app.post("/dtc/lookup", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "DTC_CODE_REQUIRED" });
  }

  const dtc = code.toUpperCase();

  const db = {
    "P2015": {
      system: "Intake Manifold",
      cause: "Intake Manifold Runner Position Sensor out of range",
      models: ["VW Golf", "Audi A3", "Skoda Octavia"],
      fix: "Replace intake manifold runner flap mechanism"
    },
    "P0420": {
      system: "Exhaust",
      cause: "Catalyst system efficiency below threshold",
      models: ["Renault Clio", "Peugeot 308", "Opel Astra"],
      fix: "Check/replace catalytic converter and oxygen sensors"
    },
    "P0299": {
      system: "Turbocharger",
      cause: "Underboost condition",
      models: ["VW Passat", "BMW 320d", "Mercedes C220"],
      fix: "Inspect turbo actuator, charge pipes, boost leaks"
    }
  };

  const result = db[dtc] || {
    system: "Unknown",
    cause: "Not found in EU DTC preset database",
    fix: "Check live data, freeze frame, boost pressure, fuel trims"
  };

  return res.json({
    ok: true,
    code: dtc,
    details: result
  });
});

const PORT = process.env.PORT || 8000;
app.listen(process.env.PORT, () => {
  console.log("AutoAI Europe backend running");
});
