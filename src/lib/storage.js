// Adaptador de armazenamento — Supabase via REST (PostgREST) + cofre no servidor.
//
// Conteúdo público do site: continua lido e gravado direto na tabela site_data.
// Dados SENSÍVEIS (membros, caixa, visitantes, pedidos de oração, códigos de operador...):
// passam pela função /api/privado, que só entrega a quem provou ser administrador ou operador.
// A sessão fica só na memória da página (recarregar a página = entrar de novo).

const SUPABASE_URL = "https://xnxfzygofnztpumqxqzt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TKv2SXrc_3ovC1hGPMdCow_lGP578sv";

const REST_URL = `${SUPABASE_URL}/rest/v1/site_data`;
const API_PRIVADO = "/api/privado";

// Deve ser igual à lista de regras de api/privado.js
const CHAVES_PRIVADAS = [
  "avivar:operatorcodes", "avivar:caixa", "avivar:caixaextra", "avivar:bens",
  "avivar:membros", "avivar:visitantes", "avivar:pedidosOracao", "avivar:pedidosfisicos",
  "avivar:mensagens", "avivar:oracoes", "avivar:disciplina",
];
const PREFIXOS_PRIVADOS = ["avivar:escalapins:"];
// Visitantes (sem login) só podem ACRESCENTAR nestas; nunca ler nem alterar o que já existe.
const ANONIMO_ACRESCENTA = ["avivar:pedidosOracao", "avivar:pedidosfisicos", "avivar:mensagens", "avivar:oracoes"];

// Conteúdo público que só administrador/operador grava, e só pelo servidor (api/privado.js). Leitura segue direta.
const CHAVES_PUBLICAS_SERVIDOR = ["avivar:doacoes", "avivar:site", "avivar:codigos", "avivar:seeds", "avivar:loja",
  "avivar:colaboradores", "avivar:avivarkids", "avivar:lideranca", "avivar:certificados",
  "avivar:eventos", "avivar:galeria", "avivar:aovivo", "avivar:transmissoespassadas", "avivar:estudos", "avivar:avivarnews",
  "avivar:biblioteca", "avivar:manchete", "avivar:historia", "avivar:visitantesdodia", "avivar:oracaoencontros", "avivar:oracaolocaldia"];
export function ehChavePublicaServidor(key) { return CHAVES_PUBLICAS_SERVIDOR.includes(key); }

// Avisa a tela quando uma gravação NÃO foi aceita (sessão vencida ou sem permissão), para a pessoa não achar que salvou.
function avisarFalha(key, motivo) {
  try { window.dispatchEvent(new CustomEvent("avivar:falha-gravacao", { detail: { key, motivo } })); } catch (e) { /* sem window */ }
}

export function ehChavePrivada(key) {
  return CHAVES_PRIVADAS.includes(key) || PREFIXOS_PRIVADOS.some((p) => String(key).startsWith(p));
}

let sessao = null; // { token, papel, nome, setores, id, esc }
export function sessaoPrivada() { return sessao; }
export function privateLogout() { sessao = null; }

