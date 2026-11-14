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
];
const PREFIXOS_PRIVADOS = ["avivar:escalapins:"];
// Visitantes (sem login) só podem ACRESCENTAR nestas; nunca ler nem alterar o que já existe.
const ANONIMO_ACRESCENTA = ["avivar:pedidosOracao", "avivar:pedidosfisicos"];

export function ehChavePrivada(key) {
  return CHAVES_PRIVADAS.includes(key) || PREFIXOS_PRIVADOS.some((p) => String(key).startsWith(p));
}

let sessao = null; // { token, papel, nome, setores, id }
export function sessaoPrivada() { return sessao; }
export function privateLogout() { sessao = null; }

export async function privateLogin(codigo, { guardar = true, exigirPapel = null } = {}) {
  try {
    const res = await fetch(API_PRIVADO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "login", codigo: String(codigo || "") }),
    });
    const r = await res.json().catch(() => ({}));
    if (res.ok && r && r.ok && r.token) {
      if (exigirPapel && r.papel !== exigirPapel) return { ok: false, motivo: "invalido" };
      if (guardar) sessao = { token: r.token, papel: r.papel, nome: r.nome, setores: r.setores || [], id: r.id };
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

export async function storageGet(key) {
  try {
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
    if (ehChavePrivada(key)) {
      if (!sessao && !ANONIMO_ACRESCENTA.includes(key)) return null;
      const res = await chamarPrivado({ acao: "set", key, value });
      if (!res.ok) {
        console.error("Falha ao salvar", key, res.status);
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
