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
const TABELA_PUBLICA = "site_data";
// Conteúdo público que só quem tem direito grava, e só por aqui (qualquer um continua LENDO direto do banco).
// setores vazio = só administrador. Com setores, o operador desse setor (ou "todos") também grava.
const PUBLICAS = [
  { teste: (k) => k !== "biblia:sermoes" && /^biblia:[A-Za-z0-9:_-]{1,80}$/.test(k), setores: [] },   // site da Bíblia Avivar (os sermões são PRIVADOS: ver REGRAS)
  { teste: (k) => ["avivar:doacoes", "avivar:site", "avivar:codigos", "avivar:seeds"].includes(k), setores: [] }, // chave Pix, textos do site, conteúdo inicial
  { teste: (k) => ["avivar:colaboradores", "avivar:avivarkids", "avivar:lideranca", "avivar:certificados"].includes(k), setores: [] }, // equipe e certificados (só o administrador edita)
  { teste: (k) => k === "avivar:loja", setores: ["loja"] },                                      // preços e links de pagamento
  { teste: (k) => ["avivar:eventos", "avivar:galeria", "avivar:aovivo", "avivar:transmissoespassadas", "avivar:estudos", "avivar:avivarnews", "avivar:biblioteca", "avivar:manchete", "avivar:historia"].includes(k), setores: [] }, // conteúdo do site (só o administrador edita)
  { teste: (k) => k === "avivar:visitantesdodia", setores: ["visitantes"] },                      // banner de boas-vindas aos visitantes (recepção)
  { teste: (k) => ["avivar:oracaoencontros", "avivar:oracaolocaldia"].includes(k), setores: ["oracoes"] }, // agenda de Oração nos Lares
];
const regraPublicaDe = (key) => PUBLICAS.find((r) => r.teste(key));
export function podeGravarPublica(sessao, regra) {
  if (!sessao || !regra) return false;
  if (sessao.papel === "admin") return true;
  const s = sessao.setores || [];
  return regra.setores.some((x) => s.includes(x)) || (regra.setores.length > 0 && s.includes("todos"));
}
const LIMITE_PUBLICO = 1_500_000; // bytes de JSON por gravação
// Sites autorizados a chamar esta função a partir do navegador (CORS). Mais endereços: variável CORS_ORIGENS, separados por vírgula.
export const ORIGENS = ["https://biblia-avivar.vercel.app", ...String(process.env.CORS_ORIGENS || "").split(",").map((x) => x.trim()).filter(Boolean)];
const CHAVE_OPERADORES = "avivar:operatorcodes";
const SESSAO_MS = 12 * 60 * 60 * 1000; // 12 horas

