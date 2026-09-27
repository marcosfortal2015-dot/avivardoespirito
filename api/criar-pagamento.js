// Vercel Serverless Function — cria uma preferência de pagamento no Mercado Pago
// (Checkout Pro) e devolve a URL de checkout para o front-end redirecionar o usuário.
// Requer a variável de ambiente MP_ACCESS_TOKEN configurada no painel da Vercel
// (Project Settings → Environment Variables) com o Access Token de PRODUÇÃO da
// conta Mercado Pago do Ministério Avivar do Espírito. Nunca coloque esse token
// no código-fonte.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado no servidor." });
    return;
  }
  try {
    const { titulo, preco } = req.body || {};
    const valor = Number(preco);
    if (!titulo || !valor || isNaN(valor) || valor <= 0) {
      res.status(400).json({ error: "Dados inválidos: informe título e preço." });
      return;
    }
    const origem = req.headers.origin || "https://avivardoespirito.com.br";
    const resposta = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: String(titulo).slice(0, 250),
            quantity: 1,
            currency_id: "BRL",
            unit_price: valor,
          },
        ],
        back_urls: {
          success: `${origem}/#loja`,
          failure: `${origem}/#loja`,
          pending: `${origem}/#loja`,
        },
        auto_return: "approved",
      }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      res.status(502).json({ error: "Mercado Pago recusou a solicitação.", detalhe: dados });
      return;
    }
    res.status(200).json({ url: dados.init_point });
  } catch (err) {
    res.status(500).json({ error: "Erro interno ao criar pagamento." });
  }
}
