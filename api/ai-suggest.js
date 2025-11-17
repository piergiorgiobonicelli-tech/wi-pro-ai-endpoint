// api/ai-suggest.js - Vercel Edge Function con CORS e OpenAI

export const config = { runtime: "edge" };

export default async function handler(req) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Use POST" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Bad JSON", detail: String(e) }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  const { type, keywords, vigneto, opName } = body || {};

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  const prompt =
    type === "operazione"
      ? `Scrivi una breve nota tecnica per l'operazione "${opName}", basandoti sulle parole chiave: ${keywords}. Vigneto: ${vigneto?.nome || "-"}, vitigno: ${vigneto?.vitigno || "-"}, anno: ${vigneto?.anno || "-"}. Stile agronomico professionale, sintetico, in italiano.`
      : `Genera osservazioni agronomiche per il vigneto "${vigneto?.nome || "-"}" (${vigneto?.vitigno || "-"}), impianto ${vigneto?.anno || "-"}. Usa le parole chiave: ${keywords}. Fornisci 2–4 punti chiave e una raccomandazione operativa. Linguaggio tecnico ma pratico, in italiano.`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "Sei un agronomo esperto di viticoltura. Rispondi in italiano, con stile tecnico, pratico e conciso.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errTxt = await openaiRes.text();
      return new Response(
        JSON.stringify({ error: "openai_error", detail: errTxt }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await openaiRes.json();
    const text =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Nessuna risposta generata.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "server_error", detail: String(e) }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
