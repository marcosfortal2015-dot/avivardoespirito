import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Flame, Menu, X, ChevronLeft, ChevronRight, Lock, Unlock, Plus, Trash2,
  Phone, Calendar, Clock, MapPin, Video, Image as ImageIcon, Users, Church,
  BookOpen, Radio, MessageCircle, Home as HomeIcon, Mail, ShieldCheck,
  KeyRound, LogOut, Send, HandHeart, ChevronDown, Sparkles, ShoppingBag,
  Music, Wallet, Package, UserPlus, Copy, Gift, CreditCard, PlayCircle, ClipboardList, Library, FileText,
  Truck, Pencil, Save, ArrowLeft, GraduationCap, Tv
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
  purpleLight: "#B39DDB",
  indigo: "#17213B",
  indigoDeep: "#0E1526",
  stone: "#1F1B2E", // era cinza (#8A8272) — pedido do usuário: trocar cinza por preto em todo o site
  line: "#00000018",
};

// Grid reaproveitável de 3 colunas responsivo — usado em todas as seções de cards
// (Estudos Bíblicos, Avivar Music, vitrines, etc.) para manter o padrão visual do site.
const GRID3 = "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5";
// Grid dos cards-menu da Home — reorganizado (set/2026) em exatamente 3 linhas x 3
// colunas, cada célula com o card (imagem) + um pequeno resumo ao lado (HomeCardBlurb).
const GRID_HOMECARDS = "grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6";
// Fundos claros, alternados por coluna, atrás do resumo de cada card da Home.
const CORES_HOMECARDS = ["#FBF1DE" /* creme */, "#E7F0FB" /* azul claro */, "#FBE9F0" /* rosé claro */, "#F3ECDF" /* bege */];

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
const CODIGOS_CURIOSIDADE_AGUA_VINHO = "/63-codigos-curiosidade-agua-vinho.jpg";
const CODIGOS_ARTIGO_ARQUITETURA_CONSCIENCIA = "/64-codigos-artigo-arquitetura-consciencia.jpg";
const CODIGOS_PROFETAS_ULTIMOS_DIAS_BANNER = "/65-codigos-profetas-ultimos-dias-banner.jpg";
const CODIGOS_ARTIGO_PORTAIS_ESPIRITUAIS = "/69-codigos-artigo-portais-espirituais.jpg";
const CODIGOS_ARTIGO_HORAS_DIMENSIONAIS = "/72-codigos-artigo-horas-dimensionais.jpg";
const CODIGOS_ARTIGO_ENERGIA_QUANTICA = "/73-codigos-artigo-energia-quantica.jpg";
const CODIGOS_ARTIGO_DOM_DISCERNIMENTO = "/74-codigos-artigo-dom-discernimento.jpg";
const CODIGOS_ARTIGO_BOM_SAMARITANO = "/75-codigos-artigo-bom-samaritano.jpg";
const CODIGOS_ARTIGO_REFIDIM_MAOS_MOISES = "/76-codigos-artigo-refidim-maos-moises.jpg";

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
  cursos: GraduationCap,
};

// Reorganização pedida pelo Marcos (set/2026): exatamente 3 linhas x 3 colunas,
// cada card com um pequeno resumo ao lado (renderizado pelo componente HomeCardBlurb
// em Home). "Igrejas Avivar" saiu dessa grade — continua acessível pelo menu superior
// (NAV) — porque a lista de 9 cards pedida não a incluiu.
const DEFAULT_HOMECARDS = [
  { key: "oracoes", titulo: "Orações nos Lares", desc: "Peça oração ou visita de intercessão.", resumo: "Agende um encontro com Jesus na sua casa. Iremos com o maior prazer.", imageUrl: ORACOES_BANNER, tone: "violet" },
  { key: "estudos", titulo: "Estudos Bíblicos", desc: "Palavra e vida.", resumo: "Aprofunde-se na Palavra com estudos que edificam a fé e transformam vidas.", imageUrl: ESTUDOS_BANNER, tone: "violet" },
  { key: "biblia", titulo: "Bíblia Avivar", desc: "Leia e ouça as Escrituras.", resumo: "Leia, ouça e medite na Palavra onde você estiver, a qualquer hora do dia.", imageUrl: BIBLIA_DESTAQUE_BANNER, tone: "gold", externalUrl: BIBLIA_URL },
  { key: "colaboradores", titulo: "Colaboradores", desc: "Quem serve conosco.", resumo: "Conheça quem serve com amor em cada área do ministério.", imageUrl: COLABORADORES_BANNER, tone: "violet" },
  { key: "visitantes", titulo: "Visitantes", desc: "Registre sua visita.", resumo: "Sua primeira vez conosco? Cadastre-se e seja bem-vindo à família.", imageUrl: VISITANTES_BANNER, tone: "gold" },
  { key: "eventos", titulo: "Eventos & Galeria", desc: "Agenda e melhores momentos.", resumo: "Confira a agenda de cultos, encontros especiais e os melhores momentos em fotos.", imageUrl: EVENTOS_BANNER, tone: "gold" },
  { key: "codigos", titulo: "Códigos Avivar", desc: "Profecia, ciência e espiritualidade.", resumo: "Profecia, ciência e espiritualidade — revelações para os últimos tempos.", imageUrl: CODIGOS_BANNER, tone: "violet" },
  { key: "loja", titulo: "Loja Avivar", desc: "Livros, roupas e utensílios cristãos.", resumo: "Livros, roupas e utensílios cristãos para fortalecer sua caminhada.", imageUrl: LOJA_BANNER, tone: "gold" },
  { key: "doacoes", titulo: "Dízimos e Ofertas", desc: "Contribua com o Reino.", resumo: "Semeie com um coração generoso e seja parte do que Deus está fazendo.", imageUrl: DOACOES_BANNER, tone: "gold" },
];

const DEFAULT_SITE = {
  churchName: "Ministério Avivar do Espírito",
  sobreNosImage: "",
  whatsappMinisterio: "",
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

const DEFAULT_AOVIVO = { isLive: false, instagramUrl: "", xUrl: "", youtubeUrl: "", embedUrl: "", mensagem: "Nenhuma transmissão no momento. Volte em breve.", programacao: [] };
const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const PROGRAMA_FIELDS = [
  { key: "dia", label: "Dia da semana", type: "select", options: DIAS_SEMANA },
  { key: "horario", label: "Horário (ex: 19h30)" },
  { key: "titulo", label: "Nome do programa/culto" },
];
const DEFAULT_DOACOES = { pixKey: "codigosavivar2026@gmail.com", mercadoPagoUrl: "", nomeRecebedor: "Ministerio Avivar do Espirito", cidade: "Brasilia", infoTexto: "" };

const DEFAULT_MANCHETE = {
  titulo: "A Oração de Hoje será na quadra 1, lote 4, bloco 1 ap 300",
  link: "",
  ativo: true,
  // modo: "auto" (padrão) passa as manchetes internas (Avivar News) em rodízio até o
  // admin cadastrar a oração nos lares de hoje — aí passa a mostrar só o local de hoje;
  // "novidades" força sempre o rodízio de manchetes internas; "oracao" força sempre o
  // local da oração de hoje; "manual" usa o texto/link fixos digitados abaixo (comportamento antigo).
  modo: "auto",
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

// Botão padrão de "Voltar" — vermelho com texto branco — usado em todas as
// telas do tipo página/detalhe (produto, notícia, evento, álbum, etc.).
function VoltarBtn({ onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-md focus:outline-none focus:ring-2 hover:opacity-90 ${className}`}
      style={{ background: "#B03428", color: "#ffffff" }}
    >
      <ArrowLeft size={14} /> Voltar
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

// Botão "Voltar" — aparece no topo de toda seção do site (menos a Home), logo ao
// chegar nela pelo menu, pedido do Marcos. Volta pra seção de onde a pessoa veio
// (ver "voltar"/"previousPage" em App), ou pro início se não houver uma anterior.
function VoltarBar({ onVoltar }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
      <button onClick={onVoltar} className="inline-flex items-center gap-1.5 text-sm font-semibold focus:outline-none focus:ring-2 rounded-md" style={{ color: C.violet }}>
        <ArrowLeft size={15} /> Voltar
      </button>
    </div>
  );
}

// Selo usado em toda reportagem marcada como "exclusiva" (avivarNews com exclusiva:
// true), sempre que ela aparece fora de Códigos Avivar já desbloqueado — na Home, em
// Ao Vivo, ou nas colunas de Códigos Avivar antes do login.
const CODIGOS_EXCLUSIVO_MSG = 'CONTEÚDO EXCLUSIVO DOS "CÓDIGOS AVIVAR" — PROFETAS DOS ÚLTIMOS TEMPOS. ASSINE.';
function ExclusivoBadge({ className = "" }) {
  return (
    <span className={`inline-block text-[9px] font-mono font-semibold tracking-wide px-2 py-1 rounded-sm ${className}`} style={{ background: C.gold, color: "#241C00" }}>
      {CODIGOS_EXCLUSIVO_MSG}
    </span>
  );
}
// Texto de prévia de uma reportagem em áreas públicas: se ela é exclusiva, mostra o
// resumo (nunca o texto completo); senão, mostra um trecho normal do texto.
function previaReportagem(n, tamanho = 90) {
  if (n.exclusiva) return n.resumo || "Conteúdo exclusivo — assine os Códigos Avivar para ler.";
  if (!n.texto) return "";
  return n.texto.slice(0, tamanho) + (n.texto.length > tamanho ? "…" : "");
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
  { key: "loja", label: "Loja Avivar", icon: ShoppingBag },
  { key: "eventos", label: "Eventos/Galeria", icon: Calendar },
  { key: "aovivo", label: "Avivar News TV", icon: Tv },
  { key: "igrejas", label: "Igrejas Avivar", icon: Church },
  { key: "biblia", label: "Bíblia Sagrada", icon: BookOpen },
  { key: "contato", label: "Contato", icon: Mail },
  { key: "doacoes", label: "Doações", icon: Send },
];
const SUBMENU = [
  { key: "colaboradores", label: "Colaboradores", icon: Users },
  { key: "escala", label: "Escala de Obreiros", icon: ClipboardList },
  { key: "estudos", label: "Estudos Bíblicos", icon: BookOpen },
  { key: "biblioteca", label: "Biblioteca Avivar", icon: Library },
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
    // Notícias gerais do Brasil e do mundo (qualquer assunto) — não mais restrito a
    // temas de igreja/evangelho, a pedido do Marcos ("as informações da igreja não
    // precisam"). Usa o feed de principais notícias do Google Notícias no Brasil.
    const feedUrl = "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419";
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
        {/* Escondido no celular a pedido — a etiqueta dourada tomava espaço e dava a
            impressão de "tapar" o carrossel de notícias na tela pequena. Continua
            aparecendo normalmente a partir do tablet/desktop (sm:). */}
        <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded shrink-0" style={{ background: C.gold, color: C.black }}>
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
    <header className="relative sticky top-0 z-40 border-b" style={{ background: C.black, borderColor: C.gold + "55" }}>
      {/* Toggle mobile — fora do fluxo do grupo alinhado de pills, para não empurrar o
          último pill do NAV para longe da borda direita. O acesso admin, antes um
          ícone pequeno aqui, virou o botão vermelho "RESTRITO" logo abaixo da logo. */}
      <div className="absolute top-2 right-2 sm:right-3 flex items-center gap-2 z-10">
        <button className="lg:hidden p-2" onClick={() => setOpen((v) => !v)} style={{ color: C.gold }}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
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
      </div>

      {/* Fileira de cima: o botão RESTRITO agora mora nesta MESMA linha, coladinho à
          esquerda, na mesma margem da logo/ícone da loja lá em cima. Os pills do NAV
          vêm logo depois dele (afastados à direita, com um respiro no meio), e ficam
          unidos entre si (gap curto), em vez de espalhados pela largura toda. */}
      <div className="hidden lg:flex items-center gap-4 max-w-6xl mx-auto px-4 sm:px-6 py-1.5" style={{ background: C.violetDeep }}>
        <button
          onClick={onAdminClick}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold tracking-wide focus:outline-none focus:ring-2"
          style={{ background: adminMode ? "#2E7D4F" : C.liveRed, color: "#fff" }}
        >
          {adminMode ? <ShieldCheck size={13} color="#fff" /> : <Lock size={13} color="#fff" />}
          {adminMode ? "SAIR DO ADMIN" : "RESTRITO"}
        </button>
        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => go(n.key)} className="nav-pulse inline-flex items-center justify-center text-center px-1.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap transition focus:outline-none focus:ring-2" style={topPillStyle(page === n.key)}>
              {n.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Barra de submenu — logo abaixo, sem faixa extra entre as duas (agora unidas),
          mesma margem esquerda da fileira de cima; sempre visível no desktop, sem
          esconder num dropdown */}
      <div className="hidden lg:flex items-center gap-1 max-w-6xl mx-auto px-4 sm:px-6 py-1.5" style={{ background: C.violetDeep }}>
        {SUBMENU.map((n) => {
          const isLoja = n.key === "loja";
          return (
            <button key={n.key} onClick={() => go(n.key)} className="nav-pulse min-w-[100px] justify-center text-center px-2 py-1 text-[11px] font-semibold rounded-full flex items-center gap-1 focus:outline-none focus:ring-2" style={pillStyle(page === n.key)}>
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
        <div className="lg:hidden border-t px-3 py-3" style={{ borderColor: C.gold + "33", background: C.black }}>
          {/* No celular, botões menores e em 2 colunas — cabe mais menu na tela sem
              precisar rolar tanto pra achar o item que se quer. */}
          <div className="grid grid-cols-2 gap-1.5">
            {[...NAV, ...SUBMENU, ...(adminMode ? ADMIN_MENU : [])].map((n) => (
              <button key={n.key} onClick={() => go(n.key)} className="text-left px-2 py-1.5 text-[11px] rounded-full flex items-center gap-1.5 truncate" style={pillStyle(page === n.key)}>
                {n.icon && <n.icon size={13} className="shrink-0" />} <span className="truncate">{n.label}</span>
              </button>
            ))}
          </div>
          <button onClick={onAdminClick} className="text-left px-2 py-2 text-sm rounded-md flex items-center gap-2 mt-2" style={{ color: C.goldBright }}>
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
              if (code === MASTER_ADMIN_PASSWORD) {
                onSuccess({ nome: "Administração", setores: ["todos"] });
                return;
              }
              const match = operatorCodes.find((o) => o.codigo === code);
              if (match) {
                onSuccess({ nome: match.nome, setores: parseSetoresOperador(match.setores) });
                return;
              }
              setErr("Código inválido.");
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

// Setores que um código de operador pode liberar individualmente — "todos" mantém o
// comportamento antigo (acesso a tudo que não é admin geral). Um código sem "setores"
// preenchido também vale como "todos", pra não quebrar códigos já cadastrados antes
// dessa função existir.
const SETORES_OPERADOR = [
  { key: "todos", label: "Todos os setores" },
  { key: "oracoes", label: "Oração nos Lares" },
  { key: "avivarmusic", label: "Avivar Music (cadastro de músicos)" },
  { key: "visitantes", label: "Visitantes" },
  { key: "membros", label: "Membros" },
  { key: "escala", label: "Escala de Obreiros" },
  { key: "loja", label: "Loja (calcular frete)" },
];
function parseSetoresOperador(texto) {
  const lista = String(texto || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return lista.length ? lista : ["todos"];
}

const OPERADOR_FIELDS = [
  { key: "nome", label: "Nome da pessoa ou função (ex: Portaria, RH — Maria)" },
  { key: "codigo", label: "Código de acesso" },
  { key: "setores", label: "Setores liberados — separe por vírgula (deixe em branco ou 'todos' pra liberar tudo): oracoes, avivarmusic, visitantes, membros, escala, loja" },
];

function OperadoresAdmin({ codes, save, adminMode }) {
  const add = (v) => save([...codes, { id: uid(), ...v }]);
  const del = (id) => save(codes.filter((c) => c.id !== id));
  if (!adminMode) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock size={28} className="mx-auto" color={C.stone} />
        <p className="text-sm mt-3" style={{ color: C.stone }}>Área restrita — acesso administrativo.</p>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Área administrativa</Eyebrow>
      <SectionTitle>Códigos de Operador</SectionTitle>
      <p className="text-sm mb-4" style={{ color: C.stone }}>
        Cada código dá acesso apenas aos setores marcados no cadastro (ex: só Oração nos Lares, ou só Avivar Music), sem liberar o resto da administração (Caixa, Bens, edição do site). Deixe "setores" em branco pra liberar tudo. Entregue um código diferente pra cada pessoa/função.
      </p>
      <div className="space-y-2">
        {codes.length === 0 && <Empty text="Nenhum código cadastrado ainda." />}
        {codes.map((c) => {
          const setores = parseSetoresOperador(c.setores);
          return (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border text-sm" style={{ borderColor: C.line }}>
              <div>
                <p className="font-medium">{c.nome}</p>
                <p className="text-xs font-mono" style={{ color: C.stone }}>{c.codigo}</p>
                <p className="text-[10px] mt-1 flex flex-wrap gap-1">
                  {setores.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded-full" style={{ background: C.parchment, color: C.ember }}>
                      {(SETORES_OPERADOR.find((x) => x.key === s) || { label: s }).label}
                    </span>
                  ))}
                </p>
              </div>
              <button onClick={() => del(c.id)}><Trash2 size={14} color={C.stone} /></button>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <DynamicForm fields={OPERADOR_FIELDS} onSubmit={(v) => v.nome && v.codigo && add(v)} submitLabel="Adicionar código" />
      </div>
    </div>
  );
}

// Botão flutuante de WhatsApp — fica em todas as páginas, canto inferior direito, e
// só aparece quando o admin cadastra o número do Ministério (Home · ADMIN · imagens de
// fundo... e contato). Some sozinho se o campo estiver vazio.
// No celular, mesmo tamanho do botão do Fórum (p-3 + ícone 20) e posicionado ACIMA
// dele (bottom-20, mesmo right-4), pra não ficar um por cima do outro. No desktop
// mantém o tamanho/posição originais (56px, bottom-5/right-5).
function BotaoFlutuanteWhatsapp({ numero }) {
  if (!numero) return null;
  return (
    <a
      href={waLink(numero, "Olá! Vim através do site do Ministério Avivar do Espírito.")}
      target="_blank"
      rel="noreferrer"
      className="fixed z-40 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition p-3 right-4 bottom-20 lg:p-0 lg:w-14 lg:h-14 lg:right-5 lg:bottom-5"
      style={{ background: "#25D366" }}
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle size={20} color="#fff" className="lg:hidden" />
      <MessageCircle size={26} color="#fff" className="hidden lg:block" />
    </a>
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
    <div className="hidden lg:flex fixed left-10 bottom-8 z-30 flex-col" style={{ width: "9.5rem", top: "13.5rem" }}>
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
      <div className="hidden lg:flex fixed right-3 bottom-8 w-56 z-30 rounded-l-xl border shadow-xl flex-col" style={{ background: C.cream, borderColor: C.line, top: "13.5rem" }}>
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
      style={{ background: bg, borderColor: bgImage ? C.line : border, color: "#fff" }}
    >
      {bgImage ? (
        // object-contain (em vez de object-cover) pra nunca cortar a imagem — o fundo
        // colorido do card (cor do "tone") aparece nas bordas quando a imagem não
        // preenche a caixa toda, em vez de cortar pra preencher.
        <img src={bgImage} alt={title} className="absolute inset-[0.3cm] w-[calc(100%-0.6cm)] h-[calc(100%-0.6cm)] object-contain rounded-lg" />
      ) : adminMode ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed" style={{ borderColor: C.line, background: "#00000006", color: C.stone }}>
          <ImageIcon size={22} />
          <span className="text-[10px] font-mono text-center px-3">{title} — aguardando imagem</span>
        </div>
      ) : null}
    </button>
  );
}

// Par "card + resumo" da grade da Home — o card (imagem) fica com largura fixa
// à esquerda, e ao lado um pequeno texto explicando o que é aquele menu, sobre um
// fundo claro (cor varia por coluna, ver CORES_HOMECARDS). O texto fica esticado
// (items-stretch) pra ficar alinhado do topo à base da imagem do card, como pedido.
function HomeCardBlurb({ card, icon, onClick, adminMode, corFundo }) {
  return (
    <div className="flex items-stretch gap-3">
      <div className="w-24 sm:w-28 shrink-0">
        <QuickCard icon={icon} title={card.titulo} desc={card.desc} onClick={onClick} tone={card.tone} bgImage={card.imageUrl} adminMode={adminMode} />
      </div>
      <button onClick={onClick} className="flex-1 rounded-xl border text-left p-3 flex flex-col justify-center focus:outline-none focus:ring-2" style={{ borderColor: C.line, background: corFundo }}>
        <p className="font-display font-semibold text-sm" style={{ color: C.ink }}>{card.titulo}</p>
        <p className="text-xs mt-1 leading-snug" style={{ color: C.stone }}>{card.resumo || card.desc}</p>
      </button>
    </div>
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
        <p className="font-display font-semibold text-sm" style={{ color: C.goldBright }}>{aoVivo.isLive ? "Estamos ao vivo agora" : "Avivar News TV"}</p>
        <p className="text-xs mt-0.5" style={{ color: "#ffffffaa" }}>Toque para ver transmissões anteriores e notícias.</p>
      </button>
    </div>
  );
}

// Card "Visitantes recentes" — mesmo visual/tamanho dos outros cards da fileira
// (ao lado do card Ao Vivo), fundo claro com borda, marquee com os últimos visitantes.
function VisitantesCard({ recentVisitors }) {
  return (
    <div className="rounded-xl border-2 shadow-xl p-4" style={{ borderColor: C.gold, background: C.cream }}>
      <div className="flex items-center gap-2 mb-2" style={{ color: C.ember }}>
        <HandHeart size={18} />
        <h3 className="font-display font-semibold text-sm">Visitantes recentes</h3>
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
  );
}

// Substituiu o antigo FeaturedBibliaCard (Bíblia Avivar foi pra grade de 9 cards —
// ver DEFAULT_HOMECARDS). Card de destaque pro futuro espaço de Cursos dos Códigos
// Avivar (cursos, PDFs e vídeos — ainda "em breve"; abre a PaginaCursos ao clicar).
function CursosDestaqueCard({ onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl overflow-hidden border-2 shadow-xl text-left relative focus:outline-none focus:ring-2" style={{ borderColor: C.gold }}>
      <div className="w-full aspect-video flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.violetDeep}, ${C.purple})` }}>
        <GraduationCap size={40} color={C.goldBright} />
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent 40%, #000000cc)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-display font-semibold text-sm text-white">Cursos dos Códigos Avivar</p>
        <p className="text-xs text-white/80">Cursos, PDFs e vídeos exclusivos — em breve</p>
      </div>
    </button>
  );
}

function HeroNewsColumn({ news, bgImage, onClick, onOpenNews }) {
  const top = [...news].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3);
  return (
    <div className="relative rounded-2xl overflow-hidden border text-left h-full min-h-[280px] focus:outline-none focus:ring-2" style={{ borderColor: C.line }}>
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
              <button key={n.id} onClick={() => onOpenNews && onOpenNews(n.id)} className="pb-3 border-b w-full text-left hover:brightness-110 focus:outline-none focus:ring-1 rounded-md" style={{ borderColor: "#ffffff22" }}>
                <p className="text-sm font-display font-semibold text-white leading-snug">{n.titulo}</p>
                <p className="text-xs mt-1" style={{ color: "#ffffffaa" }}>{previaReportagem(n, 90)}</p>
                {n.exclusiva && <ExclusivoBadge className="mt-1.5" />}
              </button>
            ))
          )}
        </div>
        <button onClick={onClick} className="text-[10px] font-mono tracking-wide underline decoration-dotted text-white/80 mt-2 text-left">ver todas as reportagens</button>
      </div>
    </div>
  );
}

