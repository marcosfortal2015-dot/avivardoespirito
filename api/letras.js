// Avivar Music — buscador de letras (ESTRUTURA PRONTA; só funciona quando um serviço LICENCIADO for ligado).
//
// Este arquivo NÃO copia letras de sites. Ele consulta apenas o serviço de letras que você contratar/licenciar
// (uma API com contrato), usando as variáveis de ambiente da Vercel abaixo. Sem elas, responde "aguardando_licenca"
// e a tela do app mostra o aviso — nada é buscado.
//
// GET /api/letras?q=<título ou trecho>&artista=<opcional>   -> { ok, resultados:[{ id, titulo, artista, letra? }] }
// GET /api/letras?id=<id do resultado>                       -> { ok, item:{ id, titulo, artista, letra } }
// Exige sessão do app (administrador, operador, líder ou músico): header Authorization: Bearer <token>.
//
// Variáveis de ambiente (Vercel > Settings > Environment Variables):
//   LETRAS_ATIVO          "1" para ligar (qualquer outro valor = desligado)
//   LETRAS_API_URL        endereço da busca, com {q} e {artista}.     Ex.: https://api.exemplo.com/buscar?texto={q}&cantor={artista}
//   LETRAS_API_DETALHE_URL (opcional) endereço da letra, com {id}.    Ex.: https://api.exemplo.com/letra/{id}
//   LETRAS_API_CHAVE      chave/token fornecido pelo serviço licenciado
//   LETRAS_API_CHAVE_CAB  nome do cabeçalho da chave (padrão "Authorization"; se for "Authorization", envia "Bearer <chave>")
//   LETRAS_MAPA           (opcional) JSON que diz onde estão os campos na resposta do serviço, por caminho com pontos:
//                         {"lista":"results","id":"id","titulo":"title","artista":"artist","letra":"lyrics","detalhe":"data"}
import { verificar } from "./privado.js";

const LIMITE_LETRA = 20000;
const janela = new Map();
const JANELA_MS = 10 * 60 * 1000, MAX_BUSCAS = 40;
function limite(ip, agora = Date.now()) {
  const l = (janela.get(ip) || []).filter((t) => agora - t < JANELA_MS);
  l.push(agora); janela.set(ip, l);
  return l.length > MAX_BUSCAS;
}
function resposta(res, status, corpo) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(corpo));
}
const pegar = (obj, caminho) => String(caminho || "").split(".").filter(Boolean).reduce((o, k) => (o == null ? o : o[k]), obj);
const texto = (v, max) => (typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, max);
const MAPA_PADRAO = { lista: "", id: "id", titulo: "titulo", artista: "artista", letra: "letra", detalhe: "" };
function mapaDe(env) {
  try { return { ...MAPA_PADRAO, ...(env.LETRAS_MAPA ? JSON.parse(env.LETRAS_MAPA) : {}) }; } catch (e) { return MAPA_PADRAO; }
}
export function normalizar(json, mapa, ehLista = true) {
  const un = (o) => ({
    id: texto(pegar(o, mapa.id), 200),
    titulo: texto(pegar(o, mapa.titulo), 200),
    artista: texto(pegar(o, mapa.artista), 200),
    letra: texto(pegar(o, mapa.letra), LIMITE_LETRA),
  });
  if (ehLista) {
    const base = mapa.lista ? pegar(json, mapa.lista) : json;
    return (Array.isArray(base) ? base : []).slice(0, 25).map(un).filter((x) => x.titulo).map((x) => (x.letra ? x : { id: x.id, titulo: x.titulo, artista: x.artista }));
  }
  const um = mapa.detalhe ? pegar(json, mapa.detalhe) : json;
  return um && typeof um === "object" ? un(um) : null;
}
const preencher = (modelo, valores) => String(modelo).replace(/\{(\w+)\}/g, (_, k) => encodeURIComponent(valores[k] == null ? "" : valores[k]));

export default async function handler(req, res, ambiente = process.env, buscar = fetch) {
  if (req.method !== "GET") return resposta(res, 405, { ok: false, motivo: "metodo" });
  const segredo = ambiente.TOKEN_SECRET;
  if (!segredo || segredo.length < 16) return resposta(res, 500, { ok: false, motivo: "servidor_nao_configurado" });
  const auth = String((req.headers && req.headers.authorization) || "");
  const sessao = auth.startsWith("Bearer ") ? verificar(auth.slice(7), segredo) : null;
  if (!sessao) return resposta(res, 401, { ok: false, motivo: "sem_sessao", mensagem: "Entre com o seu código e senha para usar o buscador." });

  if (ambiente.LETRAS_ATIVO !== "1" || !ambiente.LETRAS_API_URL) {
    return resposta(res, 200, { ok: false, motivo: "aguardando_licenca", mensagem: "O buscador está pronto e aguarda a ativação do serviço licenciado no servidor." });
  }
  const ip = String((req.headers && (req.headers["x-forwarded-for"] || req.headers["x-real-ip"])) || "?").split(",")[0].trim();
  if (limite(ip)) return resposta(res, 429, { ok: false, motivo: "limite", mensagem: "Muitas buscas seguidas. Espere alguns minutos." });

  const url = new URL(req.url || "/", "http://x");
  const q = texto(url.searchParams.get("q"), 120).trim();
  const artista = texto(url.searchParams.get("artista"), 80).trim();
  const id = texto(url.searchParams.get("id"), 200).trim();
  const mapa = mapaDe(ambiente);
  const cab = { Accept: "application/json" };
  if (ambiente.LETRAS_API_CHAVE) {
    const nome = ambiente.LETRAS_API_CHAVE_CAB || "Authorization";
    cab[nome] = nome.toLowerCase() === "authorization" ? `Bearer ${ambiente.LETRAS_API_CHAVE}` : ambiente.LETRAS_API_CHAVE;
  }
  let alvo;
  if (id) {
    if (!ambiente.LETRAS_API_DETALHE_URL) return resposta(res, 400, { ok: false, motivo: "sem_detalhe", mensagem: "Este serviço devolve a letra junto da busca." });
    alvo = preencher(ambiente.LETRAS_API_DETALHE_URL, { id });
  } else {
    if (q.length < 2) return resposta(res, 400, { ok: false, motivo: "busca_curta", mensagem: "Digite o nome do louvor ou um trecho." });
    alvo = preencher(ambiente.LETRAS_API_URL, { q, artista });
  }
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), 9000) : null;
  try {
    const r = await buscar(alvo, { headers: cab, signal: ctl ? ctl.signal : undefined });
    if (!r.ok) return resposta(res, 502, { ok: false, motivo: "servico_indisponivel", mensagem: "O serviço de letras não respondeu agora." });
    const j = await r.json();
    if (id) {
      const item = normalizar(j, mapa, false);
      if (!item || !item.letra) return resposta(res, 404, { ok: false, motivo: "sem_letra", mensagem: "Esta letra não está disponível." });
      return resposta(res, 200, { ok: true, item: { ...item, id } });
    }
    return resposta(res, 200, { ok: true, resultados: normalizar(j, mapa, true) });
  } catch (e) {
    return resposta(res, 502, { ok: false, motivo: "falha", mensagem: "Não consegui falar com o serviço de letras." });
  } finally { if (t) clearTimeout(t); }
}
