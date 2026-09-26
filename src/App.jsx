import React, { useState, useEffect, useMemo } from "react";
import {
  Flame, Menu, X, ChevronLeft, ChevronRight, Lock, Unlock, Plus, Trash2,
  Phone, Calendar, Clock, MapPin, Video, Image as ImageIcon, Users, Church,
  BookOpen, Radio, MessageCircle, Home as HomeIcon, Mail, ShieldCheck,
  KeyRound, LogOut, Send, HandHeart, ChevronDown, Sparkles, ShoppingBag,
  Music, Wallet, Package, UserPlus, Copy, Gift, CreditCard, PlayCircle, ClipboardList, Library, FileText
} from "lucide-react";
import { storageGet, storageSet } from "./lib/storage.js";
import { QRCodeSVG } from "qrcode.react";

/* ---------------------------------------------------------------- */
/* Tokens                                                            */
/* ---------------------------------------------------------------- */
const C = {
  ink: "#1F1B2E",
  parchment: "#FBF6ED",
  parchmentDeep: "#F1E7D3",
  cream: "#FFFDF8",
  ember: "#C4622D",
  emberDeep: "#9C4A20",
  gold: "#CBA135",
  goldBright: "#E9C765",
  goldDeep: "#8B6F1F",
  black: "#0B0B0C",
  blackSoft: "#1A1A1D",
  liveRed: "#C1272D",
  violet: "#4A3B6B",
  violetDeep: "#2C2340",
  purple: "#6B2FA5",
  purpleDeep: "#4A1F73",
  indigo: "#17213B",
  indigoDeep: "#0E1526",
  stone: "#1F1B2E", // era cinza (#8A8272) — pedido do usuário: trocar cinza por preto em todo o site
  line: "#00000018",
};

// Grid reaproveitável de 3 colunas responsivo — usado em todas as seções de cards
// (Estudos Bíblicos, Avivar Music, vitrines, etc.) para manter o padrão visual do site.
const GRID3 = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5";

const CAUSAS_ORACAO = ["Financeiras", "Saúde", "Libertação", "Intercessão", "Causas jurídicas", "Oportunidade de emprego", "Outros"];

const LOGO_ICON = "/logo-icone.png";
const LOGO_BLACK_BG = "/logo-fundo-preto.jpg";
const LOGO_WHITE_BG = "/logo-fundo-branco.jpg";
const HERO_BANNER = "/hero-banner.jpg";
const CODIGOS_BANNER = "/codigos-avivar-banner.jpg";
const EVENTOS_BANNER = "/eventos-banner.jpg";
const AOVIVO_BANNER = "/aovivo-banner.jpg";
const BIBLIA_CARD_BG = "/biblia-avivar-banner.jpg";
const AVIVARNEWS_BANNER = "/avivarnews-banner.jpg";
const IGREJAS_BANNER = "/igrejas-avivar-banner.jpg";
const DOACOES_BANNER = "/doacoes-banner.jpg";
const ORACOES_BANNER = "/31-oracao-nos-lares-banner.jpg";
const ESTUDOS_BANNER = "/estudos-banner.jpg";
const VISITANTES_BANNER = "/visitantes-banner.jpg";
const LOJA_BANNER = "/loja-avivar-banner.jpg";
const COLABORADORES_BANNER = "/colaboradores-banner.jpg";
const BIBLIA_DESTAQUE_BANNER = "/30-biblia-avivar-destaque.jpg";
const DIVULGACAO_BANNER = "/divulgacao-youtube.jpg";
const EVENTO_CRIANCAS_BANNER = "/2-evento-culto-criancas.jpg";
const EVENTO_ALMOCO_BANNER = "/3-evento-almoco-avivar.jpg";
const EVENTO_BATISMO_BANNER = "/4-evento-batismo.jpg";
const LOUVOR_LOGO = "/5-louvor-avivar-logo.png";
const BIBLIA_URL = "https://biblia-avivar.vercel.app";
const CODIGOS_REVISTA_BANNER = "/25-codigos-avivar-revista.jpg";
const TRILOGIA_LIVROS_BANNER = "/26-trilogia-livros-avivar.jpg";
const LIVRO_DONS_CAPA = "/27-livro-conquistando-os-dons.jpg";
const LIVRO_CURA_CAPA = "/28-livro-praticando-a-cura-divina.jpg";
const LIVRO_GLORIA_CAPA = "/29-livro-o-impacto-da-gloria.jpg";

const MASTER_ADMIN_PASSWORD = "avivar-mestre-2026"; // demo only — trocar por auth real em produção

const uid = () => Math.random().toString(36).slice(2, 10);
const nowISO = () => new Date().toISOString();
const fmtDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};
const fmtDate = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return d ? `${d}/${m}/${y}` : str;
};
const digitsOnly = (s) => (s || "").replace(/\D/g, "");
const printReport = (title, bodyHtml) => {
  const win = window.open("", "_blank", "width=850,height=1000");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><meta charset="utf-8" />
    <style>
      body { font-family: Georgia, 'Times New Roman', serif; padding: 28px; color: #1F1B2E; }
      h1 { font-size: 20px; border-bottom: 2px solid #CBA135; padding-bottom: 8px; margin-bottom: 4px; }
      .sub { font-size: 12px; color: #1F1B2E; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; text-align: left; vertical-align: top; }
      th { background: #F1E7D3; }
      .totais { margin-top: 16px; font-size: 13px; }
      @media print { body { padding: 0; } }
    </style>
    </head><body>
      <h1>${title}</h1>
      <p class="sub">Ministério Avivar do Espírito · gerado em ${new Date().toLocaleString("pt-BR")}</p>
      ${bodyHtml}
    </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
};
const waLink = (phone, msg) => `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(msg)}`;
const getEmbedUrl = (url) => {
  if (!url) return "";
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("watch?v=")) {
      const id = url.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtube.com/embed/")) return url;
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1].split(/[?&]/)[0];
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch (e) {}
  return url;
};

/* ---------------------------------------------------------------- */
/* Default seed data                                                 */
/* ---------------------------------------------------------------- */
const CARD_ICONS = {
  codigos: KeyRound,
  eventos: Calendar,
  aovivo: Radio,
  biblia: BookOpen,
  avivarnews: Video,
  igrejas: Church,
  doacoes: Send,
  oracoes: Sparkles,
  estudos: BookOpen,
  visitantes: HandHeart,
  loja: ShoppingBag,
  colaboradores: Users,
};

const DEFAULT_HOMECARDS = [
  { key: "loja", titulo: "Loja Avivar", desc: "Livros, roupas e utensílios cristãos.", imageUrl: LOJA_BANNER, tone: "gold" },
  { key: "igrejas", titulo: "Igrejas Avivar", desc: "Conheça nossas unidades.", imageUrl: IGREJAS_BANNER, tone: "violet" },
  { key: "codigos", titulo: "Códigos Avivar", desc: "Profecia, ciência e espiritualidade.", imageUrl: CODIGOS_BANNER, tone: "violet" },
  { key: "oracoes", titulo: "Orações nos Lares", desc: "Peça oração ou visita de intercessão.", imageUrl: null, tone: "violet" },
  { key: "estudos", titulo: "Estudos Bíblicos", desc: "Palavra e vida.", imageUrl: ESTUDOS_BANNER, tone: "violet" },
  { key: "visitantes", titulo: "Visitantes", desc: "Registre sua visita.", imageUrl: VISITANTES_BANNER, tone: "gold" },
  { key: "colaboradores", titulo: "Colaboradores", desc: "Quem serve conosco.", imageUrl: COLABORADORES_BANNER, tone: "violet" },
  { key: "doacoes", titulo: "Doações", desc: "Dízimos e ofertas.", imageUrl: DOACOES_BANNER, tone: "gold" },
  { key: "eventos", titulo: "Eventos & Galeria", desc: "Agenda e melhores momentos.", imageUrl: EVENTOS_BANNER, tone: "gold" },
];

const DEFAULT_SITE = {
  churchName: "Ministério Avivar do Espírito",
  homeCards: DEFAULT_HOMECARDS,
  heroSlides: [
    { id: uid(), titulo: "Avivar do Espírito", subtitulo: "", imageUrl: HERO_BANNER, linkTo: "home", selfContained: true },
    { id: uid(), titulo: "Códigos Avivar", subtitulo: "Um caminho de revelação, ciência e espiritualidade — acesso restrito a cadastrados", imageUrl: CODIGOS_BANNER, linkTo: "codigos", mist: true, taglines: ["Os segredos espirituais serão revelados.", "O Espírito Santo convoca os Profetas dos Últimos Dias.", "Conheça os mistérios revelados pelo Senhor.", "Esse é o tempo. O que está esperando?"] },
    { id: uid(), titulo: "Participe dos nossos eventos", subtitulo: "Confira a agenda de cultos e encontros especiais", imageUrl: EVENTOS_BANNER, linkTo: "eventos", titleColor: "#FFFFFF", titleShadowBlack: true },
  ],
};

const DEFAULT_CODIGOS = {
  codes: [{ id: uid(), holder: "Exemplo — Convidado", code: "AVR-0001", active: true }],
  temas: [
    { id: uid(), nome: "Segredos dos Profetas", descricao: "Estudos sobre a voz profética através das Escrituras." },
    { id: uid(), nome: "Física Quântica e Espiritualidade", descricao: "A relação entre energias vibracionais, consciência e fé." },
  ],
  courses: [],
};

const DEFAULT_AOVIVO = { isLive: false, instagramUrl: "", xUrl: "", youtubeUrl: "", embedUrl: "", mensagem: "Nenhuma transmissão no momento. Volte em breve." };
const DEFAULT_DOACOES = { pixKey: "codigosavivar2026@gmail.com", mercadoPagoUrl: "", nomeRecebedor: "Ministerio Avivar do Espirito", cidade: "Brasilia", infoTexto: "" };

const DEFAULT_MANCHETE = {
  titulo: "A Oração de Hoje será na quadra 1, lote 4, bloco 1 ap 300",
  link: "",
  ativo: true,
};

/* ---------------------------------------------------------------- */
/* PIX Copia e Cola (BR Code / EMV) — gerado localmente, sem API externa */
/* ---------------------------------------------------------------- */
function crc16ccitt(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
function pixTLV(id, value) {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}
function stripAccents(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
}
// Monta o payload "Pix Copia e Cola" padrão BR Code (EMV) — funciona em qualquer
// banco, sem depender de conta ou API externa. QR gerado localmente com qrcode.react.
function montarPixPayload({ chave, nomeRecebedor, cidade, valor, txid }) {
  const merchantAccount =
    pixTLV("00", "BR.GOV.BCB.PIX") + pixTLV("01", (chave || "").trim());
  const nome = stripAccents(nomeRecebedor || "Ministerio Avivar").toUpperCase().slice(0, 25) || "MINISTERIO AVIVAR";
  const cid = stripAccents(cidade || "Brasilia").toUpperCase().slice(0, 15) || "BRASILIA";
  const tx = (txid || "***").replace(/[^A-Za-z0-9*]/g, "").slice(0, 25) || "***";
  let payload =
    pixTLV("00", "01") +
    pixTLV("26", merchantAccount) +
    pixTLV("52", "0000") +
    pixTLV("53", "986") +
    (valor ? pixTLV("54", Number(valor).toFixed(2)) : "") +
    pixTLV("58", "BR") +
    pixTLV("59", nome) +
    pixTLV("60", cid) +
    pixTLV("62", pixTLV("05", tx));
  payload += "6304";
  return payload + crc16ccitt(payload);
}

/* ---------------------------------------------------------------- */
/* Storage helpers                                                   */
/* ---------------------------------------------------------------- */
async function loadKey(key, fallback) {
  try {
    const res = await storageGet(key);
    if (res && res.value !== undefined && res.value !== null) {
      return typeof res.value === "string" ? JSON.parse(res.value) : res.value;
    }
  } catch (e) {}
  return fallback;
}
async function saveKey(key, value) {
  try {
    await storageSet(key, value);
  } catch (e) {
    console.error("Falha ao salvar", key, e);
  }
}

/* ---------------------------------------------------------------- */
/* Small shared UI                                                   */
/* ---------------------------------------------------------------- */
function FlameMark({ size = 28, color = C.ember }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c0-1-.4-1.8-1-2.5 2 1 4 3.5 4 7A7 7 0 1 1 8 13.5C7.3 10.8 8.5 8.4 9.8 6.6 10.6 5.5 11.6 3.8 12 2Z"
        fill={color}
      />
    </svg>
  );
}

function Btn({ children, onClick, variant = "primary", color = C.gold, className = "", type = "button", ...rest }) {
  const base = "inline-flex items-center gap-2 rounded-md text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2";
  const style =
    variant === "primary"
      ? { background: color, color: "#fff" }
      : variant === "ghost"
      ? { background: "transparent", color: color, border: `1px solid ${color}55` }
      : { background: "#B0342855", color: "#7A1F17" };
  return (
    <button type={type} onClick={onClick} className={`${base} ${className} hover:opacity-90`} style={style} {...rest}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1 font-mono tracking-wide" style={{ color: C.stone }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-md border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2";

function DynamicForm({ fields, accent = C.gold, onSubmit, submitLabel = "Adicionar" }) {
  const empty = useMemo(() => Object.fromEntries(fields.map((f) => [f.key, ""])), [fields]);
  const [vals, setVals] = useState(empty);
  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }));
  return (
    <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
      {fields.map((f) => (
        <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
          <Field label={f.label}>
            {f.type === "textarea" ? (
              <textarea rows={3} value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputCls} style={{ borderColor: C.line }} />
            ) : f.type === "select" ? (
              <select value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputCls} style={{ borderColor: C.line }}>
                <option value="">Selecione...</option>
                {(f.options || []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input type={f.type || "text"} value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputCls} style={{ borderColor: C.line }} />
            )}
          </Field>
        </div>
      ))}
      <div className="sm:col-span-2">
        <Btn
          color={accent}
          onClick={() => {
            onSubmit(vals);
            setVals(empty);
          }}
        >
          <Plus size={16} /> {submitLabel}
        </Btn>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="text-sm italic py-8 text-center rounded-lg border border-dashed" style={{ color: C.stone, borderColor: C.line }}>
      {text}
    </div>
  );
}

function ImgOrPlaceholder({ url, alt, className, ph = "Espaço reservado para imagem — inserir posteriormente" }) {
  // Se a imagem falhar ao carregar (ex: arquivo não subiu pro GitHub), mostra um
  // placeholder decente em vez do ícone de "imagem quebrada" do navegador.
  const [failed, setFailed] = useState(false);
  if (url && !failed) return <img src={url} alt={alt} className={className} onError={() => setFailed(true)} />;
  return (
    <div className={`${className} flex items-center justify-center text-center p-3`} style={{ background: C.parchmentDeep, color: C.stone }}>
      <span className="text-xs font-mono">{ph}</span>
    </div>
  );
}

function Eyebrow({ children, color = C.gold }) {
  return (
    <div className="uppercase text-xs tracking-[0.2em] font-mono font-semibold mb-2" style={{ color }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="inline-block px-4 py-1.5 rounded-md mb-3" style={{ background: C.purple }}>
      <h2 className="font-script text-2xl sm:text-3xl" style={{ color: "#fff" }}>{children}</h2>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Carousel                                                           */
/* ---------------------------------------------------------------- */
function Carousel({ slides, onSlideClick, dark = true, height = "h-[62vh]" }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);
  if (!slides.length) return <Empty text="Nenhum banner cadastrado ainda." />;
  const s = slides[i];
  return (
    <div className={`relative w-full ${height} overflow-hidden`} style={{ background: C.black }}>
      {s.selfContained && (
        <img
          src={s.imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ filter: "blur(28px) brightness(0.55)" }}
        />
      )}
      <ImgOrPlaceholder url={s.imageUrl} alt={s.titulo} className={`absolute inset-0 w-full h-full ${s.selfContained ? "object-contain" : "object-cover"}`} ph="Banner sem imagem — adicionar depois" />
      {!s.selfContained && <div className="absolute inset-0" style={{ background: dark ? "linear-gradient(180deg, #00000010, #1F1B2EAA)" : "transparent" }} />}
      {s.mist && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 75% 35%, #CBA13566 0%, transparent 55%), radial-gradient(circle at 15% 85%, #4A3B6B77 0%, transparent 60%)" }} />
      )}
      {s.taglines && (
        <div className="hidden sm:block absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center max-w-md pointer-events-none">
          {s.taglines.map((t, idx) => (
            <p key={idx} className="text-sm sm:text-base italic mb-1" style={{ color: C.goldBright, textShadow: "0 2px 8px #000000cc" }}>{t}</p>
          ))}
        </div>
      )}
      <button
        onClick={() => onSlideClick && onSlideClick(s)}
        className={`absolute inset-0 w-full h-full flex flex-col text-center focus:outline-none focus:ring-2 focus:ring-inset ${s.selfContained ? "items-stretch justify-end" : "items-center justify-center p-6 sm:p-12"}`}
        style={{ color: "#fff" }}
      >
        {!s.selfContained && (
          <>
            <Eyebrow color={C.gold}>{i + 1 < 10 ? `0${i + 1}` : i + 1} / {slides.length}</Eyebrow>
            <h2 className="font-script text-4xl sm:text-6xl leading-tight" style={{ color: s.titleColor || C.goldBright, textShadow: s.titleShadowBlack ? "0 3px 12px #000000cc" : "none" }}>{s.titulo}</h2>
            {s.subtitulo && <p className="mt-3 max-w-xl text-sm sm:text-base opacity-90">{s.subtitulo}</p>}
            <span className="mt-4 text-xs font-mono tracking-wide underline decoration-dotted">toque para ver mais</span>
          </>
        )}
      </button>
      {slides.length > 1 && (
        <>
          <button onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full focus:outline-none focus:ring-2" style={{ background: "#00000044", color: "#fff" }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setI((v) => (v + 1) % slides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full focus:outline-none focus:ring-2" style={{ background: "#00000044", color: "#fff" }}>
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {slides.map((_, idx) => (
              <span key={idx} className="w-1.5 h-1.5 rounded-full" style={{ background: idx === i ? C.gold : "#ffffff66" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Nav                                                                */
/* ---------------------------------------------------------------- */
const NAV = [
  { key: "home", label: "Início", icon: HomeIcon },
  { key: "codigos", label: "Códigos Avivar", icon: KeyRound },
  { key: "eventos", label: "Eventos/Galeria", icon: Calendar },
  { key: "aovivo", label: "Ao Vivo", icon: Radio },
  { key: "igrejas", label: "Igrejas Avivar", icon: Church },
  { key: "biblia", label: "Bíblia Sagrada", icon: BookOpen },
  { key: "contato", label: "Contato", icon: Mail },
];
const SUBMENU = [
  { key: "colaboradores", label: "Colaboradores", icon: Users },
  { key: "escala", label: "Escala de Obreiros", icon: ClipboardList },
  { key: "estudos", label: "Estudos Bíblicos", icon: BookOpen },
  { key: "biblioteca", label: "Biblioteca Avivar", icon: Library },
  { key: "loja", label: "Loja Avivar", icon: ShoppingBag },
  { key: "doacoes", label: "Doações", icon: Send },
  { key: "membros", label: "Membros", icon: UserPlus },
  { key: "avivarmusic", label: "Avivar Music", icon: Music },
  { key: "visitantes", label: "Visitantes", icon: HandHeart },
];
const ADMIN_MENU = [
  { key: "caixa", label: "Caixa", icon: Wallet },
  { key: "bens", label: "Bens", icon: Package },
  { key: "operadores", label: "Operadores", icon: KeyRound },
];

/* Carrossel de notícias — busca ao vivo do Google News (RSS público, via
   proxy de CORS já que RSS não libera acesso direto do navegador). Se a
   busca falhar por qualquer motivo, o componente simplesmente não aparece
   — nunca quebra o resto do site. */
// Manchetes padrão — usadas caso a busca ao vivo falhe ou ainda não tenha retornado,
// pra a faixa "Notícias Avivar" nunca sumir da tela.
const NOTICIAS_FALLBACK = [
  { titulo: "Bem-vindo ao site do Ministério Avivar do Espírito", link: "" },
  { titulo: "Acompanhe nossos cultos e eventos na aba Eventos/Galeria", link: "" },
  { titulo: "Peça oração na aba Orações nos Lares", link: "" },
];

function NoticiasCarousel() {
  const [noticias, setNoticias] = useState(NOTICIAS_FALLBACK);

  useEffect(() => {
    const feedUrl = "https://news.google.com/rss/search?q=evangelho+igreja+avivamento&hl=pt-BR&gl=BR&ceid=BR:pt-419";
    const proxied = "https://api.allorigins.win/raw?url=" + encodeURIComponent(feedUrl);
    fetch(proxied)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((xmlText) => {
        const xml = new DOMParser().parseFromString(xmlText, "text/xml");
        const items = Array.from(xml.querySelectorAll("item"))
          .slice(0, 10)
          .map((item) => ({
            titulo: item.querySelector("title")?.textContent || "",
            link: item.querySelector("link")?.textContent || "",
          }))
          .filter((n) => n.titulo);
        if (items.length > 0) setNoticias(items);
      })
      .catch(() => {});
  }, []);

  // Nunca retorna null — sempre mostra ao menos as manchetes padrão, com margem
  // no topo pra não encostar na navbar.
  const track = (
    <>
      {noticias.map((n, i) =>
        n.link ? (
          <a key={i} href={n.link} target="_blank" rel="noreferrer" className="text-sm sm:text-base font-medium text-white hover:underline whitespace-nowrap mx-6">
            {n.titulo}
          </a>
        ) : (
          <span key={i} className="text-sm sm:text-base font-medium text-white whitespace-nowrap mx-6">
            {n.titulo}
          </span>
        )
      )}
    </>
  );

  return (
    <div className="w-full border-b overflow-hidden py-3 mt-2" style={{ background: C.black, borderColor: "#00000033" }}>
      <div className="flex items-center gap-4 px-4">
        <span className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded shrink-0" style={{ background: C.gold, color: C.black }}>
          Notícias Avivar
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="noticias-marquee flex items-center">
            {track}
            {track}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavBar({ page, setPage, adminMode, onAdminClick, churchName }) {
  const [open, setOpen] = useState(false);
  const go = (k) => {
    if (k === "biblia") {
      window.open(BIBLIA_URL, "_blank", "noopener,noreferrer");
      setOpen(false);
      return;
    }
    setPage(k);
    setOpen(false);
  };
  // Pills sem preenchimento próprio — fundo transparente (a cor vem da barra roxa
  // por trás), filete branco fino e texto branco; o item ativo só destaca a borda.
  const pillStyle = (active) => ({
    background: "transparent",
    color: "#fff",
    border: `1px solid ${active ? C.goldBright : "#ffffff80"}`,
  });
  // Fileira de cima (NAV) — mesmo estilo de pill da fileira de baixo; a fonte
  // PhotographSignature foi retirada daqui (voltou pra fonte padrão do site).
  const topPillStyle = (active) => pillStyle(active);
  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: C.black, borderColor: C.gold + "55" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-end justify-between gap-3 py-3">
        <div className="flex items-end gap-3">
          <button onClick={() => go("home")} className="flex items-end gap-3 focus:outline-none focus:ring-2 rounded-md p-1">
            <img src={LOGO_ICON} alt={churchName} className="h-12 w-auto" />
            <span className="leading-none" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: "10px", color: C.goldBright }}>
              <span className="block">Avivar</span>
              <span className="block">do</span>
              <span className="block">Espírito</span>
            </span>
          </button>
          {/* Acesso rápido à Loja perto da logo — ícone maior, branco, com glow */}
          <button
            onClick={() => go("loja")}
            className="p-1 rounded-full focus:outline-none focus:ring-2"
            title="Ir para a Loja Avivar"
            style={{ color: "#fff", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.85))" }}
          >
            <ShoppingBag size={28} />
          </button>
        </div>

        <div className="flex items-end gap-2 flex-wrap justify-end">
          {/* Fileira de cima — pills sobre fundo roxo, alinhada pela base com a logo */}
          <nav className="hidden lg:flex items-end gap-1 flex-wrap rounded-md px-2 py-1.5" style={{ background: C.violetDeep }}>
            {NAV.map((n) => (
              <button key={n.key} onClick={() => go(n.key)} className="nav-pulse px-2 py-1 text-xs font-semibold rounded-md transition focus:outline-none focus:ring-2" style={topPillStyle(page === n.key)}>
                {n.label}
              </button>
            ))}
          </nav>
          <button onClick={onAdminClick} className="hidden lg:inline-flex p-2 rounded-full focus:outline-none focus:ring-2" title={adminMode ? "Sair do modo admin" : "Entrar como admin"} style={{ background: adminMode ? C.gold : "transparent", color: adminMode ? C.black : C.gold }}>
            {adminMode ? <ShieldCheck size={16} /> : <Lock size={16} />}
          </button>
          <button className="lg:hidden p-2" onClick={() => setOpen((v) => !v)} style={{ color: C.gold }}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Barra de submenu — mesmo fundo roxo da fileira de cima, alinhada à direita
          (mesma borda direita do container da fileira de cima); sempre visível no
          desktop, sem esconder num dropdown */}
      <div className="hidden lg:flex items-center justify-end gap-1 flex-wrap max-w-6xl mx-auto px-4 sm:px-6 py-1.5" style={{ background: C.violetDeep }}>
        {SUBMENU.map((n) => {
          const isLoja = n.key === "loja";
          return (
            <button key={n.key} onClick={() => go(n.key)} className="nav-pulse px-2 py-1 text-[11px] font-semibold rounded-full flex items-center gap-1 focus:outline-none focus:ring-2" style={pillStyle(page === n.key)}>
              {isLoja ? (
                <span className="relative flex items-center justify-center w-5 h-5 rounded-full shrink-0" style={{ background: C.liveRed }}>
                  <n.icon size={12} color="#fff" />
                </span>
              ) : (
                <n.icon size={11} />
              )}
              {n.label}
            </button>
          );
        })}
        {adminMode && ADMIN_MENU.map((n) => (
          <button key={n.key} onClick={() => go(n.key)} className="nav-pulse px-2 py-1 text-[11px] font-semibold rounded-full flex items-center gap-1 focus:outline-none focus:ring-2" style={pillStyle(page === n.key)}>
            <n.icon size={11} /> {n.label}
          </button>
        ))}
      </div>

      {open && (
        <div className="lg:hidden border-t px-4 py-3 flex flex-col gap-1.5" style={{ borderColor: C.gold + "33", background: C.black }}>
          {[...NAV, ...SUBMENU, ...(adminMode ? ADMIN_MENU : [])].map((n) => (
            <button key={n.key} onClick={() => go(n.key)} className="text-left px-3 py-2 text-sm rounded-full flex items-center gap-2" style={pillStyle(page === n.key)}>
              {n.icon && <n.icon size={15} />} {n.label}
            </button>
          ))}
          <button onClick={onAdminClick} className="text-left px-2 py-2 text-sm rounded-md flex items-center gap-2" style={{ color: C.goldBright }}>
            {adminMode ? <ShieldCheck size={15} /> : <Lock size={15} />} {adminMode ? "Sair do modo admin" : "Entrar como admin"}
          </button>
        </div>
      )}
    </header>
  );
}

function AdminGateModal({ onClose, onSuccess }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#00000088" }}>
      <div className="w-full max-w-sm rounded-xl p-6 border" style={{ background: C.black, borderColor: C.gold + "44" }}>
        <div className="flex items-center gap-2 mb-3" style={{ color: C.gold }}>
          <ShieldCheck size={20} />
          <h3 className="font-display text-lg font-semibold text-white">Acesso administrativo</h3>
        </div>
        <p className="text-xs mb-4" style={{ color: "#ffffff99" }}>
          Protótipo de demonstração — em produção, isto exige autenticação real no backend.
        </p>
        <Field label="Senha master">
          <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} style={{ borderColor: C.line }} />
        </Field>
        {err && <p className="text-xs mt-2" style={{ color: "#F2A6A6" }}>{err}</p>}
        <div className="flex gap-2 mt-4">
          <Btn
            color={C.gold}
            onClick={() => {
              if (pw === MASTER_ADMIN_PASSWORD) onSuccess();
              else setErr("Senha incorreta.");
            }}
          >
            Entrar
          </Btn>
          <Btn variant="ghost" color={C.stone} onClick={onClose}>
            Cancelar
          </Btn>
        </div>
      </div>
    </div>
  );
}

function OperatorGateModal({ operatorCodes, onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#00000088" }}>
      <div className="w-full max-w-sm rounded-xl p-6 border" style={{ background: "#fff", borderColor: C.line }}>
        <div className="flex items-center gap-2 mb-3" style={{ color: C.purple }}>
          <KeyRound size={20} />
          <h3 className="font-display text-lg font-semibold">Acesso restrito</h3>
        </div>
        <p className="text-xs mb-4" style={{ color: C.stone }}>Peça o código de acesso à administração da igreja (portaria, RH, ou equivalente).</p>
        <Field label="Código de acesso">
          <input type="password" autoFocus value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} style={{ borderColor: C.line }} />
        </Field>
        {err && <p className="text-xs mt-2" style={{ color: "#B03428" }}>{err}</p>}
        <div className="flex gap-2 mt-4">
          <Btn
            color={C.purple}
            onClick={() => {
              const ok = code === MASTER_ADMIN_PASSWORD || operatorCodes.some((o) => o.codigo === code);
              if (ok) onSuccess();
              else setErr("Código inválido.");
            }}
          >
            Entrar
          </Btn>
          <Btn variant="ghost" color={C.stone} onClick={onClose}>
            Cancelar
          </Btn>
        </div>
      </div>
    </div>
  );
}

function RestrictedNotice({ onUnlock }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <Lock size={28} className="mx-auto" color={C.stone} />
      <p className="text-sm mt-3" style={{ color: C.stone }}>Este cadastro é restrito à administração ou a pessoas autorizadas (ex: portaria, RH).</p>
      <Btn className="mt-4" color={C.purple} onClick={onUnlock}>Inserir código de acesso</Btn>
    </div>
  );
}

const OPERADOR_FIELDS = [
  { key: "nome", label: "Nome da pessoa ou função (ex: Portaria, RH — Maria)" },
  { key: "codigo", label: "Código de acesso" },
];

function OperadoresAdmin({ codes, save, adminMode }) {
  const add = (v) => save([...codes, { id: uid(), ...v }]);
  const del = (id) => save(codes.filter((c) => c.id !== id));
  if (!adminMode) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock size={28} className="mx-auto" color={C.stone} />
        <p className="text-sm mt-3" style={{ color: C.stone }}>Área restrita — acesso administrativo.</p>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Área administrativa</Eyebrow>
      <SectionTitle>Códigos de Operador</SectionTitle>
      <p className="text-sm mb-4" style={{ color: C.stone }}>
        Cada código dá acesso aos cadastros de Membros, Visitantes e à agenda de Orações nos Lares, sem liberar o resto da administração (Caixa, Bens, edição do site). Entregue um código diferente pra cada pessoa/função.
      </p>
      <div className="space-y-2">
        {codes.length === 0 && <Empty text="Nenhum código cadastrado ainda." />}
        {codes.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border text-sm" style={{ borderColor: C.line }}>
            <div>
              <p className="font-medium">{c.nome}</p>
              <p className="text-xs font-mono" style={{ color: C.stone }}>{c.codigo}</p>
            </div>
            <button onClick={() => del(c.id)}><Trash2 size={14} color={C.stone} /></button>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <DynamicForm fields={OPERADOR_FIELDS} onSubmit={(v) => v.nome && v.codigo && add(v)} submitLabel="Adicionar código" />
      </div>
    </div>
  );
}

function Footer({ churchName }) {
  return (
    <footer className="border-t mt-16 py-10 px-4 sm:px-6" style={{ borderColor: C.gold + "33", background: C.black }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <img src={LOGO_BLACK_BG} alt={churchName} className="h-20 w-auto rounded-md" />
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg">
          <QRCodeSVG value="https://avivardoespirito.com.br" size={64} bgColor="#ffffff" fgColor="#0B0B0C" />
          <p className="text-xs font-mono max-w-[120px]" style={{ color: C.black }}>Aponte a câmera e visite o site</p>
        </div>
        <p className="text-xs font-mono text-center sm:text-right" style={{ color: C.gold + "cc" }}>Doutrina embasada nos princípios da fé cristã · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- */
/* Carrossel lateral fixo (disponível em todas as páginas)             */
/* ---------------------------------------------------------------- */
const SIDE_COLORS = ["#6C3FA8", "#E07B39", "#2E8B57", "#B39DDB", "#CBA135", "#B03428", "#4A3B6B", "#1B8A55", "#9C4A20", "#8B6F1F"];
const SIDE_PER_PAGE = 4;

function FilmSprockets({ side }) {
  return (
    <div className={`absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"} w-3 z-20 flex flex-col justify-around py-2 pointer-events-none`} style={{ background: "#000" }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-[2px] mx-auto" style={{ background: "#3a3a3a" }} />
      ))}
    </div>
  );
}

function SideCarousel({ photos, setPage }) {
  const FRAMES = 4;
  const [offset, setOffset] = useState(0);
  const total = photos ? photos.length : 0;
  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => setOffset((v) => (v + 1) % total), 3500);
    return () => clearInterval(t);
  }, [total]);

  if (total === 0) return null;
  const frameCount = Math.min(FRAMES, total);
  const visible = Array.from({ length: frameCount }, (_, i) => photos[(offset + i) % total]);

  return (
    <div className="hidden lg:flex fixed left-10 bottom-8 z-30 flex-col" style={{ width: "9.5rem", top: "10rem" }}>
      <div className="relative flex-1 rounded-md overflow-hidden shadow-xl" style={{ background: "#000" }}>
        <div className="absolute inset-0 flex flex-col" style={{ left: 14, right: 14 }}>
          {visible.map((photo, i) => (
            <button
              key={`${offset}-${i}`}
              onClick={() => setPage(photo.target)}
              className="relative w-full overflow-hidden focus:outline-none"
              style={{ flex: "1 1 0", borderTop: i > 0 ? "3px solid #000" : "none" }}
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-center" style={{ background: "#000000cc" }}>
                <p className="text-[8px] text-white font-mono truncate">{photo.label}</p>
              </div>
            </button>
          ))}
        </div>
        <FilmSprockets side="left" />
        <FilmSprockets side="right" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Fórum (coluna fixa à direita / botão flutuante no celular)         */
/* ---------------------------------------------------------------- */
const FORUM_FIELDS = [
  { key: "autor", label: "Seu nome" },
  { key: "mensagem", label: "Mensagem", type: "textarea" },
];

function Forum({ posts, addPost }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [msg, setMsg] = useState("");

  const send = () => {
    if (!nome.trim() || !msg.trim()) return;
    addPost({ id: uid(), autor: nome.trim(), mensagem: msg.trim(), timestamp: nowISO() });
    setMsg("");
  };

  const sorted = [...posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const Feed = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {sorted.length === 0 && <p className="text-xs italic" style={{ color: C.stone }}>Seja o primeiro a comentar.</p>}
        {sorted.map((p) => (
          <div key={p.id} className="text-sm p-2 rounded-md" style={{ background: C.parchment }}>
            <p className="font-semibold text-xs" style={{ color: C.ember }}>{p.autor}</p>
            <p style={{ color: C.ink }}>{p.mensagem}</p>
            <p className="text-[10px] font-mono mt-1" style={{ color: C.stone }}>{fmtDateTime(p.timestamp)}</p>
          </div>
        ))}
      </div>
      <div className="p-3 border-t space-y-2" style={{ borderColor: C.line }}>
        <input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} style={{ borderColor: C.line }} />
        <textarea placeholder="Escreva algo..." rows={1} value={msg} onChange={(e) => setMsg(e.target.value)} className={inputCls} style={{ borderColor: C.line }} />
        <Btn className="w-full justify-center" onClick={send}><Send size={14} /> Enviar</Btn>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex fixed right-0 bottom-8 w-64 z-30 rounded-l-xl border shadow-xl flex-col" style={{ background: C.cream, borderColor: C.line, top: "10rem" }}>
        <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: C.line }}>
          <MessageCircle size={16} color={C.ember} />
          <p className="font-display font-semibold text-sm">Fórum</p>
        </div>
        {Feed}
      </div>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed right-4 bottom-4 z-30 p-3 rounded-full shadow-xl focus:outline-none focus:ring-2" style={{ background: C.ember, color: "#fff" }}>
        <MessageCircle size={20} />
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end" style={{ background: "#00000077" }}>
          <div className="w-full h-[70vh] rounded-t-2xl flex flex-col" style={{ background: C.cream }}>
            <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: C.line }}>
              <p className="font-display font-semibold">Fórum</p>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            {Feed}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Home                                                               */
/* ---------------------------------------------------------------- */
function QuickCard({ icon: Icon, title, desc, onClick, tone = "gold", className = "", bgImage, adminMode }) {
  const bg = tone === "violet" ? C.violet : tone === "red" ? C.liveRed : C.gold;
  const border = tone === "violet" ? C.violetDeep : tone === "red" ? "#8A241B" : C.goldDeep;
  return (
    <button
      onClick={onClick}
      className={`relative block w-full aspect-[3/4] rounded-xl border transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 overflow-hidden ${className}`}
      style={{ background: bgImage ? C.black : bg, borderColor: bgImage ? C.line : border, color: "#fff" }}
    >
      {bgImage ? (
        <img src={bgImage} alt={title} className="absolute inset-0 w-full h-full object-cover" />
      ) : adminMode ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed" style={{ borderColor: C.line, background: "#00000006", color: C.stone }}>
          <ImageIcon size={22} />
          <span className="text-[10px] font-mono text-center px-3">{title} — aguardando imagem</span>
        </div>
      ) : null}
    </button>
  );
}

