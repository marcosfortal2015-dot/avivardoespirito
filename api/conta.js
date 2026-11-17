// Bíblia Avivar — contas de usuário e acesso à área de preparação de sermões.
//
// O navegador NUNCA recebe senha nem código de ninguém: tudo é conferido AQUI, e só ficam guardados os resumos (hash) em
// site_private (a mesma tabela privada do cofre do Ministério, acessível só com a chave secreta).
//
// POST /api/conta  { acao, ... }                                  Resposta: { ok:true, ... } ou { ok:false, motivo }
//  Públicas
//   cadastrar   { nome, email, whatsapp, senha, lembrar?, dispositivo? }  -> { token, perfil, e }
//   entrar      { email, senha, lembrar?, dispositivo? }                    -> { token, perfil, e }
//  Com a sessão do usuário (Authorization: Bearer <token>)
//   eu                                                  -> { perfil }
//   trocarsenha { atual, nova }                         -> { ok }
//   solicitarsermoes { mensagem? }                      -> { perfil }   (vira "solicitado" para o administrador ver)
//   sermaologin { codigo, lembrar?, dispositivo? }      -> { token (sermonista), perfil, e }
//  Com a sessão de sermonista (código aceito)
//   sermaoget                                           -> { value }
//   sermaoset { value }                                 -> { ok }
//  Só administrador (o mesmo token do /api/privado)
//   admlistar | admliberar { id, dias?, plano? } | admajustar { id, plano?, ate?, obs? } | admbloquear { id } | admnegar { id }
//   admsenhatemp { id } | admexcluir { id }
//
// Estrutura de planos: cada conta tem sermoes.plano ("liberado" por enquanto) e sermoes.ate (validade, ISO ou vazio = sem prazo).
// Quando houver assinatura, basta preencher plano/validade (ou ligar o pagamento) — o acesso expira sozinho depois da validade.
import crypto from "node:crypto";
import { assinar, verificar, ORIGENS } from "./privado.js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xnxfzygofnztpumqxqzt.supabase.co";
const TABELA = "site_private";
const K_CONTA = "biblia:conta:";
const K_EMAIL = "biblia:contaemail:";
const K_SERMOES = "biblia:sermoes:u:";
const SESSAO_MS = 12 * 60 * 60 * 1000;
const LEMBRAR_MS = 180 * 24 * 60 * 60 * 1000;
const LIMITE_SERMOES = 1_500_000;
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I

export const _teste = { falhas: new Map() };
const JANELA = 10 * 60 * 1000;
const falhas = _teste.falhas;

let buscar = (...a) => fetch(...a);
export const _injetar = (f) => { buscar = f; };

/* ---------------- Supabase (chave secreta só aqui) ---------------- */
function cab(extra = {}) {
  const k = process.env.SUPABASE_SERVICE_KEY;
  return { apikey: k, Authorization: `Bearer ${k}`, "Content-Type": "application/json", ...extra };
}
async function ler(key) {
  const r = await buscar(`${SUPABASE_URL}/rest/v1/${TABELA}?key=eq.${encodeURIComponent(key)}&select=value,updated_at`, { headers: cab() });
  if (!r.ok) throw new Error("leitura " + r.status);
  const rows = await r.json();
  return rows.length ? rows[0] : null;
}
async function gravar(key, value) {
  const r = await buscar(`${SUPABASE_URL}/rest/v1/${TABELA}?on_conflict=key`, { method: "POST", headers: cab({ Prefer: "resolution=merge-duplicates,return=minimal" }), body: JSON.stringify([{ key, value, updated_at: new Date().toISOString() }]) });
  if (!r.ok) throw new Error("gravação " + r.status);
}
// Só cria se ainda não existir. Devolve true se criou.
async function criar(key, value) {
  const r = await buscar(`${SUPABASE_URL}/rest/v1/${TABELA}?on_conflict=key`, { method: "POST", headers: cab({ Prefer: "resolution=ignore-duplicates,return=representation" }), body: JSON.stringify([{ key, value, updated_at: new Date().toISOString() }]) });
  if (!r.ok) throw new Error("criação " + r.status);
  return (await r.json()).length > 0;
}
async function apagar(key) {
  const r = await buscar(`${SUPABASE_URL}/rest/v1/${TABELA}?key=eq.${encodeURIComponent(key)}`, { method: "DELETE", headers: cab({ Prefer: "return=minimal" }) });
  if (!r.ok) throw new Error("exclusão " + r.status);
}
async function listarContas() {
  const r = await buscar(`${SUPABASE_URL}/rest/v1/${TABELA}?key=like.${encodeURIComponent(K_CONTA + "*")}&select=key,value&limit=5000`, { headers: cab() });
  if (!r.ok) throw new Error("listagem " + r.status);
  return (await r.json()).map((x) => x.value).filter((v) => v && v.id);
}

