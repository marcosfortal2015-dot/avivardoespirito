// Vercel Serverless Function — consulta o status REAL de um pagamento direto na API
// do Mercado Pago (nunca confie no status que vem só pela URL de retorno, que pode
// ser manipulado). Usada pelo front-end quando o usuário volta do Checkout Pro, pra
// só então liberar o download do PDF/capa ou o formulário de dados de envio.
// Requer a mesma variável de ambiente MP_ACCESS_TOKEN usada em criar-pagamento.js.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado no servidor." });
    return;
  }
  const paymentId = req.query && req.query.payment_id;
  if (!paymentId) {
    res.status(400).json({ error: "payment_id é obrigatório." });
    return;
  }
  try {
    const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      res.status(502).json({ error: "Mercado Pago recusou a consulta.", detalhe: dados });
      return;
    }
    res.status(200).json({
      status: dados.status, // approved | pending | rejected | in_process | cancelled | refunded
      status_detail: dados.status_detail,
      external_reference: dados.external_reference,
      transaction_amount: dados.transaction_amount,
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno ao verificar pagamento." });
  }
}
