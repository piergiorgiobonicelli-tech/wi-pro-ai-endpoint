// api/ai-suggest.js - TEST CORS + ONLINE, versione Edge

export const config = { runtime: "edge" };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req) {
  const { method } = req;

  // Preflight CORS (OPTIONS)
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Se chiami a mano via GET, risponde con messaggio di info
  if (method === "GET") {
    return new Response(
      JSON.stringify({ info: "AI endpoint attivo, usare POST" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Se non è POST → errore
  if (method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed", method }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Qui gestiamo la POST dalla tua app WI-PRO
  let body = {};
  try {
    body = await req.json();
  } catch (e) {
    body = {};
  }

  const keywords = body.keywords || "";
  const vigneto  = body.vigneto?.nome || "-";
  const opName   = body.opName || "";

  let text = `TEST ONLINE OK (handler Edge di test)
Vigneto: ${vigneto}
Parole chiave ricevute: ${keywords}`;

  if (opName) {
    text += `\nOperazione: ${opName}`;
  }

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
