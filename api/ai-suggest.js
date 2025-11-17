// api/ai-suggest.js - TEST CORS SENZA OPENAI

export const config = { runtime: "edge" };

export default async function handler(req) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Preflight CORS (OPTIONS)
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

  // prova: leggiamo il body ma anche se è vuoto non è un problema
  let body = {};
  try {
    body = await req.json();
  } catch (e) {
    // se non è JSON valido, ignoriamo per questo test
  }

  const now = new Date().toISOString();
  const keywords = body.keywords || "";
  const vigneto = body.vigneto?.nome || "-";

  const text = `TEST ONLINE OK - data server: ${now}
Vigneto: ${vigneto}
Parole chiave ricevute: ${keywords}`;

  return new Response(
    JSON.stringify({ text }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}
