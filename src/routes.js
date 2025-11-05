import { sb } from "./supabase.js";

// ✅ VIN SCAN
export async function vinScan({ vin }) {
  if (!vin) return { ok: false, error: "vin_required" };

  return {
    ok: true,
    vin,
    decoded: {
      region: "EU",
      manufacturer: "Volkswagen Group",
      model_guess: "Golf / Passat (approx)",
    }
  };
}

// ✅ DTC LOOKUP (EU)
export async function dtcLookup({ code }) {
  if (!code) return { error: "code_required" };

  const { data, error } = await sb
    .from("dtc_codes")
    .select("*")
    .ilike("code", code);

  return { code, data, error };
}

// ✅ SYMPTOM SEARCH (EU)
export async function symptomSearch({ text }) {
  if (!text) return { error: "text_required" };

  const { data, error } = await sb
    .from("symptoms")
    .select("*")
    .ilike("symptom", `%${text}%`);

  return { text, data, error };
}

// ✅ DIAGNOSTIC SEARCH (EU combined)
export async function diagnosticSearch({ vin, dtc_code, symptom_text }) {
  const out = {};

  if (vin) {
    out.vin = {
      decoded: {
        region: "EU",
        manufacturer_guess: "VW/Audi/Skoda/Seat (EU VIN)"
      }
    };
  }

  if (dtc_code) {
    const { data } = await sb
      .from("dtc_codes")
      .select("*")
      .ilike("code", dtc_code);
    out.dtc = data;
  }

  if (symptom_text) {
    const { data } = await sb
      .from("symptoms")
      .select("*")
      .ilike("symptom", `%${symptom_text}%`);
    out.symptoms = data;
  }

  return out;
}

// ✅ PARTS SEARCH (stub for now)
export async function partsSearch({ vin, query }) {
  return {
    vin,
    query,
    items: [
      {
        name: "Air filter",
        supplier: "EU Supplier",
        price: 29.99
      }
    ]
  };
}

// ✅ DOCUMENT UPLOAD (stub)
export async function presignUpload({ filename }) {
  return {
    ok: true,
    filename,
    url: "https://example.com/upload-url"
  };
}

// ✅ DOCUMENT CREATE (stub)
export async function createDocument({ title, blob_key }) {
  return {
    ok: true,
    title,
    blob_key,
    stored: true
  };
}
