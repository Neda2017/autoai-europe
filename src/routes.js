import { sb } from "./supabase.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ============================
   BASIC EU VIN SCAN (Fake decode)
   ============================ */
export async function vinScan(body) {
  const { vin } = body;

  if (!vin || vin.length < 10) {
    return { ok: false, error: "invalid_vin" };
  }

  // Simplified EU decode
  return {
    ok: true,
    vin,
    decoded: {
      region: "EU",
      manufacturer: vin.substring(0, 3),
      platform: vin.substring(3, 7),
      year_code: vin[9]
    }
  };
}

/* ============================
   EU DTC LOOKUP (Supabase)
   ============================ */
export async function dtcLookup(body) {
  const { code } = body;

  const { data, error } = await sb
    .from("dtc_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "not_found" };

  return { ok: true, dtc: data };
}

/* ============================
   SYMPTOM SEARCH (EU WORKSHOP DB)
   ============================ */
export async function symptomSearch(body) {
  const { text } = body;

  const { data, error } = await sb
    .from("symptoms")
    .select("*")
    .ilike("symptom", `%${text}%`)
    .limit(10);

  if (error) return { error: error.message };

  return { ok: true, results: data };
}

/* ============================
   DIAGNOSTIC SEARCH (Combined EU Logic)
   ============================ */
export async function diagnosticSearch(body) {
  const { dtc_code, symptom_text, model, engine_code } = body;

  let response = {
    ok: true,
    dtc: null,
    symptoms: null,
    analysis: null
  };

  // Get DTC
  if (dtc_code) {
    const { data } = await sb
      .from("dtc_codes")
      .select("*")
      .eq("code", dtc_code)
      .maybeSingle();

    response.dtc = data;
  }

  // Get symptom matches
  if (symptom_text) {
    const { data } = await sb
      .from("symptoms")
      .select("*")
      .ilike("symptom", `%${symptom_text}%`)
      .limit(5);

    response.symptoms = data;
  }

  // AI reasoning
  const prompt = `
You are an EU Automotive Master Diagnostic Technician.
Based on the following data, give a workshop-style explanation:

DTC: ${JSON.stringify(response.dtc)}
Symptoms: ${JSON.stringify(response.symptoms)}
Model: ${model}
Engine Code: ${engine_code}
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  response.analysis = completion.choices[0].message.content;

  return response;
}
