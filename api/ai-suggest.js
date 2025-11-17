// api/ai-suggest.js - TEST CORS + ONLINE, senza OpenAI

// Handler stile Node.js per Vercel
export default async function handler(req, res) {
  // CORS: questi header vengono messi SEMPRE
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight CORS (OPTIONS)
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // Se chiami a mano via GET, risponde con messaggio di info
  if (req.method === "GET") {
    res.status(200).json({ info: "AI endpoint attivo, usare POST" });
    return;
  }

  // Per qualsiasi altro metodo diverso da POST → errore
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Qui gestiamo la POST dalla tua app WI-PRO
  let body = {};
  try {
    body = req.body || {};
  } catch (e) {
    body = {};
  }

  const keywords = body.keywords || "";
  const vigneto  = body.vigneto?.nome || "-";
  const opName   = body.opName || "";

  let text = `TEST ONLINE OK (handler di test)
Vigneto: ${vigneto}
Parole chiave ricevute: ${keywords}`;

  if (opName) {
    text += `\nOperazione: ${opName}`;
  }

  res.status(200).json({ text });
}