function HeroDoacoesCard({ data, bgImage, onClick }) {
  const [copiado, setCopiado] = useState(false);
  const [copiadoImg, setCopiadoImg] = useState(false);
  const [erroImg, setErroImg] = useState(false);
  const payload = data.pixKey
    ? montarPixPayload({ chave: data.pixKey, nomeRecebedor: data.nomeRecebedor, cidade: data.cidade, txid: "AVIVAR" })
    : "";
  const copiar = (e) => {
    e.stopPropagation();
    if (!data.pixKey) return;
    navigator.clipboard?.writeText(data.pixKey).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };
  // Copia o QR Code Pix como IMAGEM (PNG) para a área de transferência — converte o
  // SVG gerado pelo qrcode.react num canvas oculto e usa a Clipboard API. Se o
  // navegador não suportar (ex: ClipboardItem indisponível), falha silenciosamente.
  const copiarQRComoImagem = async (e) => {
    e.stopPropagation();
    if (!payload) return;
    try {
      const svgEl = e.currentTarget.querySelector("svg");
      if (!svgEl) return;
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      const size = img.width || 160;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (!navigator.clipboard || typeof window.ClipboardItem === "undefined") throw new Error("sem suporte");
          await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
          setCopiadoImg(true);
          setErroImg(false);
          setTimeout(() => setCopiadoImg(false), 2000);
        } catch (err) {
          setErroImg(true);
          setTimeout(() => setErroImg(false), 2500);
        }
      }, "image/png");
    } catch (err) {
      setErroImg(true);
      setTimeout(() => setErroImg(false), 2500);
    }
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
        {payload && (
          <div className="flex flex-col items-center gap-1 mb-2">
            <div
              onClick={copiarQRComoImagem}
              title="Toque para copiar o QR Code como imagem"
              className="bg-white p-1.5 rounded-lg cursor-pointer"
            >
              <QRCodeSVG value={payload} size={96} bgColor="#ffffff" fgColor="#0B0B0C" />
            </div>
            <span className="text-[9px] text-center" style={{ color: erroImg ? "#F2A6A6" : "#ffffff88" }}>
              {copiadoImg ? "Copiado!" : erroImg ? "não foi possível copiar a imagem neste navegador" : "toque no QR Code para copiar a imagem"}
            </span>
          </div>
        )}
        <span onClick={copiar} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md w-fit mx-auto" style={{ background: "#ffffff22", color: "#fff" }}>
          <Copy size={12} /> {copiado ? "Copiado!" : "Copiar chave PIX"}
        </span>
      </button>
    </div>
  );
}

