// Cofre dos dados sensíveis do Ministério Avivar (membros, caixa, visitantes, pedidos de oração, códigos de operador).
//
// O navegador NUNCA recebe a chave secreta do Supabase: ela só existe aqui, no servidor da Vercel.
// Quem não provou ser administrador ou operador (senha/código conferidos AQUI) não lê nada destas chaves.
//
// POST /api/privado  { acao: "login", codigo }                 -> { ok, token, nome, setores, papel } | { ok:false, motivo }
// POST /api/privado  { acao: "get", key }        + Bearer token -> { ok, value }
// POST /api/privado  { acao: "set", key, value } + Bearer token -> { ok }
// POST /api/privado  { acao: "set", key, value } SEM token      -> só para pedidos de oração e pedidos físicos:
//                                                                  acrescenta itens novos, nunca lê nem altera os existentes.
//
// Variáveis de ambiente (Vercel > Settings > Environment Variables):
//   SUPABASE_SERVICE_KEY  chave secreta do Supabase (sb_secret_...). NUNCA coloque no código.
//   ADMIN_PASSWORD        senha do administrador (também vale o nome SENHA_DO_ADMINISTRADOR)
//   TOKEN_SECRET          texto longo e aleatório que assina as sessões
//   SUPABASE_URL          (opcional) padrão: o projeto do Ministério

import crypto from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xnxfzygofnztpumqxqzt.supabase.co";
const TABELA = "site_private";
const CHAVE_OPERADORES = "avivar:operatorcodes";
const SESSAO_MS = 12 * 60 * 60 * 1000; // 12 horas

// Quem pode o quê. setores = setores de operador que liberam a chave (o administrador sempre pode).
// "todos" libera tudo, exceto o que tem semTodos (caixa só com setor "caixa" marcado explicitamente).
const REGRAS = [
  { teste: (k) => k === CHAVE_OPERADORES, setores: [] }, // só administrador
  { teste: (k) => ["avivar:caixa", "avivar:caixaextra", "avivar:bens"].includes(k), setores: ["caixa"], semTodos: true },
  { teste: (k) => k === "avivar:membros", setores: ["membros"] },
  { teste: (k) => k === "avivar:visitantes", setores: ["visitantes"] },
  { teste: (k) => k.startsWith("avivar:escalapins:"), setores: ["escala"] },
  { teste: (k) => k === "avivar:pedidosOracao", setores: ["oracoes"], anonimoAcrescenta: true },
  { teste: (k) => k === "avivar:pedidosfisicos", setores: ["loja"], anonimoAcrescenta: true },
];
const regraDe = (key) => REGRAS.find((r) => r.teste(key));

// Mesma lógica de apelidos de setor que o site usa (para o servidor entender o campo "setores" do operador).
const semAcento = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const SETOR_APELIDOS = {
  recepcao: "visitantes", portaria: "visitantes", visitante: "visitantes",
  oracao: "oracoes", "oracao nos lares": "oracoes", lares: "oracoes",
  music: "avivarmusic", musica: "avivarmusic", louvor: "avivarmusic", "avivar music": "avivarmusic",
  membro: "membros", secretaria: "membros",
  escalas: "escala", obreiros: "escala",
  frete: "loja", tudo: "todos",
  tesouraria: "caixa", tesoureiro: "caixa", financeiro: "caixa", contabilidade: "caixa",
};
export function parseSetores(texto) {
  const lista = String(texto || "").split(/[,;]/).map((s) => semAcento(s.trim())).filter(Boolean).map((s) => SETOR_APELIDOS[s] || s);
  return lista.length ? [...new Set(lista)] : ["todos"];
}

export function podeAcessar(sessao, key) {
  const regra = regraDe(key);
  if (!regra || !sessao) return false;
  if (sessao.papel === "admin") return true;
  const s = sessao.setores || [];
  if (regra.setores.some((x) => s.includes(x))) return true;
  return !regra.semTodos && regra.setores.length > 0 && s.includes("todos");
}

