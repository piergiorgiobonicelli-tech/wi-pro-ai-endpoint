// api/ai-suggest.js  (Vercel Edge Function - niente dipendenze)
export const config = { runtime: "edge" };

export default async function handler(req) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Use POST" }), { status: 405, headers: cors });

  try {
    const { type, keywords, vigneto, opName } = await req.json();

    const prompt = type === "operazione"
      ? `Scrivi una breve nota tecnica per l'operazione "${opName}", basandoti sulle parole chiave: ${keywords}. Vigneto: ${vigneto?.nome || "-"}, vitigno: ${vigneto?.vitigno || "-"}, anno: ${vigneto?.anno || "-"}. Stile agronomico, italiano, conciso.`
      : `Genera osservazioni agronomiche per il vigneto ${vigneto?.nome || "-"} (${vigneto?.vitigno || "-"}), usando le parole chiave: ${keywords}. Indica 2–4 punti chiave e una raccomandazione operativa. Italiano tecnico e sintetico.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: "Sei un agronomo esperto di viticoltura. Rispondi tecnico, pratico e conciso in italiano." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: "OpenAI error", detail: err }), { status: 500, headers: cors });
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    return new Response(JSON.stringify({ text }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Bad request", detail: String(e) }), { status: 400, headers: cors });
  }
}