// Antes havia aqui um segundo card de "Oração nos Lares" duplicando o card já existente
// no grid de ícones da Home — foi transformado no card de "Pedido de Oração" (novo recurso).
function PedidoOracaoCard({ onClick, compact }) {
  if (compact) {
    // Versão compacta — usada na 3ª coluna do Hero da Home, empilhada abaixo do
    // card de Dízimo e Oferta, com botão roxo claro pulsante convidando ao clique.
    return (
      <button onClick={onClick} className="rounded-xl overflow-hidden border-2 shadow-xl text-left focus:outline-none focus:ring-2 flex flex-col h-full w-full" style={{ borderColor: C.purple }}>
        <div className="relative pt-2 pb-1.5 px-3 text-center" style={{ background: C.purpleDeep }}>
          <HandHeart size={18} color="#fff" className="mx-auto mb-1" />
          <p className="text-[10px] font-mono uppercase tracking-wide" style={{ color: "#ffffffaa" }}>Intercessão</p>
        </div>
        <div className="p-3 text-xs flex-1 flex flex-col" style={{ background: C.cream }}>
          <p className="font-display font-semibold text-sm" style={{ color: C.ink }}>Pedido de Oração</p>
          <p className="mt-0.5 text-[11px] line-clamp-1" style={{ color: C.stone }}>Conte pra nós o que está pesando no seu coração.</p>
          <div className="flex-1" />
          <span
            className="purple-light-pulse inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md w-full mt-2"
            style={{ background: C.purpleLight, color: C.violetDeep }}
          >
            <HandHeart size={13} /> Peça sua oração
          </span>
        </div>
      </button>
    );
  }
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
function MancheteBar({ manchete, save, adminMode, avivarNews, oracaoLocalDia, setPage, onOpenNews, escala }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(manchete || DEFAULT_MANCHETE);
  useEffect(() => setDraft(manchete || DEFAULT_MANCHETE), [manchete]);

  const m = { ...DEFAULT_MANCHETE, ...(manchete || {}) };
  const modo = m.modo || "auto";
  const temOracaoHoje = !!(oracaoLocalDia && oracaoLocalDia.local);

  // Assim que uma escala de obreiros é registrada (não importa se já foi confirmada
  // pelos escalados), este card vira a "Escala de Serviço" em 4 colunas, no lugar da
  // manchete de texto — mostra sempre a próxima data com escala, ou a mais recente se
  // não houver nenhuma futura.
  const safeEscala = {
    ...DEFAULT_ESCALA_OBREIROS,
    ...(escala || {}),
    escalasPorDia: (escala && escala.escalasPorDia) || {},
  };
  const hojeStr = new Date().toISOString().slice(0, 10);
  const datasComEscala = Object.keys(safeEscala.escalasPorDia)
    .filter((d) => (safeEscala.escalasPorDia[d].escalados || []).length > 0)
    .sort();
  const dataEscalaDestaque = datasComEscala.find((d) => d >= hojeStr) || datasComEscala[datasComEscala.length - 1] || null;
  const diaEscalaDestaque = dataEscalaDestaque ? safeEscala.escalasPorDia[dataEscalaDestaque] : null;
  const escaladosDestaque = diaEscalaDestaque ? diaEscalaDestaque.escalados || [] : [];

  // Últimas manchetes internas (Avivar News), mais recente primeiro, pra rodízio.
  const novidades = [...(avivarNews || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6);

  // Decide, a partir do modo escolhido pelo admin, se mostra o rodízio de novidades
  // internas ou o local da oração de hoje (ou o texto manual fixo).
  const modoEfetivo = modo === "auto" ? (temOracaoHoje ? "oracao" : "novidades") : modo;

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (modoEfetivo !== "novidades" || novidades.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % novidades.length), 6000);
    return () => clearInterval(t);
  }, [modoEfetivo, novidades.length]);
  useEffect(() => setIdx(0), [modoEfetivo]);

  let textoExibido, aoClicar, temAcao;
  if (modoEfetivo === "oracao") {
    textoExibido = `Oração de hoje: ${oracaoLocalDia.local}`;
    aoClicar = () => setPage && setPage("oracoes");
    temAcao = true;
  } else if (modoEfetivo === "novidades") {
    const atual = novidades[idx];
    textoExibido = atual ? atual.titulo : "Acompanhe as novidades do Avivar aqui em breve.";
    aoClicar = () => atual && onOpenNews && onOpenNews(atual.id);
    temAcao = !!atual;
  } else {
    textoExibido = m.titulo;
    aoClicar = () => {
      if (!m.link) return;
      if (/^https?:\/\//i.test(m.link)) window.open(m.link, "_blank", "noopener,noreferrer");
      else window.location.hash = m.link;
    };
    temAcao = !!m.link;
  }

  if (!dataEscalaDestaque && !m.ativo && !adminMode) return null;

  // Monta as 3 colunas de postos (3 funções cada) na ordem fixa de exibição, igual à
  // tabela-resumo da Escala de Obreiros — função em CAIXA ALTA, nome como cadastrado.
  const postosEscalaDestaque = dataEscalaDestaque
    ? [
        ...ORDEM_POSTOS_TABELA.filter((p) => safeEscala.postos.includes(p)),
        ...safeEscala.postos.filter((p) => !ORDEM_POSTOS_TABELA.includes(p)),
      ]
    : [];
  const linhasEscalaDestaque = postosEscalaDestaque.map((posto) => {
    const nomes = escaladosDestaque.filter((e) => e.posto === posto).map((e) => e.obreiroNome);
    return { posto, nomes: nomes.length ? nomes.join(", ") : "—" };
  });
  const gruposColunas = [linhasEscalaDestaque.slice(0, 3), linhasEscalaDestaque.slice(3, 6), linhasEscalaDestaque.slice(6)];
  const diaSemanaDestaque = dataEscalaDestaque ? diaSemanaFromData(dataEscalaDestaque) : "";
  const horarioDestaque = dataEscalaDestaque ? horarioDoDia(diaSemanaDestaque, safeEscala.horarios) : null;
  const CORES_COLUNAS = [C.cream, "#E8DCC4", "#F3DCE0"]; // creme, bege, róseo suave

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
      {dataEscalaDestaque ? (
        <div className="w-full rounded-lg border-2 overflow-hidden grid grid-cols-2 sm:grid-cols-4" style={{ borderColor: C.gold }}>
          <div className="p-3 flex flex-col justify-center col-span-2 sm:col-span-1" style={{ background: C.violet, color: "#fff" }}>
            <span className="text-[9px] font-mono uppercase tracking-wider opacity-80">Escala de Serviço</span>
            <p className="font-display font-bold text-sm sm:text-base leading-tight mt-0.5">{diaSemanaDestaque}</p>
            <p className="text-xs opacity-90">{fmtDate(dataEscalaDestaque)}{horarioDestaque ? ` · ${horarioDestaque.inicio}` : ""}</p>
          </div>
          {gruposColunas.map((grupo, i) => (
            <div key={i} className="p-2.5 flex flex-col justify-center gap-1" style={{ background: CORES_COLUNAS[i] }}>
              {grupo.length === 0 && <span className="text-[10px] italic" style={{ color: C.stone }}>—</span>}
              {grupo.map((l) => (
                <p key={l.posto} className="text-[10px] sm:text-[11px] leading-tight" style={{ color: C.ink }}>
                  <span className="font-bold uppercase">{l.posto}:</span> {l.nomes}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : (
        (m.ativo || adminMode) && (
          <button
            onClick={aoClicar}
            className={`w-full text-left rounded-lg border-2 px-4 py-3 sm:px-5 sm:py-4 transition hover:brightness-105 focus:outline-none focus:ring-2 ${temAcao ? "cursor-pointer" : "cursor-default"}`}
            style={{ background: C.parchment, borderColor: C.gold, opacity: m.ativo ? 1 : 0.5 }}
          >
            {!m.ativo && adminMode && <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: C.emberDeep }}>(inativa — só visível pra você, admin)</span>}
            <p className="font-display font-bold text-base sm:text-lg mt-0.5" style={{ color: C.ink }}>{textoExibido}</p>
          </button>
        )
      )}
      {adminMode && (
        <div className="mt-2 p-3 rounded-lg border text-xs" style={{ borderColor: C.line, background: "#00000006" }}>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="underline" style={{ color: C.stone }}>ADMIN · editar manchete da home</button>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2 mt-1">
              <Field label="Modo de exibição">
                <select className={inputCls} style={{ borderColor: C.line }} value={draft.modo || "auto"} onChange={(e) => setDraft((d) => ({ ...d, modo: e.target.value }))}>
                  <option value="auto">Automático (novidades até cadastrar oração do dia; depois, oração do dia)</option>
                  <option value="novidades">Sempre novidades / manchetes internas</option>
                  <option value="oracao">Sempre oração do dia</option>
                  <option value="manual">Manual (texto fixo abaixo)</option>
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!draft.ativo} onChange={(e) => setDraft((d) => ({ ...d, ativo: e.target.checked }))} /> Manchete ativa (visível no site)</label>
              <Field label="Título da manchete (só usado no modo Manual)"><input className={inputCls} style={{ borderColor: C.line }} value={draft.titulo} onChange={(e) => setDraft((d) => ({ ...d, titulo: e.target.value }))} /></Field>
              <Field label="Link (URL ou #id-da-secao) — só no modo Manual"><input className={inputCls} style={{ borderColor: C.line }} value={draft.link} onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))} /></Field>
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

function Home({ site, setPage, visitantes, saveSite, adminMode, aoVivo, oracaoEncontros, avivarNews, doacoes, manchete, saveManchete, onOpenNews, oracaoLocalDia, escala, onOpenCursos }) {
  const recentVisitors = [...visitantes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);
  const homeCards = site.homeCards || DEFAULT_HOMECARDS;
  return (
    <div>
      <MancheteBar manchete={manchete} save={saveManchete} adminMode={adminMode} avivarNews={avivarNews} oracaoLocalDia={oracaoLocalDia} setPage={setPage} onOpenNews={onOpenNews} escala={escala} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 grid lg:grid-cols-[1fr_1.7fr_1fr] gap-3 sm:gap-4 items-stretch">
        {/* Só no celular (grid de 1 coluna): banner do Ministério vem antes das Notícias.
            A partir do lg (3 colunas lado a lado) volta pra ordem original. */}
        <div className="order-2 lg:order-1">
          <HeroNewsColumn news={avivarNews || []} bgImage={site.heroLeftBg} onClick={() => setPage("aovivo")} onOpenNews={onOpenNews} />
        </div>

        <div className="order-1 lg:order-2 relative rounded-2xl overflow-hidden h-full min-h-[280px] sm:min-h-[360px]" style={{ background: C.black }}>
          <img src={site.heroMiddleBg || HERO_BANNER} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(1px) brightness(0.5)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #00000066, #1F1B2ECC)" }} />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="font-script text-4xl sm:text-6xl" style={{ color: C.goldBright }}>{site.churchName}</h1>
            <p className="mt-3 text-sm sm:text-base max-w-xl" style={{ color: "#ffffffdd" }}>
              Um ministério comprometido em resgatar vidas, restaurar corações e avivar a Igreja com o poder do Espírito Santo.
            </p>
          </div>
        </div>

        <div className="order-3 lg:order-3 flex flex-col gap-3 h-full">
          <div className="flex-[7] min-h-0">
            <HeroDoacoesCard data={doacoes || DEFAULT_DOACOES} bgImage={site.heroRightBg} onClick={() => setPage("doacoes")} />
          </div>
          <div className="flex-[3] min-h-0">
            <PedidoOracaoCard compact onClick={() => setPage("pedidooracao")} />
          </div>
        </div>
      </div>

      {adminMode && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-3 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
          <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · imagens de fundo das 3 colunas do topo e contato</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Fundo — coluna Notícias (esquerda)"><input className={inputCls} style={{ borderColor: C.line }} value={site.heroLeftBg || ""} onChange={(e) => saveSite({ ...site, heroLeftBg: e.target.value })} /></Field>
            <Field label="Fundo — coluna central"><input className={inputCls} style={{ borderColor: C.line }} value={site.heroMiddleBg || ""} onChange={(e) => saveSite({ ...site, heroMiddleBg: e.target.value })} /></Field>
            <Field label="Fundo — coluna Doações (direita)"><input className={inputCls} style={{ borderColor: C.line }} value={site.heroRightBg || ""} onChange={(e) => saveSite({ ...site, heroRightBg: e.target.value })} /></Field>
            <Field label="Foto — seção Sobre nós"><input className={inputCls} style={{ borderColor: C.line }} value={site.sobreNosImage || ""} onChange={(e) => saveSite({ ...site, sobreNosImage: e.target.value })} /></Field>
            <Field label="WhatsApp do Ministério (com DDD, só números)"><input className={inputCls} style={{ borderColor: C.line }} value={site.whatsappMinisterio || ""} onChange={(e) => saveSite({ ...site, whatsappMinisterio: e.target.value })} /></Field>
          </div>
        </div>
      )}

      {/* Cards da home — sempre depois dos banners do topo (Hero), nunca sobrepostos;
          reorganizados (set/2026) em 3 linhas x 3 colunas, cada um com um pequeno
          resumo ao lado sobre fundo claro (HomeCardBlurb), sem cortar a imagem
          (object-contain no QuickCard). */}
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10 ${GRID_HOMECARDS}`}>
        {homeCards.map((c, idx) => {
          const Icon = CARD_ICONS[c.key] || Sparkles;
          return (
            <HomeCardBlurb
              key={c.key}
              card={c}
              icon={Icon}
              onClick={() => (c.externalUrl ? window.open(c.externalUrl, "_blank", "noopener,noreferrer") : setPage(c.key))}
              adminMode={adminMode}
              corFundo={CORES_HOMECARDS[idx % CORES_HOMECARDS.length]}
            />
          );
        })}
      </div>

      {adminMode && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <HomeCardsAdmin cards={homeCards} onSave={(v) => saveSite({ ...site, homeCards: v })} />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10 grid sm:grid-cols-3 gap-5">
        <LiveHomeCard aoVivo={aoVivo} onClick={() => setPage("aovivo")} />
        <CursosDestaqueCard onClick={onOpenCursos} />
        <VisitantesCard recentVisitors={recentVisitors} />
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 grid md:grid-cols-[1.4fr_1fr] gap-8 items-start">
        <div>
          <Eyebrow>Sobre nós</Eyebrow>
          <SectionTitle>Uma casa de fé aberta a todos</SectionTitle>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.stone }}>
            O {site.churchName} é uma igreja interdenominacional, fundamentada na doutrina cristã, dedicada ao ensino da
            Palavra, à comunhão entre irmãos e ao cuidado com quem chega pela primeira vez.
          </p>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.stone }}>
            Mesmo sendo interdenominacionais, buscamos constantemente o poder do Senhor Espírito Santo, ativando os dons
            espirituais de cura, milagres, maravilhas, revelação, profecia e tudo quanto o Senhor determinar — estamos
            dispostos a fazer. Mesmo sem alardes nem grandes holofotes, milagres, curas, revelações e profecias são
            constantes neste ministério.
          </p>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.stone }}>
            Os fiéis de Jesus Cristo são tratados sem distinção hierárquica, porque consideramos todos filhos amados de
            Jesus Cristo. Cremos no batismo nas águas, no Espírito Santo de Deus como nosso Consolador, no Santo Cristo
            Jesus como Redentor, e no Deus Todo-Poderoso como um só Deus, que nos sustenta.
          </p>
        </div>
        <div className="rounded-xl border overflow-hidden shadow-md" style={{ borderColor: C.line }}>
          <ImgOrPlaceholder url={site.sobreNosImage} alt="Ministério Avivar do Espírito" className="w-full h-full min-h-[280px] object-cover" ph="Foto do Ministério — adicionar depois" />
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

function CodigosAvivar({ data, save, adminMode, loja, saveLoja, avivarNews, setPage, onOpenNews, unlocked, setUnlocked }) {
  const [holderName, setHolderName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [err, setErr] = useState("");
  const [showAccessMgmt, setShowAccessMgmt] = useState(false);
  const [selectedTema, setSelectedTema] = useState(null);
  const [holderTier, setHolderTier] = useState("geral");
  const [livroInternoAberto, setLivroInternoAberto] = useState(null);

  const reportagensOrdenadas = [...(avivarNews || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const reportagensDestaque = reportagensOrdenadas.slice(0, 3);
  // Mais reportagens (além das 3 já mostradas na coluna do meio) — preenche o espaço
  // vazio da coluna 3, cada título clicável abrindo a matéria na hora.
  const maisReportagens = reportagensOrdenadas.slice(3, 9);

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
      setHolderTier(match.tier || "geral");
      setErr("");
    } else {
      setErr("Código inválido, inativo ou pessoa não cadastrada.");
    }
  };

  const genCode = (holder, tier) => {
    const code = "AVR-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    save({ ...data, codes: [...data.codes, { id: uid(), holder, code, active: true, tier: tier || "geral" }] });
  };
  const toggleTier = (id) => save({ ...data, codes: data.codes.map((c) => (c.id === id ? { ...c, tier: c.tier === "serafim" ? "geral" : "serafim" } : c)) });
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
        <div className="grid lg:grid-cols-3 items-stretch">
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

              {/* Card de reforço do convite pra assinar — fundo claro, abaixo do login;
                  tamanho compacto (só o necessário pro texto), ícone bem próximo do texto */}
              <div className="mt-6 rounded-lg border shadow-md p-3 flex items-start gap-2.5 text-left" style={{ borderColor: "#ffffff33", background: C.parchment }}>
                <Sparkles size={18} color={C.violet} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-semibold text-sm" style={{ color: C.ink }}>Eleve sua consciência espiritual</p>
                  <p className="text-xs mt-1" style={{ color: C.stone }}>
                    Assine os Códigos Avivar e entre na frequência de revelação, ciência e espiritualidade que Deus reserva para os últimos dias.
                  </p>
                </div>
              </div>

              {/* Curiosidade científico-espiritual — imagem 63 */}
              <div className="mt-4 rounded-lg overflow-hidden border shadow-md" style={{ borderColor: "#ffffff33", background: C.parchment }}>
                <ImgOrPlaceholder url={CODIGOS_CURIOSIDADE_AGUA_VINHO} alt="Curiosidade: a Transformação da Água em Vinho" className="w-full object-cover max-h-[220px]" ph="Curiosidade científico-espiritual" />
                <div className="p-3 text-center">
                  <p className="text-xs font-mono" style={{ color: C.stone }}>CURIOSIDADE</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: C.ink }}>Ciência e o milagre da água em vinho</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2 — reportagens: portais espirituais, horas dimensionais, energia quântica */}
          <div className="px-6 py-12 border-t lg:border-t-0 lg:border-l" style={{ background: C.indigo, borderColor: "#ffffff14" }}>
            {/* Banner da revista Códigos Avivar — movido pra cá (reduzido pela metade),
                já estamos dentro de Códigos Avivar então não precisa navegar de novo */}
            <div className="mb-6">
              <div className="block w-full rounded-2xl overflow-hidden border-2 shadow-xl" style={{ borderColor: C.gold }}>
                <ImgOrPlaceholder url={CODIGOS_REVISTA_BANNER} alt="Códigos Avivar — Profetas dos Últimos Dias" className="w-full object-contain max-h-[260px]" ph="Banner revista Códigos Avivar — em destaque" />
              </div>
              <p className="text-xs text-center italic mt-2" style={{ color: "#D9D2EA" }}>
                Deus está revelando os seus mistérios aos profetas. Em breve, Códigos Avivar em sua nova fase com a série Profetas dos Últimos Dias. Tudo que tiver relação com Códigos Avivar levaremos para o nosso app, dentro de poucos dias.
              </p>
            </div>
            <Eyebrow color={C.goldBright}><Sparkles size={11} className="inline mr-1" />Ciência, tempo e espírito</Eyebrow>
            <h3 className="font-display text-xl font-semibold text-white mt-2 mb-5">Reflexões Avivar News</h3>
            <div className="rounded-xl p-4" style={{ background: "#ffffff0f" }}>
              <div className="space-y-3">
                {reportagensDestaque.length === 0 && (
                  <p className="text-xs italic" style={{ color: "#ffffffaa" }}>Nenhuma reportagem publicada ainda.</p>
                )}
                {reportagensDestaque.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => (onOpenNews ? onOpenNews(n.id) : (setPage && setPage("aovivo")))}
                    className="block text-left w-full p-4 rounded-lg transition hover:brightness-110 focus:outline-none focus:ring-2"
                    style={{ background: "#ffffff0f" }}
                  >
                    <p className="font-display font-semibold text-white text-sm leading-snug">{n.titulo}</p>
                    <p className="text-xs mt-1.5" style={{ color: "#ffffffaa" }}>{previaReportagem(n, 130)}</p>
                    {n.exclusiva ? (
                      <ExclusivoBadge className="mt-2" />
                    ) : (
                      <span className="text-[10px] font-mono underline decoration-dotted text-white/70 mt-2 inline-block">ler em Avivar News</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna 3 — vitrine de ebooks/livros + mais reportagens (pra não sobrar espaço vazio) */}
          <div className="px-6 py-12 border-t lg:border-t-0 lg:border-l" style={{ background: C.emberDeep, borderColor: "#ffffff14" }}>
            <p className="font-script text-3xl text-white leading-none">Códigos Avivar</p>
            <p className="text-xs mt-2" style={{ color: "#ffffffbb" }}>O Conhecimento Revelado pelo Espírito Santo</p>
            <div className="rounded-xl p-4 mt-5" style={{ background: "#ffffff0f" }}>
              {/* Curiosidade / divulgação — banner Profetas dos Últimos Dias (imagem 65) */}
              <div className="rounded-lg overflow-hidden border shadow-md" style={{ borderColor: "#ffffff33" }}>
                <ImgOrPlaceholder url={CODIGOS_PROFETAS_ULTIMOS_DIAS_BANNER} alt="Códigos Avivar — Profetas dos Últimos Dias" className="w-full object-cover max-h-[160px]" ph="Série Profetas dos Últimos Dias — em breve" />
              </div>
            </div>
            {maisReportagens.length > 0 && (
              <div className="mt-6">
                <Eyebrow color={C.goldBright}><Radio size={11} className="inline mr-1" />Mais reportagens</Eyebrow>
                <div className="mt-3 space-y-2.5">
                  {maisReportagens.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => (onOpenNews ? onOpenNews(n.id) : (setPage && setPage("aovivo")))}
                      className="flex items-center gap-1.5 text-left w-full text-sm underline decoration-dotted text-white/90 hover:text-white leading-snug"
                    >
                      {n.exclusiva && <Lock size={10} color={C.goldBright} className="shrink-0" />}
                      {n.titulo}
                    </button>
                  ))}
                </div>
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
              <DynamicForm fields={[{ key: "holder", label: "Nome da pessoa" }, { key: "tier", label: "Nível de acesso", type: "select", options: ["geral", "serafim"] }]} accent={C.violet} submitLabel="Gerar código" onSubmit={(v) => v.holder && genCode(v.holder, v.tier)} />
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
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: c.tier === "serafim" ? C.gold : "#00000011", color: c.tier === "serafim" ? "#fff" : C.stone }}>
                        {c.tier === "serafim" ? "Serafim" : "geral"}
                      </span>
                      <button onClick={() => toggleTier(c.id)} className="text-xs underline" style={{ color: C.violet }}>trocar nível</button>
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
  const bibliotecaCodigosGeral = (loja || []).filter((p) => p.categoria === "Códigos Avivar" && !(p.seedId && p.seedId.startsWith("trilogia-")));
  const bibliotecaCodigosSerafim = (loja || []).filter((p) => p.seedId && p.seedId.startsWith("trilogia-"));
  const bibliotecaCodigos = holderTier === "serafim" ? [...bibliotecaCodigosGeral, ...bibliotecaCodigosSerafim] : bibliotecaCodigosGeral;

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

        <div className="mt-12 pt-8 border-t" style={{ borderColor: "#ffffff22" }}>
          <Eyebrow color={C.gold}>Leitura exclusiva</Eyebrow>
          <h3 className="font-display text-xl font-semibold text-white mb-1">Biblioteca Códigos Avivar</h3>
          <p className="text-xs mb-4" style={{ color: "#D9D2EA" }}>
            {holderTier === "serafim"
              ? "Como aluno(a) Serafim, você tem acesso livre a todos os títulos, incluindo os que são vendidos na Loja Avivar."
              : "Livros exclusivos pra quem já tem acesso a Códigos Avivar. Os títulos à venda na Loja Avivar ficam liberados só pra alunos(as) Serafim."}
          </p>
          {bibliotecaCodigos.length === 0 ? (
            <p className="text-xs italic" style={{ color: "#ffffffaa" }}>Nenhum título cadastrado ainda.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {bibliotecaCodigos.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLivroInternoAberto(item)}
                  className="rounded-lg overflow-hidden border text-left focus:outline-none focus:ring-2"
                  style={{ borderColor: "#ffffff22", background: "#ffffff0d" }}
                >
                  <ImgOrPlaceholder url={item.imageUrl} alt={item.titulo || item.nome} className="w-full h-24 sm:h-28 object-cover" />
                  <p className="text-xs text-white p-2 leading-snug">{item.titulo || item.nome}</p>
                </button>
              ))}
            </div>
          )}
          {livroInternoAberto && (
            <div className="mt-5 rounded-xl border p-5 grid sm:grid-cols-[140px_1fr] gap-5" style={{ borderColor: "#ffffff33", background: "#ffffff0d" }}>
              <ImgOrPlaceholder url={livroInternoAberto.imageUrl} alt={livroInternoAberto.titulo || livroInternoAberto.nome} className="w-full h-52 object-cover rounded-lg" />
              <div>
                <VoltarBtn onClick={() => setLivroInternoAberto(null)} className="mb-2" />
                <h4 className="font-display font-semibold text-white">{livroInternoAberto.titulo || livroInternoAberto.nome}</h4>
                {livroInternoAberto.autor && <p className="text-xs mt-1" style={{ color: C.goldBright }}>{livroInternoAberto.autor}</p>}
                {livroInternoAberto.pdfUrl ? (
                  <a href={livroInternoAberto.pdfUrl} download className="inline-block mt-3">
                    <Btn color={C.gold}><FileText size={14} /> Baixar PDF</Btn>
                  </a>
                ) : (
                  <p className="text-xs italic mt-3" style={{ color: "#ffffffaa" }}>PDF ainda não cadastrado para este livro.</p>
                )}
              </div>
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
              <VoltarBtn onClick={() => setSelected(null)} className="mb-2" />
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

// Modal global de reportagem — usado em TODO lugar do site que abre uma matéria do
// Avivar News (Home, Códigos Avivar, Ao Vivo, Manchete...): abre na hora, por cima da
// página atual, com a imagem, sem rolar a tela pra nenhum canto.
function ReportagemModal({ news, adminMode, onClose, onDelete }) {
  if (!news) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4" style={{ background: "#00000090" }} onClick={onClose}>
      <div className="max-w-2xl mx-auto my-6 sm:my-10 rounded-xl overflow-hidden" style={{ background: C.cream }} onClick={(e) => e.stopPropagation()}>
        {news.imageUrl && <ImgOrPlaceholder url={news.imageUrl} alt={news.titulo} className="w-full h-52 sm:h-72 object-cover" />}
        <div className="p-5 sm:p-6">
          <VoltarBtn onClick={onClose} className="mb-3" />
          <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDateTime(news.timestamp)}</p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold mt-1">{news.titulo}</h2>
          {news.autor && <p className="text-xs italic mt-0.5" style={{ color: C.stone }}>por {news.autor}</p>}
          {news.videoUrl && (
            <div className="aspect-video rounded-md overflow-hidden bg-black mt-4">
              <iframe title={news.titulo} src={getEmbedUrl(news.videoUrl)} className="w-full h-full" allowFullScreen />
            </div>
          )}
          {news.texto && <p className="text-sm mt-4 whitespace-pre-line" style={{ color: C.ink }}>{news.texto}</p>}
          {adminMode && <button onClick={onDelete} className="text-xs underline mt-4" style={{ color: "#B03428" }}>excluir reportagem</button>}
        </div>
      </div>
    </div>
  );
}

function AoVivo({ data, save, passadas, savePassadas, news, saveNews, adminMode, onOpenNews }) {
  const [mainPassadaId, setMainPassadaId] = useState(null);

  const addPassada = (v) => savePassadas([...passadas, { id: uid(), ...v }]);
  const delPassada = (id) => savePassadas(passadas.filter((p) => p.id !== id));
  const sortedPassadas = [...passadas].sort((a, b) => new Date(b.data) - new Date(a.data));
  const mainPassada = sortedPassadas.find((p) => p.id === mainPassadaId) || sortedPassadas[0] || null;

  const addNews = (v) => saveNews([...news, { id: uid(), ...v, exclusiva: v.exclusiva === "Sim", timestamp: nowISO() }]);
  const delNews = (id) => saveNews(news.filter((n) => n.id !== id));
  const sortedNews = [...news].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Programação da Avivar News TV — estrutura pronta pra virar uma "grade de TV"
  // completa depois; por enquanto, cada dia sem programa cadastrado mostra "EM BREVE".
  const programacao = data.programacao || [];
  const addPrograma = (v) => save({ ...data, programacao: [...programacao, { id: uid(), ...v }] });
  const delPrograma = (id) => save({ ...data, programacao: programacao.filter((p) => p.id !== id) });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Moldura da seção Ao Vivo inteira, a pedido — fundo creme, filete dourado */}
      <div className="rounded-2xl border-2 p-4 sm:p-6" style={{ borderColor: C.gold, background: C.cream }}>
        {data.isLive ? (
          <span className="live-pulse inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold tracking-wide" style={{ background: "#E14D3A", color: "#fff" }}>
            <Radio size={12} /> LIVE
          </span>
        ) : (
          <Eyebrow color={C.stone}>Sem transmissão no momento</Eyebrow>
        )}
        <SectionTitle>Avivar News TV</SectionTitle>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-6 mt-6 items-start">
          {/* Player principal: transmissão atual, ou a última transmissão selecionada —
              filete azul indicando "área de exibição" */}
          <div className="rounded-xl p-3 sm:p-4" style={{ background: "#fff", borderLeft: "4px solid #2E6FE1" }}>
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

          {/* Coluna lateral: transmissões anteriores, estilo YouTube — mesmo filete azul */}
          <div className="rounded-xl p-3 sm:p-4" style={{ background: "#fff", borderLeft: "4px solid #2E6FE1" }}>
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

        {/* Programação da Avivar News TV — estrutura pronta pra virar a grade completa da
            TV; cada dia sem programa cadastrado mostra "EM BREVE". */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: C.line }}>
          <Eyebrow>Grade semanal</Eyebrow>
          <h3 className="font-display text-lg font-semibold mb-3" style={{ color: C.ink }}>Programação da Avivar News TV</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {DIAS_SEMANA.map((dia) => {
              const doDia = programacao.filter((p) => p.dia === dia);
              return (
                <div key={dia} className="rounded-lg border p-2.5 min-h-[92px]" style={{ borderColor: C.line, background: "#fff" }}>
                  <p className="text-[10px] font-mono uppercase tracking-wide" style={{ color: C.stone }}>{dia}</p>
                  {doDia.length === 0 ? (
                    <span className="mt-2 inline-block text-[9px] font-mono font-semibold tracking-wider px-2 py-1 rounded-full" style={{ background: C.gold, color: "#241C00" }}>EM BREVE</span>
                  ) : (
                    <div className="mt-1.5 space-y-1.5">
                      {doDia.map((p) => (
                        <div key={p.id} className="flex items-start justify-between gap-1">
                          <div>
                            <p className="text-[11px] font-semibold leading-snug">{p.titulo}</p>
                            <p className="text-[10px]" style={{ color: C.stone }}>{p.horario}</p>
                          </div>
                          {adminMode && <button onClick={() => delPrograma(p.id)}><Trash2 size={10} color={C.stone} /></button>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {adminMode && (
            <div className="mt-5">
              <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · adicionar programa à grade</p>
              <DynamicForm fields={PROGRAMA_FIELDS} onSubmit={(v) => v.dia && v.titulo && addPrograma(v)} submitLabel="Adicionar à programação" />
            </div>
          )}
        </div>
      </div>

      {/* Avivar News */}
      <div className="mt-14 pt-8 border-t" style={{ borderColor: C.line }}>
        <Eyebrow>Reportagens do ministério</Eyebrow>
        <h3 className="font-display text-2xl font-semibold" style={{ color: C.ink }}>Avivar News</h3>
        {sortedNews.length === 0 && <div className="mt-4"><Empty text="Nenhuma reportagem publicada ainda." /></div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 items-start">
          {sortedNews.map((n) => (
            <div key={n.id} className="text-left rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
              <button onClick={() => onOpenNews && onOpenNews(n.id)} className="block w-full text-left focus:outline-none focus:ring-2">
                {n.imageUrl && <ImgOrPlaceholder url={n.imageUrl} alt={n.titulo} className="w-full h-36 object-cover" />}
                <div className="p-4">
                  <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDateTime(n.timestamp)}</p>
                  <p className="font-display font-semibold text-sm mt-1">{n.titulo}</p>
                  {n.autor && <p className="text-[10px] italic mt-0.5" style={{ color: C.stone }}>por {n.autor}</p>}
                  <p className="text-xs mt-2" style={{ color: C.stone }}>{previaReportagem(n, 90)}</p>
                  {n.exclusiva && <ExclusivoBadge className="mt-2" />}
                </div>
              </button>
              {adminMode && <button onClick={() => delNews(n.id)} className="text-xs underline block px-4 pb-3" style={{ color: "#B03428" }}>excluir</button>}
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
  { key: "precoPdf", label: "Preço do PDF (ex: R$ 19,90)" },
  { key: "linkPdf", label: "Link de pagamento do PDF (Mercado Pago)", type: "url" },
  { key: "precoFisico", label: "Preço do exemplar físico (ex: R$ 49,90)" },
  { key: "linkFisico", label: "Link de pagamento do Físico (Mercado Pago)", type: "url" },
  { key: "previewUrl", label: "URL de amostra/prévia (opcional)", type: "url" },
  { key: "capaVendaUrl", label: "URL da capa na página de venda (se vazio, usa a mesma da vitrine)", type: "url" },
  { key: "pdfNaoLiberado", label: "PDF ainda não liberado (mostra 'em breve' em vez do preço/download)", type: "select", options: ["Não", "Sim"] },
  { key: "fisicoEsgotado", label: "Tiragem física esgotada (mostra aviso em vez do formulário de pedido)", type: "select", options: ["Não", "Sim"] },
];
const PEDIDO_FISICO_FIELDS = [
  { key: "nomeRecebedor", label: "Nome de quem vai receber" },
  { key: "whatsapp", label: "WhatsApp (com DDD)" },
  { key: "cep", label: "CEP" },
  { key: "rua", label: "Rua e número" },
  { key: "cidade", label: "Cidade" },
  { key: "referencia", label: "Ponto de referência (opcional)" },
];

// Extrai o valor numérico de um preço em texto livre (ex: "R$ 49,90" -> 49.9), pra
// usar no valor fixo do QR Code Pix. Retorna undefined se não der pra interpretar.
function precoParaNumero(preco) {
  if (!preco) return undefined;
  const limpo = String(preco).replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".");
  const n = parseFloat(limpo);
  return isNaN(n) ? undefined : n;
}

function LojaProdutoPix({ produto, doacoes }) {
  const [copiado, setCopiado] = useState(false);
  if (!doacoes?.pixKey) return null;
  const payload = montarPixPayload({
    chave: doacoes.pixKey,
    nomeRecebedor: doacoes.nomeRecebedor,
    cidade: doacoes.cidade,
    valor: precoParaNumero(produto.preco),
    txid: "AVIVAR",
  });
  const copiar = () => {
    navigator.clipboard?.writeText(doacoes.pixKey).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };
  return (
    <div className="mt-2 p-3 rounded-lg border flex flex-col items-center gap-2" style={{ borderColor: C.line, background: C.cream }}>
      <div className="bg-white p-2 rounded-lg border" style={{ borderColor: C.line }}>
        <QRCodeSVG value={payload} size={120} bgColor="#ffffff" fgColor="#0B0B0C" />
      </div>
      <p className="text-[10px] font-mono break-all text-center" style={{ color: C.stone }}>{doacoes.pixKey}</p>
      <Btn variant="ghost" className="w-full justify-center" onClick={copiar}>
        <Copy size={13} /> {copiado ? "Copiado!" : "Copiar chave PIX"}
      </Btn>
    </div>
  );
}

const GREEN = "#2E7D4F";
const COMPRAS_LS_KEY = "avivar_compras_aprovadas";

function lerComprasAprovadasLS() {
  try {
    return JSON.parse(localStorage.getItem(COMPRAS_LS_KEY) || "{}");
  } catch (e) {
    return {};
  }
}
function gravarComprasAprovadasLS(v) {
  try {
    localStorage.setItem(COMPRAS_LS_KEY, JSON.stringify(v));
  } catch (e) {}
}

function Loja({ items, save, adminMode, operatorMode, onRequestOperator, doacoes, pedidosFisicos, savePedidosFisicos }) {
  const add = (v) => save([...items, { id: uid(), ...v }]);
  const del = (id) => save(items.filter((i) => i.id !== id));
  const podeVerFrete = adminMode || operatorMode;
  // A Loja pública mostra os produtos que não são "Códigos Avivar" (roupas, utensílios
  // etc., se algum dia existirem) mais os 4 livros da trilogia (vendidos, mesmo sendo
  // categoria "Códigos Avivar"), mas nunca os 16 livros de Hagin da vitrine interna.
  const itemsLoja = items.filter((p) => p.categoria !== "Códigos Avivar" || p.paraVenda || (p.seedId && p.seedId.startsWith("trilogia-")));
  const [pixAbertoId, setPixAbertoId] = useState(null);
  const [produtoAbertoId, setProdutoAbertoId] = useState(null);
  const produtoAberto = itemsLoja.find((p) => p.id === produtoAbertoId) || null;
  const [mostrarOpcoesCompra, setMostrarOpcoesCompra] = useState(false);
  const [mostrarFormFisico, setMostrarFormFisico] = useState(false);
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);
  const [comprasAprovadas, setComprasAprovadas] = useState(() => lerComprasAprovadasLS());
  const [editandoPrecoId, setEditandoPrecoId] = useState(null);
  const [precoPdfEdit, setPrecoPdfEdit] = useState("");
  const [precoFisicoEdit, setPrecoFisicoEdit] = useState("");

  const abrirProduto = (id) => {
    setProdutoAbertoId(id);
    setMostrarOpcoesCompra(false);
    setMostrarFormFisico(false);
  };
  const fecharProduto = () => {
    setProdutoAbertoId(null);
    setMostrarOpcoesCompra(false);
    setMostrarFormFisico(false);
  };

  const abrirEdicaoPreco = (p) => {
    setPrecoPdfEdit(p.precoPdf || "");
    setPrecoFisicoEdit(p.precoFisico || "");
    setEditandoPrecoId(p.id);
  };
  const salvarPrecos = (p) => {
    save(items.map((i) => (i.id === p.id ? { ...i, precoPdf: precoPdfEdit, precoFisico: precoFisicoEdit } : i)));
    setEditandoPrecoId(null);
  };

  const marcarAprovado = (produtoId, tipo, paymentId) => {
    setComprasAprovadas((prev) => {
      const atual = { ...(prev[produtoId] || {}) };
      atual[tipo] = { ...(atual[tipo] || {}), aprovado: true, paymentId };
      const novo = { ...prev, [produtoId]: atual };
      gravarComprasAprovadasLS(novo);
      return novo;
    });
  };
  const marcarDadosEnviados = (produtoId) => {
    setComprasAprovadas((prev) => {
      const atual = { ...(prev[produtoId] || {}) };
      atual.fisico = { ...(atual.fisico || {}), dadosEnviados: true };
      const novo = { ...prev, [produtoId]: atual };
      gravarComprasAprovadasLS(novo);
      return novo;
    });
  };

  // Ao voltar do Mercado Pago, confirma o pagamento de verdade no servidor (nunca confia
  // só no que vem na URL) e, se aprovado, abre direto o produto já liberado.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id") || params.get("collection_id");
    if (!paymentId) return;
    setVerificandoPagamento(true);
    fetch(`/api/verificar-pagamento?payment_id=${encodeURIComponent(paymentId)}`)
      .then((r) => r.json())
      .then((dados) => {
        if (dados && dados.status === "approved" && dados.external_reference) {
          const partes = String(dados.external_reference).split(":");
          const produtoId = partes[0];
          const tipo = partes[1];
          if (produtoId && tipo) {
            marcarAprovado(produtoId, tipo, paymentId);
            setProdutoAbertoId(produtoId);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setVerificandoPagamento(false);
        const url = new URL(window.location.href);
        url.search = "";
        window.history.replaceState({}, "", url.toString());
        requestAnimationFrame(() => {
          const el = document.getElementById("loja");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const escolherTipo = async (produto, tipo) => {
    const valor = tipo === "digital" ? precoParaNumero(produto.precoPdf) : precoParaNumero(produto.precoFisico);
    if (!valor) {
      alert("O preço ainda não foi definido pelo admin.");
      return;
    }
    const referencia = `${produto.id}:${tipo}:${uid()}`;
    try {
      const resp = await fetch("/api/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: `${produto.nome} (${tipo === "digital" ? "Digital/PDF" : "Físico"})`, preco: valor, referencia }),
      });
      const dados = await resp.json();
      if (dados && dados.url) {
        window.location.href = dados.url;
      } else {
        alert("Não foi possível iniciar o pagamento agora. Tente novamente em instantes.");
      }
    } catch (e) {
      alert("Não foi possível iniciar o pagamento agora. Verifique sua conexão.");
    }
  };

  const comprarGenerico = async (produto) => {
    const valor = precoParaNumero(produto.preco);
    if (!valor) {
      alert("O preço ainda não foi definido pelo admin.");
      return;
    }
    try {
      const resp = await fetch("/api/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: produto.nome, preco: valor, referencia: `${produto.id}:geral:${uid()}` }),
      });
      const dados = await resp.json();
      if (dados && dados.url) {
        window.location.href = dados.url;
      } else {
        alert("Não foi possível iniciar o pagamento agora. Tente novamente em instantes.");
      }
    } catch (e) {
      alert("Não foi possível iniciar o pagamento agora. Verifique sua conexão.");
    }
  };

  const statusProduto = produtoAberto ? comprasAprovadas[produtoAberto.id] || {} : {};
  const digitalAprovado = !!statusProduto.digital?.aprovado;
  const fisicoAprovado = !!statusProduto.fisico?.aprovado;
  const fisicoEnviado = !!statusProduto.fisico?.dadosEnviados;
  const naoLiberadoDigital = produtoAberto && (produtoAberto.pdfNaoLiberado === true || produtoAberto.pdfNaoLiberado === "Sim");
  const esgotadoFisico = produtoAberto && (produtoAberto.fisicoEsgotado === true || produtoAberto.fisicoEsgotado === "Sim");

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Eyebrow><ShoppingBag size={12} className="inline mr-1" />Livros, roupas e utensílios cristãos</Eyebrow>
        <SectionTitle>Loja Avivar</SectionTitle>
        {verificandoPagamento && <p className="text-sm mt-3 italic" style={{ color: C.stone }}>Verificando pagamento…</p>}
        {itemsLoja.length === 0 && <div className="mt-6"><Empty text="Nenhum produto cadastrado ainda." /></div>}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 mt-6">
          {itemsLoja.map((p) => (
            <div key={p.id} className="rounded-xl border overflow-hidden w-full flex flex-col lg:flex-row" style={{ borderColor: C.line, background: C.parchment }}>
              <button onClick={() => abrirProduto(p.id)} className="block lg:w-40 lg:flex-shrink-0 focus:outline-none focus:ring-2">
                <ImgOrPlaceholder url={p.imageUrl} alt={p.nome} className="w-full h-32 lg:h-full object-contain" />
              </button>
              <div className="p-4 flex flex-col flex-1">
                {p.categoria && <p className="text-xs font-mono" style={{ color: C.stone }}>{p.categoria}</p>}
                <button onClick={() => abrirProduto(p.id)} className="block w-full text-left focus:outline-none focus:ring-2">
                  <h3 className="font-display font-semibold mt-1">{p.nome}</h3>
                </button>
                {p.descricao && <p className="text-xs mt-1 flex-1" style={{ color: C.stone }}>{p.descricao}</p>}
                {p.preco && <p className="font-display font-bold mt-2" style={{ color: C.ember }}>{p.preco}</p>}
                <Btn color={C.gold} className="w-full justify-center mt-2 lg:mt-auto" onClick={() => abrirProduto(p.id)}>
                  <ShoppingBag size={13} /> Comprar
                </Btn>
                {adminMode && <button onClick={() => del(p.id)} className="text-xs underline mt-2" style={{ color: "#B03428" }}>excluir</button>}
              </div>
            </div>
          ))}
        </div>

        {/* Página de venda — overlay em tela cheia: abre na hora, sem precisar rolar */}
        {produtoAberto && (
          <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: C.parchment }}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
              <VoltarBtn onClick={fecharProduto} />
              <div className="mt-4 rounded-xl border p-5 sm:p-6 grid sm:grid-cols-[260px_1fr] gap-6" style={{ borderColor: C.gold, background: C.parchment }}>
                <div className="flex flex-col gap-4 h-full">
                  <ImgOrPlaceholder url={produtoAberto.capaVendaUrl || produtoAberto.imageUrl} alt={produtoAberto.nome} className="w-full h-56 sm:h-64 object-contain rounded-lg flex-shrink-0" />
                  {produtoAberto.descricao && (
                    <div className="flex-1">
                      <p className="text-xs font-mono uppercase" style={{ color: C.stone }}>Sinopse</p>
                      <p className="text-sm mt-1 whitespace-pre-line" style={{ color: C.ink }}>{produtoAberto.descricao}</p>
                    </div>
                  )}
                </div>
                <div>
                  {produtoAberto.categoria && <p className="text-xs font-mono" style={{ color: C.stone }}>{produtoAberto.categoria}</p>}
                  <h3 className="font-display text-xl font-semibold mt-1" style={{ color: C.ink }}>{produtoAberto.nome}</h3>
                  {produtoAberto.autor && <p className="text-xs font-mono mt-1" style={{ color: C.ember }}>{produtoAberto.autor}</p>}

                  {produtoAberto.categoria === "Códigos Avivar" ? (
                    <div className="mt-4">
                      {/* DIGITAL — aprovado: libera downloads em verde */}
                      {digitalAprovado && (
                        <div className="p-3 rounded-lg border mb-3" style={{ borderColor: GREEN, background: C.cream }}>
                          <p className="text-xs font-mono uppercase" style={{ color: GREEN }}>Pagamento confirmado — Digital</p>
                          <div className="flex flex-col gap-2 mt-2">
                            {produtoAberto.pdfUrl && (
                              <a href={produtoAberto.pdfUrl} download>
                                <Btn color={GREEN} className="w-full justify-center"><FileText size={14} /> BAIXAR PDF</Btn>
                              </a>
                            )}
                            {produtoAberto.imageUrl && (
                              <a href={produtoAberto.imageUrl} download>
                                <Btn color={GREEN} className="w-full justify-center"><ImageIcon size={14} /> BAIXAR CAPA</Btn>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* FÍSICO — aprovado: pede dados de envio, depois confirma */}
                      {fisicoAprovado && (
                        <div className="p-3 rounded-lg border mb-3" style={{ borderColor: GREEN, background: C.cream }}>
                          <p className="text-xs font-mono uppercase" style={{ color: GREEN }}>Pagamento confirmado — Físico</p>
                          {fisicoEnviado ? (
                            <p className="text-sm mt-2" style={{ color: GREEN }}>Seu pedido já está sendo preparado. Aguarde para receber os dados via WhatsApp cadastrado.</p>
                          ) : (
                            <>
                              {!mostrarFormFisico ? (
                                <Btn color={GREEN} className="w-full justify-center mt-2" onClick={() => setMostrarFormFisico(true)}>
                                  <Send size={14} /> PREENCHER DADOS DE ENVIO
                                </Btn>
                              ) : (
                                <div className="mt-3">
                                  <DynamicForm
                                    fields={PEDIDO_FISICO_FIELDS}
                                    submitLabel="Enviar dados de envio"
                                    onSubmit={(v) => {
                                      if (!v.nomeRecebedor || !v.whatsapp) return;
                                      savePedidosFisicos([...(pedidosFisicos || []), { id: uid(), produtoId: produtoAberto.id, produtoNome: produtoAberto.nome, ...v, status: "novo", timestamp: nowISO() }]);
                                      marcarDadosEnviados(produtoAberto.id);
                                      setMostrarFormFisico(false);
                                    }}
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* Ainda falta escolher/pagar alguma modalidade */}
                      {(!digitalAprovado || !fisicoAprovado) && (
                        <div>
                          {!mostrarOpcoesCompra ? (
                            <Btn color={C.gold} className="w-full justify-center" onClick={() => setMostrarOpcoesCompra(true)}>
                              <ShoppingBag size={14} /> Comprar
                            </Btn>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              {!fisicoAprovado && (
                                esgotadoFisico ? (
                                  <div className="p-3 rounded-lg border text-center" style={{ borderColor: C.line, background: C.cream }}>
                                    <p className="text-xs font-mono uppercase" style={{ color: C.stone }}>Físico</p>
                                    <p className="text-[11px] italic mt-1" style={{ color: C.stone }}>Tiragem esgotada</p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => escolherTipo(produtoAberto, "fisico")}
                                    className="p-3 rounded-lg border text-center transition hover:-translate-y-0.5"
                                    style={{ borderColor: C.gold, background: C.gold, color: "#fff" }}
                                  >
                                    <p className="font-display font-bold">FÍSICO</p>
                                    <p className="text-xs mt-1">{produtoAberto.precoFisico || "valor a definir"}</p>
                                  </button>
                                )
                              )}
                              {!digitalAprovado && (
                                naoLiberadoDigital ? (
                                  <div className="p-3 rounded-lg border text-center" style={{ borderColor: C.line, background: C.cream }}>
                                    <p className="text-xs font-mono uppercase" style={{ color: C.stone }}>Digital</p>
                                    <p className="text-[11px] italic mt-1" style={{ color: C.stone }}>Em breve</p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => escolherTipo(produtoAberto, "digital")}
                                    className="p-3 rounded-lg border text-center transition hover:-translate-y-0.5"
                                    style={{ borderColor: C.gold, background: C.gold, color: "#fff" }}
                                  >
                                    <p className="font-display font-bold">DIGITAL</p>
                                    <p className="text-xs mt-1">{produtoAberto.precoPdf || "valor a definir"}</p>
                                  </button>
                                )
                              )}
                            </div>
                          )}
                          <p className="text-[10px] italic mt-1.5" style={{ color: C.stone }}>O valor do exemplar físico já inclui o frete.</p>
                        </div>
                      )}

                      {podeVerFrete && (
                        <a href="https://www.correios.com.br/precos-e-prazos" target="_blank" rel="noreferrer" className="block mt-2">
                          <Btn variant="ghost" className="w-full justify-center text-xs"><Truck size={13} /> Calcular frete nos Correios (admin)</Btn>
                        </a>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="font-display font-bold mt-3" style={{ color: C.ember }}>{produtoAberto.preco}</p>
                      <Btn color={C.gold} className="w-full justify-center mt-3" onClick={() => comprarGenerico(produtoAberto)}>
                        <ShoppingBag size={13} /> Comprar
                      </Btn>
                    </>
                  )}

                  {adminMode && produtoAberto.categoria === "Códigos Avivar" && (
                    <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: C.stone, background: "#00000006" }}>
                      {editandoPrecoId === produtoAberto.id ? (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-mono" style={{ color: C.stone }}>
                            Preço Digital/PDF (já pronto pra baixar)
                            <input
                              value={precoPdfEdit}
                              onChange={(e) => setPrecoPdfEdit(e.target.value)}
                              placeholder="Ex: R$ 29,90"
                              className="block w-full mt-1 px-2 py-1 rounded border text-sm"
                              style={{ borderColor: C.line }}
                            />
                          </label>
                          <label className="text-xs font-mono" style={{ color: C.stone }}>
                            Preço Físico (já incluindo o frete)
                            <input
                              value={precoFisicoEdit}
                              onChange={(e) => setPrecoFisicoEdit(e.target.value)}
                              placeholder="Ex: R$ 49,90"
                              className="block w-full mt-1 px-2 py-1 rounded border text-sm"
                              style={{ borderColor: C.line }}
                            />
                          </label>
                          <div className="flex gap-2 mt-1">
                            <Btn color={C.gold} onClick={() => salvarPrecos(produtoAberto)}><Save size={13} /> Salvar preços</Btn>
                            <Btn variant="ghost" onClick={() => setEditandoPrecoId(null)}>Cancelar</Btn>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => abrirEdicaoPreco(produtoAberto)} className="text-xs underline flex items-center gap-1" style={{ color: C.ember }}>
                          <Pencil size={12} /> editar preço
                        </button>
                      )}
                    </div>
                  )}

                  {produtoAberto.categoria !== "Códigos Avivar" && doacoes?.pixKey && (
                    <div className="mt-3">
                      <Btn variant="ghost" className="w-full sm:w-auto justify-center" onClick={() => setPixAbertoId((id) => (id === produtoAberto.id ? null : produtoAberto.id))}>
                        <Send size={13} /> {pixAbertoId === produtoAberto.id ? "Fechar Pix" : "Pagar com Pix"}
                      </Btn>
                      {pixAbertoId === produtoAberto.id && <LojaProdutoPix produto={produtoAberto} doacoes={doacoes} />}
                    </div>
                  )}

                  {produtoAberto.previewUrl && (
                    <a href={produtoAberto.previewUrl} target="_blank" rel="noreferrer" className="inline-block mt-3">
                      <Btn variant="ghost"><FileText size={13} /> Ver amostra (primeiras páginas)</Btn>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {adminMode && pedidosFisicos && pedidosFisicos.length > 0 && (
          <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: C.gold, background: "#00000006" }}>
            <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · pedidos de exemplar físico</p>
            <div className="space-y-2">
              {[...pedidosFisicos].reverse().map((p) => (
                <div key={p.id} className="p-3 rounded-md text-sm" style={{ background: C.parchment }}>
                  <p className="font-display font-semibold">{p.produtoNome}</p>
                  <p className="text-xs mt-1" style={{ color: C.ink }}>{p.nomeRecebedor} · {p.whatsapp}</p>
                  <p className="text-xs" style={{ color: C.stone }}>{p.rua}, {p.cidade} — CEP {p.cep}{p.referencia ? ` (${p.referencia})` : ""}</p>
                  <p className="text-[10px] font-mono mt-1" style={{ color: C.stone }}>{fmtDateTime(p.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
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

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
        {sorted.map((b) => (
          <div key={b.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.line, background: C.parchment }}>
            <button onClick={() => setSelected(b)} className="block w-full text-left focus:outline-none focus:ring-2">
              <div className="relative">
                <ImgOrPlaceholder url={b.capaUrl} alt={b.titulo} className="w-full h-16 sm:h-20 object-cover" ph={b.titulo} />
                {b.linkLoja && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded-full text-white" style={{ background: C.emberDeep }}>à venda</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-display font-semibold text-sm leading-snug">{b.titulo}</p>
                {b.autor && <p className="text-xs mt-0.5" style={{ color: C.stone }}>{b.autor}</p>}
              </div>
            </button>
            {b.pdfUrl && !b.linkLoja && (
              <a href={b.pdfUrl} download className="block px-3 pb-2">
                <span className="text-xs underline" style={{ color: C.violet }}>baixar PDF</span>
              </a>
            )}
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
            <VoltarBtn onClick={() => setSelected(null)} className="mb-2" />
            <h3 className="font-display text-xl font-semibold">{selected.titulo}</h3>
            {selected.autor && <p className="text-xs font-mono mt-1" style={{ color: C.ember }}>{selected.autor}</p>}
            {selected.sinopse && <p className="text-sm mt-3 whitespace-pre-line" style={{ color: C.ink }}>{selected.sinopse}</p>}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {selected.linkLoja ? (
                <button onClick={() => setPage && setPage("loja")}>
                  <Btn><ShoppingBag size={14} /> Ver na Loja Avivar</Btn>
                </button>
              ) : selected.pdfUrl ? (
                <a href={selected.pdfUrl} download>
                  <Btn><FileText size={14} /> Baixar PDF</Btn>
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock size={28} className="mx-auto" color={C.stone} />
        <p className="text-sm mt-3" style={{ color: C.stone }}>Área restrita — acesso administrativo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock size={28} className="mx-auto" color={C.stone} />
        <p className="text-sm mt-3" style={{ color: C.stone }}>Área restrita — acesso administrativo.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
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

function IgrejaCard({ igreja, save, all, adminMode, onOpen }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [descricao, setDescricao] = useState(igreja.descricao || "");

  const update = (patch) => save(all.map((i) => (i.id === igreja.id ? { ...i, ...patch } : i)));
  const regenCode = () => update({ adminCode: "UNI-" + Math.random().toString(36).slice(2, 7).toUpperCase(), adminCodeActive: true });
  const toggleActive = () => update({ adminCodeActive: !igreja.adminCodeActive });
  const del = () => save(all.filter((i) => i.id !== igreja.id));

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#fff", borderLeft: `4px solid ${C.violet}` }}>
      {/* Área clicável — leva para a página própria da unidade (galeria, eventos, escala, doações etc.) */}
      <button onClick={() => onOpen && onOpen(igreja.id)} className="block w-full text-left focus:outline-none focus:ring-2" title="Ver página desta unidade">
        <ImgOrPlaceholder url={igreja.fotoUrl} alt={igreja.nome} className="w-full h-40 object-cover" />
        <div className="p-4 pb-0">
          <h3 className="font-display font-semibold text-lg underline decoration-dotted" style={{ color: C.ink }}>{igreja.nome}</h3>
          <p className="text-xs font-mono mt-1" style={{ color: C.stone }}>{igreja.cidade}</p>
          <p className="text-sm mt-2" style={{ color: C.ink }}>{igreja.endereco}</p>
          <p className="text-sm" style={{ color: C.ink }}>Pastor(a): {igreja.pastor}</p>
          {descricao && <p className="text-sm mt-2" style={{ color: C.stone }}>{descricao}</p>}
        </div>
      </button>
      <div className="p-4 pt-2">
        {igreja.telefone && (
          <a href={waLink(igreja.telefone, `Olá! Vim através do site do Ministério Avivar do Espírito.`)} target="_blank" rel="noreferrer" className="text-xs mt-2 inline-flex items-center gap-1" style={{ color: C.ember }}>
            <Phone size={12} /> {igreja.telefone}
          </a>
        )}
        <button onClick={() => onOpen && onOpen(igreja.id)} className="text-xs underline mt-2 block" style={{ color: C.violet }}>
          Acessar página da unidade →
        </button>

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

function Igrejas({ igrejas, save, adminMode, onOpenIgreja }) {
  const addIgreja = (v) => save([...igrejas, { id: uid(), adminCode: "UNI-" + Math.random().toString(36).slice(2, 7).toUpperCase(), adminCodeActive: true, ...v }]);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Uma família, várias casas</Eyebrow>
      <SectionTitle>Unidades do Ministério</SectionTitle>
      {/* Moldura da seção Unidades, igual à do Ao Vivo — só muda a cor do filete (roxo) */}
      <div className="rounded-2xl border-2 p-4 sm:p-6 mt-6" style={{ borderColor: C.gold, background: C.cream }}>
        {igrejas.length === 0 && <Empty text="Nenhuma unidade cadastrada ainda." />}
        <div className={GRID3}>
          {igrejas.map((i) => (
            <IgrejaCard key={i.id} igreja={i} save={save} all={igrejas} adminMode={adminMode} onOpen={onOpenIgreja} />
          ))}
        </div>
        {adminMode && (
          <div className="mt-8">
            <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · nova unidade</p>
            <DynamicForm fields={IGREJA_FIELDS} onSubmit={addIgreja} submitLabel="Cadastrar unidade" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Página própria de cada Unidade Avivar — "o mesmo site do Ministério,        */
/* com algumas diferenças": reaproveita os mesmos componentes genéricos       */
/* (galeria/eventos, orações nos lares, escala, doações, visitantes,          */
/* carrossel de notícias) só que com os dados da própria unidade, guardados   */
/* dentro do próprio objeto da igreja em vez do estado global do site.        */
/* Não tem Códigos Avivar nem Avivar Music, como pedido.                       */
/* ---------------------------------------------------------------- */
const PAGINA_IGREJA_NEWS_FIELDS = [
  { key: "titulo", label: "Título da notícia" },
  { key: "texto", label: "Texto", type: "textarea" },
  { key: "imageUrl", label: "URL da imagem", type: "url" },
  { key: "videoUrl", label: "URL do vídeo (opcional)", type: "url" },
];

function PaginaIgreja({ igreja, all, save, adminMode, onVoltar }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [newsAbrirId, setNewsAbrirId] = useState(null);
  // Admin da unidade (código próprio) ou admin geral do site podem editar tudo aqui.
  const canManage = adminMode || unlocked;

  const patch = (fields) => save(all.map((i) => (i.id === igreja.id ? { ...i, ...fields } : i)));

  const noticias = igreja.noticias || [];
  const addNoticia = (v) => patch({ noticias: [...noticias, { id: uid(), ...v, timestamp: nowISO() }] });
  const delNoticia = (id) => patch({ noticias: noticias.filter((n) => n.id !== id) });
  const noticiaAberta = noticias.find((n) => n.id === newsAbrirId) || null;
  const noticiasOrdenadas = [...noticias].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const excluirUnidade = () => {
    save(all.filter((i) => i.id !== igreja.id));
    onVoltar();
  };

  return (
    <div className="min-h-screen font-body" style={{ background: C.parchment, color: C.ink }}>
      {/* Cabeçalho simplificado da unidade, com espaço para o logotipo próprio */}
      <header className="sticky top-0 z-40 border-b" style={{ background: C.black, borderColor: C.gold + "55" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 py-3">
          <button onClick={onVoltar} className="flex items-center gap-2 text-sm focus:outline-none focus:ring-2 rounded-md" style={{ color: C.goldBright }}>
            <ArrowLeft size={16} /> Voltar ao site do Ministério
          </button>
          <div className="flex items-center gap-2">
            <img src={igreja.logoUrl || LOGO_ICON} alt={igreja.nome} className="h-9 w-auto rounded" />
            <span className="font-display font-semibold text-sm hidden sm:inline" style={{ color: "#fff" }}>{igreja.nome}</span>
          </div>
        </div>
      </header>

      {/* Hero da unidade — mesmo espírito do Hero principal do site, com a foto da unidade */}
      <div className="relative">
        <ImgOrPlaceholder url={igreja.fotoUrl} alt={igreja.nome} className="w-full h-56 sm:h-72 object-cover" ph="Foto de destaque da unidade — adicionar depois" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #000000cc, #00000010)" }} />
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-4 sm:px-6 pb-5">
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: C.goldBright }}>Unidade Avivar · {igreja.cidade}</p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold" style={{ color: "#fff" }}>{igreja.nome}</h1>
          <p className="text-sm mt-1" style={{ color: "#fff" }}>Pastor(a): {igreja.pastor}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center gap-3">
        {igreja.telefone && (
          <a href={waLink(igreja.telefone, `Olá! Vim através da página da unidade ${igreja.nome}, do Ministério Avivar do Espírito.`)} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 px-3 py-2 rounded-md" style={{ background: "#25D36622", color: "#1B8A55" }}>
            <Phone size={13} /> {igreja.telefone}
          </a>
        )}
        {igreja.endereco && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(igreja.endereco)}`} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 px-3 py-2 rounded-md border" style={{ borderColor: C.line, color: C.ink }}>
            <MapPin size={13} /> Como chegar
          </a>
        )}
        <a href={BIBLIA_URL} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 px-3 py-2 rounded-md border" style={{ borderColor: C.gold, color: C.goldDeep }}>
          <BookOpen size={13} /> Bíblia Avivar
        </a>

        {!canManage ? (
          <button onClick={() => setGateOpen((v) => !v)} className="text-xs underline ml-auto" style={{ color: C.violet }}>Acesso da unidade</button>
        ) : (
          <span className="text-xs ml-auto" style={{ color: "#2E7D4F" }}>Editando como admin da unidade</span>
        )}
      </div>
      {gateOpen && !canManage && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 pb-4 flex gap-2">
          <input placeholder="Código da unidade" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} className={`${inputCls} max-w-xs text-xs`} style={{ borderColor: C.line }} />
          <Btn variant="ghost" color={C.violet} onClick={() => { if (igreja.adminCodeActive && codeInput.trim().toUpperCase() === igreja.adminCode) setUnlocked(true); }}>Entrar</Btn>
        </div>
      )}

      {/* Mesmo carrossel de notícias (Google News) do site principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <NoticiasCarousel />
      </div>

      {/* Sobre a unidade */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {canManage ? (
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-mono" style={{ color: C.stone }}>Descrição da unidade</p>
            <textarea rows={3} placeholder="Descrição da unidade" defaultValue={igreja.descricao || ""} onBlur={(e) => patch({ descricao: e.target.value })} className={inputCls} style={{ borderColor: C.line }} />
            <p className="text-[11px] italic" style={{ color: C.stone }}>Salvo ao sair do campo.</p>
          </div>
        ) : (
          igreja.descricao && <p className="text-sm max-w-xl" style={{ color: C.stone }}>{igreja.descricao}</p>
        )}
      </div>

      {/* Notícias da própria unidade */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Eyebrow>Fique por dentro</Eyebrow>
        <SectionTitle>Notícias da Unidade</SectionTitle>
        {noticiasOrdenadas.length === 0 && <div className="mt-4"><Empty text="Nenhuma notícia publicada ainda por esta unidade." /></div>}
        <div className={`${GRID3} mt-4`}>
          {noticiasOrdenadas.map((n) => (
            <div key={n.id} className="rounded-xl overflow-hidden border" style={{ borderColor: C.line }}>
              <button onClick={() => setNewsAbrirId(n.id)} className="block w-full text-left focus:outline-none focus:ring-2">
                {n.imageUrl && <ImgOrPlaceholder url={n.imageUrl} alt={n.titulo} className="w-full h-32 object-cover" />}
                <div className="p-3">
                  <p className="text-xs font-mono" style={{ color: C.stone }}>{fmtDateTime(n.timestamp)}</p>
                  <p className="font-display font-semibold text-sm mt-1">{n.titulo}</p>
                </div>
              </button>
              {canManage && <button onClick={() => delNoticia(n.id)} className="text-[10px] underline mx-3 mb-2" style={{ color: "#B03428" }}>excluir</button>}
            </div>
          ))}
        </div>
        {canManage && (
          <div className="mt-6">
            <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN DA UNIDADE · nova notícia</p>
            <DynamicForm fields={PAGINA_IGREJA_NEWS_FIELDS} onSubmit={(v) => v.titulo && addNoticia(v)} submitLabel="Publicar notícia" />
          </div>
        )}
      </div>
      <ReportagemModal news={noticiaAberta} adminMode={canManage} onClose={() => setNewsAbrirId(null)} onDelete={() => { delNoticia(newsAbrirId); setNewsAbrirId(null); }} />

      {/* Eventos & Galeria da unidade */}
      <EventosGaleria eventos={igreja.eventos || []} saveEventos={(v) => patch({ eventos: v })} galeria={igreja.galeria || []} saveGaleria={(v) => patch({ galeria: v })} adminMode={canManage} />

      {/* Orações nos Lares da unidade */}
      <OracoesLares
        items={igreja.oracoes || []}
        save={(v) => patch({ oracoes: v })}
        encontros={igreja.oracaoEncontros || []}
        saveEncontros={(v) => patch({ oracaoEncontros: v })}
        adminMode={canManage}
        operatorMode={false}
        onRequestOperator={() => setGateOpen(true)}
        localDia={igreja.oracaoLocalDia || { fotoUrl: "", local: "" }}
        saveLocalDia={(v) => patch({ oracaoLocalDia: v })}
      />

      {/* Escala de Obreiros da unidade — mesmos links de confirmação via WhatsApp */}
      <EscalaObreiros
        data={igreja.escala || DEFAULT_ESCALA_OBREIROS}
        save={(v) => patch({ escala: v })}
        adminMode={canManage}
        operatorMode={false}
        onRequestOperator={() => setGateOpen(true)}
      />

      {/* Dízimos e Ofertas da unidade */}
      <Doacoes data={igreja.doacoes || DEFAULT_DOACOES} save={(v) => patch({ doacoes: v })} adminMode={canManage} />

      {/* Cadastro de Visitantes da unidade — já vem em moldura própria */}
      <Visitantes items={igreja.visitantes || []} save={(v) => patch({ visitantes: v })} adminMode={canManage} operatorMode={false} onRequestOperator={() => setGateOpen(true)} />

      {canManage && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t" style={{ borderColor: C.line }}>
          <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN DA UNIDADE · logotipo próprio</p>
          <DynamicForm fields={[{ key: "logoUrl", label: "URL do logotipo da unidade", type: "url" }]} onSubmit={(v) => v.logoUrl && patch({ logoUrl: v.logoUrl })} submitLabel="Salvar logotipo" />
          {adminMode && (
            <button onClick={excluirUnidade} className="text-xs underline mt-4 block" style={{ color: "#B03428" }}>excluir esta unidade (admin geral)</button>
          )}
        </div>
      )}

      <div className="py-10 text-center">
        <button onClick={onVoltar} className="text-sm underline" style={{ color: C.violet }}>← Voltar ao site do Ministério Avivar do Espírito</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Cursos dos Códigos Avivar (página própria — "em breve")             */
/* ---------------------------------------------------------------- */
// Página cheia (sem rolar a home), no mesmo padrão de PaginaIgreja: assume a tela
// inteira, com botão "voltar" no cabeçalho. Por enquanto é só a estrutura pronta
// pra receber cursos, PDFs e vídeos depois — três colunas, cada uma com sua frase
// "EM BREVE"; quando o conteúdo real chegar, cada coluna vira uma lista de itens.
const CURSOS_COLUNAS = [
  { titulo: "Cursos", icone: GraduationCap, frase: "Em breve, cursos completos para aprofundar sua caminhada nos Códigos Avivar." },
  { titulo: "PDFs", icone: FileText, frase: "Em breve, materiais em PDF para estudo, consulta e impressão." },
  { titulo: "Vídeos", icone: PlayCircle, frase: "Em breve, videoaulas e conteúdos exclusivos em vídeo." },
];
const CORES_CURSOS = ["#FBF1DE", "#E7F0FB", "#FBE9F0"];

function PaginaCursos({ onVoltar }) {
  return (
    <div className="min-h-screen font-body" style={{ background: C.parchment, color: C.ink }}>
      <header className="sticky top-0 z-40 border-b" style={{ background: C.black, borderColor: C.gold + "55" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 py-3">
          <button onClick={onVoltar} className="flex items-center gap-2 text-sm focus:outline-none focus:ring-2 rounded-md" style={{ color: C.goldBright }}>
            <ArrowLeft size={16} /> Voltar ao site do Ministério
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap size={20} color={C.goldBright} />
            <span className="font-display font-semibold text-sm" style={{ color: "#fff" }}>Cursos dos Códigos Avivar</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-14">
        <Eyebrow><KeyRound size={12} className="inline mr-1" />Códigos Avivar</Eyebrow>
        <SectionTitle>Cursos, PDFs e Vídeos</SectionTitle>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: C.stone }}>
          Um espaço dedicado ao ensino mais profundo dos Códigos Avivar. Em breve, você encontrará aqui cursos completos,
          materiais para baixar e vídeos exclusivos — organizados nas colunas abaixo.
        </p>

        <div className="grid sm:grid-cols-3 gap-5 mt-8">
          {CURSOS_COLUNAS.map((c, idx) => {
            const Icon = c.icone;
            return (
              <div key={c.titulo} className="rounded-2xl border-2 p-5 flex flex-col items-center text-center gap-3" style={{ borderColor: C.gold, background: CORES_CURSOS[idx % CORES_CURSOS.length] }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: C.violetDeep }}>
                  <Icon size={26} color={C.goldBright} />
                </div>
                <h3 className="font-display font-semibold text-base" style={{ color: C.ink }}>{c.titulo}</h3>
                <p className="text-xs" style={{ color: C.stone }}>{c.frase}</p>
                <span className="mt-2 inline-block text-[10px] font-mono font-semibold tracking-wider px-3 py-1 rounded-full" style={{ background: C.gold, color: "#241C00" }}>EM BREVE</span>
              </div>
            );
          })}
        </div>
      </div>
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
            <ImgOrPlaceholder url={c.fotoUrl} alt={c.nome} className="w-full h-44 object-cover" ph={c.nome} />
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
// Ordem fixa de exibição na tabela "Escala de Serviços Ministeriais" — postos que não
// estiverem nessa lista (customizados pelo admin) aparecem depois, na ordem cadastrada.
const ORDEM_POSTOS_TABELA = ["Abertura e Semeadura", "Pregação", "Ofertas", "Kids", "Slides", "Mídia", "Recepção", "Louvor", "Anjos de Luz"];
const HORARIOS_PADRAO = [
  { dia: "Quarta-feira", inicio: "19:20", fim: "21:00" },
  { dia: "Sexta-feira", inicio: "19:20", fim: "21:00" },
  { dia: "Domingo", inicio: "18:30", fim: "20:00" },
];
const DEFAULT_ESCALA_OBREIROS = { obreiros: OBREIROS_PADRAO, postos: POSTOS_PADRAO, horarios: HORARIOS_PADRAO, escalasPorDia: {}, telefonesObreiros: {} };

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

// Página pública de confirmação de escala — aberta pelo link enviado no WhatsApp
// (?escalaId=...), sem precisar de senha nem de navegar o site. O obreiro cai direto
// aqui, vê pra qual posto/horário foi escalado, e confirma Disponível/Indisponível
// com um toque — a mesma escala fica visível pra administração em tempo real.
function ConfirmarEscalaObreiro({ escala, save, escalaId, onVoltar }) {
  const safeData = {
    ...DEFAULT_ESCALA_OBREIROS,
    ...(escala || {}),
    escalasPorDia: (escala && escala.escalasPorDia) || {},
  };
  const [editando, setEditando] = useState(false);

  let dataEncontrada = null, diaEncontrado = null, escaladoEncontrado = null;
  for (const [dataStr, dia] of Object.entries(safeData.escalasPorDia)) {
    const achado = (dia.escalados || []).find((e) => e.id === escalaId);
    if (achado) {
      dataEncontrada = dataStr;
      diaEncontrado = dia;
      escaladoEncontrado = achado;
      break;
    }
  }

  if (!escaladoEncontrado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.cream }}>
        <div className="max-w-sm text-center">
          <ClipboardList size={28} className="mx-auto" color={C.stone} />
          <p className="font-display text-lg font-semibold mt-3">Link não encontrado</p>
          <p className="text-sm mt-1" style={{ color: C.stone }}>
            Esse link de confirmação não existe mais (talvez você já tenha sido removido da escala, ou o link esteja incompleto). Fale com a administração.
          </p>
          <button onClick={onVoltar} className="text-sm underline mt-4" style={{ color: C.violet }}>Ver o site completo</button>
        </div>
      </div>
    );
  }

  const fechado = !!diaEncontrado.conferidoEm;
  const diaSemana = diaSemanaFromData(dataEncontrada);
  const horario = horarioDoDia(diaSemana, safeData.horarios);
  const statusAtual = escaladoEncontrado.status;
  const jaTravado = escaladoEncontrado.travado;

  const marcar = (status) => {
    const novosEscalados = diaEncontrado.escalados.map((e) =>
      e.id === escalaId ? { ...e, status, horarioConfirmacao: nowISO() } : e
    );
    save({ ...safeData, escalasPorDia: { ...safeData.escalasPorDia, [dataEncontrada]: { ...diaEncontrado, escalados: novosEscalados } } });
    setEditando(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.cream }}>
      <div className="max-w-sm w-full rounded-2xl border p-6 text-center" style={{ borderColor: C.gold, background: "#fff" }}>
        <ClipboardList size={28} className="mx-auto" color={C.ember} />
        <p className="text-xs font-mono uppercase mt-3" style={{ color: C.stone }}>Confirmação de Escala</p>
        <p className="font-display text-xl font-semibold mt-1">{escaladoEncontrado.obreiroNome}</p>
        <p className="text-sm mt-2" style={{ color: C.ink }}>Posto: <b>{escaladoEncontrado.posto}</b></p>
        <p className="text-sm" style={{ color: C.ink }}>{diaSemana}, {fmtDate(dataEncontrada)}{horario ? ` · ${horario.inicio}–${horario.fim}` : ""}</p>

        {fechado ? (
          <p className="text-sm mt-5 italic" style={{ color: C.stone }}>
            Essa escala já foi conferida pela administração. Se precisar mudar algo, fale diretamente com a liderança.
          </p>
        ) : jaTravado ? (
          <p className="text-sm mt-5" style={{ color: statusAtual === "disponivel" ? "#2E7D4F" : C.liveRed }}>
            Você já confirmou: <b>{statusAtual === "disponivel" ? "Disponível" : "Indisponível"}</b>
          </p>
        ) : statusAtual !== "aguardando" && !editando ? (
          <>
            <p className="text-sm mt-5 font-semibold" style={{ color: statusAtual === "disponivel" ? "#2E7D4F" : C.liveRed }}>
              Confirmado: {statusAtual === "disponivel" ? "Disponível" : "Indisponível"}
            </p>
            <button onClick={() => setEditando(true)} className="text-xs underline mt-2" style={{ color: C.stone }}>mudei de ideia</button>
          </>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            <Btn color="#2E7D4F" className="w-full justify-center" onClick={() => marcar("disponivel")}>Estou disponível</Btn>
            <Btn variant="ghost" color={C.liveRed} className="w-full justify-center" onClick={() => marcar("indisponivel")}>Não vou poder</Btn>
          </div>
        )}

        <button onClick={onVoltar} className="text-xs underline mt-6 block mx-auto" style={{ color: C.stone }}>ver o site completo</button>
      </div>
    </div>
  );
}