// ---------- sessão assinada (HMAC) ----------
const b64 = (b) => Buffer.from(b).toString("base64url");
export function assinar(payload, segredo) {
  const corpo = b64(JSON.stringify(payload));
  const mac = crypto.createHmac("sha256", segredo).update(corpo).digest("base64url");
  return `${corpo}.${mac}`;
}
export function verificar(token, segredo, agora = Date.now()) {
  if (typeof token !== "string" || token.length > 2000) return null;
  const [corpo, mac] = token.split(".");
  if (!corpo || !mac) return null;
  const esperado = crypto.createHmac("sha256", segredo).update(corpo).digest("base64url");
  const a = Buffer.from(mac), b = Buffer.from(esperado);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8"));
    if (!p || typeof p.e !== "number" || p.e < agora) return null;
    return p;
  } catch (e) { return null; }
}
function iguais(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

// ---------- Supabase (somente daqui, com a chave secreta) ----------
function cab(extra = {}) {
  const k = process.env.SUPABASE_SERVICE_KEY;
  return { apikey: k, Authorization: `Bearer ${k}`, "Content-Type": "application/json", ...extra };
}
async function lerLinha(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}?key=eq.${encodeURIComponent(key)}&select=value,updated_at`, { headers: cab() });
  if (!r.ok) throw new Error("leitura falhou " + r.status);
  const rows = await r.json();
  return rows.length ? rows[0] : null;
}
async function gravar(key, value) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}?on_conflict=key`, {
    method: "POST",
    headers: cab({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify([{ key, value, updated_at: new Date().toISOString() }]),
  });
  if (!r.ok) throw new Error("gravação falhou " + r.status);
}

// ---------- freio simples contra tentativa em massa (vale por instância ativa da Vercel) ----------
const falhas = new Map();
const JANELA = 10 * 60 * 1000, MAX_FALHAS = 8;
function bloqueado(ip, agora = Date.now()) {
  const l = (falhas.get(ip) || []).filter((t) => agora - t < JANELA);
  falhas.set(ip, l);
  return l.length >= MAX_FALHAS;
}
const registrarFalha = (ip) => falhas.set(ip, [...(falhas.get(ip) || []), Date.now()]);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
export const _teste = { falhas };

async function login(codigo, ip, segredo) {
  const c = String(codigo || "");
  if (!c || c.length > 200) return { ok: false, motivo: "invalido" };
  if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };

  const senhaAdmin = process.env.ADMIN_PASSWORD || process.env.SENHA_DO_ADMINISTRADOR;
  if (senhaAdmin && iguais(c, senhaAdmin)) {
    const e = Date.now() + SESSAO_MS;
    return { ok: true, papel: "admin", nome: "Administração", setores: ["todos"], token: assinar({ papel: "admin", n: "Administração", s: ["todos"], e }, segredo) };
  }
  const digitado = c.trim().toLowerCase();
  const linha = await lerLinha(CHAVE_OPERADORES);
  const lista = Array.isArray(linha && linha.value) ? linha.value : [];
  const igual = (o) => String(o.codigo || "").trim().toLowerCase() === digitado;
  const achado = lista.find((o) => o.ativo !== false && igual(o));
  if (achado) {
    const setores = parseSetores(achado.setores);
    const e = Date.now() + SESSAO_MS;
    // Registra o acesso no histórico do operador (melhor esforço; só grava se ninguém mexeu na lista nesse meio-tempo).
    try {
      const agora = new Date().toISOString();
      const nova = lista.map((o) => (o.id === achado.id ? { ...o, acessos: (o.acessos || 0) + 1, ultimoAcesso: agora, historico: [...(o.historico || []), { em: agora, evento: "Acesso ao site" }].slice(-60) } : o));
      const de_novo = await lerLinha(CHAVE_OPERADORES);
      if (de_novo && de_novo.updated_at === linha.updated_at) await gravar(CHAVE_OPERADORES, nova);
    } catch (err) { /* histórico é secundário */ }
    return { ok: true, papel: "operador", id: achado.id, nome: achado.nome, setores, token: assinar({ papel: "operador", i: achado.id, n: achado.nome, s: setores, e }, segredo) };
  }
  registrarFalha(ip);
  await espera(Number(process.env.ESPERA_FALHA_MS ?? 700));
  return { ok: false, motivo: lista.some((o) => o.ativo === false && igual(o)) ? "revogado" : "invalido" };
}

