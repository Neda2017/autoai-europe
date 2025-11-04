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

app.get('/openapi/autoai.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'openapi', 'autoai.yaml'));
});

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

app.listen(process.env.PORT || 3000, () => {
  console.log("AutoAI Europe backend running");
});
