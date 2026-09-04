// api/save-diagnostic.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL      = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY)
    return res.status(500).json({ error: "Backend no configurado" });

  try {
    const { email, nombre, empresa, rubro, answers, scores, general } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

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
        nombre:           nombre || null,
        empresa:          empresa || null,
        rubro:            rubro || null,
        score_general:    general,
        score_transporte: scores?.["Transporte y entregas"]?.pct ?? null,
        score_inventario: scores?.["Almacenamiento e inventario"]?.pct ?? null,
        score_procesos:   scores?.["Procesos y personal"]?.pct ?? null,
        respuestas:       answers,
        scores_detalle:   scores,
        created_at:       new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Supabase error:", errText);
      return res.status(500).json({ error: "Error al guardar" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Error interno" });
  }
}
