// api/save-diagnostic.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL      = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const RESEND_API_KEY    = process.env.RESEND_API_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY)
    return res.status(500).json({ error: "Backend no configurado" });

  try {
    const { email, nombre, empresa, rubro, answers, scores, general } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    // 1. Guardar en Supabase
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

    // 2. Notificar a Nestor
    if (RESEND_API_KEY) {
      const semLabel = (p) => p >= 70 ? "Consolidado" : p >= 40 ? "En desarrollo" : "Critico";
      const semColor = (p) => p >= 70 ? "#22c87a" : p >= 40 ? "#f5a623" : "#e84040";
      const date = new Date().toLocaleDateString("es-AR", { year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" });

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Diagnostico Logistico <onboarding@resend.dev>",
          to: ["lic.nestorlujan@gmail.com"],
          subject: `Nuevo diagnostico - ${nombre || email} - Score ${general}/100`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#1a1d2e;background:#fff">
              <div style="font-size:20px;font-weight:700;margin-bottom:4px">Lujan Logistica</div>
              <div style="font-size:11px;color:#5a6285;text-transform:uppercase;letter-spacing:.1em;margin-bottom:24px">Nuevo diagnostico completado</div>

              <div style="background:#f7f8fc;border-radius:12px;padding:20px;margin-bottom:24px">
                <div style="font-size:11px;color:#5a6285;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">Datos del cliente</div>
                ${nombre  ? `<div style="margin-bottom:6px"><strong>Nombre:</strong> ${nombre}</div>` : ""}
                ${empresa ? `<div style="margin-bottom:6px"><strong>Empresa:</strong> ${empresa}</div>` : ""}
                ${rubro   ? `<div style="margin-bottom:6px"><strong>Rubro:</strong> ${rubro}</div>` : ""}
                <div style="margin-bottom:6px"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></div>
                <div style="font-size:12px;color:#5a6285;margin-top:8px">${date}</div>
              </div>

              <div style="text-align:center;padding:20px;background:#f7f8fc;border-radius:12px;margin-bottom:24px">
                <div style="font-size:48px;font-weight:700;color:${semColor(general)};line-height:1">${general}</div>
                <div style="font-size:12px;color:#5a6285;margin-top:4px">Score general / 100</div>
                <div style="font-size:16px;font-weight:600;color:${semColor(general)};margin-top:6px">${semLabel(general)}</div>
              </div>

              <div style="margin-bottom:24px">
                <div style="font-size:11px;color:#5a6285;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">Scores por area</div>
                ${scores ? Object.entries(scores).map(([area, s]) => `
                  <div style="display:flex;justify-content:space-between;padding:10px 14px;background:#f7f8fc;border-radius:8px;margin-bottom:8px">
                    <div style="font-size:13px">${area}</div>
                    <div style="font-size:13px;font-weight:700;color:${semColor(s.pct)}">${s.pct}/100 - ${semLabel(s.pct)}</div>
                  </div>
                `).join("") : ""}
              </div>

              <div style="text-align:center;padding:16px;background:#2563eb;border-radius:10px">
                <a href="mailto:${email}" style="color:#fff;font-size:14px;font-weight:600;text-decoration:none">
                  Responder a ${nombre || email}
                </a>
              </div>

              <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e8ecf8;font-size:11px;color:#5a6285;text-align:center">
                Ver todos los diagnosticos en Supabase
              </div>
            </div>
          `,
        }),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Error interno" });
  }
}