// Escala de Obreiros — fluxo por posto: cada posto tem uma caixa de obreiros
// disponíveis; ao clicar, o obreiro "sai" da caixa e passa a aparecer escalado
// naquele posto. Só depois de escalado surgem os botões Disponível/Indisponível,
// com horário da confirmação e a opção de "Mudei de ideia" (com motivo).
function EscalaObreiros({ data, save, adminMode, operatorMode, onRequestOperator }) {
  const canManage = adminMode || operatorMode;
  const safeData = {
    ...DEFAULT_ESCALA_OBREIROS,
    ...(data || {}),
    escalasPorDia: (data && data.escalasPorDia) || {},
    telefonesObreiros: (data && data.telefonesObreiros) || {},
  };
  const [dataCulto, setDataCulto] = useState(() => new Date().toISOString().slice(0, 10));
  const [novoObreiro, setNovoObreiro] = useState("");
  const [novoPosto, setNovoPosto] = useState("");
  const [novoHorario, setNovoHorario] = useState({ dia: DIAS_SEMANA_PT[0], inicio: "19:00", fim: "21:00" });
  const [renomeando, setRenomeando] = useState(null); // { tipo: "obreiro"|"posto", original, valor }
  const [mudandoIdeiaId, setMudandoIdeiaId] = useState(null);
  const [motivoDraft, setMotivoDraft] = useState("");
  const [nomeConferente, setNomeConferente] = useState("");
  const [obsAbertoId, setObsAbertoId] = useState(null); // id do escalado com o campo de texto de observação aberto
  const [obsTextoDraft, setObsTextoDraft] = useState("");

  const diaSemana = diaSemanaFromData(dataCulto);
  const horarioAtual = horarioDoDia(diaSemana, safeData.horarios);

  const diaAtual = safeData.escalasPorDia[dataCulto] || { escalados: [], conferidoPor: null, conferidoEm: null };
  const escalados = diaAtual.escalados || [];
  const fechado = !!diaAtual.conferidoEm;
  const podeMexerNoDia = canManage; // admin/operador sempre podem mexer, mesmo fechado
  const disponiveis = safeData.obreiros.filter((o) => !escalados.some((e) => e.obreiroNome === o));
  // Ordem fixa dos ministérios na tabela-resumo — postos customizados que não estejam
  // na ordem padrão entram no final, na ordem em que foram cadastrados.
  const postosTabela = [
    ...ORDEM_POSTOS_TABELA.filter((p) => safeData.postos.includes(p)),
    ...safeData.postos.filter((p) => !ORDEM_POSTOS_TABELA.includes(p)),
  ];

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
  const responderObs = (id, respondeu, texto) => {
    salvarDia({
      escalados: escalados.map((e) => (e.id === id ? { ...e, respondeuObs: true, textoObs: respondeu ? texto || "" : "", travado: true } : e)),
    });
    setObsAbertoId(null);
    setObsTextoDraft("");
  };

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
  const setTelefoneObreiro = (nome, tel) =>
    save({ ...safeData, telefonesObreiros: { ...safeData.telefonesObreiros, [nome]: tel } });

  // Link público de confirmação — abre a própria página de "Confirmar Escala" (sem
  // precisar de login/senha), identificando o escalado pelo id. É esse link que vai
  // dentro da mensagem de WhatsApp pro obreiro confirmar disponibilidade sozinho.
  const linkConfirmacaoEscala = (escaladoId) =>
    `${window.location.origin}${window.location.pathname}?escalaId=${escaladoId}`;
  const mensagemWhatsappEscala = (e) => {
    const dia = diaSemanaFromData(dataCulto);
    const h = horarioDoDia(dia, safeData.horarios);
    const primeiroNome = (e.obreiroNome || "").split(" ")[0] || e.obreiroNome;
    return (
      `Olá, ${primeiroNome}! Você foi escalado(a) para o posto *${e.posto}* no culto de ${dia}, ${fmtDate(dataCulto)}` +
      `${h ? ` às ${h.inicio}` : ""}.\n\nPor favor, confirme sua disponibilidade clicando no link abaixo:\n${linkConfirmacaoEscala(e.id)}`
    );
  };
  const enviarWhatsappEscala = (e) => {
    const tel = safeData.telefonesObreiros[e.obreiroNome];
    const msg = mensagemWhatsappEscala(e);
    const link = tel && digitsOnly(tel) ? waLink(tel, msg) : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(link, "_blank", "noopener,noreferrer");
  };
  // Mensagem única com a escala inteira do dia, cada nome com o SEU PRÓPRIO link de
  // confirmação — pensada pra postar de uma vez só num grupo (ex: grupo da igreja no
  // WhatsApp) em vez de mandar um link de cada vez. Cada obreiro só deve clicar no
  // link com o próprio nome; quem clicar no link de outra pessoa confirma em nome dela,
  // já que o link não sabe quem está clicando, só qual escalado ele representa.
  const mensagemEscalaCompletaWhatsapp = () => {
    const dia = diaSemanaFromData(dataCulto);
    const h = horarioDoDia(dia, safeData.horarios);
    const linhas = escalados.map((e) => `• ${e.obreiroNome} (${e.posto}): ${linkConfirmacaoEscala(e.id)}`).join("\n");
    return (
      `📋 *Escala de Serviços Ministeriais* — ${dia}, ${fmtDate(dataCulto)}${h ? ` · ${h.inicio}–${h.fim}` : ""}\n\n` +
      `Cada um, confirme clicando SÓ no seu próprio link (Disponível/Indisponível):\n\n${linhas}`
    );
  };
  const enviarEscalaCompletaWhatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagemEscalaCompletaWhatsapp())}`, "_blank", "noopener,noreferrer");
  };

  const StatusObreiro = ({ e }) => {
    if (e.travado) {
      // Status travado — depois de responder às observações, a pessoa não pode mais
      // alterar o status, então mostramos só o texto, sem os botões de troca.
      if (e.status === "aguardando") {
        return <span className="text-xs italic" style={{ color: C.stone }}>aguardando confirmação</span>;
      }
      const isDispTravado = e.status === "disponivel";
      return (
        <span className="inline-flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold" style={{ color: isDispTravado ? "#2E7D4F" : C.liveRed }}>
            {isDispTravado ? "Disponível" : "Indisponível"}
          </span>
          {e.horarioConfirmacao && <span style={{ color: C.stone }}>· {fmtHM(e.horarioConfirmacao)}</span>}
        </span>
      );
    }
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

  // Coluna Observações da tabela-resumo — fluxo Sim/Não: "Não" trava direto sem texto,
  // "Sim" abre um campo curto; depois de respondido, mostra só o texto salvo (sem opção de alterar).
  const ObsCell = ({ e }) => {
    if (e.respondeuObs) {
      return (
        <span className="text-xs" style={{ color: C.stone }}>
          {e.textoObs ? e.textoObs : <span className="italic">sem observações</span>}
        </span>
      );
    }
    if (obsAbertoId === e.id) {
      if (!canManage) {
        return <span className="text-xs italic" style={{ color: C.stone }}>aguardando revisão (admin)</span>;
      }
      return (
        <span className="flex items-center gap-1 flex-wrap">
          <input
            autoFocus
            placeholder="Observação (curta)"
            value={obsTextoDraft}
            onChange={(ev) => setObsTextoDraft(ev.target.value)}
            className="text-xs rounded-md border px-2 py-1"
            style={{ borderColor: C.line }}
          />
          <button onClick={() => responderObs(e.id, true, obsTextoDraft)} className="underline text-xs" style={{ color: C.violet }}>enviar</button>
          <button onClick={() => { setObsAbertoId(null); setObsTextoDraft(""); }} className="underline text-xs" style={{ color: C.stone }}>cancelar</button>
        </span>
      );
    }
    if (!canManage) {
      return <span className="text-xs italic" style={{ color: C.stone }}>aguardando revisão (admin)</span>;
    }
    return (
      <span className="flex items-center gap-2 text-xs flex-wrap">
        <span style={{ color: C.stone }}>Tem observação?</span>
        <button onClick={() => { setObsAbertoId(e.id); setObsTextoDraft(""); }} className="underline" style={{ color: C.violet }}>Sim</button>
        <button onClick={() => responderObs(e.id, false, "")} className="underline" style={{ color: C.stone }}>Não</button>
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
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

      {/* Quadro-resumo — movido pra antes dos postos; agora em formato de tabela com
          Ministério / Nome / Disponibilidade / Observações. Só aparece depois do
          primeiro obreiro escalado no dia. */}
      {escalados.length > 0 && (
        <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: C.gold, background: "#00000006" }}>
          <Eyebrow color={C.ember}>Escala de Serviços Ministeriais</Eyebrow>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="text-xs font-mono uppercase text-left" style={{ color: C.stone }}>
                  <th className="pb-2 pr-3 font-semibold">Ministério</th>
                  <th className="pb-2 pr-3 font-semibold">Nome</th>
                  <th className="pb-2 pr-3 font-semibold">Disponibilidade</th>
                  <th className="pb-2 pr-3 font-semibold">Observações</th>
                  {canManage && <th className="pb-2 font-semibold">Confirmação</th>}
                </tr>
              </thead>
              <tbody>
                {postosTabela.map((posto) => {
                  const doPosto = escalados.filter((e) => e.posto === posto);
                  if (doPosto.length === 0) {
                    return (
                      <tr key={posto} className="border-b align-top" style={{ borderColor: C.line }}>
                        <td className="py-1.5 pr-3 font-medium" style={{ color: C.ink }}>{posto}</td>
                        <td className="py-1.5 pr-3 italic" style={{ color: C.stone }}>—</td>
                        <td className="py-1.5 pr-3 italic" style={{ color: C.stone }}>—</td>
                        <td className="py-1.5 pr-3 italic" style={{ color: C.stone }}>—</td>
                        {canManage && <td className="py-1.5 italic" style={{ color: C.stone }}>—</td>}
                      </tr>
                    );
                  }
                  return doPosto.map((e) => (
                    <tr key={e.id} className="border-b align-top" style={{ borderColor: C.line }}>
                      <td className="py-1.5 pr-3 font-medium" style={{ color: C.ink }}>{posto}</td>
                      <td className="py-1.5 pr-3" style={{ color: C.ink }}>{e.obreiroNome}</td>
                      <td className="py-1.5 pr-3"><StatusObreiro e={e} /></td>
                      <td className="py-1.5 pr-3"><ObsCell e={e} /></td>
                      {canManage && (
                        <td className="py-1.5">
                          <button
                            onClick={() => enviarWhatsappEscala(e)}
                            className="text-xs flex items-center gap-1 px-2 py-1 rounded-md whitespace-nowrap"
                            style={{ background: "#25D36622", color: "#1B8A55" }}
                          >
                            <MessageCircle size={12} /> Enviar WhatsApp
                          </button>
                        </td>
                      )}
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

          {canManage && escalados.length > 0 && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: C.line }}>
              <button
                onClick={enviarEscalaCompletaWhatsapp}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md"
                style={{ background: "#25D36622", color: "#1B8A55" }}
              >
                <MessageCircle size={13} /> Compartilhar escala do dia no grupo do WhatsApp
              </button>
              <p className="text-[10px] mt-1.5" style={{ color: C.stone }}>
                Manda uma única mensagem com o nome de todo mundo e o link de confirmação de cada um. Avise a todos: cada pessoa deve clicar SÓ no link com o próprio nome — quem clicar no link de outra pessoa confirma em nome dela, não da sua conta.
              </p>
            </div>
          )}

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

      {/* Postos e suas caixas de disponíveis / escalados */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        {safeData.postos.map((posto) => {
          const doPosto = escalados.filter((e) => e.posto === posto);
          return (
            <div key={posto} className="p-3 rounded-lg border" style={{ borderColor: C.line, background: C.cream }}>
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

              {canManage && (!fechado || adminMode) && (
                <div className="mt-2">
                  <p className="text-[10px] font-mono uppercase mb-1" style={{ color: C.stone }}>Obreiros disponíveis — clique pra escalar</p>
                  <div className="flex flex-wrap gap-1.5">
                    {disponiveis.length === 0 && <span className="text-xs italic" style={{ color: C.stone }}>Todos já foram escalados hoje.</span>}
                    {disponiveis.map((nome) => (
                      <button
                        key={nome}
                        onClick={() => escalarObreiro(nome, posto)}
                        className="text-xs px-2 py-1 rounded-full border"
                        style={{ borderColor: C.line, color: C.ink, background: C.parchment }}
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

      {!canManage && (
        <p className="text-xs mt-4 italic" style={{ color: C.stone }}>
          Esta escala fica visível para todos acompanharem. Somente o admin ou pessoas autorizadas (mediante senha) podem escalar nomes, editar postos e horários, ou responder às observações.
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
            <details className="mt-4">
              <summary className="text-xs font-mono cursor-pointer" style={{ color: C.stone }}>
                WhatsApp de cada obreiro (opcional — permite enviar a confirmação direto pra pessoa; sem número, o botão "Enviar WhatsApp" abre o WhatsApp pra você escolher o contato manualmente)
              </summary>
              <div className="mt-2 space-y-1.5 max-w-sm">
                {safeData.obreiros.map((o) => (
                  <div key={o} className="flex items-center gap-2">
                    <span className="text-xs w-40 truncate flex-shrink-0" style={{ color: C.stone }}>{o}</span>
                    <input
                      placeholder="Ex: (61) 99999-9999"
                      value={safeData.telefonesObreiros[o] || ""}
                      onChange={(e) => setTelefoneObreiro(o, e.target.value)}
                      className="text-xs rounded-md border px-2 py-1 flex-1"
                      style={{ borderColor: C.line }}
                    />
                  </div>
                ))}
              </div>
            </details>
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
          <VoltarBtn onClick={() => setSelected(null)} className="mb-2" />
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
  { key: "autor", label: "Autor (opcional)" },
  { key: "imageUrl", label: "URL da imagem de capa (opcional)", type: "url" },
  { key: "videoUrl", label: "URL do vídeo (YouTube ou Vimeo, opcional)", type: "url" },
  { key: "texto", label: "Texto da reportagem", type: "textarea" },
  { key: "exclusiva", label: "Conteúdo exclusivo de Códigos Avivar (só quem assina/entra com código lê o texto completo)", type: "select", options: ["Não", "Sim"] },
  { key: "resumo", label: "Resumo curto (aparece na parte geral do site quando for exclusiva)", type: "textarea" },
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Eyebrow><HandHeart size={12} className="inline mr-1" />Que bom te ver por aqui</Eyebrow>
        <SectionTitle>Cadastro de Visitantes</SectionTitle>
        <RestrictedNotice onUnlock={onRequestOperator} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><HandHeart size={12} className="inline mr-1" />Que bom te ver por aqui</Eyebrow>
      <SectionTitle>Cadastro de Visitantes</SectionTitle>
      <p className="text-sm mt-2" style={{ color: C.stone }}>Registre a visita e, se desejar, envie uma mensagem de agradecimento no WhatsApp.</p>

      {/* Moldura da seção Visitantes inteira, a pedido — fundo creme, filete dourado */}
      <div className="rounded-2xl border-2 p-4 sm:p-6 mt-6" style={{ borderColor: C.gold, background: C.cream }}>
        <div>
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
                  <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border" style={{ borderColor: C.line, background: "#fff" }}>
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
      </div>

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

// Fundos claros, um por coluna, da grade de "Próximos encontros" (ver comentário
// no JSX abaixo de onde é usado).
const CORES_COLUNAS_ORACAO = ["#FBF1DE" /* creme */, "#E7F0FB" /* azul claro */, "#FBE9F0" /* rosé claro */];

function OracoesLares({ items, save, encontros, saveEncontros, adminMode, operatorMode, onRequestOperator, localDia, saveLocalDia }) {
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

  const [editandoLocal, setEditandoLocal] = useState(false);
  const [fotoDiaEdit, setFotoDiaEdit] = useState((localDia && localDia.fotoUrl) || "");
  const [localDiaEdit, setLocalDiaEdit] = useState((localDia && localDia.local) || "");
  const abrirEdicaoLocal = () => {
    setFotoDiaEdit((localDia && localDia.fotoUrl) || "");
    setLocalDiaEdit((localDia && localDia.local) || "");
    setEditandoLocal(true);
  };
  const salvarLocalDia = () => {
    saveLocalDia({ fotoUrl: fotoDiaEdit, local: localDiaEdit });
    setEditandoLocal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow><Sparkles size={12} className="inline mr-1" />Intercessão</Eyebrow>
      <SectionTitle>Orações nos Lares</SectionTitle>

      {/* Banner reduzido pela metade — apenas ilustrativo */}
      <div className="rounded-xl overflow-hidden border mb-4" style={{ borderColor: C.line }}>
        <ImgOrPlaceholder url={ORACOES_BANNER} alt="Oração nos Lares" className="w-full object-cover max-h-[170px]" ph="Banner Oração nos Lares" />
      </div>

      {/* Card do local de oração do dia — fundo creme, com foto e local cadastrados pelo admin/autorizado */}
      <div className="rounded-xl border p-4 mb-4 flex flex-col sm:flex-row gap-4 items-center" style={{ borderColor: C.gold, background: C.cream }}>
        <ImgOrPlaceholder url={localDia && localDia.fotoUrl} alt="Local da oração de hoje" className="w-full sm:w-48 h-36 object-cover rounded-lg flex-shrink-0" ph="Foto do local de hoje — a cadastrar" />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-mono uppercase" style={{ color: C.stone }}>Oração de hoje</p>
          <p className="font-display font-semibold text-lg mt-1" style={{ color: C.ink }}>{(localDia && localDia.local) || "Local a definir"}</p>
        </div>
      </div>
      {canManageAgenda && (
        editandoLocal ? (
          <div className="mb-8 p-4 rounded-lg border grid sm:grid-cols-2 gap-3" style={{ borderColor: C.line, background: "#00000006" }}>
            <Field label="URL da foto do local de hoje"><input className={inputCls} style={{ borderColor: C.line }} value={fotoDiaEdit} onChange={(e) => setFotoDiaEdit(e.target.value)} /></Field>
            <Field label="Local da oração de hoje"><input className={inputCls} style={{ borderColor: C.line }} value={localDiaEdit} onChange={(e) => setLocalDiaEdit(e.target.value)} /></Field>
            <div className="flex gap-2 sm:col-span-2">
              <Btn onClick={salvarLocalDia}><Save size={13} /> Salvar</Btn>
              <Btn variant="ghost" onClick={() => setEditandoLocal(false)}>Cancelar</Btn>
            </div>
          </div>
        ) : (
          <button onClick={abrirEdicaoLocal} className="text-xs underline mb-8 flex items-center gap-1" style={{ color: C.ember }}>
            <Pencil size={12} /> editar local de hoje
          </button>
        )
      )}

      {/* Agenda de encontros — pública pra ver, restrita pra cadastrar. Pedido do Marcos:
          o mais novo cadastrado entra na 1ª coluna; ao cadastrar outro, o anterior "anda"
          pra coluna da direita, e assim por diante até formar novas linhas — sempre tudo
          visível (nunca esconde nem pagina). Como cada encontro novo é sempre adicionado
          ao FIM do array (ver addEncontro), basta exibir em ordem invertida (mais novo
          primeiro) numa grade de 3 colunas: o mais novo cai na coluna 1, o antigo "1º
          mais novo" empurra pra coluna 2, o próximo pra coluna 3, e o seguinte já forma
          a linha de baixo — exatamente o efeito descrito. Cada coluna tem um fundo claro
          diferente (CORES_COLUNAS_ORACAO) pra ficar fácil de acompanhar visualmente. */}
      <div className="mt-4">
        <p className="text-sm font-display font-semibold mb-3" style={{ color: C.ink }}>Próximos encontros</p>
        {encontros.length === 0 && <p className="text-sm italic" style={{ color: C.stone }}>Nenhum encontro cadastrado ainda.</p>}
        <div className="grid sm:grid-cols-3 gap-4">
          {[...encontros].reverse().map((e, idx) => (
            <div key={e.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.line, background: CORES_COLUNAS_ORACAO[idx % CORES_COLUNAS_ORACAO.length] }}>
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
        {canManageAgenda ? (
          <>
            <p className="text-sm mt-2 mb-2" style={{ color: C.stone }}>Peça oração ou solicite uma visita de intercessão em sua casa.</p>
            <DynamicForm fields={ORACAO_FIELDS} onSubmit={(v) => v.nome && v.pedido && add(v)} submitLabel="Enviar pedido" />
          </>
        ) : (
          <RestrictedNotice onUnlock={onRequestOperator} />
        )}

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Eyebrow>Faça parte</Eyebrow>
        <SectionTitle>Cadastro de Membros</SectionTitle>
        <RestrictedNotice onUnlock={onRequestOperator} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
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
  { key: "fotoUrl", label: "Foto (pequena, tipo 3x4) — URL da imagem", type: "url" },
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

function AvivarMusic({ repertorio, saveRepertorio, musicos, saveMusicos, albuns, saveAlbuns, adminMode, operatorMode, onRequestOperator }) {
  const canManage = adminMode || operatorMode;
  const [tab, setTab] = useState("musicos");
  const [openAlbum, setOpenAlbum] = useState(null);

  const addCulto = (v) => saveRepertorio([...repertorio, { id: uid(), musicas: [], ...v }]);
  const delCulto = (id) => saveRepertorio(repertorio.filter((c) => c.id !== id));
  const addMusica = (cultoId, v) =>
    saveRepertorio(repertorio.map((c) => {
      if (c.id !== cultoId) return c;
      // Evita cadastrar de novo uma música já existente no mesmo culto (mesmo título).
      const jaExiste = (c.musicas || []).some((m) => (m.titulo || "").trim().toLowerCase() === (v.titulo || "").trim().toLowerCase());
      if (jaExiste) return c;
      return { ...c, musicas: [...c.musicas, { id: uid(), ...v }] };
    }));
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
        {["musicos", "albuns", "repertorio"].map((t) => (
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
              <VoltarBtn onClick={() => setOpenAlbum(null)} className="mb-3" />
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
              <div key={m.id} className="p-4 rounded-lg border flex gap-3" style={{ borderColor: C.line }}>
                {m.fotoUrl && (
                  <img src={m.fotoUrl} alt={m.nome} className="rounded-md object-cover flex-shrink-0" style={{ width: "3cm", height: "4cm" }} />
                )}
                <div className="flex justify-between items-start flex-1">
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
            {canManage ? (
              <>
                <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · Cadastro de músico</p>
                <DynamicForm fields={MUSICO_FIELDS} onSubmit={(v) => v.nome && addMusico(v)} submitLabel="Cadastrar" />
              </>
            ) : (
              <RestrictedNotice onUnlock={onRequestOperator} />
            )}
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
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
  // Histórico de navegação (pilha) — cada vez que `page` muda, empilha o novo valor.
  // O botão "Voltar" de cada seção desempilha e volta pra seção de onde a pessoa
  // REALMENTE veio. Diferente da versão anterior (uma única variável "previousPage"
  // atualizada só dentro de scrollToSection), este histórico observa `page` direto
  // num efeito — funciona não importa de onde a navegação partiu (NAV, card da Home,
  // abrirReportagem, etc.), corrigindo o bug em que todo "Voltar" caía sempre em
  // "Avivar News TV".
  const historicoPaginaRef = useRef(["home"]);
  useEffect(() => {
    const h = historicoPaginaRef.current;
    if (h[h.length - 1] !== page) h.push(page);
  }, [page]);
  const scrollToSection = (key) => {
    setPage(key);
    requestAnimationFrame(() => {
      const el = document.getElementById(key);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  };
  // Ação do botão "Voltar" de cada seção — desempilha a seção atual do topo do
  // histórico e volta pra que estava logo antes dela (ou pro início, se não houver).
  const voltar = () => {
    const h = historicoPaginaRef.current;
    if (h.length > 1 && h[h.length - 1] === page) h.pop();
    const anterior = h.length > 0 ? h.pop() : "home";
    scrollToSection(anterior || "home");
  };
  // Abre uma reportagem específica do Avivar News a partir de QUALQUER seção do site
  // (Home, Códigos Avivar, Ao Vivo, Manchete...) — abre na hora, num modal por cima da
  // página atual, com a imagem; nunca rola a tela pra nenhum canto. Exceção: reportagem
  // marcada como "exclusiva" — só abre de verdade pra quem já está com Códigos Avivar
  // desbloqueado (ou é admin); qualquer outra pessoa é mandada pra tela de credenciais.
  const abrirReportagem = (id) => {
    const item = (avivarNews || []).find((n) => n.id === id);
    if (item && item.exclusiva && !adminMode && !codigosUnlocked) {
      scrollToSection("codigos");
      return;
    }
    setNewsAbrirId(id);
  };
  const [loading, setLoading] = useState(true);
  // Lido uma vez do link de WhatsApp (?escalaId=...) — se presente, a tela de confirmação
  // de escala assume a página inteira em vez do site normal (ver mais abaixo).
  const [escalaConfirmId, setEscalaConfirmId] = useState(() => new URLSearchParams(window.location.search).get("escalaId"));
  // Página própria de uma Unidade Avivar (Igrejas) — quando setado, mostra essa página
  // no lugar do site inteiro; "voltar" limpa e retorna ao site principal.
  const [paginaIgrejaId, setPaginaIgrejaId] = useState(null);
  // Página "Cursos dos Códigos Avivar" (cursos, PDFs, vídeos — em breve) — mesmo
  // padrão de página cheia sem rolagem que a de Unidade Avivar, acima.
  const [paginaCursosOpen, setPaginaCursosOpen] = useState(false);
  // Se a pessoa já entrou em Códigos Avivar (nome + código válidos) — levantado pra cá
  // (em vez de ficar só dentro de CodigosAvivar) pra que abrirReportagem saiba, de
  // qualquer lugar do site, se pode abrir uma reportagem "exclusiva" direto ou se deve
  // mandar a pessoa pra tela de login de Códigos Avivar.
  const [codigosUnlocked, setCodigosUnlocked] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  // operatorAuth guarda quem autenticou (nome + setores liberados). podeSetor() decide,
  // setor a setor, se admin ou o operador logado pode mexer naquela área — permite dar
  // código de acesso restrito a só um setor (ex: só Oração nos Lares, só Avivar Music).
  const [operatorAuth, setOperatorAuth] = useState(null);
  const podeSetor = (setor) => adminMode || (!!operatorAuth && (operatorAuth.setores.includes("todos") || operatorAuth.setores.includes(setor)));
  const [operatorGateOpen, setOperatorGateOpen] = useState(false);
  const [operatorCodes, setOperatorCodes] = useState([]);
  const [oracaoEncontros, setOracaoEncontros] = useState([]);
  const [newsAbrirId, setNewsAbrirId] = useState(null);

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
  const [pedidosFisicos, setPedidosFisicos] = useState([]);
  const [oracaoLocalDia, setOracaoLocalDia] = useState({ fotoUrl: "", local: "" });
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
      setPedidosFisicos(await loadKey("avivar:pedidosfisicos", []));
      setOracaoLocalDia(await loadKey("avivar:oracaolocaldia", { fotoUrl: "", local: "" }));
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
    // Variáveis "de trabalho" — usadas por TODOS os blocos que mexem em loja/biblioteca/
    // galeria nesta mesma passagem síncrona do efeito, pra cada bloco enxergar o resultado
    // do bloco anterior (evita a corrida de estado / stale closure que já apagou dados).
    let lojaW = loja || [];
    let bibliotecaW = biblioteca || [];
    let galeriaW = galeria || [];
    let colaboradoresW = colaboradores || [];
    if (!seeds.reportagensCodigos) {
      const jaTem = avivarNews.some((n) => n.seedId && n.seedId.startsWith("codigos-"));
      if (!jaTem) {
        const novas = [
          {
            id: uid(),
            seedId: "codigos-portais",
            titulo: "Portais espirituais na Bíblia: quando o céu se abre sobre a Terra",
            texto: "Em vários momentos das Escrituras, o véu entre o céu e a terra parece se afinar. Jacó, fugindo de Esaú, dorme numa pedra em Betel e sonha com uma escada que liga a terra ao céu — ao acordar, declara: \"Este é o portal do céu\" (Gênesis 28:10-17). No batismo de Jesus, os céus se abrem e o Espírito desce como pomba (Mateus 3:16). Estêvão, prestes a ser apedrejado, vê o céu aberto e a glória de Deus (Atos 7:55-56). E João, em Patmos, escreve: \"Depois destas coisas olhei, e eis uma porta aberta no céu\" (Apocalipse 4:1). São lugares e momentos em que o Reino invisível toca visivelmente a vida de quem busca a Deus — não fórmulas, mas encontros que Deus mesmo escolhe abrir.",
            exclusiva: true,
            resumo: "Momentos em que o véu entre o céu e a terra se abre — de Jacó em Betel ao apóstolo João em Patmos.",
            imageUrl: CODIGOS_ARTIGO_PORTAIS_ESPIRITUAIS,
            timestamp: nowISO(),
          },
          {
            id: uid(),
            seedId: "codigos-horas",
            titulo: "Horas dimensionais na Bíblia: os tempos em que o Espírito se move",
            texto: "A Bíblia marca horas específicas como momentos de virada espiritual. Na hora nona (por volta das 15h), Pedro e João sobem ao templo para orar e um coxo é curado (Atos 3:1-8) — na mesma hora nona, Cornélio recebe a visita de um anjo (Atos 10:3). À meia-noite, Paulo e Silas, presos e feridos, cantam louvores, e a prisão treme (Atos 16:25-26). Na crucificação, das seis às nove horas, trevas cobrem a terra antes da ressurreição vindoura (Mateus 27:45). E no Pentecostes, é \"a hora terceira do dia\" quando o Espírito é derramado sobre os discípulos (Atos 2:15). Não são horários mágicos, mas registros de que Deus age em tempos determinados — e nos convida a velar e orar em todo tempo.",
            exclusiva: true,
            resumo: "Por que a Bíblia marca horas específicas como pontos de virada espiritual, da hora nona ao Pentecostes.",
            imageUrl: CODIGOS_ARTIGO_HORAS_DIMENSIONAIS,
            timestamp: nowISO(),
          },
          {
            id: uid(),
            seedId: "codigos-quantica",
            titulo: "Energia quântica e espiritualidade: quando a ciência aponta para o mistério",
            texto: "A física quântica descreve um universo onde partículas separadas por enormes distâncias permanecem conectadas (o chamado emaranhamento quântico), e onde o simples ato de observar altera o que é observado. Cientistas ainda debatem o que isso realmente significa — não é prova de nada espiritual —, mas é difícil não pensar em como as Escrituras já descreviam um universo profundamente interligado, sustentado por uma Palavra que tudo criou e tudo mantém unido: \"Nele subsistem todas as coisas\" (Colossenses 1:17). Ciência e fé caminham por métodos diferentes, mas ambas, à sua maneira, apontam para um mistério maior do que conseguimos medir — e a fé cristã crê que esse mistério tem nome: Jesus Cristo.",
            exclusiva: true,
            resumo: "O que o emaranhamento quântico e a física moderna têm a nos ensinar sobre um universo sustentado por Deus.",
            imageUrl: CODIGOS_ARTIGO_ENERGIA_QUANTICA,
            timestamp: nowISO(),
          },
        ];
        const merged = [...avivarNews, ...novas];
        setAvivarNews(merged);
        saveKey("avivar:avivarnews", merged);
      }
      todo.reportagensCodigos = true;
    }
    if (!seeds.reportagensCodigos2) {
      const jaTem2 = avivarNews.some((n) => n.seedId && (n.seedId === "artigo-consciencia-espiritual" || n.seedId === "artigo-geracao-profetica"));
      if (!jaTem2) {
        const novas2 = [
          {
            id: uid(),
            seedId: "artigo-consciencia-espiritual",
            titulo: "Eleve Sua Consciência Espiritual: Os Códigos Avivar e a Frequência dos Últimos Dias",
            autor: "Marcos Fagner",
            texto: `Parte 1: A Arquitetura da Consciência e o Despertar do Subconsciente

