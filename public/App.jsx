import React, { useState, useEffect, useMemo } from "react";
import {
  Flame, Menu, X, ChevronLeft, ChevronRight, Lock, Unlock, Plus, Trash2,
  Phone, Calendar, Clock, MapPin, Video, Image as ImageIcon, Users, Church,
  BookOpen, Radio, MessageCircle, Home as HomeIcon, Mail, ShieldCheck,
  KeyRound, LogOut, Send, HandHeart, ChevronDown, Sparkles, ShoppingBag,
  Music, Wallet, Package, UserPlus, Copy, Gift, CreditCard
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
  stone: "#8A8272",
  line: "#00000018",
};

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
const ORACOES_BANNER = "/oracoes-banner.jpg";
const ESTUDOS_BANNER = "/estudos-banner.jpg";
const VISITANTES_BANNER = "/visitantes-banner.jpg";
const LOJA_BANNER = "/loja-avivar-banner.jpg";
const COLABORADORES_BANNER = "/colaboradores-banner.jpg";
const BIBLIA_DESTAQUE_BANNER = "/biblia-avivar-destaque.jpg";
const BIBLIA_URL = "https://biblia-avivar.vercel.app";

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
      .sub { font-size: 12px; color: #8A8272; margin-bottom: 16px; }
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
const DEFAULT_DOACOES = { pixKey: "codigosavivar2026@gmail.com", mercadoPagoUrl: "" };

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
  if (url) return <img src={url} alt={alt} className={className} />;
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
  { key: "estudos", label: "Estudos Bíblicos", icon: BookOpen },
  { key: "loja", label: "Loja Avivar", icon: ShoppingBag },
  { key: "doacoes", label: "Doações", icon: Send },
  { key: "membros", label: "Membros", icon: UserPlus },
  { key: "avivarmusic", label: "Avivar Music", icon: Music },
  { key: "visitantes", label: "Visitantes", icon: HandHeart },
  { key: "oracoes", label: "Orações nos Lares", icon: Sparkles },
];
const ADMIN_MENU = [
  { key: "caixa", label: "Caixa", icon: Wallet },
  { key: "bens", label: "Bens", icon: Package },
  { key: "operadores", label: "Operadores", icon: KeyRound },
];

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
  const pillStyle = (active) => ({
    background: active ? C.purpleDeep : C.purple,
    color: "#fff",
  });
  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: C.black, borderColor: C.gold + "55" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
        <button onClick={() => go("home")} className="flex items-center gap-3 focus:outline-none focus:ring-2 rounded-md p-1">
          <img src={LOGO_ICON} alt={churchName} className="h-12 w-auto" />
          <span className="leading-none" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: "10px", color: C.goldBright }}>
            <span className="block">Avivar</span>
            <span className="block">do</span>
            <span className="block">Espírito</span>
          </span>
        </button>
        <nav className="hidden lg:flex items-center gap-2">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => go(n.key)} className="nav-pulse px-3.5 py-1.5 text-sm font-semibold rounded-full transition focus:outline-none focus:ring-2" style={pillStyle(page === n.key)}>
              {n.label}
            </button>
          ))}
          <button onClick={onAdminClick} className="ml-2 p-2 rounded-full focus:outline-none focus:ring-2" title={adminMode ? "Sair do modo admin" : "Entrar como admin"} style={{ background: adminMode ? C.gold : "transparent", color: adminMode ? C.black : C.gold }}>
            {adminMode ? <ShieldCheck size={16} /> : <Lock size={16} />}
          </button>
        </nav>
        <button className="lg:hidden p-2" onClick={() => setOpen((v) => !v)} style={{ color: C.gold }}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Barra de submenu — sempre visível no desktop, sem esconder num dropdown */}
      <div className="hidden lg:flex items-center gap-2 flex-wrap max-w-6xl mx-auto px-4 sm:px-6 pb-3">
        {SUBMENU.map((n) => (
          <button key={n.key} onClick={() => go(n.key)} className="nav-pulse px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 focus:outline-none focus:ring-2" style={pillStyle(page === n.key)}>
            <n.icon size={12} /> {n.label}
          </button>
        ))}
        {adminMode && ADMIN_MENU.map((n) => (
          <button key={n.key} onClick={() => go(n.key)} className="nav-pulse px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 focus:outline-none focus:ring-2" style={{ background: C.goldDeep, color: "#fff" }}>
            <n.icon size={12} /> {n.label}
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
  const [idx, setIdx] = useState(0);
  const total = photos ? photos.length : 0;
  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(() => setIdx((v) => (v + 1) % total), 4000);
    return () => clearInterval(t);
  }, [total]);

  if (total === 0) return null;
  const photo = photos[idx % total];

  return (
    <div className="hidden lg:flex fixed left-3 top-24 bottom-8 z-30 w-28 flex-col">
      <button onClick={() => setPage(photo.target)} className="flex-1 relative rounded-md overflow-hidden shadow-xl focus:outline-none" style={{ background: "#000" }}>
        <div className="absolute inset-0" style={{ left: 12, right: 12 }}>
          <img src={photo.url} alt="" className="w-full h-full object-cover" />
        </div>
        <FilmSprockets side="left" />
        <FilmSprockets side="right" />
        <div className="absolute bottom-0 left-3 right-3 p-1.5 text-center" style={{ background: "#000000cc" }}>
          <p className="text-[9px] text-white font-mono truncate">{photo.label}</p>
        </div>
      </button>
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
      <div className="hidden lg:flex fixed right-0 top-32 bottom-8 w-64 z-30 rounded-l-xl border shadow-xl flex-col" style={{ background: C.cream, borderColor: C.line }}>
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
function QuickCard({ icon: Icon, title, desc, onClick, tone = "gold", className = "", bgImage }) {
  const bg = tone === "violet" ? C.violet : tone === "red" ? C.liveRed : C.gold;
  const border = tone === "violet" ? C.violetDeep : tone === "red" ? "#8A241B" : C.goldDeep;
  return (
    <button
      onClick={onClick}
      className={`relative text-left p-6 min-h-[220px] max-w-[260px] w-full mx-auto rounded-xl border transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 overflow-hidden ${className}`}
      style={{ background: bgImage ? C.black : bg, borderColor: border, color: "#fff" }}
    >
      {bgImage && (
        <>
          <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-contain" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #00000033, #000000AA)" }} />
        </>
      )}
      {!bgImage && (
        <div className="relative">
          <Icon size={26} color="#fff" />
          <h3 className="font-display font-bold uppercase tracking-wide mt-3 text-white text-base">{title}</h3>
          <p className="text-sm mt-1.5 opacity-90 text-white">{desc}</p>
        </div>
      )}    </button>
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

function OracaoDestaqueCard({ encontros, onClick }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (encontros.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % encontros.length), 6000);
    return () => clearInterval(t);
  }, [encontros.length]);

  return (
    <button onClick={onClick} className="rounded-xl overflow-hidden border-2 shadow-xl text-left focus:outline-none focus:ring-2" style={{ borderColor: C.purple }}>
      <div className="relative pt-7 pb-3 px-4 text-center" style={{ background: C.purpleDeep }}>
        <div className="absolute left-1/2 -translate-x-1/2 -top-3.5 w-0 h-0" style={{ borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderBottom: `22px solid ${C.purple}` }} />
        <Church size={20} color="#fff" className="mx-auto mb-1" />
        <p className="text-[10px] font-mono uppercase tracking-wide" style={{ color: "#ffffffaa" }}>Oração nos Lares</p>
      </div>
      {encontros.length === 0 ? (
        <div className="p-4 text-xs text-center" style={{ background: C.cream, color: C.stone }}>Nenhum encontro cadastrado ainda — toque pra saber mais.</div>
      ) : (
        <div className="p-3 text-xs space-y-1" style={{ background: C.cream }}>
          <p className="font-display font-semibold text-sm" style={{ color: C.ink }}>{encontros[idx].anfitriao}</p>
          <p style={{ color: C.ink }}><strong>{encontros[idx].diaSemana}</strong> · {fmtDate(encontros[idx].data)} · {encontros[idx].hora}</p>
          <p style={{ color: C.stone }}>{encontros[idx].endereco}</p>
          {encontros[idx].contato && <p style={{ color: C.stone }}>Contato: {encontros[idx].contato}</p>}
          {encontros.length > 1 && <p className="text-[10px] font-mono pt-1" style={{ color: C.purple }}>{idx + 1} de {encontros.length} encontros</p>}
        </div>
      )}
    </button>
  );
}