/* ---------------- senhas e códigos ---------------- */
const scrypt = (s, salt) => new Promise((ok, no) => crypto.scrypt(String(s), salt, 32, (e, k) => (e ? no(e) : ok(k.toString("hex")))));
const sal = () => crypto.randomBytes(16).toString("hex");
async function resumo(segredo, salt) { return scrypt(segredo, salt); }
function iguais(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
export function novoCodigo() {
  const b = crypto.randomBytes(8);
  let s = "";
  for (let i = 0; i < 6; i++) s += ALFABETO[b[i] % ALFABETO.length];
  return `SRM-${s.slice(0, 3)}-${s.slice(3)}`;
}
const normCodigo = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
export function novaSenhaTemp() {
  const b = crypto.randomBytes(6);
  let s = "";
  for (let i = 0; i < 6; i++) s += ALFABETO[b[i] % ALFABETO.length];
  return s.toLowerCase() + String(10 + (b[0] % 90));
}

/* ---------------- utilitários ---------------- */
const limpo = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
const emailNorm = (v) => limpo(v, 160).toLowerCase();
const emailOk = (e) => /^[^\s@]{1,64}@[^\s@]{1,120}\.[^\s@]{2,}$/.test(e);
export const numeroZap = (v) => { let d = String(v || "").replace(/\D/g, ""); if (d.length === 10 || d.length === 11) d = "55" + d; return d; };
const zapOk = (d) => d.length >= 12 && d.length <= 15;
const idHash = (email) => crypto.createHash("sha256").update(email).digest("hex").slice(0, 40);
const novoId = () => crypto.randomBytes(8).toString("hex");
const REGEX_ID = /^[a-f0-9]{16}$/;
const REGEX_APARELHO = /^[A-Za-z0-9_-]{3,80}$/;

function bloqueado(ip, agora = Date.now()) {
  const l = (falhas.get(ip) || []).filter((t) => agora - t < JANELA);
  falhas.set(ip, l);
  return l.length >= 10;
}
async function falhou(ip) { falhas.set(ip, [...(falhas.get(ip) || []), Date.now()]); await new Promise((r) => setTimeout(r, Number(process.env.ESPERA_FALHA_MS ?? 600))); }

// Situação do acesso aos sermões, já considerando a validade.
export function situacaoSermoes(conta, agora = Date.now()) {
  const s = (conta && conta.sermoes) || {};
  if (s.estado === "liberado") {
    if (s.ate && Date.parse(s.ate) < agora) return "expirado";
    return "liberado";
  }
  return s.estado || "nenhum";
}
function perfil(conta) {
  const s = conta.sermoes || {};
  return {
    id: conta.id, nome: conta.nome, email: conta.email, whatsapp: conta.whatsapp, criadoEm: conta.criadoEm,
    sermoes: { estado: situacaoSermoes(conta), plano: s.plano || "", ate: s.ate || "", solicitadoEm: s.solicitadoEm || "" },
  };
}
function resumoAdmin(conta) {
  const s = conta.sermoes || {};
  return {
    ...perfil(conta), ultimoAcesso: conta.ultimoAcesso || "", obs: s.obs || "", mensagem: s.mensagem || "", liberadoEm: s.liberadoEm || "",
    temCodigo: !!s.codigoHash, bloqueadoEm: s.bloqueadoEm || "", senhaTemporaria: !!conta.senhaTemp,
  };
}
const carregarConta = async (id) => { if (!REGEX_ID.test(String(id || ""))) return null; const l = await ler(K_CONTA + id); return l ? l.value : null; };
const salvarConta = (c) => gravar(K_CONTA + c.id, c);

// Usado pelo /api/ia: o sermonista ainda tem acesso (não foi bloqueado nem expirou)?
export async function sermonistaAtivo(id, agora = Date.now()) {
  try { const c = await carregarConta(id); return !!c && situacaoSermoes(c, agora) === "liberado"; } catch (e) { return false; }
}

function emitir(papel, conta, segredo, opc = {}) {
  const longo = !!(opc.lembrar && REGEX_APARELHO.test(String(opc.dispositivo || "")));
  const e = Date.now() + (longo ? LEMBRAR_MS : SESSAO_MS);
  const pl = { papel, i: conta.id, n: conta.nome, e };
  if (longo) pl.v = String(opc.dispositivo);
  return { token: assinar(pl, segredo), e, lembrado: longo };
}

/* ---------------- ações ---------------- */
export async function acaoConta(c, sessao, ip, segredo) {
  const acao = String(c.acao || "");
  const ehAdmin = !!(sessao && sessao.papel === "admin");

  if (acao === "cadastrar") {
    if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };
    const nome = limpo(c.nome, 80), email = emailNorm(c.email), zap = numeroZap(c.whatsapp), senha = String(c.senha || "");
    if (nome.length < 2) return { status: 400, ok: false, motivo: "nome_invalido" };
    if (!emailOk(email)) return { status: 400, ok: false, motivo: "email_invalido" };
    if (!zapOk(zap)) return { status: 400, ok: false, motivo: "whatsapp_invalido" };
    if (senha.length < 6 || senha.length > 100) return { status: 400, ok: false, motivo: "senha_curta" };
    falhas.set(ip, [...(falhas.get(ip) || []), Date.now()]); // cada cadastro conta no freio (evita criar contas em massa)
    const id = novoId();
    // o e-mail é a chave única: quem criar primeiro fica com ele
    if (!(await criar(K_EMAIL + idHash(email), { id }))) { await falhou(ip); return { status: 409, ok: false, motivo: "email_ja_cadastrado" }; }
    const salt = sal();
    const conta = { id, nome, email, whatsapp: zap, salt, hash: await resumo(senha, salt), criadoEm: new Date().toISOString(), ultimoAcesso: new Date().toISOString(), sermoes: { estado: "nenhum", plano: "" } };
    await salvarConta(conta);
    return { status: 200, ok: true, ...emitir("usuario", conta, segredo, c), perfil: perfil(conta) };
  }

  if (acao === "entrar") {
    if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };
    const email = emailNorm(c.email), senha = String(c.senha || "");
    if (!emailOk(email) || !senha || senha.length > 100) return { status: 400, ok: false, motivo: "invalido" };
    const ix = await ler(K_EMAIL + idHash(email));
    const conta = ix && ix.value ? await carregarConta(ix.value.id) : null;
    if (!conta) { await scrypt(senha, sal()).catch(() => {}); await falhou(ip); return { status: 401, ok: false, motivo: "email_ou_senha" }; }
    if (!iguais(await resumo(senha, conta.salt), conta.hash)) { await falhou(ip); return { status: 401, ok: false, motivo: "email_ou_senha" }; }
    conta.ultimoAcesso = new Date().toISOString();
    await salvarConta(conta);
    return { status: 200, ok: true, ...emitir("usuario", conta, segredo, c), perfil: perfil(conta), trocarSenha: !!conta.senhaTemp };
  }

  /* ----- administrador ----- */
  if (acao.startsWith("adm")) {
    if (!ehAdmin) return { status: 401, ok: false, motivo: "sem_sessao" };
    if (acao === "admlistar") {
      const todas = await listarContas();
      const ordem = { solicitado: 0, liberado: 1, expirado: 2, bloqueado: 3, nenhum: 4 };
      const lista = todas.map(resumoAdmin).sort((a, b) => (ordem[a.sermoes.estado] ?? 9) - (ordem[b.sermoes.estado] ?? 9) || String(b.criadoEm).localeCompare(String(a.criadoEm)));
      return { status: 200, ok: true, contas: lista, pendentes: lista.filter((x) => x.sermoes.estado === "solicitado").length };
    }
    const conta = await carregarConta(c.id);
    if (!conta) return { status: 404, ok: false, motivo: "nao_encontrada" };
    conta.sermoes = conta.sermoes || { estado: "nenhum" };
    const agora = new Date().toISOString();
    if (acao === "admliberar") {
      const codigo = novoCodigo();
      const salt = sal();
      const dias = Math.max(0, Math.min(3650, Math.floor(Number(c.dias) || 0)));
      conta.sermoes = { ...conta.sermoes, estado: "liberado", liberadoEm: agora, codigoSalt: salt, codigoHash: await resumo(normCodigo(codigo), salt), ate: dias ? new Date(Date.now() + dias * 86400000).toISOString() : "", plano: limpo(c.plano, 40) || conta.sermoes.plano || "liberado", falhas: 0 };
      delete conta.sermoes.bloqueadoEm;
      await salvarConta(conta);
      return { status: 200, ok: true, codigo, conta: resumoAdmin(conta) };
    }
    if (acao === "admajustar") {
      if (c.plano !== undefined) conta.sermoes.plano = limpo(c.plano, 40);
      if (c.ate !== undefined) { const t = Date.parse(c.ate); conta.sermoes.ate = c.ate === "" || c.ate === null ? "" : Number.isFinite(t) ? new Date(t).toISOString() : conta.sermoes.ate || ""; }
      if (c.obs !== undefined) conta.sermoes.obs = limpo(c.obs, 300);
      await salvarConta(conta);
      return { status: 200, ok: true, conta: resumoAdmin(conta) };
    }
    if (acao === "admbloquear") { conta.sermoes = { ...conta.sermoes, estado: "bloqueado", bloqueadoEm: agora }; await salvarConta(conta); return { status: 200, ok: true, conta: resumoAdmin(conta) }; }
    if (acao === "admnegar") { conta.sermoes = { estado: "nenhum", plano: conta.sermoes.plano || "", obs: conta.sermoes.obs || "" }; await salvarConta(conta); return { status: 200, ok: true, conta: resumoAdmin(conta) }; }
    if (acao === "admsenhatemp") {
      const senha = novaSenhaTemp();
      conta.salt = sal(); conta.hash = await resumo(senha, conta.salt); conta.senhaTemp = true;
      await salvarConta(conta);
      return { status: 200, ok: true, senha, conta: resumoAdmin(conta) };
    }
    if (acao === "admexcluir") {
      await apagar(K_CONTA + conta.id);
      await apagar(K_EMAIL + idHash(conta.email));
      await apagar(K_SERMOES + conta.id);
      return { status: 200, ok: true };
    }
    return { status: 400, ok: false, motivo: "acao_invalida" };
  }

  /* ----- usuário ----- */
  if (!sessao || !["usuario", "sermonista"].includes(sessao.papel)) return { status: 401, ok: false, motivo: "sem_sessao" };
  const conta = await carregarConta(sessao.id);
  if (!conta) return { status: 401, ok: false, motivo: "sem_sessao" };

  if (acao === "eu") return { status: 200, ok: true, perfil: perfil(conta), trocarSenha: !!conta.senhaTemp };

  if (acao === "trocarsenha") {
    if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };
    const atual = String(c.atual || ""), nova = String(c.nova || "");
    if (nova.length < 6 || nova.length > 100) return { status: 400, ok: false, motivo: "senha_curta" };
    if (!iguais(await resumo(atual, conta.salt), conta.hash)) { await falhou(ip); return { status: 401, ok: false, motivo: "senha_incorreta" }; }
    conta.salt = sal(); conta.hash = await resumo(nova, conta.salt); delete conta.senhaTemp;
    await salvarConta(conta);
    return { status: 200, ok: true };
  }

  if (acao === "solicitarsermoes") {
    conta.sermoes = conta.sermoes || { estado: "nenhum" };
    const sit = situacaoSermoes(conta);
    if (sit === "liberado") return { status: 200, ok: true, perfil: perfil(conta) };
    if (sit === "bloqueado") return { status: 403, ok: false, motivo: "bloqueado" };
    conta.sermoes = { ...conta.sermoes, estado: "solicitado", solicitadoEm: new Date().toISOString(), mensagem: limpo(c.mensagem, 300) };
    await salvarConta(conta);
    return { status: 200, ok: true, perfil: perfil(conta) };
  }

  if (acao === "sermaologin") {
    if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };
    const s = conta.sermoes || {};
    const sit = situacaoSermoes(conta);
    if (sit === "bloqueado") return { status: 403, ok: false, motivo: "bloqueado" };
    if (sit === "expirado") return { status: 403, ok: false, motivo: "expirado" };
    if (sit !== "liberado" || !s.codigoHash) return { status: 403, ok: false, motivo: "nao_liberado" };
    const cod = normCodigo(c.codigo);
    if (cod.length < 6 || cod.length > 20) { await falhou(ip); return { status: 401, ok: false, motivo: "codigo_incorreto" }; }
    if (!iguais(await resumo(cod, s.codigoSalt), s.codigoHash)) {
      await falhou(ip);
      conta.sermoes.falhas = (s.falhas || 0) + 1;
      await salvarConta(conta);
      return { status: 401, ok: false, motivo: "codigo_incorreto" };
    }
    if (s.falhas) { conta.sermoes.falhas = 0; await salvarConta(conta); }
    return { status: 200, ok: true, ...emitir("sermonista", conta, segredo, c), perfil: perfil(conta) };
  }

  if (acao === "sermaoget" || acao === "sermaoset") {
    if (sessao.papel !== "sermonista" || situacaoSermoes(conta) !== "liberado") return { status: 403, ok: false, motivo: "sem_acesso_sermoes" };
    if (acao === "sermaoget") { const l = await ler(K_SERMOES + conta.id); return { status: 200, ok: true, value: l ? l.value : null }; }
    if (!Array.isArray(c.value)) return { status: 400, ok: false, motivo: "valor_invalido" };
    if (JSON.stringify(c.value).length > LIMITE_SERMOES) return { status: 413, ok: false, motivo: "valor_grande_demais" };
    await gravar(K_SERMOES + conta.id, c.value);
    return { status: 200, ok: true };
  }
  return { status: 400, ok: false, motivo: "acao_invalida" };
}

