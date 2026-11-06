// Avivar Music — separador de instrumentos (ESTRUTURA PRONTA, serviço ainda não ligado).
// Quando o servidor de separação existir, este arquivo passa a criar e consultar "trabalhos".
//
// POST /api/separar   { arquivoUrl, modelo }  -> { jobId }
// GET  /api/separar?jobId=...                 -> { status: "fila"|"processando"|"pronto"|"erro", stems: { voz, bateria, baixo, guitarra, teclado, outros } }
//
// Hoje responde 501 (não implementado) para a tela mostrar "serviço ainda não ativado".

export default function handler(req, res) {
  res.statusCode = 501;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({
    status: "nao_implementado",
    mensagem: "A separação automática ainda não foi ativada. A mesa de faixas já funciona com arquivos que você carrega.",
    contrato: { post: "{ arquivoUrl, modelo }", get: "?jobId=", stems: ["voz", "bateria", "baixo", "guitarra", "teclado", "outros"] },
  }));
}