function Home({ site, setPage, visitantes, saveSite, adminMode, aoVivo, oracaoEncontros }) {
  const recentVisitors = [...visitantes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);
  const homeCards = site.homeCards || DEFAULT_HOMECARDS;
  return (
    <div>
      <div className="relative h-[46vh] sm:h-[52vh] overflow-hidden" style={{ background: C.black }}>
        <img src={HERO_BANNER} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(3px) brightness(0.45)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #00000066, #1F1B2ECC)" }} />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-script text-5xl sm:text-7xl" style={{ color: C.goldBright }}>{site.churchName}</h1>
          <p className="mt-3 text-sm sm:text-base max-w-xl" style={{ color: "#ffffffdd" }}>
            Um ministério comprometido em resgatar vidas, restaurar corações e avivar a Igreja com o poder do Espírito Santo.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LiveHomeCard aoVivo={aoVivo} onClick={() => setPage("aovivo")} />
        <FeaturedBibliaCard onClick={() => window.open(BIBLIA_URL, "_blank", "noopener,noreferrer")} />
        <OracaoDestaqueCard encontros={oracaoEncontros} onClick={() => setPage("oracoes")} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
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
            />
          );
        })}
      </div>

      {adminMode && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <HomeCardsAdmin cards={homeCards} onSave={(v) => saveSite({ ...site, homeCards: v })} />
        </div>
      )}

      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 grid md:grid-cols-[1.4fr_1fr] gap-8 items-start">
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
function CodigosAvivar({ data, save, adminMode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [holderName, setHolderName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [err, setErr] = useState("");
  const [showAccessMgmt, setShowAccessMgmt] = useState(false);
  const [selectedTema, setSelectedTema] = useState(null);

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
      <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ background: C.violetDeep }}>
        <div className="w-full max-w-sm text-center">
          <FlameMark size={36} color={C.gold} />
          <h2 className="font-display text-2xl font-semibold mt-4 text-white">Códigos Avivar</h2>
          <p className="text-sm mt-2" style={{ color: "#D9D2EA" }}>
            Área restrita a pessoas cadastradas. Informe seu nome e o código de acesso gerado para você.
          </p>
          <div className="mt-6 space-y-3 text-left">
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

function EventosGaleria({ eventos, saveEventos, galeria, saveGaleria, adminMode }) {
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
          <Carousel slides={eventos.map((e) => ({ ...e, titulo: e.titulo, subtitulo: `${fmtDate(e.data)} · ${e.hora || ""}` }))} onSlideClick={(e) => setSelected(eventos.find((x) => x.id === e.id))} height="h-72" />
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
            </div>
          )}
          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            {eventos.map((e) => (
              <div key={e.id} className="p-4 rounded-lg border flex justify-between items-start" style={{ borderColor: C.line }}>
                <div>
                  <p className="font-display font-semibold">{e.titulo}</p>
                  <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDate(e.data)} · {e.hora} · {e.local}</p>
                </div>
                {adminMode && <button onClick={() => delEvento(e.id)}><Trash2 size={15} color={C.stone} /></button>}
              </div>
            ))}
          </div>
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
                {adminMode && <button onClick={() => delSessao(g.id)}><Trash2 size={15} color={C.stone} /></button>}
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
  const addPassada = (v) => savePassadas([...passadas, { id: uid(), ...v }]);
  const delPassada = (id) => savePassadas(passadas.filter((p) => p.id !== id));
  const sortedPassadas = [...passadas].sort((a, b) => new Date(b.data) - new Date(a.data));

  const addNews = (v) => saveNews([...news, { id: uid(), ...v, timestamp: nowISO() }]);
  const delNews = (id) => saveNews(news.filter((n) => n.id !== id));
  const sortedNews = [...news].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: data.isLive ? "#E14D3A" : C.stone, boxShadow: data.isLive ? "0 0 0 4px #E14D3A33" : "none" }} />
        <Eyebrow color={data.isLive ? "#E14D3A" : C.stone}>{data.isLive ? "AO VIVO AGORA" : "Sem transmissão no momento"}</Eyebrow>
      </div>
      <SectionTitle>Ao Vivo</SectionTitle>

      {data.isLive && data.embedUrl ? (
        <div className="aspect-video rounded-xl overflow-hidden bg-black mt-6">
          <iframe title="ao-vivo" src={getEmbedUrl(data.embedUrl)} className="w-full h-full" allowFullScreen />
        </div>
      ) : (
        <div className="mt-6"><Empty text={data.mensagem} /></div>
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

      {/* Transmissões anteriores */}
      <div className="mt-14 pt-8 border-t" style={{ borderColor: C.line }}>
        <Eyebrow>Já se passou</Eyebrow>
        <h3 className="font-display text-2xl font-semibold" style={{ color: C.ink }}>Transmissões Anteriores</h3>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {sortedPassadas.length === 0 && <Empty text="Nenhuma transmissão anterior cadastrada ainda." />}
          {sortedPassadas.map((p) => (
            <div key={p.id} className="rounded-lg border overflow-hidden" style={{ borderColor: C.line }}>
              <div className="aspect-video bg-black">
                <iframe title={p.titulo} src={getEmbedUrl(p.videoUrl)} className="w-full h-full" allowFullScreen />
              </div>
              <div className="p-3 flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{p.titulo}</p>
                  <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDate(p.data)}</p>
                </div>
                {adminMode && <button onClick={() => delPassada(p.id)}><Trash2 size={14} color={C.stone} /></button>}
              </div>
            </div>
          ))}
        </div>
        {adminMode && (
          <div className="mt-4">
            <DynamicForm fields={PASSADA_FIELDS} onSubmit={(v) => v.titulo && addPassada(v)} submitLabel="Adicionar transmissão" />
          </div>
        )}
      </div>

      {/* Avivar News */}
      <div className="mt-14 pt-8 border-t" style={{ borderColor: C.line }}>
        <Eyebrow>Reportagens do ministério</Eyebrow>
        <h3 className="font-display text-2xl font-semibold" style={{ color: C.ink }}>Avivar News</h3>
        {sortedNews.length === 0 && <div className="mt-4"><Empty text="Nenhuma reportagem publicada ainda." /></div>}
        <div className="space-y-6 mt-4">
          {sortedNews.map((n) => (
            <div key={n.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
              {n.imageUrl && <ImgOrPlaceholder url={n.imageUrl} alt={n.titulo} className="w-full h-48 object-cover" />}
              <div className="p-5">
                <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDateTime(n.timestamp)}</p>
                <h4 className="font-display font-semibold text-lg mt-1">{n.titulo}</h4>
                {n.videoUrl && (
                  <div className="aspect-video rounded-md overflow-hidden bg-black mt-3">
                    <iframe title={n.titulo} src={getEmbedUrl(n.videoUrl)} className="w-full h-full" allowFullScreen />
                  </div>
                )}
                {n.texto && <p className="text-sm mt-3 whitespace-pre-line" style={{ color: C.ink }}>{n.texto}</p>}
                {adminMode && <button onClick={() => delNews(n.id)} className="text-xs underline mt-3" style={{ color: "#B03428" }}>excluir</button>}
              </div>
            </div>
          ))}
        </div>
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
      <div className="w-full h-48 sm:h-64 overflow-hidden">
        <ImgOrPlaceholder url={LOJA_BANNER} alt="Loja Avivar" className="w-full h-full object-cover" ph="Banner Loja Avivar — adicionar depois" />
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
/* Doações                                                              */
/* ---------------------------------------------------------------- */
function PixCard({ icon: Icon, titulo, desc, pixKey, mercadoPagoUrl }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    if (!pixKey) return;
    navigator.clipboard?.writeText(pixKey).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };
  return (
    <div className="p-5 rounded-xl border" style={{ borderColor: C.line }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={18} color={C.ember} />
        <p className="font-display font-semibold">{titulo}</p>
      </div>
      <p className="text-xs mb-3" style={{ color: C.stone }}>{desc}</p>
      <p className="text-xs font-mono uppercase" style={{ color: C.stone }}>Chave PIX</p>
      <p className="text-sm font-mono break-all mt-0.5" style={{ color: C.ink }}>{pixKey || "Chave PIX ainda não cadastrada"}</p>
      <div className="flex gap-2 mt-3">
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
    </div>
  );
}

function Doacoes({ data, save, adminMode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><HandHeart size={12} className="inline mr-1" />Semeando com generosidade</Eyebrow>
      <SectionTitle>Dízimos e Ofertas</SectionTitle>
      <p className="text-sm mt-2" style={{ color: C.stone }}>Sua contribuição sustenta a obra do Ministério Avivar do Espírito.</p>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <PixCard icon={HandHeart} titulo="Dízimo" desc="A décima parte, como ato de fidelidade e adoração." pixKey={data.pixKey} mercadoPagoUrl={data.mercadoPagoUrl} />
        <PixCard icon={Gift} titulo="Oferta" desc="Uma contribuição voluntária, além do dízimo." pixKey={data.pixKey} mercadoPagoUrl={data.mercadoPagoUrl} />
      </div>

      {adminMode && (
        <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
          <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · configurar doações (mesma chave usada pra Dízimo e Oferta)</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Chave PIX"><input className={inputCls} style={{ borderColor: C.line }} value={data.pixKey} onChange={(e) => save({ ...data, pixKey: e.target.value })} /></Field>
            <Field label="Link Mercado Pago"><input className={inputCls} style={{ borderColor: C.line }} value={data.mercadoPagoUrl} onChange={(e) => save({ ...data, mercadoPagoUrl: e.target.value })} /></Field>
          </div>
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
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
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Quem serve conosco</Eyebrow>
      <SectionTitle>Colaboradores</SectionTitle>
      {items.length === 0 && <div className="mt-6"><Empty text="Nenhum colaborador cadastrado ainda." /></div>}
      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {items.map((c) => (
          <div key={c.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.line, background: C.parchment }}>
            <ImgOrPlaceholder url={c.fotoUrl} alt={c.nome} className="w-full h-64 object-contain" ph={c.nome} />
            <div className="p-3" style={{ background: C.parchment }}>
              <p className="font-display font-semibold text-sm">{c.nome}</p>
              <p className="text-xs" style={{ color: C.ember }}>{c.cargo}</p>
              <p className="text-xs mt-1" style={{ color: C.stone }}>{c.ministerio}</p>
              {c.telefone && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: C.stone }}><Phone size={11} />{c.telefone}</p>}
              {adminMode && <button onClick={() => del(c.id)} className="text-xs underline mt-2" style={{ color: "#B03428" }}>excluir</button>}
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
/* Estudos Bíblicos                                                     */
/* ---------------------------------------------------------------- */
const ESTUDO_FIELDS = [
  { key: "titulo", label: "Título do estudo" },
  { key: "referencia", label: "Referência bíblica" },
  { key: "conteudo", label: "Conteúdo / resumo", type: "textarea" },
];

function Estudos({ items, save, adminMode }) {
  const add = (v) => save([...items, { id: uid(), ...v }]);
  const del = (id) => save(items.filter((i) => i.id !== id));
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Palavra e vida</Eyebrow>
      <SectionTitle>Estudos Bíblicos</SectionTitle>
      {items.length === 0 && <div className="mt-6"><Empty text="Nenhum estudo publicado ainda." /></div>}
      <div className="space-y-4 mt-6">
        {items.map((e) => (
          <div key={e.id} className="p-4 rounded-lg border" style={{ borderColor: C.line }}>
            <p className="font-display font-semibold">{e.titulo}</p>
            <p className="text-xs font-mono" style={{ color: C.ember }}>{e.referencia}</p>
            <p className="text-sm mt-2" style={{ color: C.ink }}>{e.conteudo}</p>
            {adminMode && <button onClick={() => del(e.id)} className="text-xs underline mt-2" style={{ color: "#B03428" }}>excluir</button>}
          </div>
        ))}
      </div>
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
                <div className="grid grid-cols-3 gap-1 px-2 pb-2">
                  {e.fotos.map((f, idx) => (
                    <div key={idx} className="relative">
                      <img src={f} className="w-full h-16 object-cover rounded" />
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

function AvivarMusic({ repertorio, saveRepertorio, musicos, saveMusicos, adminMode }) {
  const [tab, setTab] = useState("repertorio");

  const addCulto = (v) => saveRepertorio([...repertorio, { id: uid(), musicas: [], ...v }]);
  const delCulto = (id) => saveRepertorio(repertorio.filter((c) => c.id !== id));
  const addMusica = (cultoId, v) =>
    saveRepertorio(repertorio.map((c) => (c.id === cultoId ? { ...c, musicas: [...c.musicas, { id: uid(), ...v }] } : c)));
  const delMusica = (cultoId, musicaId) =>
    saveRepertorio(repertorio.map((c) => (c.id === cultoId ? { ...c, musicas: c.musicas.filter((m) => m.id !== musicaId) } : c)));

  const addMusico = (v) => saveMusicos([...musicos, { id: uid(), ...v }]);
  const delMusico = (id) => saveMusicos(musicos.filter((m) => m.id !== id));

  const sortedCultos = [...repertorio].sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><Sparkles size={12} className="inline mr-1" />Grupo de louvor</Eyebrow>
      <SectionTitle>Avivar Music</SectionTitle>

      <div className="flex gap-2 mt-6 mb-6">
        {["repertorio", "musicos"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-md text-sm font-medium capitalize" style={{ background: tab === t ? C.gold : "transparent", color: tab === t ? "#fff" : C.ink, border: `1px solid ${C.gold}55` }}>
            {t === "repertorio" ? "Repertório" : "Músicos"}
          </button>
        ))}
      </div>

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
                  <div key={m.id} className="p-3 rounded-lg" style={{ background: C.parchment }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{m.titulo} {m.tom && <span className="font-mono text-xs" style={{ color: C.ember }}>· Tom: {m.tom}</span>}</p>
                        {m.grupo && <p className="text-xs" style={{ color: C.stone }}>{m.grupo}</p>}
                      </div>
                      {adminMode && <button onClick={() => delMusica(c.id, m.id)}><Trash2 size={13} color={C.stone} /></button>}
                    </div>
                    {m.youtubeUrl && (
                      <a href={m.youtubeUrl} target="_blank" rel="noreferrer" className="text-xs underline mt-1 inline-block" style={{ color: C.ember }}>ver no YouTube</a>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    return photos;
  }, [galeria, colaboradores, oracaoEncontros]);

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
      setLoading(false);
    })();
  }, []);

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
      `}</style>

      <NavBar page={page} setPage={scrollToSection} adminMode={adminMode} churchName={site.churchName} onAdminClick={() => (adminMode ? setAdminMode(false) : setGateOpen(true))} />
      <SideCarousel photos={sideCarouselPhotos} setPage={scrollToSection} />
      <Forum posts={forumPosts} addPost={(p) => persist.forum([...forumPosts, p])} />

      <main className="lg:ml-[140px] lg:mr-[272px]">
        <section id="home"><Home site={site} setPage={scrollToSection} visitantes={visitantes} saveSite={persist.site} adminMode={adminMode} aoVivo={aoVivo} oracaoEncontros={oracaoEncontros} /></section>
        <section id="codigos" className="scroll-mt-24"><CodigosAvivar data={codigos} save={persist.codigos} adminMode={adminMode} /></section>
        <section id="eventos" className="scroll-mt-24"><EventosGaleria eventos={eventos} saveEventos={persist.eventos} galeria={galeria} saveGaleria={persist.galeria} adminMode={adminMode} /></section>
        <section id="aovivo" className="scroll-mt-24"><AoVivo data={aoVivo} save={persist.aoVivo} passadas={transmissoesPassadas} savePassadas={persist.transmissoesPassadas} news={avivarNews} saveNews={persist.avivarNews} adminMode={adminMode} /></section>
        <section id="igrejas" className="scroll-mt-24"><Igrejas igrejas={igrejas} save={persist.igrejas} adminMode={adminMode} /></section>
        <section id="colaboradores" className="scroll-mt-24"><Colaboradores items={colaboradores} save={persist.colaboradores} adminMode={adminMode} /></section>
        <section id="estudos" className="scroll-mt-24"><Estudos items={estudos} save={persist.estudos} adminMode={adminMode} /></section>
        <section id="loja" className="scroll-mt-24"><Loja items={loja} save={persist.loja} adminMode={adminMode} /></section>
        <section id="doacoes" className="scroll-mt-24"><Doacoes data={doacoes} save={persist.doacoes} adminMode={adminMode} /></section>
        <section id="visitantes" className="scroll-mt-24"><Visitantes items={visitantes} save={persist.visitantes} refresh={() => loadKey("avivar:visitantes", []).then(setVisitantes)} adminMode={adminMode} operatorMode={operatorMode} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="oracoes" className="scroll-mt-24"><OracoesLares items={oracoes} save={persist.oracoes} encontros={oracaoEncontros} saveEncontros={persist.oracaoEncontros} adminMode={adminMode} operatorMode={operatorMode} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="membros" className="scroll-mt-24"><Membros items={membros} save={persist.membros} adminMode={adminMode} operatorMode={operatorMode} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="avivarmusic" className="scroll-mt-24"><AvivarMusic repertorio={repertorio} saveRepertorio={persist.repertorio} musicos={musicos} saveMusicos={persist.musicos} adminMode={adminMode} /></section>
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