// Quem pode o quê. setores = setores de operador que liberam a chave (o administrador sempre pode).
// "todos" libera tudo, exceto o que tem semTodos (caixa só com setor "caixa" marcado explicitamente).
const REGRAS = [
  { teste: (k) => k === CHAVE_OPERADORES, setores: [] }, // só administrador
  { teste: (k) => k === "biblia:sermoes", setores: [] }, // sermões dos pastores (Bíblia Avivar): só o administrador lê e grava, nunca público
  { teste: (k) => ["avivar:caixa", "avivar:caixaextra", "avivar:bens"].includes(k), setores: ["caixa"], semTodos: true },
  { teste: (k) => k === "avivar:membros", setores: ["membros"] },
  { teste: (k) => k === "avivar:visitantes", setores: ["visitantes"] },
  { teste: (k) => k.startsWith("avivar:escalapins:"), setores: ["escala"] },
  { teste: (k) => k === "avivar:pedidosOracao", setores: ["oracoes"], anonimoAcrescenta: true },
  { teste: (k) => k === "avivar:pedidosfisicos", setores: ["loja"], anonimoAcrescenta: true },
  { teste: (k) => k === "avivar:mensagens", setores: [], anonimoAcrescenta: true },                // mensagens do Contato: visitante envia, só o administrador lê
  { teste: (k) => k === "avivar:oracoes", setores: ["oracoes"], anonimoAcrescenta: true },        // pedidos de visita de oração em casa (nome, telefone, endereço)
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
async function lerLinha(key, tabela = TABELA) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?key=eq.${encodeURIComponent(key)}&select=value,updated_at`, { headers: cab() });
  if (!r.ok) throw new Error("leitura falhou " + r.status);
  const rows = await r.json();
  return rows.length ? rows[0] : null;
}
async function gravar(key, value, tabela = TABELA) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?on_conflict=key`, {
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

const REGEX_ESCOPO = /^[A-Za-z0-9_-]{1,60}$/;
const REGEX_APARELHO = /^[A-Za-z0-9_-]{3,80}$/;
const LEMBRAR_MS = 30 * 24 * 60 * 60 * 1000; // aparelho conectado: 30 dias

async function login(codigo, ip, segredo, opc = {}) {
  const c = String(codigo || "");
  if (!c || c.length > 200) return { ok: false, motivo: "invalido" };
  if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };

  const senhaAdmin = process.env.ADMIN_PASSWORD || process.env.SENHA_DO_ADMINISTRADOR;
  if (senhaAdmin && iguais(c, senhaAdmin)) {
    const e = Date.now() + SESSAO_MS;
    return { ok: true, papel: "admin", nome: "Administração", setores: ["todos"], token: assinar({ papel: "admin", n: "Administração", s: ["todos"], e }, segredo), ...lembradoDo({ papel: "admin", nome: "Administração" }, opc, segredo) };
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
    return { ok: true, papel: "operador", id: achado.id, nome: achado.nome, setores, token: assinar({ papel: "operador", i: achado.id, n: achado.nome, s: setores, e }, segredo), ...lembradoDo({ papel: "operador", id: achado.id, nome: achado.nome }, opc, segredo) };
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

// =====================================================================================
// AVIVAR MUSIC — cofre dos músicos
// Senha, código, WhatsApp, endereço, e-mail e os pedidos de cadastro dos músicos NÃO ficam mais no registro
// público do app (avivar:musicapp). Ficam aqui, no cofre (site_private), e o login é conferido neste servidor.
//   avivar:musicsegredos            -> cofre do Ministério Avivar do Espírito (escopo "principal")
//   avivar:musicsegredos:<unidade>  -> cofre de cada unidade (outra igreja)
// Antes da migração (cofre ainda não criado) os dados são lidos do registro público antigo, para nada parar.
// =====================================================================================
const MUSIC_PUBLICO = "avivar:musicapp";
const MUSIC_UNIDADE = "avivar:musicapp:u:";
const COFRE_PRINCIPAL = "avivar:musicsegredos";
export const CAMPOS_SEGREDO = ["codigo", "senhaHash", "whatsapp", "endereco", "email", "igreja", "obs"];
const CAMPOS_FLAG = ["ativo", "lider", "permissoes"]; // a cópia pública serve só para exibir; quem vale é a do cofre
export const CAMPOS_PESSOA = [...CAMPOS_SEGREDO, ...CAMPOS_FLAG];
const CAMPOS_UNIDADE = ["liderWhatsapp"];
const PERMS = ["louvores", "harpa", "mover", "musicos", "conteudo"];
const PERM_TUDO = { louvores: true, harpa: true, mover: true, musicos: true, conteudo: true };
const LIMITE_COFRE = 1_500_000;
const escopoValido = (e) => e === "principal" || (typeof e === "string" && REGEX_ESCOPO.test(e));
const chavePublicaMusic = (e) => (e === "principal" ? MUSIC_PUBLICO : MUSIC_UNIDADE + e);
const chaveCofre = (e) => (e === "principal" ? COFRE_PRINCIPAL : `${COFRE_PRINCIPAL}:${e}`);
const ehObj = (x) => !!x && typeof x === "object" && !Array.isArray(x);

export function igualProfundo(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => igualProfundo(x, b[i]));
  const ka = Object.keys(a).filter((k) => a[k] !== undefined), kb = Object.keys(b).filter((k) => b[k] !== undefined);
  return ka.length === kb.length && ka.every((k) => igualProfundo(a[k], b[k]));
}

export const cofreVazio = () => ({ v: 1, pessoas: {}, unidades: {}, solicitacoes: [] });
export function normalizarCofre(d) {
  const o = ehObj(d) ? d : {};
  const r = { v: 1, pessoas: ehObj(o.pessoas) ? o.pessoas : {}, unidades: ehObj(o.unidades) ? o.unidades : {}, solicitacoes: Array.isArray(o.solicitacoes) ? o.solicitacoes : [] };
  if (typeof o.liderCodigo === "string") r.liderCodigo = o.liderCodigo;
  return r;
}
// Extrai do valor do app (público ou já misturado) a parte sensível, no formato do cofre.
export function segDoValor(v) {
  const seg = cofreVazio();
  if (!ehObj(v)) return seg;
  for (const a of Array.isArray(v.acessos) ? v.acessos : []) {
    if (!ehObj(a) || typeof a.id !== "string" || !a.id) continue;
    const p = {};
    for (const k of CAMPOS_PESSOA) if (a[k] !== undefined) p[k] = a[k];
    seg.pessoas[a.id] = p;
  }
  for (const u of Array.isArray(v.unidades) ? v.unidades : []) {
    if (!ehObj(u) || typeof u.id !== "string" || !u.id) continue;
    const p = {};
    for (const k of CAMPOS_UNIDADE) if (u[k] !== undefined) p[k] = u[k];
    seg.unidades[u.id] = p;
  }
  if (Array.isArray(v.solicitacoes)) seg.solicitacoes = v.solicitacoes.filter((s) => ehObj(s) && typeof s.id === "string" && s.id);
  if (typeof v.liderCodigo === "string") seg.liderCodigo = v.liderCodigo;
  return seg;
}
// Valor público: sem nenhum dado sensível. A marca _cofre diz que os dados sensíveis já estão no cofre.
export function publicoDoValor(v) {
  if (!ehObj(v)) return v;
  const p = { ...v };
  if (Array.isArray(v.acessos)) p.acessos = v.acessos.map((a) => { if (!ehObj(a)) return a; const c = { ...a }; for (const k of CAMPOS_SEGREDO) delete c[k]; return c; });
  if (Array.isArray(v.unidades)) p.unidades = v.unidades.map((u) => { if (!ehObj(u)) return u; const c = { ...u }; for (const k of CAMPOS_UNIDADE) delete c[k]; return c; });
  delete p.solicitacoes; delete p.liderCodigo;
  p._cofre = 1;
  return p;
}
// Diferença entre o que o navegador carregou (ref) e o que ele quer gravar (novo): só o que mudou.
export function diffSeg(ref, novo) {
  const a = normalizarCofre(ref), b = normalizarCofre(novo);
  const patch = {};
  const mapa = (nome, campos) => {
    const out = {};
    for (const id of new Set([...Object.keys(a[nome]), ...Object.keys(b[nome])])) {
      if (!(id in b[nome])) { out[id] = null; continue; }
      const campo = {};
      for (const k of campos) {
        const x = (a[nome][id] || {})[k], y = b[nome][id][k];
        if (!igualProfundo(x, y)) campo[k] = y === undefined ? null : y;
      }
      if (Object.keys(campo).length) out[id] = campo;
    }
    if (Object.keys(out).length) patch[nome] = out;
  };
  mapa("pessoas", CAMPOS_PESSOA);
  mapa("unidades", CAMPOS_UNIDADE);
  const sol = {};
  const antes = new Map(a.solicitacoes.map((s) => [s.id, s])), depois = new Map(b.solicitacoes.map((s) => [s.id, s]));
  for (const [id, s] of depois) if (!igualProfundo(antes.get(id), s)) sol[id] = s;
  for (const id of antes.keys()) if (!depois.has(id)) sol[id] = null;
  if (Object.keys(sol).length) patch.solicitacoes = sol;
  if (typeof b.liderCodigo === "string" && b.liderCodigo !== a.liderCodigo) patch.liderCodigo = b.liderCodigo;
  return patch;
}
export const patchVazio = (p) => !p || Object.keys(p).length === 0;

// ---------- quem é quem no Avivar Music ----------
const NIVEL_NENHUM = { tipo: "nenhum", ler: false, escrever: false, indicar: false, admin: false, perm: {} };
export function nivelMusic(sessao, escopo, cofre) {
  if (!sessao) return NIVEL_NENHUM;
  if (sessao.papel === "admin") return { tipo: "admin", ler: true, escrever: true, indicar: true, admin: true, perm: { ...PERM_TUDO } };
  if (sessao.papel === "operador") {
    const s = sessao.setores || [];
    const temSetor = s.includes("todos") || s.includes("avivarmusic");
    const noEscopo = escopo === "principal" ? (!sessao.esc || sessao.esc === "principal") : sessao.esc === escopo;
    if (temSetor && noEscopo) return { tipo: "operador", ler: true, escrever: true, indicar: false, admin: false, perm: { ...PERM_TUDO } };
    return NIVEL_NENHUM;
  }
  if (sessao.papel === "liderunidade") {
    if (escopo !== "principal" && sessao.esc === escopo) return { tipo: "liderunidade", ler: true, escrever: true, indicar: true, admin: false, perm: { ...PERM_TUDO } };
    return NIVEL_NENHUM;
  }
  if (sessao.papel === "musico" && sessao.esc === escopo) {
    const p = (cofre && cofre.pessoas && cofre.pessoas[sessao.id]) || null;
    if (!p || p.ativo === false) return NIVEL_NENHUM;
    if (p.lider) {
      const perm = { ...PERM_TUDO, ...(ehObj(p.permissoes) ? p.permissoes : {}) };
      return { tipo: "musicolider", ler: true, escrever: !!perm.musicos, indicar: false, admin: false, perm };
    }
    return { tipo: "musico", ler: false, escrever: false, indicar: false, admin: false, perm: {} };
  }
  return NIVEL_NENHUM;
}

// ---------- validação e aplicação das mudanças no cofre ----------
const texto = (v, max) => typeof v === "string" && v.length <= max;
function campoValido(k, v) {
  if (k === "ativo" || k === "lider") return typeof v === "boolean";
  if (k === "permissoes") return ehObj(v) && Object.keys(v).every((x) => PERMS.includes(x) && typeof v[x] === "boolean");
  if (k === "senhaHash") return texto(v, 80) && (v === "" || /^[a-f0-9]{1,64}$/.test(v));
  if (k === "obs") return texto(v, 600);
  if (k === "endereco") return texto(v, 300);
  if (k === "liderWhatsapp") return texto(v, 40);
  return texto(v, 160);
}
export function aplicarPatch(cofre, patch, nivel) {
  if (!ehObj(patch)) return { erro: { status: 400, motivo: "patch_invalido" } };
  if (!nivel.escrever) return { erro: { status: 403, motivo: "sem_permissao" } };
  const novo = normalizarCofre(JSON.parse(JSON.stringify(cofre)));
  for (const [id, mud] of Object.entries(ehObj(patch.pessoas) ? patch.pessoas : {})) {
    if (!id || id.length > 64) return { erro: { status: 400, motivo: "id_invalido" } };
    if (mud === null) { delete novo.pessoas[id]; continue; }
    if (!ehObj(mud)) return { erro: { status: 400, motivo: "patch_invalido" } };
    const atual = novo.pessoas[id] ? { ...novo.pessoas[id] } : {};
    for (const [k, v] of Object.entries(mud)) {
      if (!CAMPOS_PESSOA.includes(k)) return { erro: { status: 400, motivo: "campo_invalido" } };
      if ((k === "lider" || k === "permissoes") && !nivel.indicar) return { erro: { status: 403, motivo: "so_o_administrador_indica_lider" } };
      if (v === null) { delete atual[k]; continue; }
      if (!campoValido(k, v)) return { erro: { status: 400, motivo: "valor_invalido" } };
      atual[k] = v;
    }
    novo.pessoas[id] = atual;
  }
  for (const [id, mud] of Object.entries(ehObj(patch.unidades) ? patch.unidades : {})) {
    if (!nivel.admin) return { erro: { status: 403, motivo: "sem_permissao" } };
    if (!id || id.length > 64) return { erro: { status: 400, motivo: "id_invalido" } };
    if (mud === null) { delete novo.unidades[id]; continue; }
    if (!ehObj(mud)) return { erro: { status: 400, motivo: "patch_invalido" } };
    const atual = novo.unidades[id] ? { ...novo.unidades[id] } : {};
    for (const [k, v] of Object.entries(mud)) {
      if (!CAMPOS_UNIDADE.includes(k)) return { erro: { status: 400, motivo: "campo_invalido" } };
      if (v === null) { delete atual[k]; continue; }
      if (!campoValido(k, v)) return { erro: { status: 400, motivo: "valor_invalido" } };
      atual[k] = v;
    }
    novo.unidades[id] = atual;
  }
  if (ehObj(patch.solicitacoes)) {
    const mapa = new Map(novo.solicitacoes.map((s) => [s.id, s]));
    for (const [id, s] of Object.entries(patch.solicitacoes)) {
      if (!id || id.length > 64) return { erro: { status: 400, motivo: "id_invalido" } };
      if (s === null) { mapa.delete(id); continue; }
      if (!ehObj(s) || s.id !== id || JSON.stringify(s).length > 4000) return { erro: { status: 400, motivo: "valor_invalido" } };
      mapa.set(id, s);
    }
    novo.solicitacoes = [...mapa.values()];
  }
  if (patch.liderCodigo !== undefined) {
    if (!nivel.admin) return { erro: { status: 403, motivo: "sem_permissao" } };
    if (!texto(patch.liderCodigo, 80) || !patch.liderCodigo) return { erro: { status: 400, motivo: "valor_invalido" } };
    novo.liderCodigo = patch.liderCodigo;
  }
  // um código nunca pode valer para duas pessoas
  const codigos = new Set();
  for (const p of Object.values(novo.pessoas)) {
    const c = String(p.codigo || "").trim().toUpperCase();
    if (!c) continue;
    if (codigos.has(c)) return { erro: { status: 409, motivo: "codigo_duplicado" } };
    codigos.add(c);
  }
  if (Object.keys(novo.pessoas).length > 2000 || novo.solicitacoes.length > 3000 || JSON.stringify(novo).length > LIMITE_COFRE) return { erro: { status: 413, motivo: "cofre_cheio" } };
  return { doc: novo, mudou: !igualProfundo(cofre, novo) };
}

// ---------- senha dos músicos (mesmo resumo que o app sempre usou) ----------
const hashSenha = (codigo, senha) => crypto.createHash("sha256").update(`avivar-music|${String(codigo).toUpperCase()}|${senha}`).digest("hex");
function hashSenhaSemCripto(codigo, senha) { // aparelhos antigos sem crypto.subtle gravavam um resumo curto com prefixo "f"
  const t = `avivar-music|${String(codigo).toUpperCase()}|${senha}`;
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) >>> 0;
  return "f" + h.toString(16);
}
function senhaConfere(p, senha) {
  if (!p || !p.senhaHash || !p.codigo) return false;
  const guardado = String(p.senhaHash);
  // SHA-256 tem 64 caracteres (pode começar com "f"); o resumo curto dos aparelhos sem crypto.subtle tem no máximo 9.
  const curto = guardado.length <= 12 && guardado.startsWith("f");
  return iguais(guardado, curto ? hashSenhaSemCripto(p.codigo, senha) : hashSenha(p.codigo, senha));
}
function acharPessoa(cofre, ident, soCodigo = false) {
  const x = String(ident || "").trim().toLowerCase();
  if (!x) return null;
  for (const [id, p] of Object.entries(cofre.pessoas)) {
    if (p.ativo === false) continue;
    if (String(p.codigo || "").trim().toLowerCase() === x) return { id, ...p };
    if (!soCodigo && p.email && String(p.email).trim().toLowerCase() === x) return { id, ...p };
  }
  return null;
}

// ---------- leitura e gravação do cofre (com checagem contra gravação simultânea) ----------
async function carregarCofre(escopo) {
  const linha = await lerLinha(chaveCofre(escopo));
  if (linha) return { doc: normalizarCofre(linha.value), updated_at: linha.updated_at, existe: true };
  const pub = await lerLinha(chavePublicaMusic(escopo), TABELA_PUBLICA); // ainda não migrado: usa o registro público antigo
  return { doc: normalizarCofre(segDoValor(pub && pub.value)), updated_at: null, existe: false, publico: pub };
}
async function gravarCofre(escopo, doc, anterior) {
  const key = chaveCofre(escopo), agora = new Date().toISOString();
  if (!anterior) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}?on_conflict=key`, { method: "POST", headers: cab({ Prefer: "resolution=ignore-duplicates,return=representation" }), body: JSON.stringify([{ key, value: doc, updated_at: agora }]) });
    if (!r.ok) throw new Error("gravação do cofre falhou " + r.status);
    return (await r.json()).length > 0;
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}?key=eq.${encodeURIComponent(key)}&updated_at=eq.${encodeURIComponent(anterior)}`, { method: "PATCH", headers: cab({ Prefer: "return=representation" }), body: JSON.stringify({ value: doc, updated_at: agora }) });
  if (!r.ok) throw new Error("gravação do cofre falhou " + r.status);
  return (await r.json()).length > 0;
}
// fn(doc, estado) -> { doc, mudou, ...extra } | { erro }. Refaz a leitura se alguém gravou no meio do caminho.
async function atualizarCofre(escopo, fn) {
  for (let i = 0; i < 4; i++) {
    const est = await carregarCofre(escopo);
    const r = await fn(est.doc, est);
    if (r.erro || !r.mudou) return r;
    if (await gravarCofre(escopo, r.doc, est.existe ? est.updated_at : null)) return r;
  }
  return { erro: { status: 409, motivo: "conflito_tente_de_novo" } };
}

