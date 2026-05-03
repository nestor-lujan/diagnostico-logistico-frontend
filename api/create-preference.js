// api/create-preference.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) return res.status(500).json({ error: "MP no configurado" });

  const { email, empresa } = req.body;
  const BASE_URL = "https://diagnostico-logistico-frontend.vercel.app";

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [{
          title: "Diagnóstico Logístico para PYMEs",
          quantity: 1,
          unit_price: 49000,
          currency_id: "ARS",
        }],
        payer: { email },
        back_urls: {
          success: `${BASE_URL}/?status=approved`,
          failure: `${BASE_URL}/?status=failure`,
          pending: `${BASE_URL}/?status=pending`,
        },
        auto_return: "approved",
        external_reference: empresa || email,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("MP error:", err);
      return res.status(500).json({ error: "Error en MercadoPago" });
    }

    const data = await response.json();
    return res.status(200).json({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Error interno" });
  }
}