Viver o presente com profundidade exige compreender que a realidade que experimentamos não é apenas física; ela é o reflexo direto de um alinhamento espiritual profundo. Nos dias atuais, em que o mundo caminha por transformações aceleradas, a busca por uma expansão da consciência deixa de ser um mero exercício filosófico e passa a ser uma necessidade vital para o crente que deseja caminhar em pleno domínio espiritual.

A mente humana, criada à imagem e semelhança do Criador, possui camadas profundas que frequentemente permanecem inexploradas. O subconsciente atua como um solo fértil, onde crenças, memórias e padrões invisíveis moldam cotidianamente as nossas atitudes, a nossa fé e a nossa capacidade de acessar o sobrenatural. Quando a Palavra de Deus nos exorta a renovar a nossa mente, o convite é para reprogramar esse solo interno com frequências espirituais elevadas, substituindo o ruído do mundo pela frequência inabalável do Reino.

"A verdadeira revelação não vem de fora para dentro, mas irrompe de um espírito que foi sintonizado com a frequência da eternidade."

Nesse cenário, a ciência e a espiritualidade deixam de ser opostos irreconciliáveis e convergem para revelar a grandeza da criação divina. As frequências vibracionais que regem o universo físico encontram eco na frequência da fé viva. Quando alinhamos nossos pensamentos e batimentos espirituais aos propósitos divinos, entramos em um campo de sintonia onde o natural dá lugar ao sobrenatural, permitindo que milagres deixem de ser eventos esporádicos e passem a ser o padrão da caminhada cristã.

