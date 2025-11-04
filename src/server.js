// test change
import { sb } from './supabase.js'
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
// EU DTC Lookup
app.post('/dtc/lookup', async (req, res) => {
  try {
    const { code, brand } = req.body || {}
    if (!code) return res.status(400).json({ ok: false, error: 'DTC_CODE_REQUIRED' })

    let q = sb
      .from('dtc_codes')
      .select(`
        code, system, cause, fix, severity, tech_notes,
        brands:brand_id(name)
      `)
      .eq('code', code.toUpperCase())

    if (brand) q = q.eq('brands.name', brand)

    const { data, error } = await q
    if (error) throw error

    return res.json({ ok: true, items: data || [] })
  } catch (e) {
    console.error('[dtc/lookup]', e)
    res.status(500).json({ ok: false, error: 'dtc_lookup_failed', detail: String(e) })
  }
})

// Symptom Search
app.post('/symptom/search', async (req, res) => {
  try {
    const { symptom, brand, engine_code } = req.body || {}
    if (!symptom) return res.status(400).json({ ok: false, error: 'SYMPTOM_REQUIRED' })

    let q = sb
      .from('symptoms')
      .select(`
        id, symptom, probable_causes, diagnostics, fixes, confidence,
        brands:brand_id(name)
      `)
      .ilike('symptom', `%${symptom}%`)

    if (brand) q = q.eq('brands.name', brand)
    if (engine_code) q = q.eq('engine_code', engine_code)

    const { data, error } = await q
    if (error) throw error

    const items = (data || []).map(row => ({
      ...row,
      probable_causes: row.probable_causes?.split('|') ?? [],
      diagnostics: row.diagnostics?.split('|') ?? [],
      fixes: row.fixes?.split('|') ?? [],
    }))

    return res.json({ ok: true, items })
  } catch (e) {
    console.error('[symptom/search]', e)
    res.status(500).json({ ok: false, error: 'symptom_search_failed', detail: String(e) })
  }
})

// Diagnostic Fusion
app.post('/diagnostic/search', async (req, res) => {
  try {
    const { vin, brand, engine_code, dtc_code, symptom_text } = req.body || {}

    let dtcQ = sb
      .from('dtc_codes')
      .select('code, system, cause, fix, severity, tech_notes, brands:brand_id(name)')

    if (dtc_code) dtcQ = dtcQ.eq('code', dtc_code.toUpperCase())
    if (brand) dtcQ = dtcQ.eq('brands.name', brand)

    const { data: dtcs } = await dtcQ

    let symQ = sb
      .from('symptoms')
      .select('symptom, probable_causes, diagnostics, fixes, confidence, engine_code, brands:brand_id(name)')

    if (symptom_text) symQ = symQ.ilike('symptom', `%${symptom_text}%`)
    if (brand) symQ = symQ.eq('brands.name', brand)
    if (engine_code) symQ = symQ.eq('engine_code', engine_code)

    const { data: rawSyms } = await symQ

    const symptoms = (rawSyms || []).map(row => ({
      ...row,
      probable_causes: row.probable_causes?.split('|') ?? [],
      diagnostics: row.diagnostics?.split('|') ?? [],
      fixes: row.fixes?.split('|') ?? [],
    }))

    res.json({
      ok: true,
      dtcs: dtcs || [],
      symptoms,
      next_steps: [
        'Check live data (fuel trims, MAF/MAP, O2)',
        'Smoke test intake system',
        'Check technical service bulletins',
        'Perform brand-specific actuator tests'
      ]
    })
  } catch (e) {
    console.error('[diagnostic/search]', e)
    res.status(500).json({ ok: false, error: 'diagnostic_search_failed', detail: String(e) })
  }
})

app.listen(process.env.PORT, () => {
  console.log("AutoAI Europe backend running");
});