// Aparelho conectado desabilitado pela liderança: o token deixa de valer na hora.
async function aparelhoAtivo(esc, dev) {
  try {
    const linha = await lerLinha(`avivar:dev:${esc}:${dev}`, TABELA_PUBLICA);
    return !(linha && linha.value && linha.value.ativo === false);
  } catch (e) { return true; }
}
function lembradoDo(pessoa, opc, segredo) {
  if (!opc || !opc.lembrar || !REGEX_APARELHO.test(String(opc.dispositivo || "")) || !escopoValido(opc.base)) return {};
  const e = Date.now() + LEMBRAR_MS;
  // O que fica guardado no aparelho só vale para o Avivar Music (nunca para caixa, membros, etc.).
  const token = assinar({ papel: "operador", i: pessoa.id || "adm", n: pessoa.nome, s: ["avivarmusic"], x: opc.base, d: opc.dispositivo, e }, segredo);
  return { lembrado: { token, e } };
}

const cadastrosPorIp = new Map();
function limiteCadastro(ip, agora = Date.now()) {
  const l = (cadastrosPorIp.get(ip) || []).filter((t) => agora - t < JANELA);
  l.push(agora); cadastrosPorIp.set(ip, l);
  return l.length > 10;
}
const limpo = (v, max) => String(v == null ? "" : v).trim().slice(0, max);
const numeroZap = (v) => { let d = String(v || "").replace(/\D/g, ""); if (d.length === 10 || d.length === 11) d = "55" + d; return d; };
const novoId = () => crypto.randomBytes(5).toString("hex");

