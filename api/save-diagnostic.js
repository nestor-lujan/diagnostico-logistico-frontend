// api/save-diagnostic.js
// Vercel Serverless Function — guarda diagnósticos en Supabase
//
// Variables de entorno necesarias en Vercel → Settings → Environment Variables:
//   SUPABASE_URL       → tu URL de Supabase (ej: https://xxxx.supabase.co)
//   SUPABASE_ANON_KEY  → tu anon key de Supabase

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL      = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Faltan variables de entorno de Supabase");
    return res.status(500).json({ error: "Backend no configurado" });
  }

  try {
    const { email, empresa, answers, scores, general } = req.body;

    if (!email) return res.status(400).json({ error: "Email requerido" });

    // Insertar en Supabase via REST API (sin SDK extra)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/diagnosticos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        email,
        empresa:          empresa || null,
        score_general:    general,
        score_transporte: scores?.["Transporte y entregas"]?.pct ?? null,
        score_inventario: scores?.["Almacenamiento e inventario"]?.pct ?? null,
        score_procesos:   scores?.["Procesos y personal"]?.pct ?? null,
        respuestas:       answers,          // JSONB — array de 15 números
        scores_detalle:   scores,           // JSONB — objeto completo
        created_at:       new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Supabase error:", errText);
      return res.status(500).json({ error: "Error al guardar en base de datos" });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Error en save-diagnostic:", err);
    return res.status(500).json({ error: "Error interno" });
  }
}