Parte 2: Assinando os Códigos Avivar e Entrando na Dimensão Profética

Para romper as barreiras do cotidiano e acessar os segredos profundos que Deus reservou para o tempo do fim, é preciso ir além do óbvio. É neste ponto que entram os Códigos Avivar: chaves espirituais desenhadas para despertar a identidade daqueles que foram chamados para ser a voz profética desta geração.

Assinar esses códigos significa romper com a mornidão espiritual e posicionar-se na frequência da revelação. Trata-se de um treinamento intensivo do espírito, onde a interseção entre a ciência da criação e a profundidade dos dons espirituais se manifesta com poder. Os dons concedidos no dia de Pentecoste não apenas permanecem ativos, como se intensificam à medida que nos aproximamos do retorno de Jesus e dos momentos de grande prova sobre a Terra.

• Sintonia Profética: Desvendar os segredos espirituais que capacitam os intercessores e líderes a discernirem os sinais dos tempos.
• Ativação Subconsciente: Limpar os filtros mentais limitantes através da meditação na Palavra, sintonizando a mente na frequência da fé inabalável.
• Manifestação do Reino: Operar em milagres e sinais como resposta direta a um nível superior de comunhão e entrega espiritual.

Elevando a nossa consciência espiritual, compreendemos que cada obstáculo atual é, na verdade, um degrau para um nível mais alto de autoridade em Cristo. Esteja pronto para sintonizar a sua vida na frequência que transforma eras e prepare-se para caminhar com ousadia nos desígnios que o Céu preparou para os dias finais.

Qual área da sua vida espiritual você sente que precisa sintonizar mais profundamente com os Códigos Avivar hoje?`,
            exclusiva: true,
            resumo: "Como a renovação da mente e os Códigos Avivar preparam o crente para operar na frequência da revelação nos últimos dias.",
            imageUrl: CODIGOS_ARTIGO_ARQUITETURA_CONSCIENCIA,
            timestamp: nowISO(),
          },
          {
            id: uid(),
            seedId: "artigo-geracao-profetica",
            titulo: "O Despertar da Geração Profética",
            texto: `Estamos vivendo a transição de eras mais profunda da história humana. À medida que o cenário global se inclina para incertezas e crises sistêmicas — o que as Escrituras descrevem profeticamente como o momento em que o caos se instala na terra —, o Céu mobiliza uma linhagem singular: os profetas dos últimos dias. Não se trata de uma elite mística distante, mas de homens e mulheres comuns que decidiram sintonizar suas vidas na frequência exata do Criador.

O Ministério Avivar do Espírito fundamenta-se na fé cristã interdenominacional com forte viés pentecostal, crendo firmemente que os dons do Espírito Santo foram liberados no Dia de Pentecostes e permanecem plenamente ativos, cessando somente com a volta de Jesus. Para operar com autoridade nessa dispensação, é necessário decodificar os segredos espirituais que sustentam a resistência e a vitória da Igreja.

A Frequência da Revelação e o Dom Profético

O verdadeiro profeta dos últimos dias opera na interseção entre a revelação espiritual e o discernimento dos tempos. Quando o mundo mergulha em trevas e confusão, a voz de Deus ecoa com nitidez para aqueles que abandonaram a superficialidade religiosa.

• Ativação Espiritual: Os treinamentos espirituais baseados nos Códigos Avivar capacitam o crente a enxergar além das aparências físicas, decodificando os movimentos espirituais que regem as nações.
• Resiliência no Caos: O profeta atual não é surpreendido pelas crises; pelo contrário, compreende que o abalo das estruturas terrenas abre espaço para o transbordar do poder milagroso de Deus.
• Autoridade Ministerial: Assim como os apóstolos no passado, esta geração recebe o revestimento de poder para curar enfermos, expulsar trevas e anunciar o Reino com intrepidez inegociável.

Assinar os Códigos Avivar é um chamado irrevogável para assumir o seu posto na muralha. É tempo de alinhar o seu espírito, abandonar o temor e permitir que o fogo pentecostal incendeie a sua trajetória, tornando-o um farol de esperança e poder nos dias finais.`,
            exclusiva: true,
            resumo: "Por que esta geração é chamada a operar com autoridade profética em meio ao caos dos últimos tempos.",
            imageUrl: CODIGOS_PROFETAS_ULTIMOS_DIAS_BANNER,
            timestamp: nowISO(),
          },
        ];
        const merged = [...avivarNews, ...novas2];
        setAvivarNews(merged);
        saveKey("avivar:avivarnews", merged);
      }
      todo.reportagensCodigos2 = true;
    }
    // Reportagem interna de Códigos Avivar — "A Física da Fé e o Campo de Poder:
    // O Mistério das Mãos de Moisés em Refidim" (Êxodo 17:8-16).
    if (!seeds.reportagensCodigos3) {
      const jaTem3 = avivarNews.some((n) => n.seedId === "artigo-refidim-maos-moises");
      if (!jaTem3) {
        const nova3 = {
          id: uid(),
          seedId: "artigo-refidim-maos-moises",
          titulo: "A Física da Fé e o Campo de Poder: O Mistério das Mãos de Moisés em Refidim",
          autor: "Marcos Fagner",
          texto: `Em Refidim, Israel enfrentou Amaleque numa batalha que, à primeira vista, parecia se decidir apenas pela espada de Josué no vale. Mas o texto de Êxodo 17:8-16 revela algo mais profundo: enquanto Moisés mantinha as mãos erguidas no alto do monte, Israel prevalecia; quando as mãos descaíam pelo cansaço da carne, Amaleque prevalecia. O verdadeiro campo de batalha não estava apenas na planície — estava no alto do monte, num ponto de contato entre o céu e a terra.

Podemos compreender esse relato como a descrição de um verdadeiro campo de poder espiritual. Assim como campos eletromagnéticos invisíveis regem fenômenos físicos que nossos olhos não alcançam, existe uma dimensão espiritual que rege, por trás do véu, os resultados visíveis das batalhas da fé. As mãos erguidas de Moisés não eram um gesto vazio de cansaço; eram uma antena viva, sintonizada, mantendo um canal aberto para a dynamis — a palavra grega que descreve o poder de Deus operando com força e autoridade sobrenaturais.

Quando as mãos de Moisés pesavam e começavam a ceder, o texto não diz que Deus se afastou; diz que o próprio Moisés, homem de carne e osso, precisou de sustento. Arão e Hur o colocaram sobre uma pedra e sustentaram suas mãos, um de cada lado, até o pôr do sol. Eis um princípio poderoso: mesmo o maior dos intercessores precisa de quem sustente sua conexão quando o corpo fraqueja. A intercessão sustentada é o que mantém o campo de força ativo — é o que preserva a ressonância entre o pedido do homem e a resposta do Céu.

Esse "peso" que sustinha o campo aberto sobre o monte nos remete ao conceito hebraico de Kavod — a glória de Deus, literalmente "aquilo que tem peso", que tem substância. Quando Moisés erguia as mãos, ele não estava apenas orando; ele estava, de certa forma, posicionando-se sob o peso da glória, permitindo que a frequência do Céu se manifestasse em resultado concreto na terra, vale abaixo, na vida de todo o exército de Israel.

Há aqui uma espécie de enlaçamento quântico espiritual: dois pontos aparentemente distantes — o topo do monte e o vale da batalha — estavam interligados de tal forma que o que acontecia em um alterava instantaneamente o outro. Não havia demora, não havia intervalo: enquanto a intercessão permanecia firme no alto, a vitória se manifestava embaixo, em tempo real. É assim que o Reino de Deus opera: a fé sintonizada no secreto produz efeito imediato e visível no campo de batalha da vida.

Ao final do relato, o Senhor ordena que Moisés escreva o que aconteceu para memória, e edifica um altar chamado "Jeová-Nissi" — o Senhor é minha bandeira. Não foi a espada de Josué, isoladamente, que garantiu a vitória; foi a permanência do povo sintonizado na frequência do Deus Todo-Poderoso, o verdadeiro Arquiteto de todas as energias do universo, que sustentou o resultado do dia.