/* ---------------- handler ---------------- */
function resposta(res, status, corpo) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(corpo));
}
function cors(req, res) {
  const o = String((req.headers && req.headers.origin) || "");
  if (o && ORIGENS.includes(o)) {
    res.setHeader("Access-Control-Allow-Origin", o);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "600");
  }
}
export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "POST") return resposta(res, 405, { ok: false, motivo: "metodo" });
  const segredo = process.env.TOKEN_SECRET;
  if (!process.env.SUPABASE_SERVICE_KEY || !segredo || segredo.length < 16) return resposta(res, 500, { ok: false, motivo: "servidor_nao_configurado" });
  let corpo = req.body;
  if (typeof corpo === "string") { try { corpo = JSON.parse(corpo); } catch (e) { corpo = null; } }
  if (!corpo || typeof corpo !== "object") return resposta(res, 400, { ok: false, motivo: "corpo_invalido" });
  const ip = String((req.headers && (req.headers["x-forwarded-for"] || req.headers["x-real-ip"])) || "?").split(",")[0].trim();
  const auth = String((req.headers && req.headers.authorization) || "");
  const p = auth.startsWith("Bearer ") ? verificar(auth.slice(7), segredo) : null;
  const sessao = p ? { papel: p.papel, id: p.i, nome: p.n } : null;
  try {
    const r = await acaoConta(corpo, sessao, ip, segredo);
    const { status, ...resto } = r;
    return resposta(res, status || 200, resto);
  } catch (e) {
    return resposta(res, 502, { ok: false, motivo: "falha_no_banco" });
  }
}