function tokenMusico(escopo, id, nome, opc, segredo) {
  const longo = !!(opc && opc.lembrar && REGEX_APARELHO.test(String(opc.dispositivo || "")));
  const e = Date.now() + (longo ? LEMBRAR_MS : SESSAO_MS);
  const pl = { papel: "musico", i: id, n: nome, s: [], x: escopo, e };
  if (longo) pl.d = opc.dispositivo;
  return { token: assinar(pl, segredo), e };
}
async function nomePublico(escopo, id) {
  try {
    const pub = await lerLinha(chavePublicaMusic(escopo), TABELA_PUBLICA);
    const a = ((pub && pub.value && pub.value.acessos) || []).find((x) => x && x.id === id);
    return (a && a.nome) || "Músico";
  } catch (e) { return "Músico"; }
}
async function falhou(ip) { registrarFalha(ip); await espera(Number(process.env.ESPERA_FALHA_MS ?? 700)); }

// Devolve { status, ...corpo }
export async function acaoMusica(corpo, sessao, ip, segredo) {
  const escopo = corpo.escopo === undefined ? "principal" : corpo.escopo;
  if (!escopoValido(escopo)) return { status: 400, ok: false, motivo: "escopo_invalido" };
  const acao = corpo.acao;

  if (acao === "musiclogin" || acao === "musicprimeiro") {
    const ident = limpo(corpo.ident, 200), senha = String(corpo.senha || "");
    if (!ident || !senha || senha.length > 200) return { status: 400, ok: false, motivo: "invalido" };
    if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };
    if (acao === "musicprimeiro" && senha.length < 6) return { status: 400, ok: false, motivo: "senha_curta" };
    const est = await carregarCofre(escopo);
    const p = acharPessoa(est.doc, ident);
    if (!p) { await falhou(ip); return { status: 401, ok: false, motivo: "nao_encontrado" }; }
    if (acao === "musiclogin") {
      if (!p.senhaHash) return { status: 401, ok: false, motivo: "sem_senha" };
      if (!senhaConfere(p, senha)) { await falhou(ip); return { status: 401, ok: false, motivo: "senha_incorreta" }; }
    } else {
      if (p.senhaHash) return { status: 409, ok: false, motivo: "ja_tem_senha" };
      const r = await atualizarCofre(escopo, (doc) => {
        const q = doc.pessoas[p.id];
        if (!q || q.senhaHash) return { erro: { status: 409, motivo: "ja_tem_senha" } };
        doc.pessoas[p.id] = { ...q, senhaHash: hashSenha(q.codigo, senha) };
        return { doc, mudou: true };
      });
      if (r.erro) return { ...r.erro, ok: false };
    }
    const nome = await nomePublico(escopo, p.id);
    const { token, e } = tokenMusico(escopo, p.id, nome, corpo, segredo);
    return { status: 200, ok: true, id: p.id, nome, lider: !!p.lider, permissoes: p.lider ? { ...PERM_TUDO, ...(ehObj(p.permissoes) ? p.permissoes : {}) } : null, token, e };
  }

  if (acao === "musicconcluir") {
    const codigo = limpo(corpo.codigo, 40), senha = String(corpo.senha || ""), d = ehObj(corpo.dados) ? corpo.dados : {};
    if (!codigo || senha.length < 6 || senha.length > 200) return { status: 400, ok: false, motivo: "invalido" };
    if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };
    const est = await carregarCofre(escopo);
    const p = acharPessoa(est.doc, codigo, true);
    if (!p) { await falhou(ip); return { status: 404, ok: false, motivo: "codigo_invalido" }; }
    if (p.senhaHash) return { status: 409, ok: false, motivo: "codigo_ja_usado" };
    const r = await atualizarCofre(escopo, (doc) => {
      const q = doc.pessoas[p.id];
      if (!q || q.senhaHash) return { erro: { status: 409, motivo: "codigo_ja_usado" } };
      doc.pessoas[p.id] = { ...q, senhaHash: hashSenha(q.codigo, senha), whatsapp: limpo(d.whatsapp, 40), endereco: limpo(d.endereco, 300), igreja: limpo(d.igreja, 160), obs: limpo(d.obs, 600), email: q.email || limpo(d.email, 160) };
      return { doc, mudou: true };
    });
    if (r.erro) return { ...r.erro, ok: false };
    const nome = await nomePublico(escopo, p.id);
    const { token, e } = tokenMusico(escopo, p.id, nome, corpo, segredo);
    return { status: 200, ok: true, id: p.id, nome, codigo: p.codigo, token, e };
  }

  if (acao === "musiccadastro") {
    const d = ehObj(corpo.dados) ? corpo.dados : {};
    const nome = limpo(d.nome, 120), endereco = limpo(d.endereco, 300), whatsapp = limpo(d.whatsapp, 40);
    const instrumentos = (Array.isArray(d.instrumentos) ? d.instrumentos : []).map((x) => limpo(x, 40)).filter(Boolean).slice(0, 12);
    if (nome.length < 3 || endereco.length < 5 || numeroZap(whatsapp).length < 12 || !instrumentos.length) return { status: 400, ok: false, motivo: "dados_incompletos" };
    if (limiteCadastro(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };
    const zap = numeroZap(whatsapp);
    const sol = { id: novoId(), nome, endereco, whatsapp, email: limpo(d.email, 160), igreja: limpo(d.igreja, 160), instrumentos, obs: limpo(d.obs, 600), status: "pendente", criadoEm: new Date().toISOString() };
    const r = await atualizarCofre(escopo, (doc) => {
      if (doc.solicitacoes.some((s) => s.status === "pendente" && numeroZap(s.whatsapp) === zap)) return { erro: { status: 409, motivo: "pendente_duplicado" } };
      if (Object.values(doc.pessoas).some((p) => p.whatsapp && numeroZap(p.whatsapp) === zap)) return { erro: { status: 409, motivo: "whatsapp_ja_tem_acesso" } };
      if (doc.solicitacoes.length >= 3000) return { erro: { status: 413, motivo: "cofre_cheio" } };
      doc.solicitacoes.push(sol);
      return { doc, mudou: true };
    });
    if (r.erro) return { ...r.erro, ok: false };
    return { status: 200, ok: true, id: sol.id };
  }

  if (acao === "musictrocarsenha") {
    if (!sessao || sessao.papel !== "musico" || sessao.esc !== escopo) return { status: 401, ok: false, motivo: "sem_sessao" };
    const atual = String(corpo.atual || ""), nova = String(corpo.nova || "");
    if (!atual || nova.length < 6 || nova.length > 200) return { status: 400, ok: false, motivo: "invalido" };
    if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };
    const r = await atualizarCofre(escopo, async (doc) => {
      const q = doc.pessoas[sessao.id];
      if (!q || q.ativo === false) return { erro: { status: 401, motivo: "sem_sessao" } };
      if (!senhaConfere(q, atual)) return { erro: { status: 403, motivo: "senha_atual_errada" } };
      doc.pessoas[sessao.id] = { ...q, senhaHash: hashSenha(q.codigo, nova) };
      return { doc, mudou: true };
    });
    if (r.erro) { if (r.erro.motivo === "senha_atual_errada") await falhou(ip); return { ...r.erro, ok: false }; }
    return { status: 200, ok: true };
  }

  if (acao === "musiclider") { // código de liderança de uma unidade (outra igreja)
    const c = limpo(corpo.codigo, 80).toLowerCase();
    if (escopo === "principal" || !c) return { status: 400, ok: false, motivo: "invalido" };
    if (bloqueado(ip)) return { status: 429, ok: false, motivo: "muitas_tentativas" };
    const est = await carregarCofre(escopo);
    const pub = est.publico || (await lerLinha(chavePublicaMusic(escopo), TABELA_PUBLICA));
    if (!pub || !est.doc.liderCodigo) { await falhou(ip); return { status: 401, ok: false, motivo: "invalido" }; }
    if (pub.value && pub.value.ativo === false) return { status: 403, ok: false, motivo: "unidade_desativada" };
    if (!iguais(c, String(est.doc.liderCodigo).trim().toLowerCase())) { await falhou(ip); return { status: 401, ok: false, motivo: "invalido" }; }
    const longo = !!(corpo.lembrar && REGEX_APARELHO.test(String(corpo.dispositivo || "")));
    const e = Date.now() + (longo ? LEMBRAR_MS : SESSAO_MS);
    const pl = { papel: "liderunidade", n: "Líder da unidade", s: [], x: escopo, e };
    if (longo) pl.d = corpo.dispositivo;
    return { status: 200, ok: true, papel: "liderunidade", nome: "Líder da unidade", token: assinar(pl, segredo), e };
  }

  if (acao === "musicsegredos") {
    if (!sessao) return { status: 401, ok: false, motivo: "sem_sessao" };
    const est = await carregarCofre(escopo);
    const nivel = nivelMusic(sessao, escopo, est.doc);
    const resumo = { tipo: nivel.tipo, escrever: nivel.escrever, indicar: nivel.indicar, admin: nivel.admin, perm: nivel.perm };
    if (corpo.op === "ler") {
      if (!nivel.ler) return { status: nivel.tipo === "musico" ? 200 : 403, ok: nivel.tipo === "musico", motivo: "sem_permissao", nivel: resumo };
      return { status: 200, ok: true, nivel: resumo, existe: est.existe, segredos: est.doc };
    }
    if (corpo.op === "gravar") {
      if (!nivel.escrever) return { status: 403, ok: false, motivo: "sem_permissao", nivel: resumo };
      const r = await atualizarCofre(escopo, (doc) => aplicarPatch(doc, corpo.patch, nivel));
      if (r.erro) return { ...r.erro, ok: false };
      return { status: 200, ok: true, mudou: !!r.mudou };
    }
    return { status: 400, ok: false, motivo: "acao_invalida" };
  }

  if (acao === "musicmigrar") { // leva os dados sensíveis do registro público antigo para o cofre e limpa o registro público
    if (!sessao) return { status: 401, ok: false, motivo: "sem_sessao" };
    const est = await carregarCofre(escopo);
    const nivel = nivelMusic(sessao, escopo, est.doc);
    if (!nivel.escrever) return { status: 403, ok: false, motivo: "sem_permissao" };
    let mudou = false;
    if (!est.existe) { // cria o cofre com o que existia no registro público (nada se perde)
      if (await gravarCofre(escopo, est.doc, null)) mudou = true;
    }
    const pub = est.publico || (await lerLinha(chavePublicaMusic(escopo), TABELA_PUBLICA));
    if (pub && ehObj(pub.value)) {
      const limpoPub = publicoDoValor(pub.value);
      if (!igualProfundo(limpoPub, pub.value)) { await gravar(chavePublicaMusic(escopo), limpoPub, TABELA_PUBLICA); mudou = true; }
    }
    return { status: 200, ok: true, mudou, pessoas: Object.keys(est.doc.pessoas).length };
  }

  return { status: 400, ok: false, motivo: "acao_invalida" };
}

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
  let sessao = p ? { papel: p.papel, id: p.i, nome: p.n, setores: Array.isArray(p.s) ? p.s : [], esc: p.x, dev: p.d } : null;

  try {
    // Token de aparelho conectado: deixa de valer assim que a liderança desabilita o aparelho.
    if (sessao && sessao.dev && sessao.esc && !(await aparelhoAtivo(sessao.esc, sessao.dev))) sessao = null;
    if (corpo.acao === "login") {
      const r = await login(corpo.codigo, ip, segredo, { lembrar: !!corpo.lembrar, dispositivo: corpo.dispositivo, base: corpo.base });
      return resposta(res, r.status || (r.ok ? 200 : 401), r);
    }
    if (corpo.acao === "quem") {
      if (!sessao) return resposta(res, 401, { ok: false, motivo: "sem_sessao" });
      return resposta(res, 200, { ok: true, papel: sessao.papel, nome: sessao.nome, id: sessao.id, setores: sessao.setores, esc: sessao.esc });
    }
    if (typeof corpo.acao === "string" && corpo.acao.startsWith("music")) {
      const r = await acaoMusica(corpo, sessao, ip, segredo);
      const { status, ...resto } = r;
      return resposta(res, status || 200, resto);
    }
    const key = typeof corpo.key === "string" ? corpo.key : "";
    if (corpo.acao === "setpub") {
      const regraPub = regraPublicaDe(key);
      if (!regraPub) return resposta(res, 400, { ok: false, motivo: "chave_nao_permitida" });
      if (!sessao) return resposta(res, 401, { ok: false, motivo: "sem_sessao" });
      if (!podeGravarPublica(sessao, regraPub)) return resposta(res, 403, { ok: false, motivo: "sem_permissao" });
      if (corpo.value === undefined) return resposta(res, 400, { ok: false, motivo: "sem_valor" });
      if (JSON.stringify(corpo.value).length > LIMITE_PUBLICO) return resposta(res, 413, { ok: false, motivo: "valor_grande_demais" });
      await gravar(key, corpo.value, TABELA_PUBLICA);
      return resposta(res, 200, { ok: true });
    }
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
