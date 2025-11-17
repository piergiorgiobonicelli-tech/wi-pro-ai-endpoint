// api/ai-suggest.js - TEST CORS Node-style

export default async function handler(req, res) {
  // Headers CORS comuni a tutte le risposte
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight CORS
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  let body = {};
  try {
    // Su Vercel, se Content-Type è JSON, req.body è già parsato
    body = req.body || {};
  } catch (e) {
    // in caso, ignoriamo per questo test
  }

  const now = new Date().toISOString();
  const keywords = body.keywords || "";
  const vigneto  = body.vigneto?.nome || "-";

  const text = `TEST ONLINE OK (Node handler)
Data server: ${now}
Vigneto: ${vigneto}
Parole chiave ricevute: ${keywords}`;

  res.status(200).json({ text });
}