function HomeCardsAdmin({ cards, onSave }) {
  const [vals, setVals] = useState(cards);
  useEffect(() => setVals(cards), [cards]);
  const update = (idx, patch) => setVals((v) => v.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  return (
    <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
      <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · editar cards da Home (título, descrição, imagem)</p>
      <div className="space-y-2">
        {vals.map((c, idx) => (
          <div key={c.key} className="grid sm:grid-cols-3 gap-2 p-2 rounded-md" style={{ background: C.parchment }}>
            <Field label={`Título (${c.key})`}><input className={inputCls} style={{ borderColor: C.line }} value={c.titulo} onChange={(e) => update(idx, { titulo: e.target.value })} /></Field>
            <Field label="Descrição"><input className={inputCls} style={{ borderColor: C.line }} value={c.desc} onChange={(e) => update(idx, { desc: e.target.value })} /></Field>
            <Field label="URL da imagem"><input className={inputCls} style={{ borderColor: C.line }} value={c.imageUrl} onChange={(e) => update(idx, { imageUrl: e.target.value })} /></Field>
          </div>
        ))}
      </div>
      <Btn className="mt-3" onClick={() => onSave(vals)}>Salvar cards</Btn>
    </div>
  );
}

function HeroSlidesAdmin({ slides, onSave }) {
  const [vals, setVals] = useState(slides);
  useEffect(() => setVals(slides), [slides]);
  const update = (idx, patch) => setVals((v) => v.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  return (
    <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
      <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · editar banners do carrossel de entrada</p>
      <div className="space-y-2">
        {vals.map((s, idx) => (
          <div key={s.id} className="grid sm:grid-cols-3 gap-2 p-2 rounded-md" style={{ background: C.parchment }}>
            <Field label="Título"><input className={inputCls} style={{ borderColor: C.line }} value={s.titulo} onChange={(e) => update(idx, { titulo: e.target.value })} /></Field>
            <Field label="Subtítulo"><input className={inputCls} style={{ borderColor: C.line }} value={s.subtitulo || ""} onChange={(e) => update(idx, { subtitulo: e.target.value })} /></Field>
            <Field label="URL da imagem"><input className={inputCls} style={{ borderColor: C.line }} value={s.imageUrl} onChange={(e) => update(idx, { imageUrl: e.target.value })} /></Field>
          </div>
        ))}
      </div>
      <Btn className="mt-3" onClick={() => onSave(vals)}>Salvar banners</Btn>
    </div>
  );
}

function LiveHomeCard({ aoVivo, onClick }) {
  return (
    <div className="rounded-xl overflow-hidden border-2 shadow-xl" style={{ borderColor: C.gold, background: C.black }}>
      <div className="aspect-video bg-black relative">
        {aoVivo.isLive && aoVivo.embedUrl ? (
          <iframe title="ao-vivo-home" src={getEmbedUrl(aoVivo.embedUrl)} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
        ) : (
          <button onClick={onClick} className="w-full h-full relative focus:outline-none">
            <img src={AOVIVO_BANNER} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#00000066" }}>
              <Radio size={32} color={C.gold} />
            </div>
          </button>
        )}
        {aoVivo.isLive && (
          <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-1 rounded-full text-white flex items-center gap-1" style={{ background: "#E14D3A" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" /> AO VIVO
          </span>
        )}
      </div>
      <button onClick={onClick} className="w-full text-left p-3 focus:outline-none">
        <p className="font-display font-semibold text-sm" style={{ color: C.goldBright }}>{aoVivo.isLive ? "Estamos ao vivo agora" : "Ao Vivo & Avivar News"}</p>
        <p className="text-xs mt-0.5" style={{ color: "#ffffffaa" }}>Toque para ver transmissões anteriores e notícias.</p>
      </button>
    </div>
  );
}

function FeaturedBibliaCard({ onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl overflow-hidden border-2 shadow-xl text-left relative focus:outline-none focus:ring-2" style={{ borderColor: C.gold }}>
      <ImgOrPlaceholder url={BIBLIA_DESTAQUE_BANNER} alt="Bíblia Avivar" className="w-full aspect-video object-cover" ph="Banner Bíblia Avivar — adicionar depois" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent 40%, #000000cc)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-display font-semibold text-sm text-white">Bíblia Avivar</p>
        <p className="text-xs text-white/80">A Palavra que transforma vidas — acessar agora</p>
      </div>
    </button>
  );
}

function HeroNewsColumn({ news, bgImage, onClick }) {
  const top = [...news].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3);
  return (
    <button onClick={onClick} className="relative rounded-2xl overflow-hidden border text-left h-full min-h-[280px] focus:outline-none focus:ring-2" style={{ borderColor: C.line }}>
      {bgImage ? (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: C.indigo }} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0E1526CC, #0E1526EE)" }} />
      <div className="relative p-4 sm:p-5 flex flex-col h-full">
        <Eyebrow color={C.goldBright}><Radio size={11} className="inline mr-1" />Notícias do Evangelho</Eyebrow>
        <div className="mt-2 space-y-3 flex-1">
          {top.length === 0 ? (
            <p className="text-xs italic" style={{ color: "#ffffffaa" }}>Nenhuma reportagem publicada ainda.</p>
          ) : (
            top.map((n) => (
              <div key={n.id} className="pb-3 border-b" style={{ borderColor: "#ffffff22" }}>
                <p className="text-sm font-display font-semibold text-white leading-snug">{n.titulo}</p>
                {n.texto && <p className="text-xs mt-1" style={{ color: "#ffffffaa" }}>{n.texto.slice(0, 90)}{n.texto.length > 90 ? "…" : ""}</p>}
              </div>
            ))
          )}
        </div>
        <span className="text-[10px] font-mono tracking-wide underline decoration-dotted text-white/80 mt-2">ver todas as reportagens</span>
      </div>
    </button>
  );
}

function HeroDoacoesCard({ data, bgImage, onClick }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = (e) => {
    e.stopPropagation();
    if (!data.pixKey) return;
    navigator.clipboard?.writeText(data.pixKey).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };
  return (
    <div className="relative rounded-2xl overflow-hidden border h-full min-h-[280px]" style={{ borderColor: C.line }}>
      {bgImage ? (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: C.emberDeep }} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #4A1A0ACC, #2A0F06EE)" }} />
      <button onClick={onClick} className="relative w-full h-full text-left p-4 sm:p-5 flex flex-col focus:outline-none focus:ring-2">
        <Eyebrow color={C.goldBright}><HandHeart size={11} className="inline mr-1" />Semeando com generosidade</Eyebrow>
        <p className="font-display font-semibold text-lg text-white mt-1">Dízimo e Oferta</p>
        <p className="text-xs mt-1" style={{ color: "#ffffffaa" }}>Sua contribuição sustenta a obra do ministério.</p>
        <div className="mt-3">
          <p className="text-[10px] font-mono uppercase" style={{ color: "#ffffff88" }}>Chave PIX</p>
          <p className="text-sm font-mono break-all text-white">{data.pixKey || "Chave PIX ainda não cadastrada"}</p>
        </div>
        <div className="flex-1" />
        <span onClick={copiar} className="inline-flex items-center gap-1.5 text-xs mt-3 px-3 py-1.5 rounded-md w-fit" style={{ background: "#ffffff22", color: "#fff" }}>
          <Copy size={12} /> {copiado ? "Copiado!" : "Copiar chave PIX"}
        </span>
      </button>
    </div>
  );
}

// Antes havia aqui um segundo card de "Oração nos Lares" duplicando o card já existente
// no grid de ícones da Home — foi transformado no card de "Pedido de Oração" (novo recurso).
function PedidoOracaoCard({ onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl overflow-hidden border-2 shadow-xl text-left focus:outline-none focus:ring-2" style={{ borderColor: C.purple }}>
      <div className="relative pt-7 pb-3 px-4 text-center" style={{ background: C.purpleDeep }}>
        <div className="absolute left-1/2 -translate-x-1/2 -top-3.5 w-0 h-0" style={{ borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderBottom: `22px solid ${C.purple}` }} />
        <HandHeart size={20} color="#fff" className="mx-auto mb-1" />
        <p className="text-[10px] font-mono uppercase tracking-wide" style={{ color: "#ffffffaa" }}>Intercessão</p>
      </div>
      <div className="p-3 text-xs space-y-1" style={{ background: C.cream }}>
        <p className="font-display font-semibold text-sm" style={{ color: C.ink }}>Pedido de Oração</p>
        <p style={{ color: C.stone }}>Conte pra nós o que está pesando no seu coração — vamos orar com você.</p>
        <p className="text-[10px] font-mono pt-1" style={{ color: C.purple }}>toque para enviar seu pedido</p>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Manchete da Home — chamada de jornal clicável, configurável pelo admin */
/* ---------------------------------------------------------------- */
function MancheteBar({ manchete, save, adminMode }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(manchete || DEFAULT_MANCHETE);
  useEffect(() => setDraft(manchete || DEFAULT_MANCHETE), [manchete]);

  const m = manchete || DEFAULT_MANCHETE;
  const abrir = () => {
    if (!m.link) return;
    if (/^https?:\/\//i.test(m.link)) window.open(m.link, "_blank", "noopener,noreferrer");
    else window.location.hash = m.link;
  };

  if (!m.ativo && !adminMode) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
      {(m.ativo || adminMode) && (
        <button
          onClick={abrir}
          className={`w-full text-left rounded-lg border-2 px-4 py-3 sm:px-5 sm:py-4 transition hover:brightness-105 focus:outline-none focus:ring-2 ${m.link ? "cursor-pointer" : "cursor-default"}`}
          style={{ background: C.parchment, borderColor: C.gold, opacity: m.ativo ? 1 : 0.5 }}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: C.emberDeep }}>Manchete Avivar {!m.ativo && "(inativa)"}</span>
          <p className="font-display font-bold text-base sm:text-lg mt-0.5" style={{ color: C.ink }}>{m.titulo}</p>
        </button>
      )}
      {adminMode && (
        <div className="mt-2 p-3 rounded-lg border text-xs" style={{ borderColor: C.line, background: "#00000006" }}>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="underline" style={{ color: C.stone }}>ADMIN · editar manchete da home</button>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2 mt-1">
              <Field label="Título da manchete"><input className={inputCls} style={{ borderColor: C.line }} value={draft.titulo} onChange={(e) => setDraft((d) => ({ ...d, titulo: e.target.value }))} /></Field>
              <Field label="Link (URL ou #id-da-secao)"><input className={inputCls} style={{ borderColor: C.line }} value={draft.link} onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!draft.ativo} onChange={(e) => setDraft((d) => ({ ...d, ativo: e.target.checked }))} /> Manchete ativa (visível no site)</label>
              <div className="flex gap-2">
                <Btn onClick={() => { save(draft); setEditing(false); }}>Salvar</Btn>
                <button onClick={() => { setDraft(m); setEditing(false); }} className="text-xs underline" style={{ color: C.stone }}>cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Home({ site, setPage, visitantes, saveSite, adminMode, aoVivo, oracaoEncontros, avivarNews, doacoes, manchete, saveManchete }) {
  const recentVisitors = [...visitantes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);
  const homeCards = site.homeCards || DEFAULT_HOMECARDS;
  return (
    <div>
      <MancheteBar manchete={manchete} save={saveManchete} adminMode={adminMode} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 grid lg:grid-cols-[1fr_1.7fr_1fr] gap-3 sm:gap-4 items-stretch">
        <HeroNewsColumn news={avivarNews || []} bgImage={site.heroLeftBg} onClick={() => setPage("aovivo")} />

        <div className="relative rounded-2xl overflow-hidden h-full min-h-[280px] sm:min-h-[360px]" style={{ background: C.black }}>
          <img src={site.heroMiddleBg || HERO_BANNER} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(1px) brightness(0.5)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #00000066, #1F1B2ECC)" }} />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="font-script text-4xl sm:text-6xl" style={{ color: C.goldBright }}>{site.churchName}</h1>
            <p className="mt-3 text-sm sm:text-base max-w-xl" style={{ color: "#ffffffdd" }}>
              Um ministério comprometido em resgatar vidas, restaurar corações e avivar a Igreja com o poder do Espírito Santo.
            </p>
          </div>
        </div>

        <HeroDoacoesCard data={doacoes || DEFAULT_DOACOES} bgImage={site.heroRightBg} onClick={() => setPage("doacoes")} />
      </div>

      {adminMode && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-3 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
          <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · imagens de fundo das 3 colunas do topo</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Fundo — coluna Notícias (esquerda)"><input className={inputCls} style={{ borderColor: C.line }} value={site.heroLeftBg || ""} onChange={(e) => saveSite({ ...site, heroLeftBg: e.target.value })} /></Field>
            <Field label="Fundo — coluna central"><input className={inputCls} style={{ borderColor: C.line }} value={site.heroMiddleBg || ""} onChange={(e) => saveSite({ ...site, heroMiddleBg: e.target.value })} /></Field>
            <Field label="Fundo — coluna Doações (direita)"><input className={inputCls} style={{ borderColor: C.line }} value={site.heroRightBg || ""} onChange={(e) => saveSite({ ...site, heroRightBg: e.target.value })} /></Field>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LiveHomeCard aoVivo={aoVivo} onClick={() => setPage("aovivo")} />
        <FeaturedBibliaCard onClick={() => window.open(BIBLIA_URL, "_blank", "noopener,noreferrer")} />
        <PedidoOracaoCard onClick={() => setPage("pedidooracao")} />
      </div>

      {/* Cards da home — sempre depois dos banners do topo (Hero), nunca sobrepostos;
          grade de 3 colunas em telas grandes (classe GRID3 padrão do site). */}
      <div className={`max-w-5xl mx-auto px-4 sm:px-6 mt-8 relative z-10 ${GRID3}`}>
        {homeCards.map((c) => {
          const Icon = CARD_ICONS[c.key] || Sparkles;
          return (
            <QuickCard
              key={c.key}
              icon={Icon}
              title={c.titulo}
              desc={c.desc}
              onClick={() => (c.externalUrl ? window.open(c.externalUrl, "_blank", "noopener,noreferrer") : setPage(c.key))}
              tone={c.tone}
              bgImage={c.imageUrl}
              adminMode={adminMode}
            />
          );
        })}
      </div>

      {adminMode && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <HomeCardsAdmin cards={homeCards} onSave={(v) => saveSite({ ...site, homeCards: v })} />
        </div>
      )}

      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 grid md:grid-cols-[1.4fr_1fr] gap-8 items-start">
        <div>
          <Eyebrow>Sobre nós</Eyebrow>
          <SectionTitle>Uma casa de fé aberta a todos</SectionTitle>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.stone }}>
            O {site.churchName} é uma igreja interdenominacional, fundamentada na doutrina cristã, dedicada ao ensino da
            Palavra, à comunhão entre irmãos e ao cuidado com quem chega pela primeira vez.
          </p>
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: C.line, background: C.cream }}>
          <div className="flex items-center gap-2 mb-3" style={{ color: C.ember }}>
            <HandHeart size={18} />
            <h3 className="font-display font-semibold">Visitantes recentes</h3>
          </div>
          {recentVisitors.length === 0 ? (
            <Empty text="Nenhum visitante registrado ainda hoje." />
          ) : (
            <div className="h-40 overflow-hidden relative">
              <div className="marquee-track">
                {[...recentVisitors, ...recentVisitors].map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 text-sm border-b" style={{ borderColor: C.line }}>
                    <span className="font-medium" style={{ color: C.ink }}>{v.nome}</span>
                    <span className="text-xs font-mono" style={{ color: C.stone }}>{fmtDateTime(v.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs mt-2 font-mono" style={{ color: C.stone }}>Seja muito bem-vindo(a) — cadastre-se em Visitantes.</p>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Códigos Avivar                                                     */
/* ---------------------------------------------------------------- */
const CODIGOS_VITRINE_FIELDS = [
  { key: "titulo", label: "Título do ebook/livro" },
  { key: "imageUrl", label: "URL da capa", type: "url" },
  { key: "pdfUrl", label: "URL do PDF (se preenchido, abre direto — acesso liberado aqui dentro)", type: "url" },
  { key: "destino", label: "Destino ao clicar se não houver PDF (deixe 'loja' para ir à Loja Avivar, ou cole um link)" },
  { key: "preco", label: "Preço (ex: R$ 29,90)" },
  { key: "descricao", label: "Sinopse / descrição", type: "textarea" },
  { key: "linkCompra", label: "Link de compra — PIX/Mercado Pago", type: "url" },
  { key: "linkCartao", label: "Link de compra — Cartão de crédito", type: "url" },
];

function CodigosAvivar({ data, save, adminMode, loja, saveLoja, avivarNews, setPage }) {
  const [unlocked, setUnlocked] = useState(false);
  const [holderName, setHolderName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [err, setErr] = useState("");
  const [showAccessMgmt, setShowAccessMgmt] = useState(false);
  const [selectedTema, setSelectedTema] = useState(null);

  const reportagensDestaque = [...(avivarNews || [])]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  const vitrineItems = (loja || []).filter((p) => p.categoria === "Códigos Avivar");
  const addVitrineItem = (v) => {
    if (!v.titulo) return;
    saveLoja([...(loja || []), { id: uid(), categoria: "Códigos Avivar", nome: v.titulo, destino: v.destino || "loja", ...v }]);
  };
  const delVitrineItem = (id) => saveLoja((loja || []).filter((p) => p.id !== id));
  const goVitrine = (item) => {
    if (item.pdfUrl) {
      window.open(item.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const destino = (item.destino || "loja").trim();
    if (/^https?:\/\//i.test(destino)) {
      window.open(destino, "_blank", "noopener,noreferrer");
    } else {
      setPage && setPage(destino || "loja");
    }
  };

  const tryEnter = () => {
    const match = data.codes.find((c) => c.active && c.code.toLowerCase() === codeInput.trim().toLowerCase());
    if (match) {
      setUnlocked(true);
      setHolderName(nameInput || match.holder);
      setErr("");
    } else {
      setErr("Código inválido, inativo ou pessoa não cadastrada.");
    }
  };

  const genCode = (holder) => {
    const code = "AVR-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    save({ ...data, codes: [...data.codes, { id: uid(), holder, code, active: true }] });
  };
  const toggleCode = (id) => save({ ...data, codes: data.codes.map((c) => (c.id === id ? { ...c, active: !c.active } : c)) });
  const resetCode = (id) => {
    const nc = "AVR-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    save({ ...data, codes: data.codes.map((c) => (c.id === id ? { ...c, code: nc, active: true } : c)) });
  };

  const addTema = (v) => save({ ...data, temas: [...data.temas, { id: uid(), ...v }] });
  const addCourse = (v) => save({ ...data, courses: [...data.courses, { id: uid(), aulas: [], ...v }] });
  const addAula = (courseId, v) =>
    save({ ...data, courses: data.courses.map((c) => (c.id === courseId ? { ...c, aulas: [...c.aulas, { id: uid(), ...v }] } : c)) });
  const delCourse = (id) => save({ ...data, courses: data.courses.filter((c) => c.id !== id) });

  if (!unlocked) {
    return (
      <div className="min-h-[70vh]" style={{ background: C.violetDeep }}>
        {/* Divulgação em destaque — revista, trilogia de livros, Bíblia Avivar e capas individuais */}
        <div className="px-4 sm:px-6 lg:px-10 pt-10 pb-2">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setPage && setPage("aovivo")}
              className="block w-full rounded-2xl overflow-hidden border-2 shadow-xl focus:outline-none focus:ring-2 mb-5"
              style={{ borderColor: C.gold }}
            >
              <ImgOrPlaceholder url={CODIGOS_REVISTA_BANNER} alt="Revista Códigos Avivar" className="w-full object-cover max-h-[420px]" ph="Banner revista Códigos Avivar — em destaque" />
            </button>

            {/* A imagem "conjugada" com a colagem das 3 capas da trilogia foi removida daqui
                a pedido — cada capa já aparece individualmente mais abaixo. */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <FeaturedBibliaCard onClick={() => window.open(BIBLIA_URL, "_blank", "noopener,noreferrer")} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { img: LIVRO_DONS_CAPA, titulo: "Conquistando os Dons do Espírito Santo" },
                { img: LIVRO_CURA_CAPA, titulo: "Praticando a Cura Divina" },
                { img: LIVRO_GLORIA_CAPA, titulo: "O Impacto da Glória" },
              ].map((l) => (
                <button
                  key={l.titulo}
                  onClick={() => setPage && setPage("loja")}
                  className="rounded-lg overflow-hidden border shadow-md text-left focus:outline-none focus:ring-2"
                  style={{ borderColor: "#ffffff33" }}
                >
                  <ImgOrPlaceholder url={l.img} alt={l.titulo} className="w-full aspect-[3/4] object-cover" ph={l.titulo} />
                  <p className="text-[11px] text-white p-2" style={{ background: "#00000055" }}>{l.titulo}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3">
          {/* Coluna 1 — credenciais de acesso */}
          <div className="flex items-center justify-center px-4 py-12" style={{ background: C.violetDeep }}>
            <div className="w-full max-w-sm text-center">
              <FlameMark size={36} color={C.gold} />
              <h2 className="font-display text-2xl font-semibold mt-4 text-white">Códigos Avivar</h2>
              <p className="text-sm mt-2" style={{ color: "#D9D2EA" }}>
                Área restrita a pessoas cadastradas. Informe seu nome e o código de acesso gerado para você.
              </p>

              {/* Incentivo místico-espiritual acima do formulário, convidando a assinar/entrar */}
              <p className="text-xs italic mt-4 px-2 py-2 rounded-md" style={{ color: C.goldBright, background: "#ffffff0f" }}>
                <Sparkles size={11} className="inline mr-1" />
                Sua frequência espiritual está prestes a mudar de nível: assine e entre na energia quântica da revelação, onde ciência e fé se encontram para elevar sua consciência.
              </p>

              <div className="mt-4 space-y-3 text-left">
                <input placeholder="Seu nome" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                <input placeholder="Código de acesso (ex: AVR-0001)" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2" />
                {err && <p className="text-xs" style={{ color: "#F2A6A6" }}>{err}</p>}
                <Btn color={C.gold} className="w-full justify-center" onClick={tryEnter}>
                  <Unlock size={16} /> Entrar
                </Btn>
              </div>
              {adminMode && (
                <button onClick={() => setShowAccessMgmt(true)} className="mt-6 text-xs underline" style={{ color: "#D9D2EA" }}>
                  Gerenciar códigos de acesso (admin)
                </button>
              )}

              {/* Card de reforço do convite pra assinar — fundo claro, abaixo do login,
                  no mesmo tamanho dos demais cards de divulgação desta seção */}
              <div className="mt-8 rounded-lg overflow-hidden border shadow-md aspect-[3/4] flex flex-col items-center justify-center text-center p-5" style={{ borderColor: "#ffffff33", background: C.parchment }}>
                <Sparkles size={22} color={C.violet} />
                <p className="font-display font-semibold mt-3" style={{ color: C.ink }}>Eleve sua consciência espiritual</p>
                <p className="text-xs mt-2" style={{ color: C.stone }}>
                  Assine os Códigos Avivar e entre na frequência de revelação, ciência e espiritualidade que Deus reserva para os últimos dias.
                </p>
              </div>
            </div>
          </div>

          {/* Coluna 2 — reportagens: portais espirituais, horas dimensionais, energia quântica */}
          <div className="px-6 py-12 border-t lg:border-t-0 lg:border-l" style={{ background: C.indigo, borderColor: "#ffffff14" }}>
            <Eyebrow color={C.goldBright}><Sparkles size={11} className="inline mr-1" />Ciência, tempo e espírito</Eyebrow>
            <h3 className="font-display text-xl font-semibold text-white mt-2 mb-5">Reflexões Avivar News</h3>
            <div className="space-y-3">
              {reportagensDestaque.length === 0 && (
                <p className="text-xs italic" style={{ color: "#ffffffaa" }}>Nenhuma reportagem publicada ainda.</p>
              )}
              {reportagensDestaque.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setPage && setPage("aovivo")}
                  className="block text-left w-full p-4 rounded-lg transition hover:brightness-110 focus:outline-none focus:ring-2"
                  style={{ background: "#ffffff0f" }}
                >
                  <p className="font-display font-semibold text-white text-sm leading-snug">{n.titulo}</p>
                  {n.texto && (
                    <p className="text-xs mt-1.5" style={{ color: "#ffffffaa" }}>
                      {n.texto.slice(0, 130)}{n.texto.length > 130 ? "…" : ""}
                    </p>
                  )}
                  <span className="text-[10px] font-mono underline decoration-dotted text-white/70 mt-2 inline-block">ler em Avivar News</span>
                </button>
              ))}
            </div>
          </div>

          {/* Coluna 3 — vitrine de ebooks/livros */}
          <div className="px-6 py-12 border-t lg:border-t-0 lg:border-l" style={{ background: C.emberDeep, borderColor: "#ffffff14" }}>
            <p className="font-script text-3xl text-white leading-none">Códigos Avivar</p>
            <p className="text-xs mt-2" style={{ color: "#ffffffbb" }}>O Conhecimento Revelado pelo Espírito Santo</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {vitrineItems.length === 0 && (
                <p className="text-xs italic col-span-2" style={{ color: "#ffffffaa" }}>Nenhum título cadastrado ainda.</p>
              )}
              {vitrineItems.map((item) => (
                <div key={item.id} className="rounded-lg overflow-hidden border" style={{ borderColor: "#ffffff22" }}>
                  <button onClick={() => goVitrine(item)} className="block w-full focus:outline-none focus:ring-2">
                    <ImgOrPlaceholder url={item.imageUrl} alt={item.titulo || item.nome} className="w-full h-28 object-cover" />
                    <p className="text-[11px] text-white p-1.5 text-left leading-snug">{item.titulo || item.nome}</p>
                  </button>
                  {adminMode && (
                    <button onClick={() => delVitrineItem(item.id)} className="text-[10px] underline w-full text-left px-1.5 pb-1.5" style={{ color: "#ffffff88" }}>
                      excluir
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] mt-3" style={{ color: "#ffffff88" }}>
              Estes mesmos títulos ficam à venda na Loja Avivar; aqui, para quem já tem acesso, a leitura é livre.
            </p>
            {adminMode && (
              <div className="mt-5 pt-4 border-t" style={{ borderColor: "#ffffff22" }}>
                <p className="text-xs font-mono mb-2" style={{ color: "#ffffffaa" }}>ADMIN · nova capa (ebook/livro)</p>
                <DynamicForm fields={CODIGOS_VITRINE_FIELDS} accent={C.gold} submitLabel="Cadastrar" onSubmit={addVitrineItem} />
              </div>
            )}
          </div>
        </div>

        {showAccessMgmt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#00000077" }}>
            <div className="w-full max-w-lg rounded-xl p-6 max-h-[80vh] overflow-y-auto" style={{ background: C.cream }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-semibold text-lg" style={{ color: C.ink }}>Códigos de acesso</h3>
                <button onClick={() => setShowAccessMgmt(false)}><X size={18} /></button>
              </div>
              <DynamicForm fields={[{ key: "holder", label: "Nome da pessoa" }]} accent={C.violet} submitLabel="Gerar código" onSubmit={(v) => v.holder && genCode(v.holder)} />
              <div className="mt-4 space-y-2">
                {data.codes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm p-2 rounded-md" style={{ background: C.parchment }}>
                    <div>
                      <p style={{ color: C.ink }}>{c.holder}</p>
                      <p className="font-mono text-xs" style={{ color: C.stone }}>{c.code}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: c.active ? "#2E7D4F22" : "#B0342822", color: c.active ? "#2E7D4F" : "#B03428" }}>
                        {c.active ? "ativo" : "revogado"}
                      </span>
                      <button onClick={() => toggleCode(c.id)} className="text-xs underline" style={{ color: C.violet }}>{c.active ? "revogar" : "ativar"}</button>
                      <button onClick={() => resetCode(c.id)} className="text-xs underline" style={{ color: C.ember }}>resetar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const coursesForTema = selectedTema ? data.courses.filter((c) => c.tema === selectedTema.nome) : data.courses;

  return (
    <div style={{ background: C.violetDeep, minHeight: "70vh" }} className="pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow color={C.gold}>Área reservada</Eyebrow>
            <SectionTitle>Bem-vindo(a), {holderName}</SectionTitle>
            <p className="text-sm mt-1" style={{ color: "#D9D2EA" }}>Segredos dos profetas, milagres, curas e a ponte entre ciência e espiritualidade.</p>
          </div>
          <button onClick={() => setUnlocked(false)} className="flex items-center gap-1 text-xs px-3 py-2 rounded-md" style={{ color: "#fff", background: "#ffffff1a" }}>
            <LogOut size={14} /> Sair
          </button>
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedTema(null)}
            className="p-4 rounded-lg text-left"
            style={{ background: !selectedTema ? C.gold : "#ffffff10", color: !selectedTema ? C.violetDeep : "#fff" }}
          >
            <p className="font-display font-semibold">Todos os temas</p>
          </button>
          {data.temas.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTema(t)}
              className="p-4 rounded-lg text-left"
              style={{ background: selectedTema?.id === t.id ? C.gold : "#ffffff10", color: selectedTema?.id === t.id ? C.violetDeep : "#fff" }}
            >
              <p className="font-display font-semibold">{t.nome}</p>
              <p className="text-xs mt-1 opacity-80">{t.descricao}</p>
            </button>
          ))}
        </div>

        {adminMode && (
          <div className="mt-8 rounded-lg p-4" style={{ background: "#ffffff10" }}>
            <p className="text-xs font-mono mb-2 text-white/70">ADMIN · novo tema</p>
            <DynamicForm fields={[{ key: "nome", label: "Nome do tema" }, { key: "descricao", label: "Descrição", type: "textarea" }]} accent={C.gold} onSubmit={addTema} submitLabel="Criar tema" />
          </div>
        )}

        <div className="mt-10">
          <h3 className="font-display text-xl font-semibold text-white mb-4">Cursos</h3>
          {coursesForTema.length === 0 ? (
            <Empty text="Nenhum curso cadastrado neste tema ainda." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {coursesForTema.map((c) => (
                <div key={c.id} className="rounded-xl overflow-hidden" style={{ background: "#ffffff0d" }}>
                  <ImgOrPlaceholder url={c.imageUrl} alt={c.titulo} className="w-full h-36 object-cover" />
                  <div className="p-4">
                    <p className="text-xs font-mono" style={{ color: C.gold }}>{c.tema}</p>
                    <h4 className="font-display font-semibold text-white mt-1">{c.titulo}</h4>
                    <p className="text-xs text-white/70 mt-1">{c.descricao}</p>
                    <div className="mt-3 space-y-3">
                      {c.aulas.map((a) => (
                        <div key={a.id}>
                          <p className="text-xs text-white/80 mb-1">{a.titulo}</p>
                          <div className="aspect-video rounded-md overflow-hidden bg-black">
                            <iframe title={a.titulo} src={getEmbedUrl(a.videoUrl)} className="w-full h-full" allowFullScreen />
                          </div>
                        </div>
                      ))}
                      {c.aulas.length === 0 && <p className="text-xs italic text-white/50">Nenhuma aula adicionada ainda.</p>}
                    </div>
                    {adminMode && (
                      <div className="mt-4 border-t border-white/10 pt-3">
                        <DynamicForm fields={AULA_FIELDS} accent={C.gold} submitLabel="Adicionar aula" onSubmit={(v) => v.titulo && addAula(c.id, v)} />
                        <button onClick={() => delCourse(c.id)} className="text-xs mt-2 underline text-white/60">excluir curso</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {adminMode && (
            <div className="mt-6 rounded-lg p-4" style={{ background: "#ffffff10" }}>
              <p className="text-xs font-mono mb-2 text-white/70">ADMIN · novo curso</p>
              <DynamicForm fields={CURSO_FIELDS} accent={C.gold} onSubmit={addCourse} submitLabel="Criar curso" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const AULA_FIELDS = [
  { key: "titulo", label: "Título da aula" },
  { key: "videoUrl", label: "URL do vídeo (YouTube ou Vimeo)", type: "url" },
];
const CURSO_FIELDS = [
  { key: "titulo", label: "Título do curso" },
  { key: "tema", label: "Tema relacionado (nome exato)" },
  { key: "descricao", label: "Descrição", type: "textarea" },
  { key: "imageUrl", label: "URL de imagem de capa (opcional)", type: "url" },
];

/* ---------------------------------------------------------------- */
/* Eventos / Galeria                                                  */
/* ---------------------------------------------------------------- */
const EVENTO_FIELDS = [
  { key: "titulo", label: "Título do evento" },
  { key: "data", label: "Data", type: "date" },
  { key: "hora", label: "Horário", type: "time" },
  { key: "local", label: "Local" },
  { key: "descricao", label: "Descrição", type: "textarea" },
  { key: "imageUrl", label: "URL da imagem (banner)", type: "url" },
];
const SESSAO_FIELDS = [
  { key: "titulo", label: "Título da sessão" },
  { key: "data", label: "Data", type: "date" },
];

function EventosGaleria({ eventos, saveEventos, galeria, saveGaleria, adminMode, setManchete }) {
  const [tab, setTab] = useState("eventos");
  const [selected, setSelected] = useState(null);
  const [mediaUrl, setMediaUrl] = useState({});

  const addEvento = (v) => saveEventos([...eventos, { id: uid(), ...v }]);
  const delEvento = (id) => saveEventos(eventos.filter((e) => e.id !== id));
  const addSessao = (v) => saveGaleria([...galeria, { id: uid(), fotos: [], videos: [], ...v }]);
  const delSessao = (id) => saveGaleria(galeria.filter((g) => g.id !== id));
  const addMedia = (sessaoId, tipo) => {
    const url = (mediaUrl[sessaoId] || "").trim();
    if (!url) return;
    saveGaleria(galeria.map((g) => (g.id === sessaoId ? { ...g, [tipo]: [...g[tipo], url] } : g)));
    setMediaUrl((m) => ({ ...m, [sessaoId]: "" }));
  };

  const sortedEventos = [...eventos].sort((a, b) => new Date(a.data) - new Date(b.data));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Vida em comunidade</Eyebrow>
      <SectionTitle>Eventos & Galeria</SectionTitle>

      <div className="flex gap-2 mt-6 mb-6">
        {["eventos", "galeria"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-md text-sm font-medium capitalize" style={{ background: tab === t ? C.gold : "transparent", color: tab === t ? "#fff" : C.ink, border: `1px solid ${C.gold}55` }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "eventos" && (
        <div>
          <div className={GRID3}>
            <a href="https://www.youtube.com/@avivardoespirito" target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden border block" style={{ borderColor: C.line }}>
              <img src={DIVULGACAO_BANNER} alt="Inscreva-se no canal Avivar do Espírito — conheça nossos e-books" className="w-full h-44 object-cover" />
              <div className="p-3">
                <p className="text-xs font-mono" style={{ color: C.stone }}>Canal Avivar</p>
                <p className="font-display font-semibold text-sm mt-0.5">Inscreva-se no YouTube</p>
              </div>
            </a>
            {sortedEventos.map((e) => (
              <button key={e.id} onClick={() => setSelected(e)} className="rounded-xl overflow-hidden border text-left focus:outline-none focus:ring-2" style={{ borderColor: C.line }}>
                <ImgOrPlaceholder url={e.imageUrl} alt={e.titulo} className="w-full h-44 object-cover" ph="Banner do evento — adicionar depois" />
                <div className="p-3">
                  <p className="font-display font-semibold text-sm">{e.titulo}</p>
                  <p className="text-xs font-mono mt-1 flex items-center gap-1" style={{ color: C.stone }}><Calendar size={11} />{fmtDate(e.data)} · {e.hora}</p>
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: C.stone }}><MapPin size={11} />{e.local}</p>
                </div>
              </button>
            ))}
          </div>
          {selected && (
            <div className="mt-6 rounded-xl border p-5" style={{ borderColor: C.line }}>
              <button onClick={() => setSelected(null)} className="text-xs underline mb-2" style={{ color: C.stone }}>fechar</button>
              <h3 className="font-display text-xl font-semibold">{selected.titulo}</h3>
              <div className="flex flex-wrap gap-4 text-xs font-mono mt-2" style={{ color: C.stone }}>
                <span className="flex items-center gap-1"><Calendar size={13} />{fmtDate(selected.data)}</span>
                <span className="flex items-center gap-1"><Clock size={13} />{selected.hora}</span>
                <span className="flex items-center gap-1"><MapPin size={13} />{selected.local}</span>
              </div>
              <p className="text-sm mt-3" style={{ color: C.ink }}>{selected.descricao}</p>
              {adminMode && (
                <div className="flex gap-4 mt-3">
                  <button onClick={() => { delEvento(selected.id); setSelected(null); }} className="text-xs underline" style={{ color: "#B03428" }}>excluir evento</button>
                  {setManchete && (
                    <button onClick={() => setManchete({ titulo: selected.titulo, link: "#eventos", ativo: true })} className="text-xs underline" style={{ color: C.violet }}>
                      usar como manchete da home
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {adminMode && (
            <div className="mt-6">
              <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · novo evento</p>
              <DynamicForm fields={EVENTO_FIELDS} onSubmit={addEvento} submitLabel="Publicar evento" />
            </div>
          )}
        </div>
      )}

      {tab === "galeria" && (
        <div className="space-y-8">
          {galeria.length === 0 && <Empty text="Nenhuma sessão de fotos ou vídeos publicada ainda." />}
          {galeria.map((g) => (
            <div key={g.id} className="rounded-xl border p-5" style={{ borderColor: C.line }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-semibold text-lg">{g.titulo}</h3>
                  <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDate(g.data)}</p>
                </div>
                {adminMode && (
                  <div className="flex items-center gap-3">
                    {setManchete && (
                      <button onClick={() => setManchete({ titulo: g.titulo, link: "#eventos", ativo: true })} className="text-xs underline" style={{ color: C.violet }}>
                        usar como manchete
                      </button>
                    )}
                    <button onClick={() => delSessao(g.id)}><Trash2 size={15} color={C.stone} /></button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-4">
                {g.fotos.map((f, idx) => (
                  <img key={idx} src={f} className="w-full h-44 object-contain rounded-md" style={{ background: C.parchmentDeep }} />
                ))}
                {g.videos.map((v, idx) => (
                  <div key={idx} className="aspect-video rounded-md overflow-hidden bg-black col-span-2">
                    <iframe title={`video-${idx}`} src={getEmbedUrl(v)} className="w-full h-full" allowFullScreen />
                  </div>
                ))}
                {g.fotos.length === 0 && g.videos.length === 0 && <Empty text="Sem mídia ainda" />}
              </div>
              {adminMode && (
                <div className="flex flex-wrap gap-2 mt-4 items-center">
                  <input placeholder="URL de foto ou vídeo" value={mediaUrl[g.id] || ""} onChange={(e) => setMediaUrl((m) => ({ ...m, [g.id]: e.target.value }))} className={`${inputCls} max-w-xs`} style={{ borderColor: C.line }} />
                  <Btn variant="ghost" onClick={() => addMedia(g.id, "fotos")}>+ foto</Btn>
                  <Btn variant="ghost" onClick={() => addMedia(g.id, "videos")}>+ vídeo</Btn>
                </div>
              )}
            </div>
          ))}
          {adminMode && (
            <div>
              <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · nova sessão</p>
              <DynamicForm fields={SESSAO_FIELDS} onSubmit={addSessao} submitLabel="Criar sessão" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Ao Vivo                                                             */
/* ---------------------------------------------------------------- */
const PASSADA_FIELDS = [
  { key: "titulo", label: "Título da transmissão" },
  { key: "data", label: "Data", type: "date" },
  { key: "videoUrl", label: "Link do vídeo (YouTube ou Vimeo)", type: "url" },
];

function AoVivo({ data, save, passadas, savePassadas, news, saveNews, adminMode }) {
  const [mainPassadaId, setMainPassadaId] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);

  const addPassada = (v) => savePassadas([...passadas, { id: uid(), ...v }]);
  const delPassada = (id) => savePassadas(passadas.filter((p) => p.id !== id));
  const sortedPassadas = [...passadas].sort((a, b) => new Date(b.data) - new Date(a.data));
  const mainPassada = sortedPassadas.find((p) => p.id === mainPassadaId) || sortedPassadas[0] || null;

  const addNews = (v) => saveNews([...news, { id: uid(), ...v, timestamp: nowISO() }]);
  const delNews = (id) => saveNews(news.filter((n) => n.id !== id));
  const sortedNews = [...news].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: data.isLive ? "#E14D3A" : C.stone, boxShadow: data.isLive ? "0 0 0 4px #E14D3A33" : "none" }} />
        <Eyebrow color={data.isLive ? "#E14D3A" : C.stone}>{data.isLive ? "AO VIVO AGORA" : "Sem transmissão no momento"}</Eyebrow>
      </div>
      <SectionTitle>Ao Vivo</SectionTitle>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 mt-6 items-start">
        {/* Player principal: transmissão atual, ou a última transmissão selecionada */}
        <div>
          {data.isLive && data.embedUrl ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe title="ao-vivo" src={getEmbedUrl(data.embedUrl)} className="w-full h-full" allowFullScreen />
            </div>
          ) : mainPassada ? (
            <div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe title={mainPassada.titulo} src={getEmbedUrl(mainPassada.videoUrl)} className="w-full h-full" allowFullScreen />
              </div>
              <p className="font-display font-semibold mt-3">{mainPassada.titulo}</p>
              <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDate(mainPassada.data)}</p>
            </div>
          ) : (
            <Empty text={data.mensagem} />
          )}

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            {data.instagramUrl && <a href={data.instagramUrl} target="_blank" rel="noreferrer" className="p-3 rounded-lg border text-sm text-center" style={{ borderColor: C.line }}>Instagram</a>}
            {data.xUrl && <a href={data.xUrl} target="_blank" rel="noreferrer" className="p-3 rounded-lg border text-sm text-center" style={{ borderColor: C.line }}>X</a>}
            {data.youtubeUrl && <a href={data.youtubeUrl} target="_blank" rel="noreferrer" className="p-3 rounded-lg border text-sm text-center" style={{ borderColor: C.line }}>YouTube</a>}
          </div>

          {adminMode && (
            <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
              <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · configurar transmissão</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" checked={data.isLive} onChange={(e) => save({ ...data, isLive: e.target.checked })} /> Estamos ao vivo agora
                </label>
                <Field label="URL de embed (YouTube/Vimeo)"><input className={inputCls} style={{ borderColor: C.line }} value={data.embedUrl} onChange={(e) => save({ ...data, embedUrl: e.target.value })} /></Field>
                <Field label="Mensagem quando offline"><input className={inputCls} style={{ borderColor: C.line }} value={data.mensagem} onChange={(e) => save({ ...data, mensagem: e.target.value })} /></Field>
                <Field label="Link Instagram"><input className={inputCls} style={{ borderColor: C.line }} value={data.instagramUrl} onChange={(e) => save({ ...data, instagramUrl: e.target.value })} /></Field>
                <Field label="Link X"><input className={inputCls} style={{ borderColor: C.line }} value={data.xUrl} onChange={(e) => save({ ...data, xUrl: e.target.value })} /></Field>
                <Field label="Link YouTube"><input className={inputCls} style={{ borderColor: C.line }} value={data.youtubeUrl} onChange={(e) => save({ ...data, youtubeUrl: e.target.value })} /></Field>
              </div>
            </div>
          )}

          {adminMode && (
            <div className="mt-6">
              <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · adicionar transmissão anterior</p>
              <DynamicForm fields={PASSADA_FIELDS} onSubmit={(v) => v.titulo && addPassada(v)} submitLabel="Adicionar transmissão" />
            </div>
          )}
        </div>

        {/* Coluna lateral: transmissões anteriores, estilo YouTube */}
        <div>
          <Eyebrow>Já se passou</Eyebrow>
          <h3 className="font-display text-lg font-semibold mb-3" style={{ color: C.ink }}>Transmissões Anteriores</h3>
          {sortedPassadas.length === 0 && <Empty text="Nenhuma transmissão anterior cadastrada ainda." />}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {sortedPassadas.map((p) => (
              <div key={p.id} className="flex gap-2 items-start p-1.5 rounded-lg" style={{ background: mainPassada?.id === p.id ? C.parchment : "transparent" }}>
                <button onClick={() => setMainPassadaId(p.id)} className="flex gap-2 flex-1 text-left focus:outline-none focus:ring-2 rounded-md">
                  <div className="w-28 aspect-video rounded-md overflow-hidden shrink-0 flex items-center justify-center" style={{ background: C.black }}>
                    <Video size={18} color={C.gold} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-2">{p.titulo}</p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: C.stone }}>{fmtDate(p.data)}</p>
                  </div>
                </button>
                {adminMode && <button onClick={() => delPassada(p.id)} className="shrink-0 mt-1"><Trash2 size={12} color={C.stone} /></button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Avivar News */}
      <div className="mt-14 pt-8 border-t" style={{ borderColor: C.line }}>
        <Eyebrow>Reportagens do ministério</Eyebrow>
        <h3 className="font-display text-2xl font-semibold" style={{ color: C.ink }}>Avivar News</h3>
        {sortedNews.length === 0 && <div className="mt-4"><Empty text="Nenhuma reportagem publicada ainda." /></div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {sortedNews.map((n) => (
            <button key={n.id} onClick={() => setSelectedNews(n)} className="text-left rounded-xl border overflow-hidden focus:outline-none focus:ring-2" style={{ borderColor: C.line }}>
              {n.imageUrl && <ImgOrPlaceholder url={n.imageUrl} alt={n.titulo} className="w-full h-36 object-cover" />}
              <div className="p-4">
                <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDateTime(n.timestamp)}</p>
                <p className="font-display font-semibold text-sm mt-1">{n.titulo}</p>
                {n.texto && <p className="text-xs mt-2" style={{ color: C.stone }}>{n.texto.slice(0, 90)}{n.texto.length > 90 ? "…" : ""}</p>}
              </div>
            </button>
          ))}
        </div>
        {selectedNews && (
          <div className="mt-6 rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
            {selectedNews.imageUrl && <ImgOrPlaceholder url={selectedNews.imageUrl} alt={selectedNews.titulo} className="w-full h-48 object-cover" />}
            <div className="p-5">
              <button onClick={() => setSelectedNews(null)} className="text-xs underline mb-2" style={{ color: C.stone }}>fechar</button>
              <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDateTime(selectedNews.timestamp)}</p>
              <h4 className="font-display font-semibold text-lg mt-1">{selectedNews.titulo}</h4>
              {selectedNews.videoUrl && (
                <div className="aspect-video rounded-md overflow-hidden bg-black mt-3">
                  <iframe title={selectedNews.titulo} src={getEmbedUrl(selectedNews.videoUrl)} className="w-full h-full" allowFullScreen />
                </div>
              )}
              {selectedNews.texto && <p className="text-sm mt-3 whitespace-pre-line" style={{ color: C.ink }}>{selectedNews.texto}</p>}
              {adminMode && <button onClick={() => { delNews(selectedNews.id); setSelectedNews(null); }} className="text-xs underline mt-3" style={{ color: "#B03428" }}>excluir</button>}
            </div>
          </div>
        )}
        {adminMode && (
          <div className="mt-8">
            <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · nova reportagem</p>
            <DynamicForm fields={AVIVARNEWS_FIELDS} onSubmit={(v) => v.titulo && addNews(v)} submitLabel="Publicar reportagem" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Loja Avivar                                                          */
/* ---------------------------------------------------------------- */
const LOJA_FIELDS = [
  { key: "nome", label: "Nome do produto" },
  { key: "categoria", label: "Categoria (Livros, Roupas, Utensílios...)" },
  { key: "preco", label: "Preço (ex: R$ 49,90)" },
  { key: "descricao", label: "Sinopse / descrição do produto", type: "textarea" },
  { key: "imageUrl", label: "URL da imagem", type: "url" },
  { key: "linkCompra", label: "Link de compra — PIX/Mercado Pago", type: "url" },
  { key: "linkCartao", label: "Link de compra — Cartão de crédito", type: "url" },
];

function Loja({ items, save, adminMode }) {
  const add = (v) => save([...items, { id: uid(), ...v }]);
  const del = (id) => save(items.filter((i) => i.id !== id));
  return (
    <div>
      {/* Frase de incentivo + versículo no lugar da antiga imagem-colagem de livros */}
      <div className="w-full py-10 px-4 text-center" style={{ background: C.violetDeep }}>
        <BookOpen size={26} color={C.goldBright} className="mx-auto" />
        <p className="font-script text-2xl sm:text-3xl mt-3" style={{ color: C.goldBright }}>
          "Busca a sabedoria, pois ela vale mais que qualquer tesouro."
        </p>
        <p className="text-xs font-mono mt-2 tracking-wide" style={{ color: "#ffffffaa" }}>Provérbios 4:7</p>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Eyebrow><ShoppingBag size={12} className="inline mr-1" />Livros, roupas e utensílios cristãos</Eyebrow>
        <SectionTitle>Loja Avivar</SectionTitle>
        {items.length === 0 && <div className="mt-6"><Empty text="Nenhum produto cadastrado ainda." /></div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {items.map((p) => (
            <div key={p.id} className="rounded-xl border overflow-hidden max-w-[240px] w-full mx-auto" style={{ borderColor: C.line, background: C.parchment }}>
              <ImgOrPlaceholder url={p.imageUrl} alt={p.nome} className="w-full h-32 object-contain" />
              <div className="p-4">
                {p.categoria && <p className="text-xs font-mono" style={{ color: C.stone }}>{p.categoria}</p>}
                <h3 className="font-display font-semibold mt-1">{p.nome}</h3>
                {p.descricao && <p className="text-xs mt-1" style={{ color: C.stone }}>{p.descricao}</p>}
                <p className="font-display font-bold mt-2" style={{ color: C.ember }}>{p.preco}</p>
                <div className="flex flex-col gap-1.5 mt-2">
                  {p.linkCompra && (
                    <a href={p.linkCompra} target="_blank" rel="noreferrer">
                      <Btn className="w-full justify-center"><ShoppingBag size={13} /> PIX / Mercado Pago</Btn>
                    </a>
                  )}
                  {p.linkCartao && (
                    <a href={p.linkCartao} target="_blank" rel="noreferrer">
                      <Btn variant="ghost" className="w-full justify-center"><CreditCard size={13} /> Pagar com cartão</Btn>
                    </a>
                  )}
                </div>
                {adminMode && <button onClick={() => del(p.id)} className="text-xs underline mt-2" style={{ color: "#B03428" }}>excluir</button>}
              </div>
            </div>
          ))}
        </div>
        {adminMode && (
          <div className="mt-8">
            <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · novo produto</p>
            <DynamicForm fields={LOJA_FIELDS} onSubmit={(v) => v.nome && add(v)} submitLabel="Publicar produto" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Biblioteca Avivar — pública, aberta a qualquer visitante                */
/* ---------------------------------------------------------------- */
const BIBLIOTECA_FIELDS = [
  { key: "titulo", label: "Título do livro" },
  { key: "autor", label: "Autor (opcional)" },
  { key: "capaUrl", label: "URL da capa", type: "url" },
  { key: "sinopse", label: "Sinopse breve", type: "textarea" },
  { key: "pdfUrl", label: "URL do PDF (ex: /biblioteca/nome-do-livro.pdf)", type: "url" },
];

function BibliotecaAvivar({ items, save, adminMode, setPage }) {
  const [selected, setSelected] = useState(null);
  const add = (v) => v.titulo && save([...(items || []), { id: uid(), ...v }]);
  const del = (id) => save((items || []).filter((i) => i.id !== id));
  const sorted = [...(items || [])].sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR"));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><Library size={12} className="inline mr-1" />Leitura livre para todos</Eyebrow>
      <SectionTitle>Biblioteca Avivar</SectionTitle>
      <p className="text-sm mt-2" style={{ color: C.stone }}>
        Livros abertos ao público em geral. Os títulos exclusivos de Códigos Avivar ficam só na área de acesso por senha.
      </p>

      {sorted.length === 0 && <div className="mt-6"><Empty text="Nenhum livro cadastrado ainda." /></div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {sorted.map((b) => (
          <div key={b.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.line, background: C.parchment }}>
            <button onClick={() => setSelected(b)} className="block w-full text-left focus:outline-none focus:ring-2">
              <div className="relative">
                <ImgOrPlaceholder url={b.capaUrl} alt={b.titulo} className="w-full h-48 object-cover" ph={b.titulo} />
                {b.linkLoja && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full text-white" style={{ background: C.emberDeep }}>à venda</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-display font-semibold text-sm leading-snug">{b.titulo}</p>
                {b.autor && <p className="text-xs mt-0.5" style={{ color: C.stone }}>{b.autor}</p>}
              </div>
            </button>
            {adminMode && (
              <button onClick={() => del(b.id)} className="text-xs underline block px-3 pb-3" style={{ color: "#B03428" }}>
                excluir
              </button>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-6 rounded-xl border p-5 grid sm:grid-cols-[160px_1fr] gap-5" style={{ borderColor: C.line }}>
          <ImgOrPlaceholder url={selected.capaUrl} alt={selected.titulo} className="w-full h-56 sm:h-full object-cover rounded-lg" ph={selected.titulo} />
          <div>
            <button onClick={() => setSelected(null)} className="text-xs underline mb-2" style={{ color: C.stone }}>fechar</button>
            <h3 className="font-display text-xl font-semibold">{selected.titulo}</h3>
            {selected.autor && <p className="text-xs font-mono mt-1" style={{ color: C.ember }}>{selected.autor}</p>}
            {selected.sinopse && <p className="text-sm mt-3 whitespace-pre-line" style={{ color: C.ink }}>{selected.sinopse}</p>}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {selected.linkLoja ? (
                <button onClick={() => setPage && setPage("loja")}>
                  <Btn><ShoppingBag size={14} /> Ver na Loja Avivar</Btn>
                </button>
              ) : selected.pdfUrl ? (
                <a href={selected.pdfUrl} target="_blank" rel="noreferrer">
                  <Btn><FileText size={14} /> Abrir PDF</Btn>
                </a>
              ) : (
                <p className="text-xs italic" style={{ color: C.stone }}>PDF ainda não cadastrado para este livro.</p>
              )}
              {adminMode && (
                <button onClick={() => { del(selected.id); setSelected(null); }} className="text-xs underline" style={{ color: "#B03428" }}>
                  excluir livro
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {adminMode && (
        <div className="mt-8">
          <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · novo livro</p>
          <DynamicForm fields={BIBLIOTECA_FIELDS} onSubmit={add} submitLabel="Cadastrar livro" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Doações                                                              */
/* ---------------------------------------------------------------- */
function PixCard({ icon: Icon, titulo, desc, pixKey, mercadoPagoUrl, nomeRecebedor, cidade }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    if (!pixKey) return;
    navigator.clipboard?.writeText(pixKey).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };
  const payload = pixKey ? montarPixPayload({ chave: pixKey, nomeRecebedor, cidade, txid: "AVIVAR" }) : "";
  return (
    <div className="p-5 rounded-xl border" style={{ borderColor: C.line }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={18} color={C.ember} />
        <p className="font-display font-semibold">{titulo}</p>
      </div>
      <p className="text-xs mb-3" style={{ color: C.stone }}>{desc}</p>
      <p className="text-xs font-mono uppercase" style={{ color: C.stone }}>Chave PIX</p>
      <p className="text-sm font-mono break-all mt-0.5" style={{ color: C.ink }}>{pixKey || "Chave PIX ainda não cadastrada"}</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {pixKey && (
          <Btn variant="ghost" onClick={copiar}>
            <Copy size={13} /> {copiado ? "Copiado!" : "Copiar chave"}
          </Btn>
        )}
        {mercadoPagoUrl && (
          <a href={mercadoPagoUrl} target="_blank" rel="noreferrer">
            <Btn>Pagar pelo Mercado Pago</Btn>
          </a>
        )}
      </div>
      {/* Integração real de checkout (cartão) via Mercado Pago entraria aqui — exige
          credenciais/API key da conta Mercado Pago do usuário, ainda não fornecidas. */}
      {payload && (
        <div className="mt-4 pt-4 border-t flex items-center gap-3 flex-wrap" style={{ borderColor: C.line }}>
          <div className="bg-white p-2 rounded-lg border" style={{ borderColor: C.line }}>
            <QRCodeSVG value={payload} size={128} bgColor="#ffffff" fgColor="#0B0B0C" />
          </div>
          <p className="text-xs max-w-[160px]" style={{ color: C.stone }}>Aponte a câmera do banco pra esse QR Code Pix e doe direto pelo celular, sem sair daqui.</p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ texto, save, adminMode }) {
  const [draft, setDraft] = useState(texto || "");
  useEffect(() => setDraft(texto || ""), [texto]);
  return (
    <div className="p-5 rounded-xl border" style={{ borderColor: C.line }}>
      <div className="flex items-center gap-2 mb-1">
        <FileText size={18} color={C.ember} />
        <p className="font-display font-semibold">Informações</p>
      </div>
      {adminMode ? (
        <div className="mt-2 space-y-2">
          <textarea rows={5} className={inputCls} style={{ borderColor: C.line }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Recados/instruções para quem for doar (editável pelo admin)..." />
          <Btn variant="ghost" onClick={() => save(draft)}>Salvar informações</Btn>
        </div>
      ) : (
        <p className="text-sm mt-2 whitespace-pre-line" style={{ color: C.stone }}>{texto || "Em breve mais informações sobre dízimos e ofertas."}</p>
      )}
    </div>
  );
}

function Doacoes({ data, save, adminMode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><HandHeart size={12} className="inline mr-1" />Semeando com generosidade</Eyebrow>
      <SectionTitle>Dízimos e Ofertas</SectionTitle>
      <p className="text-sm mt-2" style={{ color: C.stone }}>Sua contribuição sustenta a obra do Ministério Avivar do Espírito.</p>

      <div className="mt-6 grid sm:grid-cols-2 gap-5 items-start">
        <PixCard
          icon={HandHeart}
          titulo="Dízimo e Oferta"
          desc="A décima parte, como ato de fidelidade, e a contribuição voluntária além dela."
          pixKey={data.pixKey}
          mercadoPagoUrl={data.mercadoPagoUrl}
          nomeRecebedor={data.nomeRecebedor}
          cidade={data.cidade}
        />
        <InfoCard texto={data.infoTexto} save={(v) => save({ ...data, infoTexto: v })} adminMode={adminMode} />
      </div>

      {adminMode && (
        <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
          <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · configurar doações (mesma chave usada pra Dízimo e Oferta)</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Chave PIX"><input className={inputCls} style={{ borderColor: C.line }} value={data.pixKey} onChange={(e) => save({ ...data, pixKey: e.target.value })} /></Field>
            <Field label="Nome do recebedor (aparece no QR)"><input className={inputCls} style={{ borderColor: C.line }} value={data.nomeRecebedor || ""} onChange={(e) => save({ ...data, nomeRecebedor: e.target.value })} /></Field>
            <Field label="Cidade do recebedor (aparece no QR)"><input className={inputCls} style={{ borderColor: C.line }} value={data.cidade || ""} onChange={(e) => save({ ...data, cidade: e.target.value })} /></Field>
            <Field label="Link Mercado Pago (opcional — pagamento por cartão)"><input className={inputCls} style={{ borderColor: C.line }} value={data.mercadoPagoUrl} onChange={(e) => save({ ...data, mercadoPagoUrl: e.target.value })} /></Field>
          </div>
          <p className="text-[11px] mt-2 italic" style={{ color: C.stone }}>
            Checkout de cartão de crédito de verdade (Mercado Pago) depende das credenciais da conta Mercado Pago do usuário — por enquanto, esse campo só guarda um link opcional.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Caixa (financeiro) — área restrita ao admin                          */
/* ---------------------------------------------------------------- */
const CAIXA_FIELDS = [
  { key: "tipo", label: "Tipo", type: "select", options: ["Entrada", "Saída"] },
  { key: "categoria", label: "Categoria", type: "select", options: ["Dízimo", "Oferta", "Água", "Luz", "Internet", "Manutenção", "Bens", "Outro"] },
  { key: "descricao", label: "Descrição" },
  { key: "valor", label: "Valor (R$)", type: "number" },
  { key: "data", label: "Data", type: "date" },
];

function Caixa({ items, save, adminMode }) {
  const add = (v) => save([...items, { id: uid(), ...v }]);
  const del = (id) => save(items.filter((i) => i.id !== id));
  const sorted = [...items].sort((a, b) => new Date(b.data) - new Date(a.data));
  const totalEntradas = items.filter((i) => i.tipo === "Entrada").reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
  const totalSaidas = items.filter((i) => i.tipo === "Saída").reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);
  const saldo = totalEntradas - totalSaidas;
  const fmtR = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const gerarPDF = () => {
    const rows = sorted
      .map((i) => `<tr><td>${fmtDate(i.data)}</td><td>${i.tipo}</td><td>${i.categoria}</td><td>${i.descricao || ""}</td><td>${fmtR(parseFloat(i.valor) || 0)}</td></tr>`)
      .join("");
    printReport(
      "Relatório de Caixa",
      `<table><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>${rows}</tbody></table>
       <div class="totais">
         <p><strong>Total de entradas:</strong> ${fmtR(totalEntradas)}</p>
         <p><strong>Total de saídas:</strong> ${fmtR(totalSaidas)}</p>
         <p><strong>Saldo:</strong> ${fmtR(saldo)}</p>
       </div>`
    );
  };

  if (!adminMode) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock size={28} className="mx-auto" color={C.stone} />
        <p className="text-sm mt-3" style={{ color: C.stone }}>Área restrita — acesso administrativo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Área administrativa</Eyebrow>
      <SectionTitle>Caixa</SectionTitle>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-lg border" style={{ borderColor: C.line, background: "#2E7D4F11" }}>
          <p className="text-xs font-mono" style={{ color: C.stone }}>Entradas</p>
          <p className="font-display font-bold text-lg" style={{ color: "#2E7D4F" }}>{fmtR(totalEntradas)}</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: C.line, background: "#B0342811" }}>
          <p className="text-xs font-mono" style={{ color: C.stone }}>Saídas</p>
          <p className="font-display font-bold text-lg" style={{ color: "#B03428" }}>{fmtR(totalSaidas)}</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: C.line, background: C.parchment }}>
          <p className="text-xs font-mono" style={{ color: C.stone }}>Saldo</p>
          <p className="font-display font-bold text-lg" style={{ color: C.ink }}>{fmtR(saldo)}</p>
        </div>
      </div>

      <Btn className="mt-4" onClick={gerarPDF}>Baixar / imprimir relatório (PDF)</Btn>

      <div className="mt-6 space-y-2">
        {sorted.length === 0 && <Empty text="Nenhum lançamento ainda." />}
        {sorted.map((i) => (
          <div key={i.id} className="flex items-center justify-between p-3 rounded-lg border text-sm" style={{ borderColor: C.line }}>
            <div>
              <p className="font-medium">{i.categoria} {i.descricao && `· ${i.descricao}`}</p>
              <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDate(i.data)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display font-semibold" style={{ color: i.tipo === "Entrada" ? "#2E7D4F" : "#B03428" }}>{i.tipo === "Saída" ? "-" : "+"}{fmtR(parseFloat(i.valor) || 0)}</span>
              <button onClick={() => del(i.id)}><Trash2 size={14} color={C.stone} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>Novo lançamento</p>
        <DynamicForm fields={CAIXA_FIELDS} onSubmit={(v) => v.tipo && v.categoria && add(v)} submitLabel="Lançar" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Bens (patrimônio) — área restrita ao admin                           */
/* ---------------------------------------------------------------- */
const BENS_FIELDS = [
  { key: "nome", label: "Nome do bem" },
  { key: "categoria", label: "Categoria" },
  { key: "valor", label: "Valor estimado (R$)", type: "number" },
  { key: "dataAquisicao", label: "Data de aquisição", type: "date" },
  { key: "observacao", label: "Observação", type: "textarea" },
];

function Bens({ items, save, adminMode }) {
  const add = (v) => save([...items, { id: uid(), ...v }]);
  const del = (id) => save(items.filter((i) => i.id !== id));
  const fmtR = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const totalValor = items.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);

  const gerarPDF = () => {
    const rows = items
      .map((i) => `<tr><td>${i.nome}</td><td>${i.categoria || ""}</td><td>${fmtDate(i.dataAquisicao)}</td><td>${fmtR(parseFloat(i.valor) || 0)}</td><td>${i.observacao || ""}</td></tr>`)
      .join("");
    printReport(
      "Relatório de Bens",
      `<table><thead><tr><th>Bem</th><th>Categoria</th><th>Aquisição</th><th>Valor</th><th>Observação</th></tr></thead><tbody>${rows}</tbody></table>
       <div class="totais"><p><strong>Valor total do patrimônio:</strong> ${fmtR(totalValor)}</p></div>`
    );
  };

  if (!adminMode) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock size={28} className="mx-auto" color={C.stone} />
        <p className="text-sm mt-3" style={{ color: C.stone }}>Área restrita — acesso administrativo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Área administrativa</Eyebrow>
      <SectionTitle>Bens</SectionTitle>
      <p className="text-sm mt-2" style={{ color: C.stone }}>Valor total do patrimônio: <strong>{fmtR(totalValor)}</strong></p>

      <Btn className="mt-4" onClick={gerarPDF}>Baixar / imprimir relatório (PDF)</Btn>

      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        {items.length === 0 && <Empty text="Nenhum bem cadastrado ainda." />}
        {items.map((i) => (
          <div key={i.id} className="p-4 rounded-lg border" style={{ borderColor: C.line }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-display font-semibold">{i.nome}</p>
                <p className="text-xs" style={{ color: C.stone }}>{i.categoria} {i.dataAquisicao && `· ${fmtDate(i.dataAquisicao)}`}</p>
              </div>
              <button onClick={() => del(i.id)}><Trash2 size={14} color={C.stone} /></button>
            </div>
            <p className="text-sm mt-1 font-mono">{fmtR(parseFloat(i.valor) || 0)}</p>
            {i.observacao && <p className="text-xs mt-1" style={{ color: C.stone }}>{i.observacao}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>Novo bem</p>
        <DynamicForm fields={BENS_FIELDS} onSubmit={(v) => v.nome && add(v)} submitLabel="Cadastrar" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Igrejas                                                             */
/* ---------------------------------------------------------------- */
const IGREJA_FIELDS = [
  { key: "nome", label: "Nome da unidade" },
  { key: "cidade", label: "Cidade" },
  { key: "endereco", label: "Endereço" },
  { key: "pastor", label: "Pastor(a) responsável" },
  { key: "telefone", label: "Contato", type: "tel" },
  { key: "fotoUrl", label: "URL de foto", type: "url" },
];

function IgrejaCard({ igreja, save, all, adminMode }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [descricao, setDescricao] = useState(igreja.descricao || "");

  const update = (patch) => save(all.map((i) => (i.id === igreja.id ? { ...i, ...patch } : i)));
  const regenCode = () => update({ adminCode: "UNI-" + Math.random().toString(36).slice(2, 7).toUpperCase(), adminCodeActive: true });
  const toggleActive = () => update({ adminCodeActive: !igreja.adminCodeActive });
  const del = () => save(all.filter((i) => i.id !== igreja.id));

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
      <ImgOrPlaceholder url={igreja.fotoUrl} alt={igreja.nome} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg">{igreja.nome}</h3>
        <p className="text-xs font-mono mt-1" style={{ color: C.stone }}>{igreja.cidade}</p>
        <p className="text-sm mt-2" style={{ color: C.ink }}>{igreja.endereco}</p>
        <p className="text-sm" style={{ color: C.ink }}>Pastor(a): {igreja.pastor}</p>
        {igreja.telefone && (
          <a href={waLink(igreja.telefone, `Olá! Vim através do site do Ministério Avivar do Espírito.`)} target="_blank" rel="noreferrer" className="text-xs mt-2 inline-flex items-center gap-1" style={{ color: C.ember }}>
            <Phone size={12} /> {igreja.telefone}
          </a>
        )}
        {descricao && <p className="text-sm mt-2" style={{ color: C.stone }}>{descricao}</p>}

        {!unlocked ? (
          <button onClick={() => setGateOpen((v) => !v)} className="text-xs underline mt-3" style={{ color: C.violet }}>Acesso da unidade</button>
        ) : (
          <span className="text-xs mt-3 inline-block" style={{ color: "#2E7D4F" }}>Editando como admin da unidade</span>
        )}
        {gateOpen && !unlocked && (
          <div className="flex gap-2 mt-2">
            <input placeholder="Código da unidade" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} className={`${inputCls} text-xs`} style={{ borderColor: C.line }} />
            <Btn
              variant="ghost"
              color={C.violet}
              onClick={() => {
                if (igreja.adminCodeActive && codeInput.trim().toUpperCase() === igreja.adminCode) setUnlocked(true);
              }}
            >
              Entrar
            </Btn>
          </div>
        )}
        {unlocked && (
          <div className="mt-3 space-y-2">
            <textarea rows={2} placeholder="Descrição da unidade" value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputCls} style={{ borderColor: C.line }} />
            <Btn onClick={() => update({ descricao })}>Salvar</Btn>
          </div>
        )}

        {adminMode && (
          <div className="mt-4 pt-3 border-t space-y-1" style={{ borderColor: C.line }}>
            <p className="text-xs font-mono" style={{ color: C.stone }}>Código da unidade: <span style={{ color: C.ink }}>{igreja.adminCode}</span> · {igreja.adminCodeActive ? "ativo" : "revogado"}</p>
            <div className="flex gap-3 text-xs">
              <button onClick={toggleActive} className="underline" style={{ color: C.violet }}>{igreja.adminCodeActive ? "revogar" : "reativar"}</button>
              <button onClick={regenCode} className="underline" style={{ color: C.ember }}>resetar código</button>
              <button onClick={del} className="underline" style={{ color: "#B03428" }}>excluir</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Igrejas({ igrejas, save, adminMode }) {
  const addIgreja = (v) => save([...igrejas, { id: uid(), adminCode: "UNI-" + Math.random().toString(36).slice(2, 7).toUpperCase(), adminCodeActive: true, ...v }]);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Uma família, várias casas</Eyebrow>
      <SectionTitle>Unidades do Ministério</SectionTitle>
      {igrejas.length === 0 && <div className="mt-6"><Empty text="Nenhuma unidade cadastrada ainda." /></div>}
      <div className={`${GRID3} mt-6`}>
        {igrejas.map((i) => (
          <IgrejaCard key={i.id} igreja={i} save={save} all={igrejas} adminMode={adminMode} />
        ))}
      </div>
      {adminMode && (
        <div className="mt-8">
          <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · nova unidade</p>
          <DynamicForm fields={IGREJA_FIELDS} onSubmit={addIgreja} submitLabel="Cadastrar unidade" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Colaboradores                                                       */
/* ---------------------------------------------------------------- */
const COLAB_FIELDS = [
  { key: "nome", label: "Nome completo" },
  { key: "cargo", label: "Cargo eclesiástico (Pastor, Diácono, Obreiro...)" },
  { key: "ministerio", label: "Liderança / ministério" },
  { key: "atribuicao", label: "Atribuição", type: "textarea" },
  { key: "telefone", label: "Telefone (opcional)", type: "tel" },
  { key: "fotoUrl", label: "URL da foto", type: "url" },
];

function Colaboradores({ items, save, adminMode }) {
  const add = (v) => save([...items, { id: uid(), ...v }]);
  const del = (id) => save(items.filter((i) => i.id !== id));
  const sorted = [...items].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Quem serve conosco</Eyebrow>
      <SectionTitle>Colaboradores</SectionTitle>
      {items.length === 0 && <div className="mt-6"><Empty text="Nenhum colaborador cadastrado ainda." /></div>}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
        {sorted.map((c) => (
          <div key={c.id} className="rounded-lg border overflow-hidden" style={{ borderColor: C.line, background: C.parchment }}>
            <ImgOrPlaceholder url={c.fotoUrl} alt={c.nome} className="w-full h-28 object-cover" ph={c.nome} />
            <div className="p-2" style={{ background: C.parchment }}>
              <p className="font-display font-semibold text-xs leading-snug">{c.nome}</p>
              <p className="text-[10px]" style={{ color: C.ember }}>{c.cargo}</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.stone }}>{c.ministerio}</p>
              {c.telefone && <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: C.stone }}><Phone size={10} />{c.telefone}</p>}
              {adminMode && <button onClick={() => del(c.id)} className="text-[10px] underline mt-1" style={{ color: "#B03428" }}>excluir</button>}
            </div>
          </div>
        ))}
      </div>
      {adminMode && (
        <div className="mt-8">
          <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · novo colaborador</p>
          <DynamicForm fields={COLAB_FIELDS} onSubmit={add} submitLabel="Cadastrar" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Escala de Obreiros                                                   */
/* ---------------------------------------------------------------- */
const DIAS_SEMANA_PT = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const OBREIROS_PADRAO = [
  "Diácono Gilvan", "Diácono Ítalo", "Diácono Vitor Silva", "Diaconisa Michelle Veras", "Diaconisa Michelle Brilhante",
  "Pra. Gláucia", "Pra. Isabele", "Pra. Wládia", "Pr. Marcos", "Ir. Elias", "Lucas", "Ir. José", "Ir. Vitória Castro",
  "Ir. Vitória Dimas", "Ir. Livia", "Ir. Bárbara", "Ir. Renato", "Ir. Kauan", "Ir. Brena", "Ir. Samuel", "Ir. Odeuzina", "Ir. Nilcéia",
];
const POSTOS_PADRAO = ["Recepção", "Ofertas", "Slides", "Mídia", "Abertura e Semeadura", "Pregação", "Anjos de Luz", "Louvor", "Kids"];
const HORARIOS_PADRAO = [
  { dia: "Quarta-feira", inicio: "19:20", fim: "21:00" },
  { dia: "Sexta-feira", inicio: "19:20", fim: "21:00" },
  { dia: "Domingo", inicio: "18:30", fim: "20:00" },
];
const DEFAULT_ESCALA_OBREIROS = { obreiros: OBREIROS_PADRAO, postos: POSTOS_PADRAO, horarios: HORARIOS_PADRAO, escalasPorDia: {} };

function diaSemanaFromData(dataStr) {
  if (!dataStr) return "";
  const d = new Date(dataStr + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  return DIAS_SEMANA_PT[d.getDay()];
}
function horarioDoDia(dia, horarios) {
  return (horarios || []).find((h) => h.dia === dia) || null;
}
function fmtHorario(h) {
  return h ? `${h.dia} · ${h.inicio}–${h.fim}` : "Horário não cadastrado para este dia";
}
function fmtHM(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Escala de Obreiros — fluxo por posto: cada posto tem uma caixa de obreiros
// disponíveis; ao clicar, o obreiro "sai" da caixa e passa a aparecer escalado
// naquele posto. Só depois de escalado surgem os botões Disponível/Indisponível,
// com horário da confirmação e a opção de "Mudei de ideia" (com motivo).
function EscalaObreiros({ data, save, adminMode, operatorMode, onRequestOperator }) {
  const canManage = adminMode || operatorMode;
  const safeData = { ...DEFAULT_ESCALA_OBREIROS, ...(data || {}), escalasPorDia: (data && data.escalasPorDia) || {} };
  const [dataCulto, setDataCulto] = useState(() => new Date().toISOString().slice(0, 10));
  const [novoObreiro, setNovoObreiro] = useState("");
  const [novoPosto, setNovoPosto] = useState("");
  const [novoHorario, setNovoHorario] = useState({ dia: DIAS_SEMANA_PT[0], inicio: "19:00", fim: "21:00" });
  const [renomeando, setRenomeando] = useState(null); // { tipo: "obreiro"|"posto", original, valor }
  const [mudandoIdeiaId, setMudandoIdeiaId] = useState(null);
  const [motivoDraft, setMotivoDraft] = useState("");
  const [nomeConferente, setNomeConferente] = useState("");

  const diaSemana = diaSemanaFromData(dataCulto);
  const horarioAtual = horarioDoDia(diaSemana, safeData.horarios);

  const diaAtual = safeData.escalasPorDia[dataCulto] || { escalados: [], conferidoPor: null, conferidoEm: null };
  const escalados = diaAtual.escalados || [];
  const fechado = !!diaAtual.conferidoEm;
  const podeMexerNoDia = canManage; // admin/operador sempre podem mexer, mesmo fechado
  const disponiveis = safeData.obreiros.filter((o) => !escalados.some((e) => e.obreiroNome === o));

  const salvarDia = (patchDia) => {
    save({
      ...safeData,
      escalasPorDia: { ...safeData.escalasPorDia, [dataCulto]: { ...diaAtual, ...patchDia } },
    });
  };

  const escalarObreiro = (nome, posto) => {
    if (fechado && !adminMode) return;
    const novo = { id: uid(), obreiroNome: nome, posto, status: "aguardando", horarioConfirmacao: null, motivoMudanca: "" };
    salvarDia({ escalados: [...escalados, novo] });
  };
  const removerEscalado = (id) => salvarDia({ escalados: escalados.filter((e) => e.id !== id) });
  const marcarStatus = (id, status) => {
    salvarDia({
      escalados: escalados.map((e) => (e.id === id ? { ...e, status, horarioConfirmacao: nowISO() } : e)),
    });
  };
  const confirmarMudancaDeIdeia = (id) => {
    const atual = escalados.find((e) => e.id === id);
    if (!atual) return;
    const novoStatus = atual.status === "disponivel" ? "indisponivel" : "disponivel";
    salvarDia({
      escalados: escalados.map((e) =>
        e.id === id ? { ...e, status: novoStatus, horarioConfirmacao: nowISO(), motivoMudanca: motivoDraft.trim() } : e
      ),
    });
    setMudandoIdeiaId(null);
    setMotivoDraft("");
  };
  const conferirDia = () => {
    if (!nomeConferente.trim()) return;
    salvarDia({ conferidoPor: nomeConferente.trim(), conferidoEm: nowISO() });
  };
  const reabrirDia = () => salvarDia({ conferidoPor: null, conferidoEm: null });

  const addObreiro = () => {
    if (!novoObreiro.trim()) return;
    save({ ...safeData, obreiros: [...safeData.obreiros, novoObreiro.trim()] });
    setNovoObreiro("");
  };
  const delObreiro = (nome) => save({ ...safeData, obreiros: safeData.obreiros.filter((o) => o !== nome) });
  const renomearObreiro = (original, novoNome) => {
    if (!novoNome.trim()) return;
    save({ ...safeData, obreiros: safeData.obreiros.map((o) => (o === original ? novoNome.trim() : o)) });
    setRenomeando(null);
  };
  const addPosto = () => {
    if (!novoPosto.trim()) return;
    save({ ...safeData, postos: [...safeData.postos, novoPosto.trim()] });
    setNovoPosto("");
  };
  const delPosto = (nome) => save({ ...safeData, postos: safeData.postos.filter((p) => p !== nome) });
  const renomearPosto = (original, novoNome) => {
    if (!novoNome.trim()) return;
    save({ ...safeData, postos: safeData.postos.map((p) => (p === original ? novoNome.trim() : p)) });
    setRenomeando(null);
  };
  const addHorario = () => save({ ...safeData, horarios: [...safeData.horarios, novoHorario] });
  const delHorario = (idx) => save({ ...safeData, horarios: safeData.horarios.filter((_, i) => i !== idx) });

  const StatusObreiro = ({ e }) => {
    const podeEditar = podeMexerNoDia && (!fechado || adminMode);
    if (e.status === "aguardando") {
      if (!podeEditar) return <span className="text-xs italic" style={{ color: C.stone }}>aguardando confirmação</span>;
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <Btn color="#2E7D4F" onClick={() => marcarStatus(e.id, "disponivel")}>Disponível</Btn>
          <Btn variant="ghost" color={C.liveRed} onClick={() => marcarStatus(e.id, "indisponivel")}>Indisponível</Btn>
        </div>
      );
    }
    const isDisp = e.status === "disponivel";
    return (
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="font-semibold" style={{ color: isDisp ? "#2E7D4F" : C.liveRed }}>
          {isDisp ? "Disponível" : "Indisponível"}
        </span>
        {e.horarioConfirmacao && <span style={{ color: C.stone }}>· {fmtHM(e.horarioConfirmacao)}</span>}
        {podeEditar && (
          mudandoIdeiaId === e.id ? (
            <span className="flex items-center gap-1 mt-1 basis-full">
              <input
                autoFocus
                placeholder="Motivo (curto)"
                value={motivoDraft}
                onChange={(ev) => setMotivoDraft(ev.target.value)}
                className="text-xs rounded-md border px-2 py-1"
                style={{ borderColor: C.line }}
              />
              <button onClick={() => confirmarMudancaDeIdeia(e.id)} className="underline" style={{ color: C.violet }}>enviar</button>
              <button onClick={() => { setMudandoIdeiaId(null); setMotivoDraft(""); }} className="underline" style={{ color: C.stone }}>cancelar</button>
            </span>
          ) : (
            <button onClick={() => { setMudandoIdeiaId(e.id); setMotivoDraft(""); }} className="underline" style={{ color: C.stone }}>Mudei de ideia</button>
          )
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><ClipboardList size={12} className="inline mr-1" />Serviço na Casa de Deus</Eyebrow>
      <SectionTitle>Escala de Obreiros</SectionTitle>

      <p className="mt-3 text-sm font-bold" style={{ color: C.liveRed }}>
        Caso não possa servir ao Senhor no culto abaixo, favor marcar como indisponível com antecedência.
      </p>

      <div className="mt-4 flex items-center gap-3 flex-wrap p-3 rounded-lg border" style={{ borderColor: C.line, background: C.parchment }}>
        <Field label="Data do culto">
          <input type="date" className={inputCls} style={{ borderColor: C.line }} value={dataCulto} onChange={(e) => setDataCulto(e.target.value)} />
        </Field>
        <div className="text-sm" style={{ color: C.ink }}>
          <p className="font-mono text-xs uppercase" style={{ color: C.stone }}>Horário deste culto</p>
          <p className="font-display font-semibold">{fmtHorario(horarioAtual)}</p>
        </div>
        {fechado && (
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: "#2E7D4F22", color: "#2E7D4F" }}>
            Escala conferida por {diaAtual.conferidoPor} às {fmtHM(diaAtual.conferidoEm)}
          </span>
        )}
      </div>

      {/* Postos e suas caixas de disponíveis / escalados */}
      <div className="mt-6 space-y-4">
        {safeData.postos.map((posto) => {
          const doPosto = escalados.filter((e) => e.posto === posto);
          return (
            <div key={posto} className="p-3 rounded-lg border" style={{ borderColor: C.line }}>
              <p className="font-display font-semibold text-sm" style={{ color: C.ink }}>{posto}</p>

              {doPosto.length > 0 && (
                <div className="mt-2 space-y-2">
                  {doPosto.map((e) => (
                    <div key={e.id} className="p-2 rounded-md flex items-center justify-between gap-2 flex-wrap" style={{ background: C.parchment }}>
                      <div>
                        <span className="text-sm font-medium" style={{ color: C.ink }}>{e.obreiroNome}</span>
                        <span className="ml-2"><StatusObreiro e={e} /></span>
                      </div>
                      {podeMexerNoDia && (!fechado || adminMode) && (
                        <button onClick={() => removerEscalado(e.id)} className="text-[10px] underline" style={{ color: "#B03428" }}>remover da escala</button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(!fechado || adminMode) && (
                <div className="mt-2">
                  <p className="text-[10px] font-mono uppercase mb-1" style={{ color: C.stone }}>Obreiros disponíveis — clique pra escalar</p>
                  <div className="flex flex-wrap gap-1.5">
                    {disponiveis.length === 0 && <span className="text-xs italic" style={{ color: C.stone }}>Todos já foram escalados hoje.</span>}
                    {disponiveis.map((nome) => (
                      <button
                        key={nome}
                        onClick={() => escalarObreiro(nome, posto)}
                        className="text-xs px-2 py-1 rounded-full border"
                        style={{ borderColor: C.line, color: C.ink }}
                      >
                        {nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quadro-resumo — só aparece depois do primeiro obreiro escalado no dia */}
      {escalados.length > 0 && (
        <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: C.gold, background: "#00000006" }}>
          <Eyebrow color={C.ember}>Visão geral do dia</Eyebrow>
          <div className="space-y-1.5 mt-2">
            {escalados.map((e) => (
              <div key={e.id} className="text-sm flex items-center justify-between gap-2 flex-wrap border-b pb-1.5" style={{ borderColor: C.line }}>
                <span><strong>{e.obreiroNome}</strong> · {e.posto}</span>
                <span className="text-xs">
                  {e.status === "aguardando" ? (
                    <span className="italic" style={{ color: C.stone }}>aguardando confirmação</span>
                  ) : (
                    <span style={{ color: e.status === "disponivel" ? "#2E7D4F" : C.liveRed }}>
                      {e.status === "disponivel" ? "Disponível" : "Indisponível"}{e.horarioConfirmacao ? ` · ${fmtHM(e.horarioConfirmacao)}` : ""}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {adminMode && !fechado && (
            <div className="mt-4 pt-3 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: C.line }}>
              <input
                placeholder="Seu nome (responsável pela conferência)"
                value={nomeConferente}
                onChange={(e) => setNomeConferente(e.target.value)}
                className="text-sm rounded-md border px-2 py-1.5"
                style={{ borderColor: C.line }}
              />
              <Btn color={C.gold} onClick={conferirDia}><ShieldCheck size={14} /> Conferido</Btn>
            </div>
          )}
          {adminMode && fechado && (
            <button onClick={reabrirDia} className="text-xs underline mt-3" style={{ color: C.stone }}>reabrir escala do dia (admin)</button>
          )}
        </div>
      )}

      {!canManage && (
        <p className="text-xs mt-4 italic" style={{ color: C.stone }}>
          Qualquer pessoa pode clicar no próprio nome pra se escalar e marcar disponibilidade. Nomes, postos e horários só podem ser editados pelo admin ou por pessoas autorizadas.
        </p>
      )}

      {canManage && (
        <div className="mt-12 pt-8 border-t space-y-8" style={{ borderColor: C.line }}>
          <Eyebrow>Área administrativa</Eyebrow>
          <div>
            <p className="font-display font-semibold mb-2">Obreiros</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {safeData.obreiros.map((o) =>
                renomeando && renomeando.tipo === "obreiro" && renomeando.original === o ? (
                  <span key={o} className="flex items-center gap-1">
                    <input autoFocus value={renomeando.valor} onChange={(e) => setRenomeando((r) => ({ ...r, valor: e.target.value }))} className="text-xs rounded-md border px-2 py-1" style={{ borderColor: C.line }} />
                    <button onClick={() => renomearObreiro(o, renomeando.valor)} className="text-xs underline" style={{ color: C.violet }}>salvar</button>
                    <button onClick={() => setRenomeando(null)} className="text-xs underline" style={{ color: C.stone }}>cancelar</button>
                  </span>
                ) : (
                  <span key={o} className="text-xs px-2 py-1 rounded-full flex items-center gap-1.5" style={{ background: C.parchment }}>
                    {o}
                    <button onClick={() => setRenomeando({ tipo: "obreiro", original: o, valor: o })}>editar</button>
                    <button onClick={() => delObreiro(o)}><X size={11} color={C.stone} /></button>
                  </span>
                )
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <input className={`${inputCls} max-w-xs`} style={{ borderColor: C.line }} placeholder="Nome do(a) novo(a) obreiro(a)" value={novoObreiro} onChange={(e) => setNovoObreiro(e.target.value)} />
              <Btn onClick={addObreiro}><Plus size={14} /> Adicionar</Btn>
            </div>
          </div>
          <div>
            <p className="font-display font-semibold mb-2">Postos / funções</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {safeData.postos.map((p) =>
                renomeando && renomeando.tipo === "posto" && renomeando.original === p ? (
                  <span key={p} className="flex items-center gap-1">
                    <input autoFocus value={renomeando.valor} onChange={(e) => setRenomeando((r) => ({ ...r, valor: e.target.value }))} className="text-xs rounded-md border px-2 py-1" style={{ borderColor: C.line }} />
                    <button onClick={() => renomearPosto(p, renomeando.valor)} className="text-xs underline" style={{ color: C.violet }}>salvar</button>
                    <button onClick={() => setRenomeando(null)} className="text-xs underline" style={{ color: C.stone }}>cancelar</button>
                  </span>
                ) : (
                  <span key={p} className="text-xs px-2 py-1 rounded-full flex items-center gap-1.5" style={{ background: C.parchment }}>
                    {p}
                    <button onClick={() => setRenomeando({ tipo: "posto", original: p, valor: p })}>editar</button>
                    <button onClick={() => delPosto(p)}><X size={11} color={C.stone} /></button>
                  </span>
                )
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <input className={`${inputCls} max-w-xs`} style={{ borderColor: C.line }} placeholder="Novo posto/função" value={novoPosto} onChange={(e) => setNovoPosto(e.target.value)} />
              <Btn onClick={addPosto}><Plus size={14} /> Adicionar</Btn>
            </div>
          </div>
          <div>
            <p className="font-display font-semibold mb-2">Horários dos cultos</p>
            <div className="space-y-1 mb-2">
              {safeData.horarios.map((h, idx) => (
                <div key={idx} className="text-sm flex items-center gap-2">
                  <span>{h.dia} · {h.inicio}–{h.fim}</span>
                  <button onClick={() => delHorario(idx)} className="text-xs underline" style={{ color: "#B03428" }}>remover</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap items-end">
              <select className="text-sm rounded-md border px-2 py-2" style={{ borderColor: C.line }} value={novoHorario.dia} onChange={(e) => setNovoHorario((h) => ({ ...h, dia: e.target.value }))}>
                {DIAS_SEMANA_PT.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="time" className="text-sm rounded-md border px-2 py-2" style={{ borderColor: C.line }} value={novoHorario.inicio} onChange={(e) => setNovoHorario((h) => ({ ...h, inicio: e.target.value }))} />
              <input type="time" className="text-sm rounded-md border px-2 py-2" style={{ borderColor: C.line }} value={novoHorario.fim} onChange={(e) => setNovoHorario((h) => ({ ...h, fim: e.target.value }))} />
              <Btn onClick={addHorario}><Plus size={14} /> Adicionar horário</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Estudos Bíblicos                                                     */
/* ---------------------------------------------------------------- */
const ESTUDO_FIELDS = [
  { key: "titulo", label: "Título do estudo" },
  { key: "referencia", label: "Referência bíblica" },
  { key: "conteudo", label: "Conteúdo / resumo", type: "textarea" },
];

function Estudos({ items, save, adminMode }) {
  const [selected, setSelected] = useState(null);
  const add = (v) => save([...items, { id: uid(), ...v }]);
  const del = (id) => save(items.filter((i) => i.id !== id));
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Palavra e vida</Eyebrow>
      <SectionTitle>Estudos Bíblicos</SectionTitle>
      {items.length === 0 && <div className="mt-6"><Empty text="Nenhum estudo publicado ainda." /></div>}
      <div className={`${GRID3} mt-6`}>
        {items.map((e) => (
          <button key={e.id} onClick={() => setSelected(e)} className="text-left rounded-lg border overflow-hidden focus:outline-none focus:ring-2" style={{ borderColor: C.line }}>
            <ImgOrPlaceholder url={e.imageUrl} alt={e.titulo} className="w-full h-32 object-cover" ph="Imagem do estudo — adicionar depois" />
            <div className="p-4">
              <p className="font-display font-semibold">{e.titulo}</p>
              <p className="text-xs font-mono mt-1" style={{ color: C.ember }}>{e.referencia}</p>
              {e.conteudo && <p className="text-xs mt-2 line-clamp-3" style={{ color: C.stone }}>{e.conteudo.slice(0, 110)}{e.conteudo.length > 110 ? "…" : ""}</p>}
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-6 rounded-xl border p-5" style={{ borderColor: C.line }}>
          <button onClick={() => setSelected(null)} className="text-xs underline mb-2" style={{ color: C.stone }}>fechar</button>
          <p className="font-display text-xl font-semibold">{selected.titulo}</p>
          <p className="text-xs font-mono mt-1" style={{ color: C.ember }}>{selected.referencia}</p>
          <p className="text-sm mt-3 whitespace-pre-line" style={{ color: C.ink }}>{selected.conteudo}</p>
          {adminMode && <button onClick={() => { del(selected.id); setSelected(null); }} className="text-xs underline mt-3" style={{ color: "#B03428" }}>excluir</button>}
        </div>
      )}
      {adminMode && (
        <div className="mt-8">
          <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · novo estudo</p>
          <DynamicForm fields={ESTUDO_FIELDS} onSubmit={add} submitLabel="Publicar" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Avivar News                                                          */
/* ---------------------------------------------------------------- */
const AVIVARNEWS_FIELDS = [
  { key: "titulo", label: "Título da reportagem" },
  { key: "imageUrl", label: "URL da imagem de capa (opcional)", type: "url" },
  { key: "videoUrl", label: "URL do vídeo (YouTube ou Vimeo, opcional)", type: "url" },
  { key: "texto", label: "Texto da reportagem", type: "textarea" },
];

/* ---------------------------------------------------------------- */
/* Visitantes                                                          */
/* ---------------------------------------------------------------- */
const VISITANTE_FIELDS = [
  { key: "nome", label: "Nome do visitante" },
  { key: "cargoEclesiastico", label: "Cargo eclesiástico (opcional)" },
  { key: "igreja", label: "Igreja que congrega" },
  { key: "telefone", label: "WhatsApp (opcional)", type: "tel" },
  { key: "local", label: "Local / culto" },
];

function Visitantes({ items, save, refresh, adminMode, operatorMode, onRequestOperator }) {
  const [modoProjecao, setModoProjecao] = useState(false);
  const canAccess = adminMode || operatorMode;
  const grouped = useMemo(() => {
    const byDay = {};
    [...items]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .forEach((v) => {
        const day = new Date(v.timestamp).toLocaleDateString("pt-BR");
        byDay[day] = byDay[day] || [];
        byDay[day].push(v);
      });
    return byDay;
  }, [items]);

  useEffect(() => {
    if (!modoProjecao || !refresh) return;
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [modoProjecao]);

  const hojeStr = new Date().toLocaleDateString("pt-BR");
  const visitantesHoje = [...items].filter((v) => new Date(v.timestamp).toLocaleDateString("pt-BR") === hojeStr).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const add = (v) => {
    const entry = { id: uid(), ...v, timestamp: nowISO() };
    save([...items, entry]);
  };

  if (!canAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Eyebrow><HandHeart size={12} className="inline mr-1" />Que bom te ver por aqui</Eyebrow>
        <SectionTitle>Cadastro de Visitantes</SectionTitle>
        <RestrictedNotice onUnlock={onRequestOperator} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><HandHeart size={12} className="inline mr-1" />Que bom te ver por aqui</Eyebrow>
      <SectionTitle>Cadastro de Visitantes</SectionTitle>
      <p className="text-sm mt-2" style={{ color: C.stone }}>Registre a visita e, se desejar, envie uma mensagem de agradecimento no WhatsApp.</p>

      <div className="mt-6">
        <DynamicForm fields={VISITANTE_FIELDS} onSubmit={(v) => v.nome && add(v)} submitLabel="Registrar visita" />
      </div>

      <Btn variant="ghost" className="mt-4" onClick={() => setModoProjecao(true)}>
        <Video size={14} /> Abrir tela de projeção (culto de hoje)
      </Btn>

      <div className="mt-10 space-y-6">
        {Object.keys(grouped).length === 0 && <Empty text="Nenhuma visita registrada ainda." />}
        {Object.entries(grouped).map(([day, list]) => (
          <div key={day}>
            <p className="text-xs font-mono font-semibold mb-2" style={{ color: C.stone }}>{day}</p>
            <div className="space-y-2">
              {list.map((v) => (
                <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border" style={{ borderColor: C.line }}>
                  <div>
                    <p className="text-sm font-medium">{v.nome} {v.cargoEclesiastico && <span className="text-xs font-normal" style={{ color: C.stone }}>· {v.cargoEclesiastico}</span>}</p>
                    <p className="text-xs" style={{ color: C.stone }}>{v.igreja} {v.local && `· ${v.local}`} · {fmtDateTime(v.timestamp)}</p>
                  </div>
                  {v.telefone && (
                    <a
                      href={waLink(v.telefone, `Olá ${v.nome.split(" ")[0]}! Que alegria receber sua visita em nome de Jesus Cristo, no Ministério Avivar do Espírito. Esperamos vê-lo(a) novamente em breve!`)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-md"
                      style={{ background: "#25D36622", color: "#1B8A55" }}
                    >
                      <MessageCircle size={13} /> agradecer no WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-6 italic" style={{ color: C.stone }}>
        Neste protótipo, a mensagem de agradecimento é enviada com um toque (via WhatsApp Web/App). Envio 100% automático, sem toque, requer integração com a API oficial do WhatsApp Business em um backend real.
      </p>

      {modoProjecao && (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: C.black }}>
          <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: C.gold + "33" }}>
            <div>
              <p className="text-xs font-mono" style={{ color: C.gold }}>{hojeStr}</p>
              <h2 className="font-script text-4xl" style={{ color: C.goldBright }}>Visitantes de Hoje</h2>
            </div>
            <button onClick={() => setModoProjecao(false)} className="text-white p-2"><X size={28} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {visitantesHoje.length === 0 && <p className="text-white/60 text-xl text-center mt-10">Nenhum visitante registrado ainda hoje.</p>}
            {visitantesHoje.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-4 rounded-lg" style={{ background: "#ffffff11" }}>
                <div>
                  <p className="text-2xl font-display font-semibold text-white">{v.nome}</p>
                  <p className="text-base" style={{ color: C.gold }}>{v.cargoEclesiastico} {v.igreja && `· ${v.igreja}`}</p>
                </div>
                <span className="text-sm font-mono" style={{ color: "#ffffff88" }}>{fmtDateTime(v.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Orações nos Lares                                                    */
/* ---------------------------------------------------------------- */
const ORACAO_FIELDS = [
  { key: "nome", label: "Nome" },
  { key: "contato", label: "Telefone/WhatsApp" },
  { key: "endereco", label: "Endereço (para visita, opcional)" },
  { key: "pedido", label: "Pedido de oração", type: "textarea" },
];

const ENCONTRO_FIELDS = [
  { key: "anfitriao", label: "Anfitrião (ex: Casa da Irmã Deuza)" },
  { key: "diaSemana", label: "Dia da semana (ex: Terça-feira)" },
  { key: "data", label: "Data", type: "date" },
  { key: "hora", label: "Horário" },
  { key: "endereco", label: "Endereço completo" },
  { key: "contato", label: "Contato" },
];

function OracoesLares({ items, save, encontros, saveEncontros, adminMode, operatorMode, onRequestOperator }) {
  const canManageAgenda = adminMode || operatorMode;
  const add = (v) => save([...items, { id: uid(), ...v, timestamp: nowISO(), status: "pendente" }]);
  const setStatus = (id, status) => save(items.map((i) => (i.id === id ? { ...i, status } : i)));

  const addEncontro = (v) => saveEncontros([...encontros, { id: uid(), ...v, fotos: [] }]);
  const delEncontro = (id) => saveEncontros(encontros.filter((e) => e.id !== id));
  const addFoto = (id, url) => {
    if (!url.trim()) return;
    saveEncontros(encontros.map((e) => (e.id === id ? { ...e, fotos: [...(e.fotos || []), url.trim()] } : e)));
  };
  const delFoto = (id, idx) => {
    saveEncontros(encontros.map((e) => (e.id === id ? { ...e, fotos: e.fotos.filter((_, i) => i !== idx) } : e)));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><Sparkles size={12} className="inline mr-1" />Intercessão</Eyebrow>
      <SectionTitle>Orações nos Lares</SectionTitle>

      <div className="rounded-xl overflow-hidden border mb-8" style={{ borderColor: C.line }}>
        <ImgOrPlaceholder url={ORACOES_BANNER} alt="Oração nos Lares" className="w-full object-cover max-h-[360px]" ph="Banner Oração nos Lares" />
      </div>

      {/* Agenda de encontros — pública pra ver, restrita pra cadastrar */}
      <div className="mt-4">
        <p className="text-sm font-display font-semibold mb-3" style={{ color: C.ink }}>Próximos encontros</p>
        {encontros.length === 0 && <p className="text-sm italic" style={{ color: C.stone }}>Nenhum encontro cadastrado ainda.</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          {encontros.map((e) => (
            <div key={e.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <p className="font-display font-semibold text-sm">{e.anfitriao}</p>
                  {canManageAgenda && <button onClick={() => delEncontro(e.id)}><Trash2 size={13} color={C.stone} /></button>}
                </div>
                <p className="text-xs mt-1" style={{ color: C.stone }}><strong>{e.diaSemana}</strong> · {fmtDate(e.data)} · {e.hora}</p>
                <p className="text-xs mt-1" style={{ color: C.stone }}>{e.endereco}</p>
                {e.contato && <p className="text-xs" style={{ color: C.stone }}>Contato: {e.contato}</p>}
              </div>
              {(e.fotos || []).length > 0 && (
                <div className="grid grid-cols-3 gap-1.5 px-2 pb-2">
                  {e.fotos.map((f, idx) => (
                    <div key={idx} className="relative">
                      <img src={f} className="w-full h-28 object-cover rounded" />
                      {canManageAgenda && (
                        <button onClick={() => delFoto(e.id, idx)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5">
                          <X size={10} color="#fff" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {canManageAgenda && (
                <MiniPhotoAdder onAdd={(url) => addFoto(e.id, url)} />
              )}
            </div>
          ))}
        </div>

        {canManageAgenda ? (
          <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
            <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>Novo encontro</p>
            <DynamicForm fields={ENCONTRO_FIELDS} onSubmit={(v) => v.anfitriao && addEncontro(v)} submitLabel="Cadastrar encontro" />
          </div>
        ) : (
          <Btn variant="ghost" className="mt-4" color={C.purple} onClick={onRequestOperator}>
            <KeyRound size={13} /> Sou autorizado a cadastrar encontros
          </Btn>
        )}
      </div>

      <div className="mt-12 pt-8 border-t" style={{ borderColor: C.line }}>
        <p className="text-sm mt-2 mb-2" style={{ color: C.stone }}>Peça oração ou solicite uma visita de intercessão em sua casa.</p>
        <DynamicForm fields={ORACAO_FIELDS} onSubmit={(v) => v.nome && v.pedido && add(v)} submitLabel="Enviar pedido" />

        {adminMode && (
          <div className="mt-10 space-y-3">
            <p className="text-xs font-mono" style={{ color: C.stone }}>ADMIN · pedidos recebidos</p>
            {items.length === 0 && <Empty text="Nenhum pedido ainda." />}
            {[...items].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((i) => (
              <div key={i.id} className="p-4 rounded-lg border" style={{ borderColor: C.line }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{i.nome} · {i.contato}</p>
                    <p className="text-xs" style={{ color: C.stone }}>{fmtDateTime(i.timestamp)} {i.endereco && `· ${i.endereco}`}</p>
                  </div>
                  <select value={i.status} onChange={(e) => setStatus(i.id, e.target.value)} className="text-xs rounded-md border px-2 py-1" style={{ borderColor: C.line }}>
                    <option value="pendente">pendente</option>
                    <option value="agendado">agendado</option>
                    <option value="concluido">concluído</option>
                  </select>
                </div>
                <p className="text-sm mt-2" style={{ color: C.ink }}>{i.pedido}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniPhotoAdder({ onAdd }) {
  const [url, setUrl] = useState("");
  return (
    <div className="flex gap-1 p-2 border-t" style={{ borderColor: C.line }}>
      <input placeholder="URL de foto" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 text-xs rounded-md border px-2 py-1" style={{ borderColor: C.line }} />
      <button
        onClick={() => {
          onAdd(url);
          setUrl("");
        }}
        className="text-xs px-2 rounded-md"
        style={{ background: C.purple, color: "#fff" }}
      >
        +
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Pedido de Oração — formulário público; lista de pedidos só em adminMode */
/* ---------------------------------------------------------------- */
function PedidoOracao({ items, save, adminMode }) {
  const empty = { nome: "", local: "", whatsapp: "", email: "", causas: [], intercessaoNomes: "", descricao: "" };
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");
  const [enviado, setEnviado] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCausa = (c) => setForm((f) => ({ ...f, causas: f.causas.includes(c) ? f.causas.filter((x) => x !== c) : [...f.causas, c] }));

  const enviar = () => {
    if (!form.nome.trim() || !form.whatsapp.trim()) {
      setErr("Nome e WhatsApp são obrigatórios.");
      return;
    }
    save([...(items || []), { id: uid(), ...form, timestamp: nowISO() }]);
    setForm(empty);
    setErr("");
    setEnviado(true);
    setTimeout(() => setEnviado(false), 3500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><Sparkles size={12} className="inline mr-1" />Estamos com você</Eyebrow>
      <SectionTitle>Pedido de Oração</SectionTitle>
      <p className="text-sm mt-2" style={{ color: C.stone }}>Conte pra nós o que está pesando no seu coração — nossa equipe de intercessão vai orar por você.</p>

      <div className="mt-6 grid sm:grid-cols-2 gap-3 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
        <Field label="Nome de quem pediu"><input className={inputCls} style={{ borderColor: C.line }} value={form.nome} onChange={(e) => set("nome", e.target.value)} /></Field>
        <Field label="Local de onde está pedindo"><input className={inputCls} style={{ borderColor: C.line }} value={form.local} onChange={(e) => set("local", e.target.value)} /></Field>
        <Field label="WhatsApp (obrigatório)"><input className={inputCls} style={{ borderColor: C.line }} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
        <Field label="E-mail"><input type="email" className={inputCls} style={{ borderColor: C.line }} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>

        <div className="sm:col-span-2">
          <Field label="Causa do pedido">
            <div className="flex flex-wrap gap-2 mt-1">
              {CAUSAS_ORACAO.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCausa(c)}
                  className="text-xs px-3 py-1.5 rounded-full border transition"
                  style={form.causas.includes(c) ? { background: C.purple, color: "#fff", borderColor: C.purple } : { background: "#fff", color: C.ink, borderColor: C.line }}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {form.causas.includes("Intercessão") && (
          <div className="sm:col-span-2">
            <Field label="Nome das pessoas que necessitam de intercessão">
              <input className={inputCls} style={{ borderColor: C.line }} value={form.intercessaoNomes} onChange={(e) => set("intercessaoNomes", e.target.value)} />
            </Field>
          </div>
        )}

        <div className="sm:col-span-2">
          <Field label="Descreva seu pedido">
            <textarea rows={4} className={inputCls} style={{ borderColor: C.line }} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
          </Field>
        </div>

        {err && <p className="text-xs sm:col-span-2" style={{ color: "#B03428" }}>{err}</p>}
        {enviado && <p className="text-xs sm:col-span-2" style={{ color: "#2E7D4F" }}>Pedido enviado! Vamos orar com você.</p>}

        <div className="sm:col-span-2">
          <Btn onClick={enviar}><Send size={14} /> Enviar pedido</Btn>
        </div>
      </div>

      {adminMode && (
        <div className="mt-10 space-y-3">
          <Eyebrow>Área administrativa</Eyebrow>
          <p className="text-xs font-mono" style={{ color: C.stone }}>ADMIN · pedidos de oração recebidos (mais recentes primeiro)</p>
          {(!items || items.length === 0) && <Empty text="Nenhum pedido de oração recebido ainda." />}
          {[...(items || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((i) => (
            <div key={i.id} className="p-4 rounded-lg border text-sm" style={{ borderColor: C.line }}>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="font-medium">{i.nome} {i.local && `· ${i.local}`}</p>
                  <p className="text-xs" style={{ color: C.stone }}>{fmtDateTime(i.timestamp)}</p>
                </div>
                <div className="text-xs text-right" style={{ color: C.stone }}>
                  <p>{i.whatsapp}</p>
                  {i.email && <p>{i.email}</p>}
                </div>
              </div>
              {i.causas && i.causas.length > 0 && (
                <p className="text-xs mt-2 flex flex-wrap gap-1">
                  {i.causas.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded-full" style={{ background: C.parchment, color: C.ember }}>{c}</span>
                  ))}
                </p>
              )}
              {i.intercessaoNomes && <p className="text-xs mt-2" style={{ color: C.ink }}><strong>Intercessão por:</strong> {i.intercessaoNomes}</p>}
              {i.descricao && <p className="text-sm mt-2" style={{ color: C.ink }}>{i.descricao}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Membros — formulário público, lista restrita ao admin                */
/* ---------------------------------------------------------------- */
const MEMBRO_FIELDS = [
  { key: "nome", label: "Nome completo" },
  { key: "nomePai", label: "Nome do pai" },
  { key: "nomeMae", label: "Nome da mãe" },
  { key: "dataNascimento", label: "Data de nascimento", type: "date" },
  { key: "localNascimento", label: "Local de nascimento" },
  { key: "endereco", label: "Endereço" },
  { key: "whatsapp", label: "WhatsApp", type: "tel" },
  { key: "anoConversao", label: "Ano de conversão" },
  { key: "igrejaAnterior", label: "Igreja anterior (se houver)" },
  { key: "cargoEclesiastico", label: "Cargo eclesiástico (se houver)" },
  { key: "pretendeServir", label: "Pretende servir na igreja?", type: "select", options: ["Não", "Sim"] },
  { key: "funcaoServir", label: "Se sim, em qual função?" },
];

function Membros({ items, save, adminMode, operatorMode, onRequestOperator }) {
  const add = (v) => save([...items, { id: uid(), ...v, timestamp: nowISO() }]);
  const del = (id) => save(items.filter((i) => i.id !== id));
  const canAccess = adminMode || operatorMode;

  const gerarPDF = () => {
    const rows = items
      .map(
        (m) =>
          `<tr><td>${m.nome}</td><td>${fmtDate(m.dataNascimento)}</td><td>${m.whatsapp || ""}</td><td>${m.endereco || ""}</td><td>${m.cargoEclesiastico || ""}</td><td>${m.pretendeServir === "Sim" ? `Sim — ${m.funcaoServir || ""}` : "Não"}</td></tr>`
      )
      .join("");
    printReport(
      "Relatório de Membros",
      `<table><thead><tr><th>Nome</th><th>Nascimento</th><th>WhatsApp</th><th>Endereço</th><th>Cargo</th><th>Deseja servir</th></tr></thead><tbody>${rows}</tbody></table>
       <p class="totais"><strong>Total de membros cadastrados:</strong> ${items.length}</p>`
    );
  };

  if (!canAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Eyebrow>Faça parte</Eyebrow>
        <SectionTitle>Cadastro de Membros</SectionTitle>
        <RestrictedNotice onUnlock={onRequestOperator} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Faça parte</Eyebrow>
      <SectionTitle>Cadastro de Membros</SectionTitle>
      <p className="text-sm mt-2" style={{ color: C.stone }}>Preencha os dados para integrar o cadastro oficial de membros do ministério.</p>

      <div className="mt-6">
        <DynamicForm fields={MEMBRO_FIELDS} onSubmit={(v) => v.nome && add(v)} submitLabel="Enviar cadastro" />
      </div>

      <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono" style={{ color: C.stone }}>{items.length} membro(s) cadastrado(s)</p>
            <Btn onClick={gerarPDF}>Baixar / imprimir relatório (PDF)</Btn>
          </div>
          <div className="mt-4 space-y-2">
            {items.length === 0 && <Empty text="Nenhum membro cadastrado ainda." />}
            {items.map((m) => (
              <div key={m.id} className="p-3 rounded-lg border text-sm" style={{ borderColor: C.line }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{m.nome}</p>
                    <p className="text-xs" style={{ color: C.stone }}>
                      {fmtDate(m.dataNascimento)} {m.whatsapp && `· ${m.whatsapp}`} {m.cargoEclesiastico && `· ${m.cargoEclesiastico}`}
                    </p>
                    <p className="text-xs" style={{ color: C.stone }}>{m.endereco}</p>
                    {m.pretendeServir === "Sim" && <p className="text-xs mt-1" style={{ color: C.ember }}>Deseja servir: {m.funcaoServir}</p>}
                  </div>
                  <button onClick={() => del(m.id)}><Trash2 size={14} color={C.stone} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Avivar Music — músicos e repertório por culto                        */
/* ---------------------------------------------------------------- */
const MUSICO_FIELDS = [
  { key: "nome", label: "Nome do músico" },
  { key: "instrumento", label: "Instrumento / habilidade" },
  { key: "cantor", label: "É cantor(a)?", type: "select", options: ["Não", "Sim"] },
  { key: "disponibilidade", label: "Disponibilidade" },
];

const CULTO_FIELDS = [
  { key: "titulo", label: "Culto (ex: Culto de Domingo)" },
  { key: "data", label: "Data", type: "date" },
];

const MUSICA_FIELDS = [
  { key: "titulo", label: "Título da música" },
  { key: "tom", label: "Tom" },
  { key: "grupo", label: "Grupo / estilo" },
  { key: "letra", label: "Letra (opcional)", type: "textarea" },
  { key: "cifra", label: "Cifra (opcional)", type: "textarea" },
  { key: "youtubeUrl", label: "Link do YouTube", type: "url" },
];

const ALBUM_FIELDS = [
  { key: "titulo", label: "Nome do álbum / música" },
  { key: "capaUrl", label: "URL do banner/capa", type: "url" },
  { key: "videoUrl", label: "Link do vídeo/YouTube", type: "url" },
];

function AvivarMusic({ repertorio, saveRepertorio, musicos, saveMusicos, albuns, saveAlbuns, adminMode }) {
  const [tab, setTab] = useState("albuns");
  const [openAlbum, setOpenAlbum] = useState(null);

  const addCulto = (v) => saveRepertorio([...repertorio, { id: uid(), musicas: [], ...v }]);
  const delCulto = (id) => saveRepertorio(repertorio.filter((c) => c.id !== id));
  const addMusica = (cultoId, v) =>
    saveRepertorio(repertorio.map((c) => (c.id === cultoId ? { ...c, musicas: [...c.musicas, { id: uid(), ...v }] } : c)));
  const delMusica = (cultoId, musicaId) =>
    saveRepertorio(repertorio.map((c) => (c.id === cultoId ? { ...c, musicas: c.musicas.filter((m) => m.id !== musicaId) } : c)));

  const addMusico = (v) => saveMusicos([...musicos, { id: uid(), ...v }]);
  const delMusico = (id) => saveMusicos(musicos.filter((m) => m.id !== id));

  const addAlbum = (v) => v.titulo && saveAlbuns([...(albuns || []), { id: uid(), ...v }]);
  const delAlbum = (id) => saveAlbuns((albuns || []).filter((a) => a.id !== id));

  const sortedCultos = [...repertorio].sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><Sparkles size={12} className="inline mr-1" />Grupo de louvor</Eyebrow>
      <SectionTitle>Avivar Music</SectionTitle>

      <div className="flex gap-2 mt-6 mb-6">
        {["albuns", "repertorio", "musicos"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-md text-sm font-medium capitalize" style={{ background: tab === t ? C.gold : "transparent", color: tab === t ? "#fff" : C.ink, border: `1px solid ${C.gold}55` }}>
            {t === "albuns" ? "Álbuns" : t === "repertorio" ? "Repertório" : "Músicos"}
          </button>
        ))}
      </div>

      {tab === "albuns" && (
        <div>
          <div className={GRID3}>
            {(albuns || []).length === 0 && <Empty text="Nenhum álbum cadastrado ainda." />}
            {(albuns || []).map((a) => (
              <div key={a.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
                <button onClick={() => setOpenAlbum(a)} className="block w-full text-left focus:outline-none focus:ring-2">
                  <ImgOrPlaceholder url={a.capaUrl} alt={a.titulo} className="w-full h-40 object-cover" ph="Banner do álbum — adicionar depois" />
                  <div className="p-3 flex items-center gap-2">
                    <PlayCircle size={16} color={C.ember} />
                    <p className="font-display font-semibold text-sm">{a.titulo}</p>
                  </div>
                </button>
                {adminMode && <button onClick={() => delAlbum(a.id)} className="text-xs underline block px-3 pb-3" style={{ color: "#B03428" }}>excluir</button>}
              </div>
            ))}
          </div>
          {openAlbum && (
            <div className="mt-6 rounded-xl border p-5" style={{ borderColor: C.line }}>
              <button onClick={() => setOpenAlbum(null)} className="text-xs underline mb-3" style={{ color: C.stone }}>fechar</button>
              <p className="font-display font-semibold text-lg mb-3">{openAlbum.titulo}</p>
              {openAlbum.videoUrl ? (
                <div className="aspect-video rounded-md overflow-hidden bg-black">
                  <iframe title={openAlbum.titulo} src={getEmbedUrl(openAlbum.videoUrl)} className="w-full h-full" allowFullScreen />
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: C.stone }}>Vídeo ainda não cadastrado para este álbum.</p>
              )}
            </div>
          )}
          {adminMode && (
            <div className="mt-8">
              <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · novo álbum</p>
              <DynamicForm fields={ALBUM_FIELDS} onSubmit={addAlbum} submitLabel="Cadastrar álbum" />
            </div>
          )}
        </div>
      )}

      {tab === "repertorio" && (
        <div className="space-y-6">
          {sortedCultos.length === 0 && <Empty text="Nenhum culto cadastrado ainda." />}
          {sortedCultos.map((c) => (
            <div key={c.id} className="rounded-xl border p-5" style={{ borderColor: C.line }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-semibold text-lg">{c.titulo}</h3>
                  <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDate(c.data)}</p>
                </div>
                {adminMode && <button onClick={() => delCulto(c.id)}><Trash2 size={15} color={C.stone} /></button>}
              </div>
              <div className="mt-4 space-y-3">
                {c.musicas.length === 0 && <p className="text-xs italic" style={{ color: C.stone }}>Nenhuma música adicionada ainda.</p>}
                {c.musicas.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg ${m.youtubeUrl ? "cursor-pointer hover:brightness-95" : ""}`}
                    style={{ background: C.parchment }}
                    onClick={() => m.youtubeUrl && window.open(m.youtubeUrl, "_blank", "noopener,noreferrer")}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-1.5">
                          {m.youtubeUrl && <PlayCircle size={13} color={C.ember} />}
                          {m.titulo} {m.tom && <span className="font-mono text-xs" style={{ color: C.ember }}>· Tom: {m.tom}</span>}
                        </p>
                        {m.grupo && <p className="text-xs" style={{ color: C.stone }}>{m.grupo}</p>}
                      </div>
                      {adminMode && <button onClick={(e) => { e.stopPropagation(); delMusica(c.id, m.id); }}><Trash2 size={13} color={C.stone} /></button>}
                    </div>
                    {m.youtubeUrl && (
                      <span className="text-xs underline mt-1 inline-block" style={{ color: C.ember }}>ver no YouTube</span>
                    )}
                    {m.cifra && <p className="text-xs mt-2 whitespace-pre-line font-mono">{m.cifra}</p>}
                    {m.letra && <p className="text-xs mt-2 whitespace-pre-line">{m.letra}</p>}
                  </div>
                ))}
              </div>
              {adminMode && (
                <div className="mt-4 border-t pt-3" style={{ borderColor: C.line }}>
                  <DynamicForm fields={MUSICA_FIELDS} submitLabel="Adicionar música" onSubmit={(v) => v.titulo && addMusica(c.id, v)} />
                </div>
              )}
            </div>
          ))}
          {adminMode && (
            <div>
              <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · novo culto</p>
              <DynamicForm fields={CULTO_FIELDS} onSubmit={(v) => v.titulo && addCulto(v)} submitLabel="Criar culto" />
            </div>
          )}
        </div>
      )}

      {tab === "musicos" && (
        <div>
          <div className={GRID3}>
            {musicos.length === 0 && <Empty text="Nenhum músico cadastrado ainda." />}
            {musicos.map((m) => (
              <div key={m.id} className="p-4 rounded-lg border" style={{ borderColor: C.line }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-semibold">{m.nome}</p>
                    <p className="text-xs" style={{ color: C.ember }}>{m.instrumento}</p>
                    {m.cantor === "Sim" && <p className="text-xs" style={{ color: C.stone }}>Também canta</p>}
                    {m.disponibilidade && <p className="text-xs mt-1" style={{ color: C.stone }}>Disponibilidade: {m.disponibilidade}</p>}
                  </div>
                  {adminMode && <button onClick={() => delMusico(m.id)}><Trash2 size={14} color={C.stone} /></button>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>Cadastro de músico</p>
            <DynamicForm fields={MUSICO_FIELDS} onSubmit={(v) => v.nome && addMusico(v)} submitLabel="Cadastrar" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Contato                                                              */
/* ---------------------------------------------------------------- */
const CONTATO_FIELDS = [
  { key: "nome", label: "Nome" },
  { key: "contato", label: "E-mail ou telefone" },
  { key: "mensagem", label: "Mensagem", type: "textarea" },
];

function Contato({ items, save, adminMode }) {
  const add = (v) => save([...items, { id: uid(), ...v, timestamp: nowISO() }]);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Fale conosco</Eyebrow>
      <SectionTitle>Contato</SectionTitle>
      <div className="mt-6"><DynamicForm fields={CONTATO_FIELDS} onSubmit={(v) => v.nome && add(v)} submitLabel="Enviar mensagem" /></div>
      {adminMode && (
        <div className="mt-10 space-y-2">
          <p className="text-xs font-mono" style={{ color: C.stone }}>ADMIN · mensagens recebidas</p>
          {items.length === 0 && <Empty text="Nenhuma mensagem ainda." />}
          {[...items].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((i) => (
            <div key={i.id} className="p-3 rounded-lg border text-sm" style={{ borderColor: C.line }}>
              <p className="font-medium">{i.nome} · <span style={{ color: C.stone }}>{i.contato}</span></p>
              <p style={{ color: C.ink }}>{i.mensagem}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* App                                                                  */
/* ---------------------------------------------------------------- */
export default function App() {
  const [page, setPage] = useState("home");
  const scrollToSection = (key) => {
    setPage(key);
    requestAnimationFrame(() => {
      const el = document.getElementById(key);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  };
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [operatorMode, setOperatorMode] = useState(false);
  const [operatorGateOpen, setOperatorGateOpen] = useState(false);
  const [operatorCodes, setOperatorCodes] = useState([]);
  const [oracaoEncontros, setOracaoEncontros] = useState([]);

  const [site, setSite] = useState(DEFAULT_SITE);
  const [codigos, setCodigos] = useState(DEFAULT_CODIGOS);
  const [eventos, setEventos] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [aoVivo, setAoVivo] = useState(DEFAULT_AOVIVO);
  const [transmissoesPassadas, setTransmissoesPassadas] = useState([]);
  const [doacoes, setDoacoes] = useState(DEFAULT_DOACOES);
  const [loja, setLoja] = useState([]);
  const [igrejas, setIgrejas] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [estudos, setEstudos] = useState([]);
  const [avivarNews, setAvivarNews] = useState([]);
  const [visitantes, setVisitantes] = useState([]);
  const [oracoes, setOracoes] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [caixa, setCaixa] = useState([]);
  const [bens, setBens] = useState([]);
  const [membros, setMembros] = useState([]);
  const [repertorio, setRepertorio] = useState([]);
  const [musicos, setMusicos] = useState([]);
  const [albuns, setAlbuns] = useState([]);
  const [escala, setEscala] = useState(DEFAULT_ESCALA_OBREIROS);
  const [biblioteca, setBiblioteca] = useState([]);
  const [manchete, setManchete] = useState(DEFAULT_MANCHETE);
  const [pedidosOracao, setPedidosOracao] = useState([]);
  const [seeds, setSeeds] = useState({});

  const sideCarouselPhotos = useMemo(() => {
    const photos = [];
    (galeria || []).forEach((sessao) => {
      (sessao.fotos || []).forEach((url) => {
        photos.push({ url, label: sessao.titulo || "Galeria", target: "eventos" });
      });
    });
    (colaboradores || []).forEach((c) => {
      if (c.fotoUrl) photos.push({ url: c.fotoUrl, label: c.nome, target: "colaboradores" });
    });
    (oracaoEncontros || []).forEach((e) => {
      (e.fotos || []).forEach((url) => {
        photos.push({ url, label: e.anfitriao || "Oração", target: "oracoes" });
      });
    });
    (eventos || []).forEach((e) => {
      if (e.imageUrl) photos.push({ url: e.imageUrl, label: e.titulo || "Evento", target: "eventos" });
    });
    (loja || []).forEach((p) => {
      if (p.imageUrl) photos.push({ url: p.imageUrl, label: p.nome || "Loja", target: "loja" });
    });
    (igrejas || []).forEach((i) => {
      if (i.fotoUrl) photos.push({ url: i.fotoUrl, label: i.nome || "Igreja", target: "igrejas" });
    });
    (avivarNews || []).forEach((n) => {
      if (n.imageUrl) photos.push({ url: n.imageUrl, label: n.titulo || "Avivar News", target: "aovivo" });
    });
    (albuns || []).forEach((a) => {
      if (a.capaUrl) photos.push({ url: a.capaUrl, label: a.titulo || "Avivar Music", target: "avivarmusic" });
    });
    (biblioteca || []).forEach((b) => {
      if (b.capaUrl) photos.push({ url: b.capaUrl, label: b.titulo || "Biblioteca Avivar", target: "biblioteca" });
    });
    return photos;
  }, [galeria, colaboradores, oracaoEncontros, eventos, loja, igrejas, avivarNews, albuns, biblioteca]);

  useEffect(() => {
    (async () => {
      setSite(await loadKey("avivar:site", DEFAULT_SITE));
      setCodigos(await loadKey("avivar:codigos", DEFAULT_CODIGOS));
      setEventos(await loadKey("avivar:eventos", []));
      setGaleria(await loadKey("avivar:galeria", []));
      setAoVivo(await loadKey("avivar:aovivo", DEFAULT_AOVIVO));
      setTransmissoesPassadas(await loadKey("avivar:transmissoespassadas", []));
      setOperatorCodes(await loadKey("avivar:operatorcodes", []));
      setOracaoEncontros(await loadKey("avivar:oracaoencontros", []));
      setDoacoes(await loadKey("avivar:doacoes", DEFAULT_DOACOES));
      setLoja(await loadKey("avivar:loja", []));
      setIgrejas(await loadKey("avivar:igrejas", []));
      setColaboradores(await loadKey("avivar:colaboradores", []));
      setEstudos(await loadKey("avivar:estudos", []));
      setAvivarNews(await loadKey("avivar:avivarnews", []));
      setVisitantes(await loadKey("avivar:visitantes", []));
      setOracoes(await loadKey("avivar:oracoes", []));
      setMensagens(await loadKey("avivar:mensagens", []));
      setForumPosts(await loadKey("avivar:forum", []));
      setCaixa(await loadKey("avivar:caixa", []));
      setBens(await loadKey("avivar:bens", []));
      setMembros(await loadKey("avivar:membros", []));
      setRepertorio(await loadKey("avivar:repertorio", []));
      setMusicos(await loadKey("avivar:musicos", []));
      setAlbuns(await loadKey("avivar:albuns", []));
      setEscala(await loadKey("avivar:escalaObreiros", DEFAULT_ESCALA_OBREIROS));
      setManchete(await loadKey("avivar:manchete", DEFAULT_MANCHETE));
      setPedidosOracao(await loadKey("avivar:pedidosOracao", []));
      setBiblioteca(await loadKey("avivar:biblioteca", []));
      setSeeds(await loadKey("avivar:seeds", {}));
      setLoading(false);
    })();
  }, []);

  // Semeadura única de conteúdo inicial (reportagens de Códigos Avivar, eventos, etc.)
  // — usa a flag avivar:seeds pra nunca duplicar, mesmo que a página recarregue várias vezes,
  // mas sem recriar o item se o admin apagá-lo de propósito depois.
  useEffect(() => {
    if (loading) return;
    const todo = {};
    if (!seeds.reportagensCodigos) {
      const jaTem = avivarNews.some((n) => n.seedId && n.seedId.startsWith("codigos-"));
      if (!jaTem) {
        const novas = [
          {
            id: uid(),
            seedId: "codigos-portais",
            titulo: "Portais espirituais na Bíblia: quando o céu se abre sobre a Terra",
            texto: "Em vários momentos das Escrituras, o véu entre o céu e a terra parece se afinar. Jacó, fugindo de Esaú, dorme numa pedra em Betel e sonha com uma escada que liga a terra ao céu — ao acordar, declara: \"Este é o portal do céu\" (Gênesis 28:10-17). No batismo de Jesus, os céus se abrem e o Espírito desce como pomba (Mateus 3:16). Estêvão, prestes a ser apedrejado, vê o céu aberto e a glória de Deus (Atos 7:55-56). E João, em Patmos, escreve: \"Depois destas coisas olhei, e eis uma porta aberta no céu\" (Apocalipse 4:1). São lugares e momentos em que o Reino invisível toca visivelmente a vida de quem busca a Deus — não fórmulas, mas encontros que Deus mesmo escolhe abrir.",
            timestamp: nowISO(),
          },
          {
            id: uid(),
            seedId: "codigos-horas",
            titulo: "Horas dimensionais na Bíblia: os tempos em que o Espírito se move",
            texto: "A Bíblia marca horas específicas como momentos de virada espiritual. Na hora nona (por volta das 15h), Pedro e João sobem ao templo para orar e um coxo é curado (Atos 3:1-8) — na mesma hora nona, Cornélio recebe a visita de um anjo (Atos 10:3). À meia-noite, Paulo e Silas, presos e feridos, cantam louvores, e a prisão treme (Atos 16:25-26). Na crucificação, das seis às nove horas, trevas cobrem a terra antes da ressurreição vindoura (Mateus 27:45). E no Pentecostes, é \"a hora terceira do dia\" quando o Espírito é derramado sobre os discípulos (Atos 2:15). Não são horários mágicos, mas registros de que Deus age em tempos determinados — e nos convida a velar e orar em todo tempo.",
            timestamp: nowISO(),
          },
          {
            id: uid(),
            seedId: "codigos-quantica",
            titulo: "Energia quântica e espiritualidade: quando a ciência aponta para o mistério",
            texto: "A física quântica descreve um universo onde partículas separadas por enormes distâncias permanecem conectadas (o chamado emaranhamento quântico), e onde o simples ato de observar altera o que é observado. Cientistas ainda debatem o que isso realmente significa — não é prova de nada espiritual —, mas é difícil não pensar em como as Escrituras já descreviam um universo profundamente interligado, sustentado por uma Palavra que tudo criou e tudo mantém unido: \"Nele subsistem todas as coisas\" (Colossenses 1:17). Ciência e fé caminham por métodos diferentes, mas ambas, à sua maneira, apontam para um mistério maior do que conseguimos medir — e a fé cristã crê que esse mistério tem nome: Jesus Cristo.",
            timestamp: nowISO(),
          },
        ];
        const merged = [...avivarNews, ...novas];
        setAvivarNews(merged);
        saveKey("avivar:avivarnews", merged);
      }
      todo.reportagensCodigos = true;
    }
    if (!seeds.eventos3) {
      const jaTem = eventos.some((e) => e.seedId && e.seedId.startsWith("evt-"));
      if (!jaTem) {
        const novosEventos = [
          {
            id: uid(),
            seedId: "evt-criancas",
            titulo: "Culto de Crianças",
            data: "2026-10-10",
            hora: "19:00",
            local: "Quadra 1, Lote 4 — Final do estacionamento",
            descricao: "Um culto especial dedicado às crianças do Ministério Avivar do Espírito.",
            imageUrl: EVENTO_CRIANCAS_BANNER,
          },
          {
            id: uid(),
            seedId: "evt-batismo",
            titulo: "Batismo nas Águas do Ministério Avivar do Espírito",
            data: "2026-11-07",
            hora: "07:30",
            local: "Av. G, 06 (quase no final da Av. G, próximo à vacaria)",
            descricao: "Momento de consagração e novo nascimento em Cristo através do batismo nas águas.",
            imageUrl: EVENTO_BATISMO_BANNER,
          },
          {
            id: uid(),
            seedId: "evt-almoco",
            titulo: "Almoço Avivar",
            data: "2026-09-27",
            hora: "11:30",
            local: "Ministério Avivar do Espírito",
            descricao: "Um momento de comunhão e confraternização entre a família Avivar.",
            imageUrl: EVENTO_ALMOCO_BANNER,
          },
        ];
        const mergedEventos = [...eventos, ...novosEventos];
        setEventos(mergedEventos);
        saveKey("avivar:eventos", mergedEventos);
      }
      todo.eventos3 = true;
    }
    if (!seeds.biblioteca1) {
      const jaTem = biblioteca.some((b) => b.seedId && b.seedId.startsWith("bib-"));
      if (!jaTem) {
        const novosLivros = [
          {
            id: uid(),
            seedId: "bib-palavra",
            titulo: "A Palavra de Deus: Um Remédio Infalível",
            autor: "Kenneth E. Hagin",
            capaUrl: "/biblioteca/6-biblioteca-a-palavra-de-deus.jpg",
            pdfUrl: "/biblioteca/7-biblioteca-a-palavra-de-deus.pdf",
            sinopse: "A partir de Provérbios 4.20-22, Kenneth Hagin mostra como a Palavra de Deus funciona como remédio para o corpo e para a vida — não apenas metáfora, mas promessa concreta de cura e sustento. Um convite a tratar as Escrituras com a mesma constância de um tratamento médico: lidas, guardadas no coração e proclamadas com fé.",
          },
          {
            id: uid(),
            seedId: "bib-aguias",
            titulo: "Voando com as Águias",
            autor: "Kenneth Hagin Jr.",
            capaUrl: "/biblioteca/8-biblioteca-voando-com-as-aguias.jpg",
            pdfUrl: "/biblioteca/9-biblioteca-voando-com-as-aguias.pdf",
            sinopse: "Usando a águia como símbolo bíblico de força e renovação, Kenneth Hagin Jr. ensina como o cristão pode se erguer acima das tempestades da vida pela fé, em vez de reagir como as aves comuns diante das dificuldades. Um chamado à maturidade espiritual e à confiança na provisão de Deus mesmo em meio à adversidade.",
          },
          {
            id: uid(),
            seedId: "bib-setepassos",
            titulo: "Sete Passos Vitais Para Receber o Espírito Santo",
            autor: "Kenneth E. Hagin",
            capaUrl: "/biblioteca/10-biblioteca-sete-passos-espirito-santo.jpg",
            pdfUrl: "/biblioteca/11-biblioteca-sete-passos-espirito-santo.pdf",
            sinopse: "Um guia prático e pastoral para ajudar alguém a receber o batismo no Espírito Santo, com base em Atos 2 e João 14, explicando o papel da fé, da expectativa e da liberdade para orar em línguas. Traz também dez razões bíblicas para valorizar essa experiência na vida de todo crente.",
          },
          {
            id: uid(),
            seedId: "bib-familia",
            titulo: "Ministrando à Sua Família",
            autor: "Kenneth E. Hagin e Kenneth Hagin Jr.",
            capaUrl: "/biblioteca/12-biblioteca-ministrando-a-sua-familia.jpg",
            pdfUrl: "/biblioteca/13-biblioteca-ministrando-a-sua-familia.pdf",
            sinopse: "Coletânea de sermões dos dois autores sobre como aplicar princípios bíblicos de fé, amor e ordem na vida familiar. Aborda o papel de pais e cônjuges à luz da Palavra, com ênfase prática para o dia a dia do lar cristão.",
          },
          {
            id: uid(),
            seedId: "bib-uncao",
            titulo: "Uma Nova Unção",
            autor: "Kenneth E. Hagin",
            capaUrl: "",
            pdfUrl: "",
            sinopse: "Hagin explica a diferença entre a unção que já habita todo crente e uma unção renovada e intensificada para o serviço, mostrando exemplos do Velho e do Novo Testamento de homens e mulheres que a buscaram e a mantiveram viva mesmo em circunstâncias adversas. Um chamado a não se contentar com reservatórios vazios quando Deus oferece um fluir constante do Espírito.",
          },
          {
            id: uid(),
            seedId: "bib-nomejesus",
            titulo: "O Nome de Jesus",
            autor: "Kenneth E. Hagin",
            capaUrl: "",
            pdfUrl: "",
            sinopse: "Um estudo detalhado sobre a autoridade que Deus depositou no nome de Jesus — herdada, concedida e conquistada pela igreja — e como usá-la em oração, na cura, na libertação e no dia a dia da fé cristã. Percorre desde a origem desse Nome \"acima de todo nome\" até seu uso prático contra a opressão espiritual.",
          },
          {
            id: uid(),
            seedId: "bib-alimentofe",
            titulo: "Alimento da Fé — Devocionais",
            autor: "Kenneth E. Hagin",
            capaUrl: "",
            pdfUrl: "",
            sinopse: "Uma coletânea de devocionais curtos, um para cada ocasião de leitura, criada para alimentar a fé do leitor diariamente através de confissões bíblicas e reflexões objetivas. Pensado para ser lido em voz alta, fortalecendo a prática da confissão da Palavra no dia a dia.",
          },
          {
            id: uid(),
            seedId: "bib-cursofe",
            titulo: "Curso de Estudo Bíblico Sobre a Fé",
            autor: "Kenneth E. Hagin",
            capaUrl: "",
            pdfUrl: "",
            sinopse: "Um curso completo e didático sobre como a fé bíblica funciona: como ela vem, como é liberada, os passos para o mais alto tipo de fé e os maiores inimigos que a atacam. Referência clássica de Hagin sobre o tema, indicada tanto para o estudo pessoal quanto para discipulado em grupo.",
          },
        ];
        const mergedBiblioteca = [...biblioteca, ...novosLivros];
        setBiblioteca(mergedBiblioteca);
        saveKey("avivar:biblioteca", mergedBiblioteca);
      }
      todo.biblioteca1 = true;
    }
    if (!seeds.biblioteca2) {
      const jaTem = biblioteca.some((b) => b.seedId && b.seedId.startsWith("bib2-"));
      if (!jaTem) {
        const maisLivros = [
          {
            id: uid(),
            seedId: "bib2-dons",
            titulo: "Os Dons do Ministério",
            autor: "Kenneth E. Hagin",
            capaUrl: "/biblioteca/14-biblioteca-os-dons-do-ministerio.jpg",
            pdfUrl: "/biblioteca/15-biblioteca-os-dons-do-ministerio.pdf",
            sinopse: "Um estudo sobre os cinco dons ministeriais mencionados em Efésios 4 — apóstolo, profeta, evangelista, pastor e mestre — e como cada um deles equipa a igreja para o crescimento e a maturidade espiritual. Hagin explica como reconhecer esses chamados e por que eles continuam atuantes no Corpo de Cristo hoje.",
          },
          {
            id: uid(),
            seedId: "bib2-elshaddai",
            titulo: "El Shaddai: O Deus Mais do que Suficiente",
            autor: "Kenneth E. Hagin",
            capaUrl: "/biblioteca/16-biblioteca-el-shaddai.jpg",
            pdfUrl: "/biblioteca/17-biblioteca-el-shaddai.pdf",
            sinopse: "A partir do nome hebraico El Shaddai, Hagin explora a suficiência de Deus para suprir cada necessidade do crente — física, financeira e espiritual. Um convite a confiar na provisão divina mesmo diante de circunstâncias que parecem maiores do que os próprios recursos.",
          },
          {
            id: uid(),
            seedId: "bib2-sofram",
            titulo: "É Necessário que os Cristãos Sofram?",
            autor: "Kenneth E. Hagin",
            capaUrl: "/biblioteca/18-biblioteca-e-necessario-que-os-cristaos-sofram.jpg",
            pdfUrl: "/biblioteca/19-biblioteca-e-necessario-que-os-cristaos-sofram.pdf",
            sinopse: "Hagin examina, à luz das Escrituras, se o sofrimento é parte do plano de Deus para o crente ou consequência de outros fatores, distinguindo entre a perseguição pela fé e as aflições que a Palavra ensina a resistir. Uma reflexão pastoral para quem enfrenta dificuldades e busca entender o papel de Deus nelas.",
          },
          {
            id: uid(),
            seedId: "bib2-duelo",
            titulo: "Duelo con el Diablo (em espanhol)",
            autor: "Kenneth Hagin Jr.",
            capaUrl: "/biblioteca/20-biblioteca-duelo-con-el-diablo.jpg",
            pdfUrl: "/biblioteca/21-biblioteca-duelo-con-el-diablo.pdf",
            sinopse: "Kenneth Hagin Jr. ensina como identificar as imitações e ciladas espirituais do diabo e como resistir a elas com autoridade na fé cristã. Atenção: este exemplar está em espanhol, não em português.",
          },
          {
            id: uid(),
            seedId: "bib2-autoridade",
            titulo: "A Autoridade do Crente",
            autor: "Kenneth E. Hagin",
            capaUrl: "/biblioteca/22-biblioteca-a-autoridade-do-crente.jpg",
            pdfUrl: "/biblioteca/23-biblioteca-a-autoridade-do-crente.pdf",
            sinopse: "Um dos ensinos mais conhecidos de Hagin sobre a autoridade espiritual que o crente recebe em Cristo — a base bíblica para resistir ao inimigo, orar com convicção e viver de forma vitoriosa. Referência clássica sobre o tema no meio evangélico.",
          },
          {
            id: uid(),
            seedId: "bib2-naoculpe",
            titulo: "Não Culpe a Deus",
            autor: "Kenneth E. Hagin",
            capaUrl: "",
            pdfUrl: "/biblioteca/24-biblioteca-nao-culpe-a-deus.pdf",
            sinopse: "A partir da própria história de enfermidade na infância, Hagin desmonta a ideia de que Deus é o autor do sofrimento, mostrando pelas Escrituras que a cura e a vida abundante são a vontade de Deus para todos. Um livro pastoral e testemunhal sobre encontrar respostas bíblicas em meio à dor.",
          },
          {
            id: uid(),
            seedId: "bib2-casamento",
            titulo: "Casamento, Divórcio e Novo Casamento",
            autor: "Kenneth E. Hagin",
            capaUrl: "",
            pdfUrl: "",
            sinopse: "Hagin trata com equilíbrio bíblico os temas do casamento, do divórcio e da possibilidade de um novo casamento, buscando o que as Escrituras realmente ensinam para além do senso comum religioso. Aborda também a visão de Deus para o lar e os principais desafios entre marido e mulher.",
          },
        ];
        const mergedBiblioteca2 = [...biblioteca, ...maisLivros];
        setBiblioteca(mergedBiblioteca2);
        saveKey("avivar:biblioteca", mergedBiblioteca2);
      }
      todo.biblioteca2 = true;
    }
    if (!seeds.trilogiaLivros1) {
      const jaTemTrilogia = (loja || []).some((p) => p.seedId && p.seedId.startsWith("trilogia-"));
      if (!jaTemTrilogia) {
        const livrosTrilogia = [
          {
            id: uid(),
            seedId: "trilogia-dons",
            categoria: "Códigos Avivar",
            titulo: "Conquistando os Dons do Espírito Santo",
            nome: "Conquistando os Dons do Espírito Santo",
            autor: "Filho do Deus Altíssimo",
            imageUrl: LIVRO_DONS_CAPA,
            destino: "loja",
            preco: "",
            linkCompra: "",
            linkCartao: "",
            descricao: "Um guia prático para reconhecer, desenvolver e operar os dons do Espírito Santo na vida cristã. A obra conduz o leitor a compreender como o derramar do Espírito prometido em Isaías 44:3 se manifesta hoje, treinando os filhos de Deus para a batalha espiritual pela salvação das almas.",
          },
          {
            id: uid(),
            seedId: "trilogia-cura",
            categoria: "Códigos Avivar",
            titulo: "Praticando a Cura Divina",
            nome: "Praticando a Cura Divina",
            autor: "Filho do Deus Altíssimo",
            imageUrl: LIVRO_CURA_CAPA,
            destino: "loja",
            preco: "",
            linkCompra: "",
            linkCartao: "",
            descricao: "Um manual de fé e ação sobre a cura divina, ensinando princípios bíblicos para orar pelos enfermos e libertar os oprimidos. A obra resgata o exemplo de Jesus e dos apóstolos, mostrando que o poder de curar os enfermos e expulsar demônios continua disponível à Igreja hoje.",
          },
          {
            id: uid(),
            seedId: "trilogia-gloria",
            categoria: "Códigos Avivar",
            titulo: "O Impacto da Glória — Dons do Espírito Santo",
            nome: "O Impacto da Glória — Dons do Espírito Santo",
            autor: "Filho do Deus Altíssimo",
            imageUrl: LIVRO_GLORIA_CAPA,
            destino: "loja",
            preco: "",
            linkCompra: "",
            linkCartao: "",
            descricao: "Uma reflexão sobre o impacto da glória de Deus manifestada por meio dos dons espirituais, à luz da profecia de Joel 2:28. O livro convida a Igreja a viver o derramamento profetizado — com sonhos, visões e profecias — reacendendo o avivamento nos últimos dias.",
          },
        ];
        const mergedLoja = [...(loja || []), ...livrosTrilogia];
        setLoja(mergedLoja);
        saveKey("avivar:loja", mergedLoja);
      }
      todo.trilogiaLivros1 = true;
    }
    if (!seeds.trilogiaLivros2) {
      // Agora que os PDFs (miolo) chegaram, preenche pdfUrl dos 3 livros já cadastrados
      // e acrescenta "O Dom da Revelação" como 4º título — sem duplicar o que já existe.
      const pdfMap = {
        "trilogia-dons": "/43-livro-conquistando-os-dons.pdf",
        "trilogia-cura": "/44-livro-praticando-a-cura-divina.pdf",
        "trilogia-gloria": "/45-livro-o-impacto-da-gloria.pdf",
      };
      let lojaAtualizada = (loja || []).map((p) =>
        p.seedId && pdfMap[p.seedId] && !p.pdfUrl ? { ...p, pdfUrl: pdfMap[p.seedId] } : p
      );
      const jaTemRevelacao = lojaAtualizada.some((p) => p.seedId === "trilogia-revelacao");
      if (!jaTemRevelacao) {
        lojaAtualizada = [
          ...lojaAtualizada,
          {
            id: uid(),
            seedId: "trilogia-revelacao",
            categoria: "Códigos Avivar",
            titulo: "O Dom da Revelação — Segredos e Técnicas",
            nome: "O Dom da Revelação — Segredos e Técnicas",
            autor: "Filho do Deus Altíssimo",
            imageUrl: "/46-livro-o-dom-da-revelacao.jpg",
            pdfUrl: "/47-livro-o-dom-da-revelacao.pdf",
            destino: "loja",
            preco: "",
            linkCompra: "",
            linkCartao: "",
            descricao: "Uma obra dedicada ao dom da revelação e da palavra de ciência, com explicações simples e minuciosas fundamentadas nas Escrituras e garantidas pelo Espírito Santo. Traz também exercícios práticos para que o leitor experimente uma fluidez maior na manifestação desse dom em sua vida espiritual.",
          },
        ];
      }
      setLoja(lojaAtualizada);
      saveKey("avivar:loja", lojaAtualizada);

      // Os mesmos 4 livros também aparecem na Biblioteca Avivar (pública), mas
      // como são vendidos, o clique redireciona para a Loja em vez de abrir o PDF ali.
      const jaTemNaBiblioteca = (biblioteca || []).some((b) => b.seedId && b.seedId.startsWith("trilogia-bib-"));
      if (!jaTemNaBiblioteca) {
        const copiasBiblioteca = [
          { id: uid(), seedId: "trilogia-bib-dons", titulo: "Conquistando os Dons do Espírito Santo", autor: "Filho do Deus Altíssimo", capaUrl: "/27-livro-conquistando-os-dons.jpg", linkLoja: true, sinopse: "Um guia prático para reconhecer, desenvolver e operar os dons do Espírito Santo na vida cristã, treinando os filhos de Deus para a batalha espiritual pela salvação das almas. Disponível para aquisição na Loja Avivar." },
          { id: uid(), seedId: "trilogia-bib-cura", titulo: "Praticando a Cura Divina", autor: "Filho do Deus Altíssimo", capaUrl: "/28-livro-praticando-a-cura-divina.jpg", linkLoja: true, sinopse: "Um manual de fé e ação sobre a cura divina, com princípios bíblicos para orar pelos enfermos e libertar os oprimidos. Disponível para aquisição na Loja Avivar." },
          { id: uid(), seedId: "trilogia-bib-gloria", titulo: "O Impacto da Glória — Dons do Espírito Santo", autor: "Filho do Deus Altíssimo", capaUrl: "/29-livro-o-impacto-da-gloria.jpg", linkLoja: true, sinopse: "Uma reflexão sobre o impacto da glória de Deus manifestada pelos dons espirituais, à luz da profecia de Joel 2:28. Disponível para aquisição na Loja Avivar." },
          { id: uid(), seedId: "trilogia-bib-revelacao", titulo: "O Dom da Revelação — Segredos e Técnicas", autor: "Filho do Deus Altíssimo", capaUrl: "/46-livro-o-dom-da-revelacao.jpg", linkLoja: true, sinopse: "Uma obra dedicada ao dom da revelação e da palavra de ciência, com explicações simples e exercícios práticos fundamentados nas Escrituras. Disponível para aquisição na Loja Avivar." },
        ];
        const mergedBiblioteca3 = [...(biblioteca || []), ...copiasBiblioteca];
        setBiblioteca(mergedBiblioteca3);
        saveKey("avivar:biblioteca", mergedBiblioteca3);
      }
      todo.trilogiaLivros2 = true;
    }
    if (!seeds.galeriaComunidade1) {
      const jaTemSessao = (galeria || []).some((g) => g.seedId === "galeria-comunidade-1");
      if (!jaTemSessao) {
        const novaSessao = {
          id: uid(),
          seedId: "galeria-comunidade-1",
          titulo: "Vida em Comunidade",
          data: "2026-09-26",
          videos: [],
          fotos: [
            "/32-galeria-comunidade.jpg",
            "/33-galeria-comunidade.jpg",
            "/34-galeria-comunidade.jpg",
            "/35-galeria-comunidade.jpg",
            "/36-galeria-comunidade.jpg",
            "/37-galeria-comunidade.jpg",
            "/38-galeria-comunidade.jpg",
            "/39-galeria-comunidade.jpg",
            "/40-galeria-comunidade.jpg",
            "/41-galeria-comunidade.jpg",
            "/42-galeria-comunidade.jpg",
          ],
        };
        const mergedGaleria = [...(galeria || []), novaSessao];
        setGaleria(mergedGaleria);
        saveKey("avivar:galeria", mergedGaleria);
      }
      todo.galeriaComunidade1 = true;
    }
    if (!seeds.galeriaLouvor1) {
      const jaTemLouvor = (galeria || []).some((g) => g.seedId === "galeria-louvor-1");
      if (!jaTemLouvor) {
        const sessaoLouvor = {
          id: uid(),
          seedId: "galeria-louvor-1",
          titulo: "Louvor Avivar",
          data: "2026-09-26",
          videos: [],
          fotos: [
            LOUVOR_LOGO,
            "/48-louvor-avivar.jpg",
            "/49-louvor-avivar.jpg",
            "/50-louvor-avivar.jpg",
            "/51-louvor-avivar.jpg",
            "/52-louvor-avivar.jpg",
            "/53-louvor-avivar.jpg",
            "/54-louvor-avivar.jpg",
            "/55-louvor-avivar.jpg",
            "/56-louvor-avivar.jpg",
            "/57-louvor-avivar.jpg",
            "/58-louvor-avivar.jpg",
            "/59-louvor-avivar.jpg",
            "/60-louvor-avivar.jpg",
            "/61-louvor-avivar.jpg",
          ],
        };
        const mergedGaleria2 = [...(galeria || []), sessaoLouvor];
        setGaleria(mergedGaleria2);
        saveKey("avivar:galeria", mergedGaleria2);
      }
      todo.galeriaLouvor1 = true;
    }
    if (!seeds.estudos1) {
      const jaTemEstudo = (estudos || []).some((e) => e.seedId && e.seedId.startsWith("estudo-"));
      if (!jaTemEstudo) {
        const novosEstudos = [
          {
            id: uid(),
            seedId: "estudo-samaritano",
            titulo: "O Bom Samaritano: amor que atravessa barreiras",
            referencia: "Lucas 10:25-37",
            imageUrl: "",
            conteudo:
              "Um mestre da lei pergunta a Jesus quem é o seu próximo, esperando talvez uma resposta que limitasse seu dever de amar. Jesus responde com uma história: um homem é espancado e deixado à beira do caminho; um sacerdote e um levita — pessoas religiosas, que conheciam a Lei — passam de largo. Quem para para ajudar é um samaritano, alguém que os judeus da época tratavam com desprezo.\n\nA parábola vira a pergunta original de cabeça para baixo. Em vez de responder \"quem é meu próximo\", Jesus mostra o que significa \"ser\" próximo de alguém: enxergar a dor concreta de quem está diante de nós, mesmo quando isso custa tempo, dinheiro e conforto. O samaritano cuida do ferido, paga sua estadia numa hospedaria e promete voltar — misericórdia prática, não apenas sentimento.\n\nPara a vida da igreja hoje, o convite permanece o mesmo: o amor cristão não escolhe quem merece ser ajudado com base em religião, nacionalidade ou aparência. Ele se define pela disposição de parar o que se está fazendo diante da necessidade real de alguém — vizinho, estranho ou até quem normalmente rejeitaríamos.",
          },
          {
            id: uid(),
            seedId: "estudo-videira",
            titulo: "A Videira e os Ramos: permanecer em Cristo",
            referencia: "João 15:1-8",
            imageUrl: "",
            conteudo:
              "Na véspera da cruz, Jesus usa uma imagem simples e conhecida de seus discípulos: Ele é a videira verdadeira, o Pai é o agricultor, e nós somos os ramos. Um ramo separado da videira não tem vida própria — ele simplesmente seca. É uma imagem de dependência, não de esforço isolado.\n\nJesus repete o verbo \"permanecer\" várias vezes nessa passagem: permanecer nEle é a condição para dar fruto. Isso muda a forma como entendemos a vida espiritual — ela não é primariamente sobre produzir resultados por conta própria, mas sobre manter uma ligação viva e constante com Cristo, através da oração, da Palavra e da obediência, deixando que a seiva da graça sustente o que fazemos.\n\nO agricultor também poda os ramos que já dão fruto, para que deem mais fruto ainda — um lembrete de que até o crescimento espiritual maduro passa por momentos de corte e ajuste na mão de Deus. O convite da passagem é simples e prático: antes de tentar produzir mais para Deus, verifique se está genuinamente permanecendo nEle.",
          },
          {
            id: uid(),
            seedId: "estudo-frutoespirito",
            titulo: "O Fruto do Espírito: uma vida transformada",
            referencia: "Gálatas 5:22-23",
            imageUrl: "",
            conteudo:
              "Paulo escreve aos gálatas contrastando as \"obras da carne\" com o \"fruto do Espírito\" — não os \"frutos\", no plural, mas um único fruto com várias características: amor, alegria, paz, paciência, amabilidade, bondade, fidelidade, mansidão e domínio próprio. É um conjunto integrado, o retrato do caráter que o Espírito Santo forma em quem anda com Ele.\n\nDiferente de um dom espiritual, que pode variar de pessoa para pessoa, o fruto do Espírito é o resultado esperado na vida de todo cristão — assim como uma árvore saudável naturalmente produz fruto, sem se esforçar artificialmente por isso. O texto sugere que esse caráter cresce organicamente à medida que vivemos em comunhão com o Espírito, não como uma lista de regras a cumprir por força de vontade.\n\nÉ um convite ao exame honesto: não se trata de perguntar quantos dons espirituais alguém tem, mas se amor, paz e domínio próprio estão de fato aparecendo no dia a dia — em casa, no trabalho, na igreja. Onde falta fruto, a resposta bíblica não é tentar mais, mas permanecer mais perto da fonte.",
          },
        ];
        const mergedEstudos = [...(estudos || []), ...novosEstudos];
        setEstudos(mergedEstudos);
        saveKey("avivar:estudos", mergedEstudos);
      }
      todo.estudos1 = true;
    }
    if (!seeds.escalaObreiros1) {
      // Obreiros/postos/horários padrão da Escala de Obreiros — só populam se o
      // registro ainda estiver vazio; depois disso o admin controla livremente.
      if (!escala || !escala.obreiros || escala.obreiros.length === 0) {
        setEscala(DEFAULT_ESCALA_OBREIROS);
        saveKey("avivar:escalaObreiros", DEFAULT_ESCALA_OBREIROS);
      }
      todo.escalaObreiros1 = true;
    }
    if (Object.keys(todo).length > 0) {
      const merged = { ...seeds, ...todo };
      setSeeds(merged);
      saveKey("avivar:seeds", merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const persist = {
    site: (v) => { setSite(v); saveKey("avivar:site", v); },
    codigos: (v) => { setCodigos(v); saveKey("avivar:codigos", v); },
    eventos: (v) => { setEventos(v); saveKey("avivar:eventos", v); },
    galeria: (v) => { setGaleria(v); saveKey("avivar:galeria", v); },
    aoVivo: (v) => { setAoVivo(v); saveKey("avivar:aovivo", v); },
    transmissoesPassadas: (v) => { setTransmissoesPassadas(v); saveKey("avivar:transmissoespassadas", v); },
    operatorCodes: (v) => { setOperatorCodes(v); saveKey("avivar:operatorcodes", v); },
    oracaoEncontros: (v) => { setOracaoEncontros(v); saveKey("avivar:oracaoencontros", v); },
    doacoes: (v) => { setDoacoes(v); saveKey("avivar:doacoes", v); },
    loja: (v) => { setLoja(v); saveKey("avivar:loja", v); },
    igrejas: (v) => { setIgrejas(v); saveKey("avivar:igrejas", v); },
    colaboradores: (v) => { setColaboradores(v); saveKey("avivar:colaboradores", v); },
    estudos: (v) => { setEstudos(v); saveKey("avivar:estudos", v); },
    avivarNews: (v) => { setAvivarNews(v); saveKey("avivar:avivarnews", v); },
    visitantes: (v) => { setVisitantes(v); saveKey("avivar:visitantes", v); },
    oracoes: (v) => { setOracoes(v); saveKey("avivar:oracoes", v); },
    mensagens: (v) => { setMensagens(v); saveKey("avivar:mensagens", v); },
    forum: (v) => { setForumPosts(v); saveKey("avivar:forum", v); },
    caixa: (v) => { setCaixa(v); saveKey("avivar:caixa", v); },
    bens: (v) => { setBens(v); saveKey("avivar:bens", v); },
    membros: (v) => { setMembros(v); saveKey("avivar:membros", v); },
    repertorio: (v) => { setRepertorio(v); saveKey("avivar:repertorio", v); },
    albuns: (v) => { setAlbuns(v); saveKey("avivar:albuns", v); },
    escala: (v) => { setEscala(v); saveKey("avivar:escalaObreiros", v); },
    manchete: (v) => { setManchete(v); saveKey("avivar:manchete", v); },
    pedidosOracao: (v) => { setPedidosOracao(v); saveKey("avivar:pedidosOracao", v); },
    biblioteca: (v) => { setBiblioteca(v); saveKey("avivar:biblioteca", v); },
    musicos: (v) => { setMusicos(v); saveKey("avivar:musicos", v); },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.parchment }}>
        <FlameMark size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body" style={{ background: C.parchment, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Tangerine:wght@700&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @font-face {
          font-family: "PhotographSignature";
          src: url("/62-photograph-signature.ttf") format("truetype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        html { scroll-behavior: smooth; }
        @keyframes navPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(107,47,165,0.55); } 50% { box-shadow: 0 0 0 6px rgba(107,47,165,0); } }
        .nav-pulse { animation: navPulse 2.4s ease-in-out infinite; }
        .nav-pulse:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .nav-pulse { animation: none; } }
        .font-display { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Playfair Display', serif; font-weight: 700; }
        .font-body { font-family: 'Public Sans', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        @keyframes marquee { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .marquee-track { animation: marquee 14s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }
        @keyframes noticiasMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .noticias-marquee { animation: noticiasMarquee 30s linear infinite; width: max-content; }
        .noticias-marquee:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .noticias-marquee { animation: none; } }
      `}</style>

      <NavBar page={page} setPage={scrollToSection} adminMode={adminMode} churchName={site.churchName} onAdminClick={() => (adminMode ? setAdminMode(false) : setGateOpen(true))} />
      <NoticiasCarousel />
      <SideCarousel photos={sideCarouselPhotos} setPage={scrollToSection} />
      <Forum posts={forumPosts} addPost={(p) => persist.forum([...forumPosts, p])} />

      <main className="lg:ml-[200px] lg:mr-[280px]">
        <section id="home"><Home site={site} setPage={scrollToSection} visitantes={visitantes} saveSite={persist.site} adminMode={adminMode} aoVivo={aoVivo} oracaoEncontros={oracaoEncontros} avivarNews={avivarNews} doacoes={doacoes} manchete={manchete} saveManchete={persist.manchete} /></section>
        <section id="codigos" className="scroll-mt-24"><CodigosAvivar data={codigos} save={persist.codigos} adminMode={adminMode} loja={loja} saveLoja={persist.loja} avivarNews={avivarNews} setPage={scrollToSection} /></section>
        <section id="eventos" className="scroll-mt-24"><EventosGaleria eventos={eventos} saveEventos={persist.eventos} galeria={galeria} saveGaleria={persist.galeria} adminMode={adminMode} setManchete={persist.manchete} /></section>
        <section id="aovivo" className="scroll-mt-24"><AoVivo data={aoVivo} save={persist.aoVivo} passadas={transmissoesPassadas} savePassadas={persist.transmissoesPassadas} news={avivarNews} saveNews={persist.avivarNews} adminMode={adminMode} /></section>
        <section id="igrejas" className="scroll-mt-24"><Igrejas igrejas={igrejas} save={persist.igrejas} adminMode={adminMode} /></section>
        <section id="colaboradores" className="scroll-mt-24"><Colaboradores items={colaboradores} save={persist.colaboradores} adminMode={adminMode} /></section>
        <section id="escala" className="scroll-mt-24"><EscalaObreiros data={escala} save={persist.escala} adminMode={adminMode} operatorMode={operatorMode} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="estudos" className="scroll-mt-24"><Estudos items={estudos} save={persist.estudos} adminMode={adminMode} /></section>
        <section id="loja" className="scroll-mt-24"><Loja items={loja} save={persist.loja} adminMode={adminMode} /></section>
        <section id="biblioteca" className="scroll-mt-24"><BibliotecaAvivar items={biblioteca} save={persist.biblioteca} adminMode={adminMode} setPage={scrollToSection} /></section>
        <section id="doacoes" className="scroll-mt-24"><Doacoes data={doacoes} save={persist.doacoes} adminMode={adminMode} /></section>
        <section id="visitantes" className="scroll-mt-24"><Visitantes items={visitantes} save={persist.visitantes} refresh={() => loadKey("avivar:visitantes", []).then(setVisitantes)} adminMode={adminMode} operatorMode={operatorMode} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="oracoes" className="scroll-mt-24"><OracoesLares items={oracoes} save={persist.oracoes} encontros={oracaoEncontros} saveEncontros={persist.oracaoEncontros} adminMode={adminMode} operatorMode={operatorMode} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="pedidooracao" className="scroll-mt-24"><PedidoOracao items={pedidosOracao} save={persist.pedidosOracao} adminMode={adminMode} /></section>
        <section id="membros" className="scroll-mt-24"><Membros items={membros} save={persist.membros} adminMode={adminMode} operatorMode={operatorMode} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="avivarmusic" className="scroll-mt-24"><AvivarMusic repertorio={repertorio} saveRepertorio={persist.repertorio} musicos={musicos} saveMusicos={persist.musicos} albuns={albuns} saveAlbuns={persist.albuns} adminMode={adminMode} /></section>
        <section id="caixa" className="scroll-mt-24"><Caixa items={caixa} save={persist.caixa} adminMode={adminMode} /></section>
        <section id="operadores" className="scroll-mt-24"><OperadoresAdmin codes={operatorCodes} save={persist.operatorCodes} adminMode={adminMode} /></section>
        <section id="bens" className="scroll-mt-24"><Bens items={bens} save={persist.bens} adminMode={adminMode} /></section>
        <section id="contato" className="scroll-mt-24"><Contato items={mensagens} save={persist.mensagens} adminMode={adminMode} /></section>
      </main>

      <Footer churchName={site.churchName} />

      {gateOpen && (
        <AdminGateModal
          onClose={() => setGateOpen(false)}
          onSuccess={() => {
            setAdminMode(true);
            setGateOpen(false);
          }}
        />
      )}
      {operatorGateOpen && (
        <OperatorGateModal
          operatorCodes={operatorCodes}
          onClose={() => setOperatorGateOpen(false)}
          onSuccess={() => {
            setOperatorMode(true);
            setOperatorGateOpen(false);
          }}
        />
      )}
    </div>
  );
}
