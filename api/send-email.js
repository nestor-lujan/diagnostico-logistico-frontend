// api/send-email.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return res.status(500).json({ error: "Email no configurado" });

  const { email, empresa, general, scores } = req.body;
  if (!email) return res.status(400).json({ error: "Email requerido" });

  const semLabel = (p) => p >= 70 ? "Consolidado" : p >= 40 ? "En desarrollo" : "Crítico";
  const semColor = (p) => p >= 70 ? "#22c87a" : p >= 40 ? "#f5a623" : "#e84040";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Luján Logística <onboarding@resend.dev>",
        to: [email],
        subject: `Tu diagnóstico logístico — Score ${general}/100`,
        html: `
          <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;backgrou