const LIMITE_ITEM = 4000, LIMITE_NOVOS = 5, LIMITE_LISTA = 3000;
function acrescentar(existente, enviado) {
  const base = Array.isArray(existente) ? existente : [];
  if (!Array.isArray(enviado)) return null;
  const ids = new Set(base.map((x) => x && x.id));
  const novos = [];
  for (const it of enviado) {
    if (!it || typeof it !== "object" || Array.isArray(it) || typeof it.id !== "string" || !it.id || it.id.length > 64) continue;
    if (ids.has(it.id)) continue;
    if (JSON.stringify(it).length > LIMITE_ITEM) continue;
    ids.add(it.id);
    novos.push(it);
    if (novos.length >= LIMITE_NOVOS) break;
  }
  if (base.length + novos.length > LIMITE_LISTA) return null;
  return { lista: [...base, ...novos], quantos: novos.length };
}

function resposta(res, status, corpo) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(corpo));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return resposta(res, 405, { ok: false, motivo: "metodo" });
  const segredo = process.env.TOKEN_SECRET;
  if (!process.env.SUPABASE_SERVICE_KEY || !segredo || segredo.length < 16) return resposta(res, 500, { ok: false, motivo: "servidor_nao_configurado" });

  let corpo = req.body;
  if (typeof corpo === "string") { try { corpo = JSON.parse(corpo); } catch (e) { corpo = null; } }
  if (!corpo || typeof corpo !== "object") return resposta(res, 400, { ok: false, motivo: "corpo_invalido" });

  const ip = String((req.headers && (req.headers["x-forwarded-for"] || req.headers["x-real-ip"])) || "?").split(",")[0].trim();
  const auth = String((req.headers && req.headers.authorization) || "");
  const p = auth.startsWith("Bearer ") ? verificar(auth.slice(7), segredo) : null;
  const sessao = p ? { papel: p.papel, id: p.i, nome: p.n, setores: Array.isArray(p.s) ? p.s : [] } : null;

  try {
    if (corpo.acao === "login") {
      const r = await login(corpo.codigo, ip, segredo);
      return resposta(res, r.status || (r.ok ? 200 : 401), r);
    }
    const key = typeof corpo.key === "string" ? corpo.key : "";
    const regra = regraDe(key);
    if (!regra) return resposta(res, 400, { ok: false, motivo: "chave_nao_permitida" });

    if (corpo.acao === "get") {
      if (!sessao) return resposta(res, 401, { ok: false, motivo: "sem_sessao" });
      if (!podeAcessar(sessao, key)) return resposta(res, 403, { ok: false, motivo: "sem_permissao" });
      const linha = await lerLinha(key);
      return resposta(res, 200, { ok: true, value: linha ? linha.value : null });
    }
    if (corpo.acao === "set") {
      if (sessao) {
        if (!podeAcessar(sessao, key)) return resposta(res, 403, { ok: false, motivo: "sem_permissao" });
        if (corpo.value === undefined) return resposta(res, 400, { ok: false, motivo: "sem_valor" });
        await gravar(key, corpo.value);
        return resposta(res, 200, { ok: true });
      }
      if (!regra.anonimoAcrescenta) return resposta(res, 401, { ok: false, motivo: "sem_sessao" });
      const linha = await lerLinha(key);
      const junto = acrescentar(linha && linha.value, corpo.value);
      if (!junto) return resposta(res, 400, { ok: false, motivo: "valor_invalido" });
      if (junto.quantos > 0) await gravar(key, junto.lista);
      return resposta(res, 200, { ok: true });
    }
    return resposta(res, 400, { ok: false, motivo: "acao_invalida" });
  } catch (e) {
    return resposta(res, 502, { ok: false, motivo: "falha_no_banco" });
  }
}