A pergunta que fica para nós, filhos de Deus, chamados a viver os Códigos Avivar nestes últimos dias, é: quem está sustentando as suas mãos quando elas pesam? E, mais que isso: você tem permanecido erguido, sintonizado, mesmo quando o cansaço da carne pede para que você abaixe os braços?`,
          exclusiva: true,
          resumo: "O que as mãos erguidas de Moisés em Refidim revelam sobre intercessão sustentada e vitória espiritual.",
          imageUrl: CODIGOS_ARTIGO_REFIDIM_MAOS_MOISES,
          timestamp: nowISO(),
        };
        const merged3 = [...avivarNews, nova3];
        setAvivarNews(merged3);
        saveKey("avivar:avivarnews", merged3);
      }
      todo.reportagensCodigos3 = true;
    }
    // Duas reportagens novas de Códigos Avivar, ilustradas pelas imagens enviadas pelo
    // Marcos junto com o banner da série e a arte do Bom Samaritano.
    if (!seeds.reportagensCodigos4) {
      const jaTem4 = avivarNews.some((n) => n.seedId === "artigo-dom-discernimento" || n.seedId === "artigo-bom-samaritano");
      if (!jaTem4) {
        const novas4 = [
          {
            id: uid(),
            seedId: "artigo-dom-discernimento",
            titulo: "O Dom do Discernimento: Enxergando Além do Véu com os Olhos do Espírito",
            autor: "Marcos Fagner",
            texto: `Vivemos numa época em que os sinais se multiplicam e as vozes se cruzam — algumas do Espírito de Deus, outras do espírito do mundo, e outras ainda de um reino de trevas que se disfarça de luz (2 Coríntios 11:14). Nesse cenário, um dos dons mais necessários para a Igreja nestes últimos dias não é o mais visível, mas talvez o mais decisivo: o dom de discernimento de espíritos, listado por Paulo entre as manifestações do Espírito Santo (1 Coríntios 12:10).

Discernir não é desconfiar de tudo, nem é o dom da suspeita. É a capacidade, dada pelo Espírito, de perceber a origem espiritual por trás de uma palavra, de uma atitude, de um movimento — se aquilo nasce do Espírito de Deus, da carne, ou de uma influência das trevas. É como enxergar, por um instante, o campo que sustenta o que está diante de nós, além da superfície visível.

A Escritura registra esse dom em ação: Pedro discerne o coração de Ananias e Safira antes mesmo de qualquer prova visível (Atos 5:1-10). Paulo discerne, num único olhar, o espírito de adivinhação por trás da jovem escrava de Filipos, que gritava verdades sobre ele e Silas, mas vindo de uma fonte errada (Atos 16:16-18). João adverte a igreja: "Amados, não creiais em todo espírito, mas provai se os espíritos são de Deus, porque muitos falsos profetas têm saído pelo mundo" (1 João 4:1).

Assim como campos magnéticos invisíveis orientam a agulha de uma bússola sem que ninguém os veja, existe uma orientação espiritual disponível a quem caminha sintonizado com o Espírito Santo — não uma intuição humana treinada, mas um dom concedido, uma bússola que aponta para a verdade em meio à confusão dos últimos dias.

Quem exercita esse dom com maturidade não se torna arrogante nem julgador; torna-se, antes, mais cuidadoso, mais dependente de Deus e mais capaz de proteger o rebanho das armadilhas que se apresentam disfarçadas de bênção. Peça a Deus esse dom, Igreja. Nos dias em que vivemos, discernir não é luxo — é sobrevivência espiritual.`,
            exclusiva: true,
            resumo: "Como reconhecer, à luz da Palavra, a origem espiritual por trás de vozes, atitudes e movimentos nestes últimos dias.",
            imageUrl: CODIGOS_ARTIGO_DOM_DISCERNIMENTO,
            timestamp: nowISO(),
          },
          {
            id: uid(),
            seedId: "artigo-bom-samaritano",
            titulo: "O Bom Samaritano: a Compaixão que Atravessa as Barreiras",
            autor: "Marcos Fagner",
            texto: `Um homem descia de Jerusalém a Jericó quando caiu nas mãos de assaltantes, que o despojaram, o espancaram e se foram, deixando-o quase morto à beira do caminho (Lucas 10:30). Um sacerdote passou e desviou; um levita, servo do templo, fez o mesmo. Foi um samaritano — povo desprezado pelos judeus da época — quem parou, teve compaixão, cuidou das feridas com azeite e vinho, e pagou do próprio bolso pela recuperação de um estranho.

Jesus conta essa parábola em resposta a uma pergunta teológica — "e quem é o meu próximo?" — mas responde com uma demonstração prática. O verdadeiro amor ao próximo não pergunta primeiro quem merece; ele se aproxima primeiro, e só depois pensa no custo.

Há algo profundo nesse gesto do samaritano: ele rompe uma barreira social, religiosa e histórica de inimizade só para restaurar a vida de alguém que, em outra circunstância, talvez nem lhe dirigisse a palavra. É como se, naquele instante, uma frequência maior que o preconceito humano tivesse tomado conta da cena — uma compaixão capaz de atravessar qualquer distância entre duas pessoas, por mais diferentes ou distantes que sejam.

O sacerdote e o levita não eram maus; tinham responsabilidades religiosas para cumprir, motivos plausíveis para seguir adiante. Mas a compaixão de Deus não se contenta com motivos plausíveis: ela para, se abaixa, cuida, investe tempo e recurso. É a mesma compaixão de Cristo, que "vendo as multidões, teve compaixão delas, porque andavam desgarradas e cansadas, como ovelhas que não têm pastor" (Mateus 9:36) e desceu até nós, feridos à beira do caminho, para nos socorrer com o próprio sangue.

Jesus termina a parábola devolvendo a pergunta: "Qual, pois, destes três te parece que foi o próximo daquele que caiu nas mãos dos salteadores?" E ordena: "Vai, e faze da mesma maneira" (Lucas 10:36-37). O Ministério Avivar do Espírito crê que ser Igreja nestes últimos dias é isso: parar diante da dor de quem sofre, mesmo quando não é conveniente, e deixar que o amor de Deus alcance quem está à beira do caminho.

Quem é, hoje, o seu próximo que espera à beira da estrada?`,
            exclusiva: true,
            resumo: "A parábola que Jesus contou para redefinir quem é o nosso próximo — e o custo real de amar de verdade.",
            imageUrl: CODIGOS_ARTIGO_BOM_SAMARITANO,
            timestamp: nowISO(),
          },
        ];
        const merged4 = [...avivarNews, ...novas4];
        setAvivarNews(merged4);
        saveKey("avivar:avivarnews", merged4);
      }
      todo.reportagensCodigos4 = true;
    }
    // Reportagem sobre fé, oração e comunhão com Deus (a partir do tema trazido por
    // Marcos: fé como confiança no caráter de Deus, não como técnica de manipulação
    // da realidade) — também exclusiva de Códigos Avivar.
    if (!seeds.reportagensCodigos5) {
      const jaTem5 = avivarNews.some((n) => n.seedId === "artigo-fe-comunhao-nao-manipulacao");
      if (!jaTem5) {
        const nova5 = {
          id: uid(),
          seedId: "artigo-fe-comunhao-nao-manipulacao",
          titulo: "A Fé que Move Montanhas: Comunhão, Não Manipulação",
          autor: "Marcos Fagner",
          exclusiva: true,
          resumo: "Fé bíblica não é uma técnica para dobrar a realidade à sua vontade — é confiança no caráter de um Deus que já conhece o que você precisa.",
          texto: `Boa parte do que se ensina sobre fé hoje soa como uma fórmula: diga a palavra certa, visualize o resultado certo, repita a técnica certa, e a realidade se dobra à sua vontade. Mas a fé descrita nas Escrituras é outra coisa, bem mais simples e bem mais profunda: não é uma técnica de manipulação da realidade, é uma confiança absoluta na bondade e na autoridade de um Deus que já conhece o que precisamos antes de pedirmos (Mateus 6:8).

Hebreus 11 define fé como "a certeza de coisas que se esperam, a convicção de fatos que se não veem" (Hebreus 11:1) — e o capítulo inteiro é uma galeria de pessoas que creram não porque dominaram uma técnica, mas porque confiaram na palavra e no caráter de Deus, muitas vezes sem ver o cumprimento em vida (Hebreus 11:13).

Quando Jesus fala da fé do tamanho de um grão de mostarda que move montanhas (Mateus 17:20), ou promete que "tudo o que pedirdes em oração, crendo, o recebereis" (Marcos 11:24), Ele não está ensinando uma fórmula mágica de manifestação — está convidando os discípulos a uma dependência radical do Pai, a mesma dependência que Ele mesmo vivia. A fé bíblica floresce dentro de um relacionamento, não de uma técnica isolada dele.

É por isso que Jesus também ensina: "O Reino de Deus está dentro de vós" (Lucas 17:21) — o ponto de partida da fé não é o mundo lá fora que queremos dobrar à nossa vontade, mas o Reino que já habita dentro de quem nasceu de novo, sujeito ao Rei, e não o contrário.

Tiago é ainda mais direto sobre o risco de inverter essa ordem: "Pedis, e não recebeis, porque pedis mal, para o gastardes em vossos deleites" (Tiago 4:3). A oração centrada em nós mesmos — em conquistar, controlar, manipular circunstâncias para satisfação própria — não é fé bíblica, por mais versículos que se cite ao seu redor. A fé verdadeira sempre aponta para fora de si mesma, para a vontade e a glória de Deus, mesmo quando essa vontade custa caro a quem ora.

