// Adaptador de armazenamento — conecta direto no Supabase via REST API (PostgREST).
//
// Antes, este arquivo só usava window.storage (que só existe dentro de um artefato
// do Claude) e caía para localStorage do navegador em qualquer outro lugar — por
// isso os dados nunca apareciam para os visitantes do site publicado: cada
// navegador via só os próprios dados, sem nunca tocar no Supabase de verdade.
//
// Agora as funções chamam a API REST do Supabase diretamente, lendo e escrevendo
// na tabela site_data (colunas: key text, value jsonb, updated_at timestamptz).

const SUPABASE_URL = "https://xnxfzygofnztpumqxqzt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TKv2SXrc_3ovC1hGPMdCow_lGP578sv";

const REST_URL = `${SUPABASE_URL}/rest/v1/site_data`;

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