// ---- aparelho conectado (Avivar Music): o aparelho guarda só um token de 30 dias, nunca a senha ----
const lsTok = (base) => `am-tok-${base || "principal"}`;
function idAparelho() { try { let v = localStorage.getItem("am-aparelho"); if (!v) { v = Math.random().toString(36).slice(2, 8); localStorage.setItem("am-aparelho", v); } return v; } catch (e) { return "x" + Math.random().toString(36).slice(2, 6); } }
function guardarSessaoLembrada(base, s) { try { localStorage.setItem(lsTok(base), JSON.stringify({ token: s.token, e: s.e, papel: s.papel, nome: s.nome, setores: s.setores || [], id: s.id || "", esc: s.esc || base })); } catch (e) { /* sem storage */ } }
export function limparSessaoLembrada(base) { try { localStorage.removeItem(lsTok(base)); } catch (e) { /* sem storage */ } }
// Reativa a sessão guardada neste aparelho (se ainda valer). Devolve a sessão ou null.
export async function restaurarSessaoLembrada(base) {
  if (sessao) return sessao;
  let j = null;
  try { j = JSON.parse(localStorage.getItem(lsTok(base)) || "null"); } catch (e) { j = null; }
  if (!j || !j.token || !(j.e > Date.now())) { if (j) limparSessaoLembrada(base); return null; }
  try {
    const res = await fetch(API_PRIVADO, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${j.token}` }, body: JSON.stringify({ acao: "quem" }) });
    if (res.status === 401) { limparSessaoLembrada(base); return null; }
    if (!res.ok) return null;
  } catch (e) { return null; } // sem internet: tenta de novo mais tarde
  sessao = { token: j.token, papel: j.papel, nome: j.nome, setores: j.setores || [], id: j.id, esc: j.esc };
  return sessao;
}

export async function privateLogin(codigo, { guardar = true, exigirPapel = null, lembrar = false, base = "principal" } = {}) {
  try {
    const res = await fetch(API_PRIVADO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "login", codigo: String(codigo || ""), lembrar: !!lembrar, dispositivo: lembrar ? idAparelho() : undefined, base }),
    });
    const r = await res.json().catch(() => ({}));
    if (res.ok && r && r.ok && r.token) {
      if (exigirPapel && r.papel !== exigirPapel) return { ok: false, motivo: "invalido" };
      if (guardar) {
        sessao = { token: r.token, papel: r.papel, nome: r.nome, setores: r.setores || [], id: r.id, esc: undefined };
        if (lembrar && r.lembrado) guardarSessaoLembrada(base, { token: r.lembrado.token, e: r.lembrado.e, papel: "operador", nome: r.nome, setores: ["avivarmusic"], id: r.id || "adm", esc: base });
      }
      return { ok: true, papel: r.papel, nome: r.nome, setores: r.setores || [], id: r.id };
    }
    return { ok: false, motivo: (r && r.motivo) || "invalido" };
  } catch (e) {
    return { ok: false, motivo: "sem_conexao" };
  }
}

async function chamarPrivado(corpo) {
  const headers = { "Content-Type": "application/json" };
  if (sessao) headers.Authorization = `Bearer ${sessao.token}`;
  const res = await fetch(API_PRIVADO, { method: "POST", headers, body: JSON.stringify(corpo) });
  if (res.status === 401 && sessao) sessao = null; // sessão expirou
  return res;
}

function headers(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

// =====================================================================================
// AVIVAR MUSIC — dados sensíveis dos músicos ficam no cofre do servidor (ver api/privado.js).
// O registro público (avivar:musicapp) guarda só o que pode ser público; para quem é líder, o servidor devolve
// o cofre e esta camada junta os dois; ao gravar, separa de novo e manda ao cofre só o que mudou.
// (As funções puras abaixo são cópia exata das de api/privado.js — os dois lados precisam concordar.)
// =====================================================================================
const CAMPOS_SEGREDO = ["codigo", "senhaHash", "whatsapp", "endereco", "email", "igreja", "obs"];
const CAMPOS_FLAG = ["ativo", "lider", "permissoes"];
const CAMPOS_PESSOA = [...CAMPOS_SEGREDO, ...CAMPOS_FLAG];
const CAMPOS_UNIDADE = ["liderWhatsapp"];
const ehObj = (x) => !!x && typeof x === "object" && !Array.isArray(x);
export function igualProfundo(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => igualProfundo(x, b[i]));
  const ka = Object.keys(a).filter((k) => a[k] !== undefined), kb = Object.keys(b).filter((k) => b[k] !== undefined);
  return ka.length === kb.length && ka.every((k) => igualProfundo(a[k], b[k]));
}
export function normalizarCofre(d) {
  const o = ehObj(d) ? d : {};
  const r = { v: 1, pessoas: ehObj(o.pessoas) ? o.pessoas : {}, unidades: ehObj(o.unidades) ? o.unidades : {}, solicitacoes: Array.isArray(o.solicitacoes) ? o.solicitacoes : [] };
  if (typeof o.liderCodigo === "string") r.liderCodigo = o.liderCodigo;
  return r;
}
export function segDoValor(v) {
  const seg = normalizarCofre(null);
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
  if (Array.isArray(v.solicitacoes)) seg.solicitacoes = v.solicitacoes.filter((x) => ehObj(x) && typeof x.id === "string" && x.id);
  if (typeof v.liderCodigo === "string") seg.liderCodigo = v.liderCodigo;
  return seg;
}
export function publicoDoValor(v) {
  if (!ehObj(v)) return v;
  const p = { ...v };
  if (Array.isArray(v.acessos)) p.acessos = v.acessos.map((a) => { if (!ehObj(a)) return a; const c = { ...a }; for (const k of CAMPOS_SEGREDO) delete c[k]; return c; });
  if (Array.isArray(v.unidades)) p.unidades = v.unidades.map((u) => { if (!ehObj(u)) return u; const c = { ...u }; for (const k of CAMPOS_UNIDADE) delete c[k]; return c; });
  delete p.solicitacoes; delete p.liderCodigo;
  p._cofre = 1;
  return p;
}
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
  const antes = new Map(a.solicitacoes.map((x) => [x.id, x])), depois = new Map(b.solicitacoes.map((x) => [x.id, x]));
  for (const [id, x] of depois) if (!igualProfundo(antes.get(id), x)) sol[id] = x;
  for (const id of antes.keys()) if (!depois.has(id)) sol[id] = null;
  if (Object.keys(sol).length) patch.solicitacoes = sol;
  if (typeof b.liderCodigo === "string" && b.liderCodigo !== a.liderCodigo) patch.liderCodigo = b.liderCodigo;
  return patch;
}
export const patchVazio = (p) => !p || Object.keys(p).length === 0;
// Junta o registro público com o cofre. Quem vale para código, senha, contatos e permissões é SEMPRE o cofre:
// nada do que vier escrito no registro público nesses campos é aproveitado, e entradas sem par no cofre somem da tela.
export function mesclarSeg(pub, seg) {
  if (!ehObj(pub)) return pub;
  const s = normalizarCofre(seg);
  const m = { ...pub };
  if (Array.isArray(pub.acessos)) {
    m.acessos = pub.acessos.filter((a) => ehObj(a) && s.pessoas[a.id]).map((a) => {
      const c = { ...a };
      for (const k of CAMPOS_PESSOA) delete c[k];
      return { ...c, ...s.pessoas[a.id] };
    });
  }
  if (Array.isArray(pub.unidades)) {
    m.unidades = pub.unidades.map((u) => {
      if (!ehObj(u)) return u;
      const c = { ...u };
      for (const k of CAMPOS_UNIDADE) delete c[k];
      return { ...c, ...(s.unidades[u.id] || {}) };
    });
  }
  m.solicitacoes = s.solicitacoes;
  if (s.liderCodigo !== undefined) m.liderCodigo = s.liderCodigo; else delete m.liderCodigo;
  return m;
}

const MUSIC_PRINCIPAL = "avivar:musicapp";
const MUSIC_UNIDADE = "avivar:musicapp:u:";
export function ehChaveMusic(key) { return key === MUSIC_PRINCIPAL || (String(key).startsWith(MUSIC_UNIDADE) && /^[A-Za-z0-9_-]{1,60}$/.test(String(key).slice(MUSIC_UNIDADE.length))); }
const escopoDe = (key) => (key === MUSIC_PRINCIPAL ? "principal" : String(key).slice(MUSIC_UNIDADE.length));
const refMusic = new Map(); // o que cada registro tinha no cofre quando foi carregado (para mandar só a diferença)
// Quem pode ler/gravar o cofre: administrador, operador (setor do louvor), líder de unidade ou músico logado (o servidor decide o resto).
const temSessaoMusic = () => !!sessao && ["admin", "operador", "liderunidade", "musico"].includes(sessao.papel);

async function lerMusic(key) {
  const url = `${REST_URL}?key=eq.${encodeURIComponent(key)}&select=value`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows.length) { refMusic.delete(key); return null; }
  let valor = rows[0].value;
  if (ehObj(valor) && temSessaoMusic()) {
    try {
      const r = await chamarPrivado({ acao: "musicsegredos", escopo: escopoDe(key), op: "ler" });
      if (r.ok) { const j = await r.json(); if (j && j.ok && j.segredos) valor = mesclarSeg(valor, j.segredos); }
    } catch (e) { /* sem o cofre, segue com a parte pública */ }
  }
  if (ehObj(valor)) refMusic.set(key, normalizarCofre(segDoValor(valor)));
  return { key, value: valor, shared: true };
}

async function gravarMusic(key, value) {
  const escopo = escopoDe(key);
  const ref = refMusic.get(key) || normalizarCofre(null);
  const novoSeg = normalizarCofre(segDoValor(value));
  const patch = diffSeg(ref, novoSeg);
  const marcado = !!(ehObj(value) && value._cofre); // o registro público já foi limpo e os dados sensíveis estão no cofre
  let migrado = false;
  if (!marcado && temSessaoMusic()) { // primeira gravação depois da atualização: garante o cofre antes de tirar os dados do registro público
    const m = await chamarPrivado({ acao: "musicmigrar", escopo });
    migrado = m.ok; // quem não tem permissão (ou perdeu a sessão) segue como antes
  }
  let paraGravar = value;
  if (temSessaoMusic() && (marcado || migrado)) {
    if (!patchVazio(patch)) {
      const r = await chamarPrivado({ acao: "musicsegredos", escopo, op: "gravar", patch });
      if (!r.ok) { console.error("Falha ao salvar o cofre dos músicos", r.status); avisarFalha(key, r.status === 401 ? "sem_sessao_musica" : "recusado"); return null; }
    }
    paraGravar = publicoDoValor(value);
    refMusic.set(key, novoSeg);
  } else if (marcado) {
    if (!patchVazio(patch)) { avisarFalha(key, "sem_sessao_musica"); return null; } // mexeu em códigos, senhas ou contatos sem estar autenticado como líder
    paraGravar = publicoDoValor(value);
  } // sem sessão e ainda sem a marca: grava como sempre (o cofre ainda não existe)
  const res = await fetch(`${REST_URL}?on_conflict=key`, {
    method: "POST",
    headers: headers({ Prefer: "resolution=merge-duplicates,return=representation" }),
    body: JSON.stringify([{ key, value: paraGravar, updated_at: new Date().toISOString() }]),
  });
  if (!res.ok) { console.error("Falha ao salvar", key, await res.text()); return null; }
  return { key, value, shared: true };
}

// ---- ações dos músicos no servidor (login, cadastro, senha) ----
async function chamarMusica(corpo) {
  try {
    const res = await chamarPrivado(corpo);
    const r = await res.json().catch(() => ({}));
    return { ...r, status: res.status, ok: !!(res.ok && r && r.ok) };
  } catch (e) { return { ok: false, motivo: "sem_conexao", status: 0 }; }
}
function iniciarSessaoMusico(escopo, r, lembrar) {
  sessao = { token: r.token, papel: "musico", nome: r.nome, setores: [], id: r.id, esc: escopo };
  if (lembrar) guardarSessaoLembrada(escopo, { token: r.token, e: r.e, papel: "musico", nome: r.nome, setores: [], id: r.id, esc: escopo });
}
const comAparelho = (lembrar) => (lembrar ? { lembrar: true, dispositivo: idAparelho() } : {});
export async function musicaLogin({ escopo = "principal", ident, senha, lembrar = false }) {
  const r = await chamarMusica({ acao: "musiclogin", escopo, ident, senha, ...comAparelho(lembrar) });
  if (r.ok) iniciarSessaoMusico(escopo, r, lembrar);
  return r;
}
export async function musicaPrimeiro({ escopo = "principal", ident, senha, lembrar = false }) {
  const r = await chamarMusica({ acao: "musicprimeiro", escopo, ident, senha, ...comAparelho(lembrar) });
  if (r.ok) iniciarSessaoMusico(escopo, r, lembrar);
  return r;
}
export async function musicaConcluir({ escopo = "principal", codigo, senha, dados, lembrar = false }) {
  const r = await chamarMusica({ acao: "musicconcluir", escopo, codigo, senha, dados, ...comAparelho(lembrar) });
  if (r.ok) iniciarSessaoMusico(escopo, r, lembrar);
  return r;
}
export function musicaCadastro({ escopo = "principal", dados }) { return chamarMusica({ acao: "musiccadastro", escopo, dados }); }
export function musicaTrocarSenha({ escopo = "principal", atual, nova }) { return chamarMusica({ acao: "musictrocarsenha", escopo, atual, nova }); }
export async function musicaLider({ escopo, codigo, lembrar = false }) {
  const r = await chamarMusica({ acao: "musiclider", escopo, codigo, ...comAparelho(lembrar) });
  if (r.ok) {
    sessao = { token: r.token, papel: "liderunidade", nome: r.nome, setores: [], id: "", esc: escopo };
    if (lembrar) guardarSessaoLembrada(escopo, { token: r.token, e: r.e, papel: "liderunidade", nome: r.nome, setores: [], id: "", esc: escopo });
  }
  return r;
}
export function musicaMigrar(escopo = "principal") { return chamarMusica({ acao: "musicmigrar", escopo }); }

export async function storageGet(key) {
  try {
    if (ehChaveMusic(key)) return await lerMusic(key);
    if (ehChavePrivada(key)) {
      if (!sessao) return null;
      const res = await chamarPrivado({ acao: "get", key });
      if (!res.ok) return null;
      const r = await res.json();
      if (!r || r.value === undefined || r.value === null) return null;
      return { key, value: r.value, shared: true };
    }
    const url = `${REST_URL}?key=eq.${encodeURIComponent(key)}&select=value`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows.length) return null;
    return { key, value: rows[0].value, shared: true };
  } catch (e) {
    console.error("Falha ao ler", key, e);
    return null;
  }
}

export async function storageSet(key, value) {
  try {
    if (ehChaveMusic(key)) return await gravarMusic(key, value);
    if (ehChavePublicaServidor(key)) {
      if (!sessao) { avisarFalha(key, "sem_sessao"); return null; }
      const res = await chamarPrivado({ acao: "setpub", key, value });
      if (!res.ok) {
        console.error("Falha ao salvar", key, res.status);
        avisarFalha(key, res.status === 401 ? "sem_sessao" : "recusado");
        return null;
      }
      return { key, value, shared: true };
    }
    if (ehChavePrivada(key)) {
      if (!sessao && !ANONIMO_ACRESCENTA.includes(key)) { avisarFalha(key, "sem_sessao"); return null; }
      const tinhaSessao = !!sessao;
      const res = await chamarPrivado({ acao: "set", key, value });
      if (!res.ok) {
        console.error("Falha ao salvar", key, res.status);
        if (tinhaSessao) avisarFalha(key, res.status === 401 ? "sem_sessao" : "recusado");
        return null;
      }
      return { key, value, shared: true };
    }
    const url = `${REST_URL}?on_conflict=key`;
    const res = await fetch(url, {
      method: "POST",
      headers: headers({ Prefer: "resolution=merge-duplicates,return=representation" }),
      body: JSON.stringify([{ key, value, updated_at: new Date().toISOString() }]),
    });
    if (!res.ok) {
      console.error("Falha ao salvar", key, await res.text());
      return null;
    }
    return { key, value, shared: true };
  } catch (e) {
    console.error("Falha ao salvar", key, e);
    return null;
  }
}