Buscar poder espiritual é legítimo — a própria Igreja primitiva orava por sinais e milagres (Atos 4:29-31). O que separa a fé bíblica de qualquer prática de manipulação da realidade é a direção do coração: uma pede "seja feita a Tua vontade" (Mateus 6:10); a outra pede "seja feita a minha vontade, através de Ti." Nos Códigos Avivar, aprendemos a orar como quem confia, não como quem barganha — e é exatamente essa confiança que Deus responde.`,
          timestamp: nowISO(),
        };
        const merged5 = [...avivarNews, nova5];
        setAvivarNews(merged5);
        saveKey("avivar:avivarnews", merged5);
      }
      todo.reportagensCodigos5 = true;
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
      const jaTem = bibliotecaW.some((b) => b.seedId && b.seedId.startsWith("bib-"));
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
        bibliotecaW = [...bibliotecaW, ...novosLivros];
        setBiblioteca(bibliotecaW);
        saveKey("avivar:biblioteca", bibliotecaW);
      }
      todo.biblioteca1 = true;
    }
    if (!seeds.biblioteca2) {
      const jaTem = bibliotecaW.some((b) => b.seedId && b.seedId.startsWith("bib2-"));
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
        bibliotecaW = [...bibliotecaW, ...maisLivros];
        setBiblioteca(bibliotecaW);
        saveKey("avivar:biblioteca", bibliotecaW);
      }
      todo.biblioteca2 = true;
    }
    if (!seeds.trilogiaLivros1) {
      const jaTemTrilogia = lojaW.some((p) => p.seedId && p.seedId.startsWith("trilogia-"));
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
        lojaW = [...lojaW, ...livrosTrilogia];
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
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
      lojaW = lojaW.map((p) =>
        p.seedId && pdfMap[p.seedId] && !p.pdfUrl ? { ...p, pdfUrl: pdfMap[p.seedId] } : p
      );
      const jaTemRevelacao = lojaW.some((p) => p.seedId === "trilogia-revelacao");
      if (!jaTemRevelacao) {
        lojaW = [
          ...lojaW,
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
      setLoja(lojaW);
      saveKey("avivar:loja", lojaW);

      // Os mesmos 4 livros também aparecem na Biblioteca Avivar (pública), mas
      // como são vendidos, o clique redireciona para a Loja em vez de abrir o PDF ali.
      const jaTemNaBiblioteca = bibliotecaW.some((b) => b.seedId && b.seedId.startsWith("trilogia-bib-"));
      if (!jaTemNaBiblioteca) {
        const copiasBiblioteca = [
          { id: uid(), seedId: "trilogia-bib-dons", titulo: "Conquistando os Dons do Espírito Santo", autor: "Filho do Deus Altíssimo", capaUrl: "/27-livro-conquistando-os-dons.jpg", linkLoja: true, sinopse: "Um guia prático para reconhecer, desenvolver e operar os dons do Espírito Santo na vida cristã, treinando os filhos de Deus para a batalha espiritual pela salvação das almas. Disponível para aquisição na Loja Avivar." },
          { id: uid(), seedId: "trilogia-bib-cura", titulo: "Praticando a Cura Divina", autor: "Filho do Deus Altíssimo", capaUrl: "/28-livro-praticando-a-cura-divina.jpg", linkLoja: true, sinopse: "Um manual de fé e ação sobre a cura divina, com princípios bíblicos para orar pelos enfermos e libertar os oprimidos. Disponível para aquisição na Loja Avivar." },
          { id: uid(), seedId: "trilogia-bib-gloria", titulo: "O Impacto da Glória — Dons do Espírito Santo", autor: "Filho do Deus Altíssimo", capaUrl: "/29-livro-o-impacto-da-gloria.jpg", linkLoja: true, sinopse: "Uma reflexão sobre o impacto da glória de Deus manifestada pelos dons espirituais, à luz da profecia de Joel 2:28. Disponível para aquisição na Loja Avivar." },
          { id: uid(), seedId: "trilogia-bib-revelacao", titulo: "O Dom da Revelação — Segredos e Técnicas", autor: "Filho do Deus Altíssimo", capaUrl: "/46-livro-o-dom-da-revelacao.jpg", linkLoja: true, sinopse: "Uma obra dedicada ao dom da revelação e da palavra de ciência, com explicações simples e exercícios práticos fundamentados nas Escrituras. Disponível para aquisição na Loja Avivar." },
        ];
        bibliotecaW = [...bibliotecaW, ...copiasBiblioteca];
        setBiblioteca(bibliotecaW);
        saveKey("avivar:biblioteca", bibliotecaW);
      }
      todo.trilogiaLivros2 = true;
    }
    // --- Reparo de dados perdidos em produção pela corrida de estado corrigida acima (Parte A2) ---
    if (!seeds.repairLoja1) {
      const canonicalTrilogia = [
        { seedId: "trilogia-dons", categoria: "Códigos Avivar", titulo: "Conquistando os Dons do Espírito Santo", nome: "Conquistando os Dons do Espírito Santo", autor: "Filho do Deus Altíssimo", imageUrl: LIVRO_DONS_CAPA, pdfUrl: "/43-livro-conquistando-os-dons.pdf", destino: "loja", preco: "", linkCompra: "", linkCartao: "", descricao: "Um guia prático para reconhecer, desenvolver e operar os dons do Espírito Santo na vida cristã. A obra conduz o leitor a compreender como o derramar do Espírito prometido em Isaías 44:3 se manifesta hoje, treinando os filhos de Deus para a batalha espiritual pela salvação das almas." },
        { seedId: "trilogia-cura", categoria: "Códigos Avivar", titulo: "Praticando a Cura Divina", nome: "Praticando a Cura Divina", autor: "Filho do Deus Altíssimo", imageUrl: LIVRO_CURA_CAPA, pdfUrl: "/44-livro-praticando-a-cura-divina.pdf", destino: "loja", preco: "", linkCompra: "", linkCartao: "", descricao: "Um manual de fé e ação sobre a cura divina, ensinando princípios bíblicos para orar pelos enfermos e libertar os oprimidos. A obra resgata o exemplo de Jesus e dos apóstolos, mostrando que o poder de curar os enfermos e expulsar demônios continua disponível à Igreja hoje." },
        { seedId: "trilogia-gloria", categoria: "Códigos Avivar", titulo: "O Impacto da Glória — Dons do Espírito Santo", nome: "O Impacto da Glória — Dons do Espírito Santo", autor: "Filho do Deus Altíssimo", imageUrl: LIVRO_GLORIA_CAPA, pdfUrl: "/45-livro-o-impacto-da-gloria.pdf", destino: "loja", preco: "", linkCompra: "", linkCartao: "", descricao: "Uma reflexão sobre o impacto da glória de Deus manifestada por meio dos dons espirituais, à luz da profecia de Joel 2:28. O livro convida a Igreja a viver o derramamento profetizado — com sonhos, visões e profecias — reacendendo o avivamento nos últimos dias." },
        { seedId: "trilogia-revelacao", categoria: "Códigos Avivar", titulo: "O Dom da Revelação — Segredos e Técnicas", nome: "O Dom da Revelação — Segredos e Técnicas", autor: "Filho do Deus Altíssimo", imageUrl: "/46-livro-o-dom-da-revelacao.jpg", pdfUrl: "/47-livro-o-dom-da-revelacao.pdf", destino: "loja", preco: "", linkCompra: "", linkCartao: "", descricao: "Uma obra dedicada ao dom da revelação e da palavra de ciência, com explicações simples e minuciosas fundamentadas nas Escrituras e garantidas pelo Espírito Santo. Traz também exercícios práticos para que o leitor experimente uma fluidez maior na manifestação desse dom em sua vida espiritual." },
      ];
      const faltando = canonicalTrilogia.filter((c) => !lojaW.some((p) => p.seedId === c.seedId));
      if (faltando.length > 0) {
        lojaW = [...lojaW, ...faltando.map((c) => ({ id: uid(), ...c }))];
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
      }
      todo.repairLoja1 = true;
    }
    if (!seeds.repairBiblioteca1) {
      const canonicalBiblioteca = [
        { seedId: "bib-palavra", titulo: "A Palavra de Deus: Um Remédio Infalível", autor: "Kenneth E. Hagin", capaUrl: "/biblioteca/6-biblioteca-a-palavra-de-deus.jpg", pdfUrl: "/biblioteca/7-biblioteca-a-palavra-de-deus.pdf", sinopse: "A partir de Provérbios 4.20-22, Kenneth Hagin mostra como a Palavra de Deus funciona como remédio para o corpo e para a vida — não apenas metáfora, mas promessa concreta de cura e sustento. Um convite a tratar as Escrituras com a mesma constância de um tratamento médico: lidas, guardadas no coração e proclamadas com fé." },
        { seedId: "bib-aguias", titulo: "Voando com as Águias", autor: "Kenneth Hagin Jr.", capaUrl: "/biblioteca/8-biblioteca-voando-com-as-aguias.jpg", pdfUrl: "/biblioteca/9-biblioteca-voando-com-as-aguias.pdf", sinopse: "Usando a águia como símbolo bíblico de força e renovação, Kenneth Hagin Jr. ensina como o cristão pode se erguer acima das tempestades da vida pela fé, em vez de reagir como as aves comuns diante das dificuldades. Um chamado à maturidade espiritual e à confiança na provisão de Deus mesmo em meio à adversidade." },
        { seedId: "bib-setepassos", titulo: "Sete Passos Vitais Para Receber o Espírito Santo", autor: "Kenneth E. Hagin", capaUrl: "/biblioteca/10-biblioteca-sete-passos-espirito-santo.jpg", pdfUrl: "/biblioteca/11-biblioteca-sete-passos-espirito-santo.pdf", sinopse: "Um guia prático e pastoral para ajudar alguém a receber o batismo no Espírito Santo, com base em Atos 2 e João 14, explicando o papel da fé, da expectativa e da liberdade para orar em línguas. Traz também dez razões bíblicas para valorizar essa experiência na vida de todo crente." },
        { seedId: "bib-familia", titulo: "Ministrando à Sua Família", autor: "Kenneth E. Hagin e Kenneth Hagin Jr.", capaUrl: "/biblioteca/12-biblioteca-ministrando-a-sua-familia.jpg", pdfUrl: "/biblioteca/13-biblioteca-ministrando-a-sua-familia.pdf", sinopse: "Coletânea de sermões dos dois autores sobre como aplicar princípios bíblicos de fé, amor e ordem na vida familiar. Aborda o papel de pais e cônjuges à luz da Palavra, com ênfase prática para o dia a dia do lar cristão." },
        { seedId: "bib-uncao", titulo: "Uma Nova Unção", autor: "Kenneth E. Hagin", capaUrl: "", pdfUrl: "", sinopse: "Hagin explica a diferença entre a unção que já habita todo crente e uma unção renovada e intensificada para o serviço, mostrando exemplos do Velho e do Novo Testamento de homens e mulheres que a buscaram e a mantiveram viva mesmo em circunstâncias adversas. Um chamado a não se contentar com reservatórios vazios quando Deus oferece um fluir constante do Espírito." },
        { seedId: "bib-nomejesus", titulo: "O Nome de Jesus", autor: "Kenneth E. Hagin", capaUrl: "", pdfUrl: "", sinopse: "Um estudo detalhado sobre a autoridade que Deus depositou no nome de Jesus — herdada, concedida e conquistada pela igreja — e como usá-la em oração, na cura, na libertação e no dia a dia da fé cristã. Percorre desde a origem desse Nome \"acima de todo nome\" até seu uso prático contra a opressão espiritual." },
        { seedId: "bib-alimentofe", titulo: "Alimento da Fé — Devocionais", autor: "Kenneth E. Hagin", capaUrl: "", pdfUrl: "", sinopse: "Uma coletânea de devocionais curtos, um para cada ocasião de leitura, criada para alimentar a fé do leitor diariamente através de confissões bíblicas e reflexões objetivas. Pensado para ser lido em voz alta, fortalecendo a prática da confissão da Palavra no dia a dia." },
        { seedId: "bib-cursofe", titulo: "Curso de Estudo Bíblico Sobre a Fé", autor: "Kenneth E. Hagin", capaUrl: "", pdfUrl: "", sinopse: "Um curso completo e didático sobre como a fé bíblica funciona: como ela vem, como é liberada, os passos para o mais alto tipo de fé e os maiores inimigos que a atacam. Referência clássica de Hagin sobre o tema, indicada tanto para o estudo pessoal quanto para discipulado em grupo." },
        { seedId: "bib2-dons", titulo: "Os Dons do Ministério", autor: "Kenneth E. Hagin", capaUrl: "/biblioteca/14-biblioteca-os-dons-do-ministerio.jpg", pdfUrl: "/biblioteca/15-biblioteca-os-dons-do-ministerio.pdf", sinopse: "Um estudo sobre os cinco dons ministeriais mencionados em Efésios 4 — apóstolo, profeta, evangelista, pastor e mestre — e como cada um deles equipa a igreja para o crescimento e a maturidade espiritual. Hagin explica como reconhecer esses chamados e por que eles continuam atuantes no Corpo de Cristo hoje." },
        { seedId: "bib2-elshaddai", titulo: "El Shaddai: O Deus Mais do que Suficiente", autor: "Kenneth E. Hagin", capaUrl: "/biblioteca/16-biblioteca-el-shaddai.jpg", pdfUrl: "/biblioteca/17-biblioteca-el-shaddai.pdf", sinopse: "A partir do nome hebraico El Shaddai, Hagin explora a suficiência de Deus para suprir cada necessidade do crente — física, financeira e espiritual. Um convite a confiar na provisão divina mesmo diante de circunstâncias que parecem maiores do que os próprios recursos." },
        { seedId: "bib2-sofram", titulo: "É Necessário que os Cristãos Sofram?", autor: "Kenneth E. Hagin", capaUrl: "/biblioteca/18-biblioteca-e-necessario-que-os-cristaos-sofram.jpg", pdfUrl: "/biblioteca/19-biblioteca-e-necessario-que-os-cristaos-sofram.pdf", sinopse: "Hagin examina, à luz das Escrituras, se o sofrimento é parte do plano de Deus para o crente ou consequência de outros fatores, distinguindo entre a perseguição pela fé e as aflições que a Palavra ensina a resistir. Uma reflexão pastoral para quem enfrenta dificuldades e busca entender o papel de Deus nelas." },
        { seedId: "bib2-duelo", titulo: "Duelo con el Diablo (em espanhol)", autor: "Kenneth Hagin Jr.", capaUrl: "/biblioteca/20-biblioteca-duelo-con-el-diablo.jpg", pdfUrl: "/biblioteca/21-biblioteca-duelo-con-el-diablo.pdf", sinopse: "Kenneth Hagin Jr. ensina como identificar as imitações e ciladas espirituais do diabo e como resistir a elas com autoridade na fé cristã. Atenção: este exemplar está em espanhol, não em português." },
        { seedId: "bib2-autoridade", titulo: "A Autoridade do Crente", autor: "Kenneth E. Hagin", capaUrl: "/biblioteca/22-biblioteca-a-autoridade-do-crente.jpg", pdfUrl: "/biblioteca/23-biblioteca-a-autoridade-do-crente.pdf", sinopse: "Um dos ensinos mais conhecidos de Hagin sobre a autoridade espiritual que o crente recebe em Cristo — a base bíblica para resistir ao inimigo, orar com convicção e viver de forma vitoriosa. Referência clássica sobre o tema no meio evangélico." },
        { seedId: "bib2-naoculpe", titulo: "Não Culpe a Deus", autor: "Kenneth E. Hagin", capaUrl: "", pdfUrl: "/biblioteca/24-biblioteca-nao-culpe-a-deus.pdf", sinopse: "A partir da própria história de enfermidade na infância, Hagin desmonta a ideia de que Deus é o autor do sofrimento, mostrando pelas Escrituras que a cura e a vida abundante são a vontade de Deus para todos. Um livro pastoral e testemunhal sobre encontrar respostas bíblicas em meio à dor." },
        { seedId: "bib2-casamento", titulo: "Casamento, Divórcio e Novo Casamento", autor: "Kenneth E. Hagin", capaUrl: "", pdfUrl: "", sinopse: "Hagin trata com equilíbrio bíblico os temas do casamento, do divórcio e da possibilidade de um novo casamento, buscando o que as Escrituras realmente ensinam para além do senso comum religioso. Aborda também a visão de Deus para o lar e os principais desafios entre marido e mulher." },
      ];
      const faltandoBib = canonicalBiblioteca.filter((c) => !bibliotecaW.some((b) => b.seedId === c.seedId));
      if (faltandoBib.length > 0) {
        bibliotecaW = [...bibliotecaW, ...faltandoBib.map((c) => ({ id: uid(), ...c }))];
        setBiblioteca(bibliotecaW);
        saveKey("avivar:biblioteca", bibliotecaW);
      }
      todo.repairBiblioteca1 = true;
    }
    // Os 4 livros da trilogia agora só existem pra venda na Loja Avivar — remove as
    // cópias que ficavam na Biblioteca pública (Parte G).
    if (!seeds.removerLivrosVendidosDaBiblioteca1) {
      const tinhaAlgum = bibliotecaW.some((b) => b.seedId && b.seedId.startsWith("trilogia-bib-"));
      if (tinhaAlgum) {
        bibliotecaW = bibliotecaW.filter((b) => !(b.seedId && b.seedId.startsWith("trilogia-bib-")));
        setBiblioteca(bibliotecaW);
        saveKey("avivar:biblioteca", bibliotecaW);
      }
      todo.removerLivrosVendidosDaBiblioteca1 = true;
    }
    if (!seeds.repairGaleria1) {
      const canonicalGaleria = [
        {
          seedId: "galeria-comunidade-1",
          titulo: "Vida em Comunidade",
          data: "2026-09-26",
          videos: [],
          fotos: [
            "/77-galeria-comunidade.jpg", "/78-galeria-comunidade.jpg", "/79-galeria-comunidade.jpg",
            "/80-galeria-comunidade.jpg", "/81-galeria-comunidade.jpg", "/82-galeria-comunidade.jpg",
            "/83-galeria-comunidade.jpg", "/84-galeria-comunidade.jpg", "/85-galeria-comunidade.jpg",
            "/86-galeria-comunidade.jpg", "/87-galeria-comunidade.jpg", "/88-galeria-comunidade.jpg",
            "/89-galeria-comunidade.jpg", "/90-galeria-comunidade.jpg",
          ],
        },
        {
          seedId: "galeria-louvor-1",
          titulo: "Louvor Avivar",
          data: "2026-09-26",
          videos: [],
          fotos: [
            LOUVOR_LOGO,
            "/48-louvor-avivar.jpg", "/49-louvor-avivar.jpg", "/50-louvor-avivar.jpg", "/51-louvor-avivar.jpg",
            "/52-louvor-avivar.jpg", "/53-louvor-avivar.jpg", "/54-louvor-avivar.jpg", "/55-louvor-avivar.jpg",
            "/56-louvor-avivar.jpg", "/57-louvor-avivar.jpg", "/58-louvor-avivar.jpg", "/59-louvor-avivar.jpg",
            "/60-louvor-avivar.jpg", "/61-louvor-avivar.jpg",
          ],
        },
      ];
      const faltandoGaleria = canonicalGaleria.filter((c) => !galeriaW.some((g) => g.seedId === c.seedId));
      if (faltandoGaleria.length > 0) {
        galeriaW = [...galeriaW, ...faltandoGaleria.map((c) => ({ id: uid(), ...c }))];
        setGaleria(galeriaW);
        saveKey("avivar:galeria", galeriaW);
      }
      todo.repairGaleria1 = true;
    }
    // --- Parte F: Loja com formato PDF/Físico + vitrine dos livros de Hagin em Códigos Avivar ---
    if (!seeds.lojaFormatoDuplo1) {
      lojaW = lojaW.map((p) =>
        p.seedId && p.seedId.startsWith("trilogia-") && p.precoPdf === undefined
          ? { ...p, precoPdf: "", linkPdf: "", precoFisico: "", linkFisico: "", previewUrl: "" }
          : p
      );
      setLoja(lojaW);
      saveKey("avivar:loja", lojaW);
      todo.lojaFormatoDuplo1 = true;
    }
    if (!seeds.lancamentoEnergiaCriador1) {
      const jaTemEnergia = lojaW.some((p) => p.seedId === "lancamento-energia-criador");
      if (!jaTemEnergia) {
        lojaW = [
          ...lojaW,
          {
            id: uid(),
            seedId: "lancamento-energia-criador",
            categoria: "Códigos Avivar",
            paraVenda: true,
            titulo: "A Energia do Criador",
            nome: "A Energia do Criador",
            autor: "Marcos Fagner S. Alves",
            imageUrl: "/70-livro-a-energia-do-criador-vitrine.jpg",
            capaVendaUrl: "/71-livro-a-energia-do-criador-capa-venda.jpg",
            pdfNaoLiberado: true,
            fisicoEsgotado: true,
            precoPdf: "",
            precoFisico: "",
            preco: "",
            linkCompra: "",
            linkCartao: "",
            destino: "loja",
            descricao: "Deus escreveu dois livros: a Bíblia e o universo. Nesta obra inédita — Volume IX da Série Códigos Avivar, Revelações dos Últimos Tempos — Marcos Fagner S. Alves mostra como as descobertas mais impressionantes da física quântica (o campo quântico, o efeito do observador, o enlaçamento e a incerteza) ressoam com o que as Escrituras já revelavam há milênios sobre a presença, o poder e a soberania do Criador. Deus não é o campo quântico — Ele o criou. Um convite a enxergar, na estrutura mais profunda do universo, as marcas de Quem o projetou, unindo ciência, fé e revelação em uma leitura que fortalece a adoração e a intimidade com o Espírito Santo.",
          },
        ];
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
      }
      todo.lancamentoEnergiaCriador1 = true;
    }
    if (!seeds.hagInVitrineCodigos1) {
      const idsBib = ["bib-palavra","bib-aguias","bib-setepassos","bib-familia","bib-uncao","bib-nomejesus","bib-alimentofe","bib-cursofe","bib2-dons","bib2-elshaddai","bib2-sofram","bib2-duelo","bib2-autoridade","bib2-naoculpe","bib2-casamento"];
      const jaTem = lojaW.some((p) => p.seedId && p.seedId.startsWith("vitrine-bib"));
      if (!jaTem) {
        const novosVitrine = idsBib
          .map((sid) => bibliotecaW.find((b) => b.seedId === sid))
          .filter(Boolean)
          .map((b) => ({
            id: uid(),
            seedId: "vitrine-" + b.seedId,
            categoria: "Códigos Avivar",
            titulo: b.titulo,
            nome: b.titulo,
            autor: b.autor || "",
            imageUrl: b.capaUrl || "",
            pdfUrl: b.pdfUrl || "",
            destino: "biblioteca",
          }));
        lojaW = [...lojaW, ...novosVitrine];
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
      }
      todo.hagInVitrineCodigos1 = true;
    }
    if (!seeds.galeriaComunidade1) {
      const jaTemSessao = galeriaW.some((g) => g.seedId === "galeria-comunidade-1");
      if (!jaTemSessao) {
        const novaSessao = {
          id: uid(),
          seedId: "galeria-comunidade-1",
          titulo: "Vida em Comunidade",
          data: "2026-09-26",
          videos: [],
          fotos: [
            "/77-galeria-comunidade.jpg",
            "/78-galeria-comunidade.jpg",
            "/79-galeria-comunidade.jpg",
            "/80-galeria-comunidade.jpg",
            "/81-galeria-comunidade.jpg",
            "/82-galeria-comunidade.jpg",
            "/83-galeria-comunidade.jpg",
            "/84-galeria-comunidade.jpg",
            "/85-galeria-comunidade.jpg",
            "/86-galeria-comunidade.jpg",
            "/87-galeria-comunidade.jpg",
            "/88-galeria-comunidade.jpg",
            "/89-galeria-comunidade.jpg",
            "/90-galeria-comunidade.jpg",
          ],
        };
        galeriaW = [...galeriaW, novaSessao];
        setGaleria(galeriaW);
        saveKey("avivar:galeria", galeriaW);
      }
      todo.galeriaComunidade1 = true;
    }
    if (!seeds.galeriaLouvor1) {
      const jaTemLouvor = galeriaW.some((g) => g.seedId === "galeria-louvor-1");
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
        galeriaW = [...galeriaW, sessaoLouvor];
        setGaleria(galeriaW);
        saveKey("avivar:galeria", galeriaW);
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
    if (!seeds.escalaHorariosCorretos1) {
      // Força os horários padrão (Quarta e Sexta 19:20-21:00, Domingo 18:30-20:00) —
      // a escala já salva no banco pode estar com valores antigos.
      const escalaAtual = escala || DEFAULT_ESCALA_OBREIROS;
      const novaEscala = { ...escalaAtual, horarios: HORARIOS_PADRAO };
      setEscala(novaEscala);
      saveKey("avivar:escalaObreiros", novaEscala);
      todo.escalaHorariosCorretos1 = true;
    }
    if (!seeds.corrigeTelefonePrMarcos1) {
      // Correção: o WhatsApp 85992071505 tinha sido cadastrado por engano como telefone
      // pessoal do Pr. Marcos na Escala de Obreiros — na verdade é o WhatsApp oficial do
      // Ministério (ver seed whatsappMinisterio1 abaixo). Remove essa entrada errada,
      // sem mexer em nenhum outro telefone que já tenha sido cadastrado manualmente.
      const escalaAtual = escala || DEFAULT_ESCALA_OBREIROS;
      if (escalaAtual.telefonesObreiros && escalaAtual.telefonesObreiros["Pr. Marcos"] === "85992071505") {
        const { "Pr. Marcos": _remove, ...resto } = escalaAtual.telefonesObreiros;
        const novaEscala = { ...escalaAtual, telefonesObreiros: resto };
        setEscala(novaEscala);
        saveKey("avivar:escalaObreiros", novaEscala);
      }
      todo.corrigeTelefonePrMarcos1 = true;
    }
    if (!seeds.whatsappMinisterio1) {
      // WhatsApp oficial do Ministério — usado no botão flutuante do site inteiro.
      if (!site.whatsappMinisterio) {
        const novoSite = { ...(site || DEFAULT_SITE), whatsappMinisterio: "85992071505" };
        setSite(novoSite);
        saveKey("avivar:site", novoSite);
      }
      todo.whatsappMinisterio1 = true;
    }
    if (!seeds.colaboradoresNovos1) {
      const jaTemColab = colaboradoresW.some((c) => c.seedId && c.seedId.startsWith("colab-novo-"));
      if (!jaTemColab) {
        const novosColab = [
          { id: uid(), seedId: "colab-novo-elias", nome: "Elias", cargo: "Irmão", fotoUrl: "/66-colaborador-elias.jpg" },
          { id: uid(), seedId: "colab-novo-bene", nome: "Bené", cargo: "Diaconisa", fotoUrl: "/67-colaboradora-bene.jpg" },
          { id: uid(), seedId: "colab-novo-livia", nome: "Lívia", cargo: "Irmã", fotoUrl: "/68-colaboradora-livia.jpg" },
        ];
        colaboradoresW = [...colaboradoresW, ...novosColab];
        setColaboradores(colaboradoresW);
        saveKey("avivar:colaboradores", colaboradoresW);
      }
      todo.colaboradoresNovos1 = true;
    }
    if (!seeds.colaboradoresNovos2) {
      const jaTemNardo = colaboradoresW.some((c) => c.seedId === "colab-novo-nardo");
      if (!jaTemNardo) {
        colaboradoresW = [...colaboradoresW, { id: uid(), seedId: "colab-novo-nardo", nome: "Nardo", cargo: "Irmão", fotoUrl: "/91-colaborador-nardo.jpg" }];
        setColaboradores(colaboradoresW);
        saveKey("avivar:colaboradores", colaboradoresW);
      }
      todo.colaboradoresNovos2 = true;
    }
    if (!seeds.homeCardsOracaoImg1) {
      const hc = site.homeCards || DEFAULT_HOMECARDS;
      const precisaCorrigir = hc.some((c) => c.key === "oracoes" && !c.imageUrl);
      if (precisaCorrigir) {
        const hcCorrigido = hc.map((c) => (c.key === "oracoes" && !c.imageUrl ? { ...c, imageUrl: ORACOES_BANNER } : c));
        const siteAtual = site || DEFAULT_SITE;
        const novoSite = { ...siteAtual, homeCards: hcCorrigido };
        setSite(novoSite);
        saveKey("avivar:site", novoSite);
      }
      todo.homeCardsOracaoImg1 = true;
    }
    if (!seeds.reportagemPortaisImg1) {
      const precisaImagem = avivarNews.some((n) => n.seedId === "codigos-portais" && !n.imageUrl);
      if (precisaImagem) {
        const newsCorrigida = avivarNews.map((n) =>
          n.seedId === "codigos-portais" && !n.imageUrl ? { ...n, imageUrl: CODIGOS_ARTIGO_PORTAIS_ESPIRITUAIS } : n
        );
        setAvivarNews(newsCorrigida);
        saveKey("avivar:avivarnews", newsCorrigida);
      }
      todo.reportagemPortaisImg1 = true;
    }
    // Remove músicas duplicadas dentro de cada culto do repertório (mesmo título, sem
    // diferenciar maiúsculas/espaços nas pontas) — mantém só a primeira ocorrência.
    if (!seeds.dedupeRepertorio1) {
      const chaveMusica = (m) => (m.titulo || "").trim().toLowerCase();
      const tinhaDuplicada = (repertorio || []).some((c) => {
        const vistos = new Set();
        return (c.musicas || []).some((m) => {
          const k = chaveMusica(m);
          if (!k) return false;
          if (vistos.has(k)) return true;
          vistos.add(k);
          return false;
        });
      });
      if (tinhaDuplicada) {
        const repertorioSemDuplicadas = (repertorio || []).map((c) => {
          const vistos = new Set();
          const musicasUnicas = (c.musicas || []).filter((m) => {
            const k = chaveMusica(m);
            if (!k) return true;
            if (vistos.has(k)) return false;
            vistos.add(k);
            return true;
          });
          return { ...c, musicas: musicasUnicas };
        });
        setRepertorio(repertorioSemDuplicadas);
        saveKey("avivar:repertorio", repertorioSemDuplicadas);
      }
      todo.dedupeRepertorio1 = true;
    }
    // Reorganização dos cards da Home pedida pelo Marcos (set/2026): nova ordem em
    // 3x3, card "Bíblia Avivar" entrando na grade (saiu do card grande em destaque),
    // "Igrejas Avivar" saindo da grade (continua no menu superior) e resumo em cada
    // card. Roda uma vez só; preserva a imagem já cadastrada de cada card que já
    // existia (caso o admin tenha trocado alguma banner antes desta atualização).
    if (!seeds.homeCardsReorg1) {
      const hcAtual = site.homeCards || DEFAULT_HOMECARDS;
      const porChave = {};
      hcAtual.forEach((c) => { porChave[c.key] = c; });
      const hcNovo = DEFAULT_HOMECARDS.map((c) => {
        const antigo = porChave[c.key];
        return antigo && antigo.imageUrl ? { ...c, imageUrl: antigo.imageUrl } : c;
      });
      const siteAtual = site || DEFAULT_SITE;
      const novoSite = { ...siteAtual, homeCards: hcNovo };
      setSite(novoSite);
      saveKey("avivar:site", novoSite);
      todo.homeCardsReorg1 = true;
    }
    // Marcos perdeu as 11 fotos originais da galeria "Vida em Comunidade" (nunca
    // chegou a colar os arquivos /32 a /42-galeria-comunidade.jpg no GitHub) e mandou
    // 14 fotos novas pra substituir. Sobrescreve o array de fotos dessa sessão — que
    // os seeds anteriores (galeriaComunidade1 / repairGaleria1) já tinham criado com
    // os nomes antigos — com os nomes definitivos /77 a /90-galeria-comunidade.jpg.
    // Roda uma vez só; se a sessão ainda não existir por algum motivo, cria ela já
    // com os nomes certos.
    if (!seeds.galeriaComunidadeFotosNovas1) {
      const fotosNovas = Array.from({ length: 14 }, (_, i) => `/${77 + i}-galeria-comunidade.jpg`);
      const temSessao = galeriaW.some((g) => g.seedId === "galeria-comunidade-1");
      galeriaW = temSessao
        ? galeriaW.map((g) => (g.seedId === "galeria-comunidade-1" ? { ...g, fotos: fotosNovas } : g))
        : [...galeriaW, { id: uid(), seedId: "galeria-comunidade-1", titulo: "Vida em Comunidade", data: "2026-09-28", videos: [], fotos: fotosNovas }];
      setGaleria(galeriaW);
      saveKey("avivar:galeria", galeriaW);
      todo.galeriaComunidadeFotosNovas1 = true;
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
    pedidosFisicos: (v) => { setPedidosFisicos(v); saveKey("avivar:pedidosfisicos", v); },
    oracaoLocalDia: (v) => { setOracaoLocalDia(v); saveKey("avivar:oracaolocaldia", v); },
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

  // Link de confirmação de escala vindo do WhatsApp (?escalaId=...) — mostra só a
  // telinha de confirmação, sem o site inteiro em volta, pra ser rápido no celular.
  if (escalaConfirmId) {
    const achaEmPrincipal = Object.values((escala && escala.escalasPorDia) || {}).some((d) =>
      (d.escalados || []).some((e) => e.id === escalaConfirmId)
    );
    const igrejaDona = !achaEmPrincipal
      ? (igrejas || []).find((ig) =>
          Object.values((ig.escala && ig.escala.escalasPorDia) || {}).some((d) =>
            (d.escalados || []).some((e) => e.id === escalaConfirmId)
          )
        )
      : null;
    const escalaAlvo = igrejaDona ? igrejaDona.escala : escala;
    const saveAlvo = igrejaDona
      ? (v) => persist.igrejas(igrejas.map((ig) => (ig.id === igrejaDona.id ? { ...ig, escala: v } : ig)))
      : persist.escala;
    return (
      <ConfirmarEscalaObreiro
        escala={escalaAlvo}
        save={saveAlvo}
        escalaId={escalaConfirmId}
        onVoltar={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("escalaId");
          window.history.replaceState({}, "", url.toString());
          setEscalaConfirmId(null);
        }}
      />
    );
  }

  // Página própria de uma Unidade Avivar — assume a tela inteira, no lugar do site
  // principal, enquanto uma unidade estiver selecionada (ver Igrejas → IgrejaCard).
  if (paginaIgrejaId) {
    const igrejaSelecionada = (igrejas || []).find((ig) => ig.id === paginaIgrejaId);
    if (igrejaSelecionada) {
      return (
        <PaginaIgreja
          igreja={igrejaSelecionada}
          all={igrejas}
          save={persist.igrejas}
          adminMode={adminMode}
          onVoltar={() => setPaginaIgrejaId(null)}
        />
      );
    }
    // Unidade não encontrada (ex: excluída enquanto a página estava aberta) — cai
    // de volta pro site normal, sem forçar atualização de estado durante o render.
  }

  // Página "Cursos dos Códigos Avivar" — abre em tela cheia, sem rolar a home.
  if (paginaCursosOpen) {
    return <PaginaCursos onVoltar={() => setPaginaCursosOpen(false)} />;
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
        @keyframes purpleLightPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(179,157,219,0.65); } 50% { box-shadow: 0 0 0 7px rgba(179,157,219,0); } }
        .purple-light-pulse { animation: purpleLightPulse 2.2s ease-in-out infinite; }
        .purple-light-pulse:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .purple-light-pulse { animation: none; } }
        @keyframes livePulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(225,77,58,0.6); } 50% { box-shadow: 0 0 0 8px rgba(225,77,58,0); } }
        .live-pulse { animation: livePulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .live-pulse { animation: none; } }
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
        <section id="home"><Home site={site} setPage={scrollToSection} visitantes={visitantes} saveSite={persist.site} adminMode={adminMode} aoVivo={aoVivo} oracaoEncontros={oracaoEncontros} avivarNews={avivarNews} doacoes={doacoes} manchete={manchete} saveManchete={persist.manchete} onOpenNews={abrirReportagem} oracaoLocalDia={oracaoLocalDia} escala={escala} onOpenCursos={() => setPaginaCursosOpen(true)} /></section>
        <section id="codigos" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><CodigosAvivar data={codigos} save={persist.codigos} adminMode={adminMode} loja={loja} saveLoja={persist.loja} avivarNews={avivarNews} setPage={scrollToSection} onOpenNews={abrirReportagem} unlocked={codigosUnlocked} setUnlocked={setCodigosUnlocked} /></section>
        <section id="loja" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Loja items={loja} save={persist.loja} adminMode={adminMode} operatorMode={podeSetor("loja")} onRequestOperator={() => setOperatorGateOpen(true)} doacoes={doacoes} pedidosFisicos={pedidosFisicos} savePedidosFisicos={persist.pedidosFisicos} /></section>
        <section id="eventos" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><EventosGaleria eventos={eventos} saveEventos={persist.eventos} galeria={galeria} saveGaleria={persist.galeria} adminMode={adminMode} setManchete={persist.manchete} /></section>
        <section id="aovivo" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><AoVivo data={aoVivo} save={persist.aoVivo} passadas={transmissoesPassadas} savePassadas={persist.transmissoesPassadas} news={avivarNews} saveNews={persist.avivarNews} adminMode={adminMode} onOpenNews={abrirReportagem} /></section>
        <section id="igrejas" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Igrejas igrejas={igrejas} save={persist.igrejas} adminMode={adminMode} onOpenIgreja={setPaginaIgrejaId} /></section>
        <section id="colaboradores" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Colaboradores items={colaboradores} save={persist.colaboradores} adminMode={adminMode} /></section>
        <section id="escala" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><EscalaObreiros data={escala} save={persist.escala} adminMode={adminMode} operatorMode={podeSetor("escala")} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="estudos" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Estudos items={estudos} save={persist.estudos} adminMode={adminMode} /></section>
        <section id="biblioteca" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><BibliotecaAvivar items={biblioteca} save={persist.biblioteca} adminMode={adminMode} setPage={scrollToSection} /></section>
        <section id="doacoes" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Doacoes data={doacoes} save={persist.doacoes} adminMode={adminMode} /></section>
        <section id="visitantes" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Visitantes items={visitantes} save={persist.visitantes} refresh={() => loadKey("avivar:visitantes", []).then(setVisitantes)} adminMode={adminMode} operatorMode={podeSetor("visitantes")} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="oracoes" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><OracoesLares items={oracoes} save={persist.oracoes} encontros={oracaoEncontros} saveEncontros={persist.oracaoEncontros} adminMode={adminMode} operatorMode={podeSetor("oracoes")} onRequestOperator={() => setOperatorGateOpen(true)} localDia={oracaoLocalDia} saveLocalDia={persist.oracaoLocalDia} /></section>
        <section id="pedidooracao" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><PedidoOracao items={pedidosOracao} save={persist.pedidosOracao} adminMode={adminMode} /></section>
        <section id="membros" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Membros items={membros} save={persist.membros} adminMode={adminMode} operatorMode={podeSetor("membros")} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="avivarmusic" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><AvivarMusic repertorio={repertorio} saveRepertorio={persist.repertorio} musicos={musicos} saveMusicos={persist.musicos} albuns={albuns} saveAlbuns={persist.albuns} adminMode={adminMode} operatorMode={podeSetor("avivarmusic")} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="caixa" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Caixa items={caixa} save={persist.caixa} adminMode={adminMode} /></section>
        <section id="operadores" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><OperadoresAdmin codes={operatorCodes} save={persist.operatorCodes} adminMode={adminMode} /></section>
        <section id="bens" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Bens items={bens} save={persist.bens} adminMode={adminMode} /></section>
        <section id="contato" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Contato items={mensagens} save={persist.mensagens} adminMode={adminMode} /></section>
      </main>

      <Footer churchName={site.churchName} />
      <BotaoFlutuanteWhatsapp numero={site.whatsappMinisterio} />

      <ReportagemModal
        news={(avivarNews || []).find((n) => n.id === newsAbrirId) || null}
        adminMode={adminMode}
        onClose={() => setNewsAbrirId(null)}
        onDelete={() => {
          persist.avivarNews(avivarNews.filter((n) => n.id !== newsAbrirId));
          setNewsAbrirId(null);
        }}
      />

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
          onSuccess={(auth) => {
            setOperatorAuth(auth);
            setOperatorGateOpen(false);
          }}
        />
      )}
    </div>
  );
}
