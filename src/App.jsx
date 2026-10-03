import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Flame, Menu, X, ChevronLeft, ChevronRight, Lock, Unlock, Plus, Trash2,
  Phone, Calendar, Clock, MapPin, Video, Image as ImageIcon, Users, Church,
  BookOpen, Radio, MessageCircle, Home as HomeIcon, Mail, ShieldCheck,
  KeyRound, LogOut, Send, HandHeart, ChevronDown, Sparkles, ShoppingBag,
  Music, Wallet, Package, UserPlus, Copy, Gift, CreditCard, PlayCircle, ClipboardList, Library, FileText,
  Truck, Pencil, Save, ArrowLeft, GraduationCap, Tv, Feather, Gem, Crown, CheckCircle2,
  Play, Pause, Maximize, Minus, Settings2, Layers, History,
  Eye, EyeOff, Bell, Star, Check, Mic, Headphones, Music2, Music3, Music4
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
const LIVRO_CURA_ALMA_CAPA = "/92-livro-cura-da-alma-capa.jpg";
const LIVRO_ANJOS_CAPA = "/93-livro-anjos-entre-trono-terra-capa.jpg";
const LIVRO_MILAGRES_JESUS_CAPA = "/94-livro-milagres-de-jesus-cristo-capa.jpg";
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
// Compara nomes ignorando acento e maiúscula/minúscula — usado pra achar o
// Pastor Marcos e a Pastora Wládia entre os colaboradores sem depender de
// como o nome foi digitado.
const semAcento = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
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
];

const DEFAULT_SITE = {
  churchName: "Ministério Avivar do Espírito",
  // Histórico breve mostrado na 1ª coluna do topo da Home, junto com o nome e a
  // logo (editável pelo admin; texto completo continua na seção "Sobre nós").
  heroHistoricoBreve: "Um ministério levantado para resgatar vidas, restaurar corações e avivar a Igreja com o poder do Espírito Santo — anunciando o evangelho e cuidando de cada pessoa como família.",
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
  // Planos de assinatura (Anjo grátis / Querubim / Serafim) — preço e imagem ficam
  // em branco até Marcos definir (ver doc de planejamento), editáveis pelo admin
  // direto na página de venda. "beneficios" é um texto com um item por linha.
  planos: {
    anjo: {
      precoSemestral: "",
      precoAnual: "",
      imagemUrl: "",
      resumo: "O anjo é o mensageiro — o primeiro a anunciar a boa nova. Este é o seu ponto de partida em Códigos Avivar: gratuito, sempre aberto, para que ninguém fique de fora do chamado.",
      beneficios: "Reportagens e vitrine de Avivar News\nAcesso às matérias públicas de Códigos Avivar\nConvite permanente para subir de nível quando o Espírito chamar",
    },
    querubim: {
      precoSemestral: "",
      precoAnual: "",
      imagemUrl: "",
      resumo: "Os querubins guardavam a entrada do Éden e contemplavam de perto a glória de Deus. Neste nível os véus começam a se abrir: livros completos, estudos mais profundos e ferramentas práticas para a sua caminhada.",
      beneficios: "Tudo do nível Anjo\nLivros da trilogia + O Dom da Revelação, em PDF/flip-book\nEstudos espirituais (energia quântica, glândula pineal, energias vibracionais) — acesso parcial\nVídeo-aulas exclusivas — acesso parcial\nExercícios práticos guiados",
    },
    serafim: {
      precoSemestral: "",
      precoAnual: "",
      imagemUrl: "",
      resumo: "Os serafins estão ao redor do trono, na presença mais íntima da glória (Isaías 6). Este é o nível mais pleno de Códigos Avivar — tudo liberado, para quem deseja viver na frequência mais alta da revelação.",
      beneficios: "Tudo do nível Querubim\nEstudos espirituais completos\nVídeo-aulas exclusivas completas\nNovos lançamentos em primeira mão",
    },
  },
  // Pessoas interessadas em assinar (formulário acima das credenciais) — lista
  // crua, pensada para já servir de base de migração quando o app independente
  // de Códigos Avivar existir.
  leads: [],
};

/* ---------------------------------------------------------------- */
/* Células Avivar                                                      */
/* ---------------------------------------------------------------- */
// Três células fixas (Alfa/Beta/Gama) — não é uma lista que o admin cresce
// livremente, é a estrutura pedida pelo Marcos. Cada uma guarda seu próprio
// logotipo (a enviar), anfitrião, lista de participantes (texto, um nome por
// linha) e um pequeno histórico de encontros — mesmo padrão de "encontros"
// já usado em Orações nos Lares (data + anfitrião + local + fotos).
const CELULA_KEYS = ["alfa", "beta", "gama"];
const CELULA_LABELS = { alfa: "Célula Alfa", beta: "Célula Beta", gama: "Célula Gama" };
const CELULA_CORES = { alfa: "#CBA135", beta: "#4A3B6B", gama: "#C4622D" };
const CELULA_VAZIA = (chave) => ({
  nome: CELULA_LABELS[chave],
  logoUrl: "",
  anfitriao: "",
  participantes: "",
  historia: "",
  encontros: [],
});
const DEFAULT_CELULAS = {
  // Diácono Gilvan coordena o projeto Células Avivar como um todo (as 3 células).
  // liderCode é o código único que o admin gera/revoga e entrega ao Diácono Gilvan
  // (Líder de Células) para que ele edite as 3 páginas sem precisar do login de admin.
  coordenador: "Diácono Gilvan",
  liderCode: "LIDER-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
  liderCodeActive: true,
  alfa: {
    ...CELULA_VAZIA("alfa"),
    logoUrl: "/109-celula-alfa-logo.png",
    anfitriao: "Irmão Renato",
    historia:
      "A Célula Alfa foi a primeira célula formada pelo Ministério Avivar do Espírito, em 01/10/2026 — o início do projeto Células Avivar. Tem o Irmão Renato como anfitrião.",
    encontros: [
      { id: "seed-celula-alfa-01", data: "2026-10-01", anfitriao: "Irmão Renato", local: "", fotos: ["/95-celula-alfa-primeiro-encontro.jpg"] },
    ],
  },
  beta: { ...CELULA_VAZIA("beta"), logoUrl: "/111-celula-beta-logo.png" },
  gama: { ...CELULA_VAZIA("gama"), logoUrl: "/110-celula-gama-logo.png" },
};
const CELULA_ENCONTRO_FIELDS = [
  { key: "data", label: "Data", type: "date" },
  { key: "anfitriao", label: "Anfitrião(ã)" },
  { key: "local", label: "Local / endereço" },
  { key: "relato", label: "Relato do líder (quantas harpas louvaram, qual foi a palavra do dia, etc.)", type: "textarea" },
  { key: "presentes", label: "Relação dos presentes nesse encontro (um nome por linha)", type: "textarea" },
];

/* ---------------------------------------------------------------- */
/* História do Ministério                                              */
/* ---------------------------------------------------------------- */
// Página aberta ao clicar no nome/logo do Ministério no Hero da Home — guarda
// o texto que antes vivia na seção "Sobre nós" (agora substituída por Células
// Avivar na Home), além de fotos antigas e a diretoria/liderança.
const DEFAULT_HISTORIA = {
  texto:
    "O Ministério Avivar do Espírito é uma igreja interdenominacional, fundamentada na doutrina cristã, dedicada ao ensino da Palavra, à comunhão entre irmãos e ao cuidado com quem chega pela primeira vez.\n\nMesmo sendo interdenominacionais, buscamos constantemente o poder do Senhor Espírito Santo, ativando os dons espirituais de cura, milagres, maravilhas, revelação, profecia e tudo quanto o Senhor determinar — estamos dispostos a fazer. Mesmo sem alardes nem grandes holofotes, milagres, curas, revelações e profecias são constantes neste ministério.\n\nOs fiéis de Jesus Cristo são tratados sem distinção hierárquica, porque consideramos todos filhos amados de Jesus Cristo. Cremos no batismo nas águas, no Espírito Santo de Deus como nosso Consolador, no Santo Cristo Jesus como Redentor, e no Deus Todo-Poderoso como um só Deus, que nos sustenta.",
  fotosAntigas: [],
  diretoria: [],
};
const DIRETORIA_FIELDS = [
  { key: "nome", label: "Nome completo" },
  { key: "cargo", label: "Cargo na diretoria" },
  { key: "fotoUrl", label: "URL da foto", type: "url" },
];

const DEFAULT_AOVIVO = {
  isLive: false,
  instagramUrl: "",
  xUrl: "",
  youtubeUrl: "",
  embedUrl: "",
  mensagem: "Nenhuma transmissão no momento. Volte em breve.",
  programacao: [],
  // Próxima transmissão agendada — enquanto isLive for falso e essa data estiver
  // no futuro, o card de vídeo ao vivo da Home mostra um cronômetro regressivo
  // em vez da última transmissão.
  proximaTransmissaoEm: "",
  proximaTransmissaoTitulo: "",
};
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

// Banner de boas-vindas aos Visitantes do Dia — quando há nomes cadastrados (e o
// admin não "parou" a exibição), este banner toma o lugar da Escala de Serviço no
// topo da Home (a escala continua normalmente na sua própria seção). Cada nome
// pulsa, com uma mensagem de boas-vindas e, opcionalmente, um áudio de fundo.
const DEFAULT_VISITANTES_DIA = {
  nomes: [], // [{ id, nome }]
  exibir: true, // admin "parar exibição de visitantes"
  exibirEscala: true, // admin "parar exibição de escala" (na Home — a seção própria continua)
  mensagem: "Sejam muito bem-vindos(as), amados irmãos e irmãs em Cristo Jesus! É uma alegria recebê-los hoje entre nós. Agradecemos a Deus pela sua presença, em nome de Jesus Cristo e do Ministério Avivar do Espírito.",
  audioUrl: "",
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

function DynamicForm({ fields, accent = C.gold, onSubmit, submitLabel = "Adicionar", initial }) {
  const empty = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.key, initial && initial[f.key] != null ? String(initial[f.key]) : ""])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields]
  );
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
  { key: "codigos", label: "Códigos Avivar", icon: KeyRound, red: true },
  { key: "loja", label: "Loja Avivar", icon: ShoppingBag, red: true },
  { key: "eventos", label: "Eventos/Galeria", icon: Calendar },
  { key: "aovivo", label: "Avivar News TV", icon: Tv, red: true },
  { key: "igrejas", label: "Igrejas Avivar", icon: Church },
  { key: "biblia", label: "Bíblia Sagrada", icon: BookOpen, red: true },
  // Era "Contato" — como já existe o botão de WhatsApp pra isso, virou atalho
  // direto pra seção das Células Avivar (dentro da Home), a pedido do Marcos.
  { key: "celulas", label: "Células Avivar", icon: Layers },
];
// "Escala" primeiro (pra alinhar embaixo de "Início", o 1º botão da barra de
// cima — ver o espaçador invisível na NavBar); "Biblioteca" (nome encurtado) e
// "Oração nos Lares" (novo) ficam juntos, no meio.
const SUBMENU = [
  { key: "escala", label: "Escala", icon: ClipboardList },
  { key: "colaboradores", label: "Colaboradores", icon: Users },
  { key: "estudos", label: "Estudos Bíblicos", icon: BookOpen },
  { key: "biblioteca", label: "Biblioteca", icon: Library },
  { key: "oracoes", label: "Oração nos Lares", icon: MapPin },
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
    let cancelado = false;
    const feedUrl = "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419";

    const parseRssXml = (xmlText) => {
      const xml = new DOMParser().parseFromString(xmlText, "text/xml");
      return Array.from(xml.querySelectorAll("item"))
        .slice(0, 12)
        .map((item) => ({
          titulo: item.querySelector("title")?.textContent || "",
          link: item.querySelector("link")?.textContent || "",
        }))
        .filter((n) => n.titulo);
    };

    // Tenta mais de uma fonte, em sequência: se a primeira falhar (proxy fora
    // do ar, limite de uso, bloqueio temporário etc.) tenta a próxima, só
    // caindo nas manchetes padrão se todas falharem. Isso evita que o
    // carrossel fique preso nas notícias padrão quando um único serviço
    // externo está indisponível.
    const fontes = [
      // rss2json: serviço feito especificamente pra isso, devolve JSON
      // pronto — em geral mais confiável que um proxy de CORS genérico.
      async () => {
        const r = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feedUrl));
        if (!r.ok) throw new Error("rss2json falhou");
        const data = await r.json();
        if (data.status !== "ok" || !Array.isArray(data.items)) throw new Error("rss2json sem itens");
        return data.items
          .slice(0, 12)
          .map((item) => ({ titulo: item.title || "", link: item.link || "" }))
          .filter((n) => n.titulo);
      },
      // allorigins: proxy de CORS genérico, devolve o XML original do feed.
      async () => {
        const proxied = "https://api.allorigins.win/raw?url=" + encodeURIComponent(feedUrl);
        const r = await fetch(proxied);
        if (!r.ok) throw new Error("allorigins falhou");
        const items = parseRssXml(await r.text());
        if (items.length === 0) throw new Error("allorigins sem itens");
        return items;
      },
      // corsproxy.io: segunda alternativa de proxy genérico, caso o allorigins
      // esteja fora do ar ou com limite de uso atingido.
      async () => {
        const proxied = "https://corsproxy.io/?url=" + encodeURIComponent(feedUrl);
        const r = await fetch(proxied);
        if (!r.ok) throw new Error("corsproxy falhou");
        const items = parseRssXml(await r.text());
        if (items.length === 0) throw new Error("corsproxy sem itens");
        return items;
      },
    ];

    (async () => {
      for (const tentar of fontes) {
        try {
          const items = await tentar();
          if (!cancelado && items.length > 0) {
            setNoticias(items);
            return;
          }
        } catch (e) {
          // tenta a próxima fonte da lista
        }
      }
    })();

    return () => {
      cancelado = true;
    };
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
  // Botões do menu no celular — fundo branco, letra preta, a pedido do Marcos
  // (diferente do estilo "pill" roxo/transparente usado no menu de telas grandes).
  const mobilePillStyle = (active) => ({
    background: "#fff",
    color: "#000",
    border: `1px solid ${active ? C.gold : "#00000022"}`,
  });
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
      {/* Linha 1 (fundo preto): logo + ícone da loja e, NA MESMA LINHA do ícone, os
          pills do NAV (começando pertinho do ícone). Linha 2 (roxa): RESTRITO e, NA
          MESMA LINHA dele, os pills do submenu. O bloco da esquerda das duas linhas
          tem a mesma largura fixa (NAV_LEFT_W), então "Início" cai exatamente em
          cima de "Escala"; e como os dois grupos de pills vão até a mesma borda
          direita, "Células Avivar" cai em cima de "Visitantes". */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-end gap-3 pt-3 pb-1.5" style={{ background: C.violetDeep }}>
        <div className="flex items-end gap-3 shrink-0 lg:w-[208px]">
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
        <nav className="hidden lg:flex flex-1 items-center justify-between pb-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => go(n.key)}
              className="nav-pulse inline-flex items-center justify-center text-center px-1.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap transition focus:outline-none focus:ring-2"
              style={{ background: C.liveRed, color: "#fff", border: `1px solid ${page === n.key ? C.goldBright : C.liveRed}` }}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="hidden lg:flex items-center gap-3 max-w-6xl mx-auto px-4 sm:px-6 py-1.5" style={{ background: C.violetDeep }}>
        <div className="shrink-0 w-[208px]">
          <button
            onClick={onAdminClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold tracking-wide whitespace-nowrap focus:outline-none focus:ring-2"
            style={{ background: adminMode ? "#2E7D4F" : C.liveRed, color: "#fff" }}
          >
            {adminMode ? <ShieldCheck size={13} color="#fff" /> : <Lock size={13} color="#fff" />}
            {adminMode ? "SAIR DO ADMIN" : "RESTRITO"}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-between">
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
      </div>

      {open && (
        <div className="lg:hidden border-t px-3 py-3" style={{ borderColor: C.gold + "33", background: C.black }}>
          {/* No celular, botões ainda menores, em 2 colunas, fundo branco e letra
              preta (a pedido do Marcos) — cabe mais menu na tela sem precisar rolar
              tanto pra achar o item que se quer. */}
          <div className="grid grid-cols-2 gap-1">
            {[...NAV, ...SUBMENU, ...(adminMode ? ADMIN_MENU : [])].map((n) => (
              <button key={n.key} onClick={() => go(n.key)} className="text-left px-1.5 py-1 text-[10px] rounded-full flex items-center gap-1 truncate" style={mobilePillStyle(page === n.key)}>
                {n.icon && <n.icon size={11} className="shrink-0" />} <span className="truncate">{n.label}</span>
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
        <p className="text-xs mb-4" style={{ color: C.stone }}>Digite o código que a administração da igreja lhe entregou. Um mesmo código abre todas as áreas em que você serve.</p>
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
              const digitado = code.trim().toLowerCase();
              const match = operatorCodes.find((o) => String(o.codigo || "").trim().toLowerCase() === digitado);
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
  { key: "avivarmusic", label: "Avivar Music (liderança do louvor)" },
  { key: "visitantes", label: "Visitantes" },
  { key: "membros", label: "Membros" },
  { key: "escala", label: "Escala de Obreiros" },
  { key: "loja", label: "Loja (editar produtos, frete e pedidos)" },
];
// Apelidos aceitos no campo "setores" de um código — o admin pode escrever do jeito
// que fala no dia a dia (ex: "recepção"), com ou sem acento, que cai no setor certo.
const SETOR_APELIDOS = {
  recepcao: "visitantes", portaria: "visitantes", visitante: "visitantes",
  oracao: "oracoes", "oracao nos lares": "oracoes", lares: "oracoes",
  music: "avivarmusic", musica: "avivarmusic", louvor: "avivarmusic", "avivar music": "avivarmusic",
  membro: "membros", secretaria: "membros",
  escalas: "escala", obreiros: "escala",
  frete: "loja", tudo: "todos",
};
function parseSetoresOperador(texto) {
  const lista = String(texto || "").split(/[,;]/).map((s) => semAcento(s.trim())).filter(Boolean).map((s) => SETOR_APELIDOS[s] || s);
  return lista.length ? [...new Set(lista)] : ["todos"];
}
// Onde fica cada setor no site (id da seção) — usado pelos atalhos da barra de acesso.
const SETOR_DESTINO = { oracoes: "oracoes", avivarmusic: "avivarmusic", visitantes: "visitantes", membros: "membros", escala: "escala", loja: "loja" };

// Barra de acesso do servidor — aparece no topo de cada seção que aceita código de
// função (recepção, secretaria, louvor...). Sem código: botão pra entrar. Com código:
// mostra quem entrou e um atalho pra CADA seção que aquele código libera.
function SetorAcessoBar({ setor, adminMode, operatorAuth, onEntrar, onSair, irPara }) {
  if (adminMode) return null;
  const info = SETORES_OPERADOR.find((x) => x.key === setor) || { label: setor };
  const liberados = operatorAuth
    ? (operatorAuth.setores.includes("todos") ? SETORES_OPERADOR.filter((x) => x.key !== "todos").map((x) => x.key) : operatorAuth.setores.filter((k) => SETOR_DESTINO[k]))
    : [];
  const temEste = liberados.includes(setor);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3">
      <div className="rounded-lg border px-3 py-2 flex flex-wrap items-center gap-2 text-xs" style={{ borderColor: C.line, background: "#00000006" }}>
        {!operatorAuth ? (
          <>
            <KeyRound size={14} color={C.purple} />
            <span style={{ color: C.stone }}>Serve nesta área ({info.label})?</span>
            <Btn color={C.purple} className="!py-1 !px-3 text-xs" onClick={onEntrar}><Unlock size={13} /> Entrar com código de acesso</Btn>
          </>
        ) : (
          <>
            <ShieldCheck size={14} color="#2E7D4F" />
            <span style={{ color: C.ink }}>
              <b>{operatorAuth.nome}</b> — {temEste ? "acesso liberado nesta área." : "seu código não libera esta área."}
            </span>
            {liberados.length > 0 && <span style={{ color: C.stone }}>Suas áreas:</span>}
            {liberados.map((k) => (
              <button key={k} onClick={() => irPara(SETOR_DESTINO[k])} className="px-2 py-0.5 rounded-full border font-semibold" style={{ borderColor: C.purple, color: k === setor ? "#fff" : C.purple, background: k === setor ? C.purple : "transparent" }}>
                {(SETORES_OPERADOR.find((x) => x.key === k) || { label: k }).label}
              </button>
            ))}
            {!temEste && <button onClick={onEntrar} className="underline" style={{ color: C.purple }}>usar outro código</button>}
            <button onClick={onSair} className="underline ml-auto" style={{ color: C.stone }}>sair</button>
          </>
        )}
      </div>
    </div>
  );
}

const OPERADOR_FIELDS = [
  { key: "nome", label: "Nome da pessoa ou função (ex: Portaria, RH — Maria)" },
  { key: "codigo", label: "Código de acesso" },
  { key: "setores", label: "Setores liberados — separe por vírgula (em branco ou 'todos' libera tudo): oracoes, avivarmusic, visitantes (ou recepção), membros, escala, loja" },
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
/* Fórum — antes era uma coluna fixa na borda direita da tela (sobre
   qualquer seção); agora é um painel normal, dentro da área logada de
   Códigos Avivar, só pra quem já é assinante/cadastrado.            */
/* ---------------------------------------------------------------- */
const FORUM_FIELDS = [
  { key: "autor", label: "Seu nome" },
  { key: "mensagem", label: "Mensagem", type: "textarea" },
];

function Forum({ posts, addPost }) {
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
    <div className="rounded-xl border shadow-md overflow-hidden flex flex-col" style={{ background: C.cream, borderColor: C.line, height: "26rem" }}>
      <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: C.line, background: C.parchment }}>
        <MessageCircle size={16} color={C.ember} />
        <p className="font-display font-semibold text-sm" style={{ color: C.ink }}>Fórum da Comunidade</p>
      </div>
      {Feed}
    </div>
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
          <span className="live-pulse absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full text-white flex items-center gap-1" style={{ background: "#E14D3A" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE
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
    <div className="relative rounded-2xl overflow-hidden border text-left h-full min-h-[135px] focus:outline-none focus:ring-2" style={{ borderColor: C.line }}>
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

// Banner de boas-vindas aos Visitantes do Dia — toma o lugar da Escala de Serviço
// no topo da Home, com cada nome pulsando e, se cadastrado, um áudio de fundo
// inspirador. A reprodução automática com som pode ser bloqueada pelo navegador
// até o visitante interagir com a página — por isso o botão "tocar música" surge
// como alternativa sempre que o autoplay falhar.
function VisitantesDiaBanner({ vd }) {
  const audioRef = useRef(null);
  const [bloqueado, setBloqueado] = useState(false);
  useEffect(() => {
    if (!vd.audioUrl || !audioRef.current) return;
    audioRef.current.volume = 0.5;
    const p = audioRef.current.play();
    if (p && p.catch) p.catch(() => setBloqueado(true));
  }, [vd.audioUrl]);
  return (
    <div className="w-full rounded-lg border-2 overflow-hidden p-4 sm:p-5" style={{ borderColor: C.gold, background: `linear-gradient(135deg, ${C.violetDeep}, ${C.indigoDeep})` }}>
      <div className="flex items-center gap-2 mb-2">
        <HandHeart size={15} color={C.goldBright} />
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: C.goldBright }}>Visitantes de hoje</span>
      </div>
      <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#ffffffee" }}>{vd.mensagem || DEFAULT_VISITANTES_DIA.mensagem}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {(vd.nomes || []).map((v, i) => (
          <span
            key={v.id}
            className="visitante-pulse px-3 py-1.5 rounded-full text-sm font-display font-semibold"
            style={{ background: C.goldBright, color: C.violetDeep, animationDelay: `${(i % 6) * 0.2}s` }}
          >
            {v.nome}
          </span>
        ))}
      </div>
      {vd.audioUrl && (
        <>
          <audio ref={audioRef} src={vd.audioUrl} loop />
          {bloqueado && (
            <button
              onClick={() => { audioRef.current?.play(); setBloqueado(false); }}
              className="text-[11px] underline mt-3 flex items-center gap-1"
              style={{ color: C.goldBright }}
            >
              <Music size={12} /> tocar música de fundo
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Manchete da Home — chamada de jornal clicável, configurável pelo admin */
/* ---------------------------------------------------------------- */
function MancheteBar({ manchete, save, adminMode, avivarNews, oracaoLocalDia, setPage, onOpenNews, escala, visitantesDoDia, saveVisitantesDoDia, podeVisitantesDia }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(manchete || DEFAULT_MANCHETE);
  useEffect(() => setDraft(manchete || DEFAULT_MANCHETE), [manchete]);
  const [editingVisitantes, setEditingVisitantes] = useState(false);
  const [novoNomeVisitante, setNovoNomeVisitante] = useState("");

  const vd = { ...DEFAULT_VISITANTES_DIA, ...(visitantesDoDia || {}) };
  const temVisitantesHoje = vd.exibir && (vd.nomes || []).length > 0;

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

  if (!temVisitantesHoje && !dataEscalaDestaque && !m.ativo && !adminMode) return null;
  const mostrarEscalaNaHome = dataEscalaDestaque && vd.exibirEscala && !temVisitantesHoje;

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
      {temVisitantesHoje ? (
        <VisitantesDiaBanner vd={vd} />
      ) : mostrarEscalaNaHome ? (
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
      {(adminMode || podeVisitantesDia) && (
        <div className="mt-2 p-3 rounded-lg border text-xs" style={{ borderColor: C.line, background: "#00000006" }}>
          {!editingVisitantes ? (
            <button onClick={() => setEditingVisitantes(true)} className="underline" style={{ color: C.stone }}>{adminMode ? "ADMIN" : "RECEPÇÃO"} · Visitantes do Dia</button>
          ) : (
            <div className="mt-2 space-y-3">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!vd.exibir} onChange={(e) => saveVisitantesDoDia({ ...vd, exibir: e.target.checked })} />
                  Exibir banner de visitantes (se desmarcado, a escala volta a aparecer aqui)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!vd.exibirEscala} onChange={(e) => saveVisitantesDoDia({ ...vd, exibirEscala: e.target.checked })} />
                  Exibir escala aqui na Home (a seção própria de Escala continua sempre)
                </label>
              </div>
              <Field label="Mensagem de boas-vindas">
                <textarea rows={3} className={inputCls} style={{ borderColor: C.line }} value={vd.mensagem} onChange={(e) => saveVisitantesDoDia({ ...vd, mensagem: e.target.value })} />
              </Field>
              <Field label="URL de áudio de fundo inspirador (opcional — mp3)">
                <input className={inputCls} style={{ borderColor: C.line }} value={vd.audioUrl} onChange={(e) => saveVisitantesDoDia({ ...vd, audioUrl: e.target.value })} />
              </Field>
              <div>
                <p className="text-xs font-mono mb-1.5" style={{ color: C.stone }}>Visitantes de hoje</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(vd.nomes || []).length === 0 && <span className="text-xs italic" style={{ color: C.stone }}>Nenhum visitante cadastrado ainda.</span>}
                  {(vd.nomes || []).map((v) => (
                    <span key={v.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: C.gold + "33", color: C.ink }}>
                      {v.nome}
                      <button onClick={() => saveVisitantesDoDia({ ...vd, nomes: vd.nomes.filter((n) => n.id !== v.id) })}><X size={11} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="Nome do visitante"
                    value={novoNomeVisitante}
                    onChange={(e) => setNovoNomeVisitante(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" || !novoNomeVisitante.trim()) return;
                      saveVisitantesDoDia({ ...vd, nomes: [...(vd.nomes || []), { id: uid(), nome: novoNomeVisitante.trim() }] });
                      setNovoNomeVisitante("");
                    }}
                    className={`${inputCls} max-w-xs`}
                    style={{ borderColor: C.line }}
                  />
                  <Btn
                    onClick={() => {
                      if (!novoNomeVisitante.trim()) return;
                      saveVisitantesDoDia({ ...vd, nomes: [...(vd.nomes || []), { id: uid(), nome: novoNomeVisitante.trim() }] });
                      setNovoNomeVisitante("");
                    }}
                  >
                    Adicionar
                  </Btn>
                </div>
              </div>
              <button onClick={() => setEditingVisitantes(false)} className="text-xs underline" style={{ color: C.stone }}>fechar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Card de vídeo ao vivo da Home — metade de cima da coluna central. Estados, em
// ordem de prioridade: 1) ao vivo agora; 2) contagem regressiva até a próxima
// transmissão agendada pelo admin; 3) a última transmissão (ou a que o admin
// fixou no topo em Avivar News TV — mesmo mecanismo, sem duplicar dado nenhum);
// 4) mensagem padrão. "Ampliar" leva pra Avivar News TV (histórico completo).
function HeroLiveVideoCard({ aoVivo, passadas, onAmpliar }) {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const data = aoVivo || DEFAULT_AOVIVO;
  const sortedPassadas = [...(passadas || [])].sort((a, b) => {
    if (!!a.destaque !== !!b.destaque) return a.destaque ? -1 : 1;
    return new Date(b.data) - new Date(a.data);
  });
  const destaquePassada = sortedPassadas[0] || null;

  const alvo = data.proximaTransmissaoEm ? new Date(data.proximaTransmissaoEm) : null;
  const contandoRegressiva = !data.isLive && alvo && !isNaN(alvo.getTime()) && alvo.getTime() > agora.getTime();
  let diffSeg = contandoRegressiva ? Math.floor((alvo.getTime() - agora.getTime()) / 1000) : 0;
  const dd = Math.floor(diffSeg / 86400);
  const hh = Math.floor((diffSeg % 86400) / 3600);
  const mm = Math.floor((diffSeg % 3600) / 60);
  const ss = diffSeg % 60;
  const pad = (n) => String(n).padStart(2, "0");

  const ampliarBtnCls = "absolute text-[9px] font-mono px-2 py-1 rounded focus:outline-none focus:ring-2";
  const ampliarBtnStyle = { background: "#00000099", color: "#fff" };

  return (
    <div className="relative rounded-2xl overflow-hidden border h-full min-h-[135px] w-full" style={{ borderColor: C.line, background: C.black }}>
      {data.isLive && data.embedUrl ? (
        <>
          <iframe title="transmissão ao vivo" src={getEmbedUrl(data.embedUrl)} className="w-full h-full" allowFullScreen />
          <span className="live-pulse absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold pointer-events-none" style={{ background: "#E14D3A", color: "#fff" }}>
            <Radio size={10} /> LIVE
          </span>
          <button onClick={onAmpliar} className={`${ampliarBtnCls} bottom-2 right-2`} style={ampliarBtnStyle}>ampliar ⤢</button>
        </>
      ) : contandoRegressiva ? (
        <button onClick={onAmpliar} className="w-full h-full flex flex-col items-center justify-center text-center px-3 focus:outline-none focus:ring-2" style={{ background: C.indigoDeep }}>
          <Eyebrow color={C.goldBright}><Radio size={11} className="inline mr-1" />Próxima transmissão</Eyebrow>
          <p className="text-xs sm:text-sm font-display font-semibold text-white mt-1">{data.proximaTransmissaoTitulo || "Em breve"}</p>
          <p className="font-mono text-base sm:text-lg mt-1 tracking-wider" style={{ color: C.goldBright }}>
            {dd > 0 ? `${dd}d ` : ""}{pad(hh)}:{pad(mm)}:{pad(ss)}
          </p>
        </button>
      ) : destaquePassada ? (
        <>
          <iframe title={destaquePassada.titulo} src={getEmbedUrl(destaquePassada.videoUrl)} className="w-full h-full" allowFullScreen />
          <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 pointer-events-none" style={{ background: "linear-gradient(0deg,#000000cc,transparent)" }}>
            <p className="text-[10px] text-white font-medium leading-snug line-clamp-1">{destaquePassada.titulo}</p>
          </div>
          <button onClick={onAmpliar} className={`${ampliarBtnCls} top-2 right-2`} style={ampliarBtnStyle}>ampliar ⤢</button>
        </>
      ) : (
        <button onClick={onAmpliar} className="w-full h-full flex flex-col items-center justify-center text-center px-3 focus:outline-none focus:ring-2" style={{ background: C.indigoDeep }}>
          <Tv size={20} color={C.goldBright} />
          <p className="text-xs mt-2" style={{ color: "#ffffffaa" }}>{data.mensagem || "Nenhuma transmissão no momento."}</p>
        </button>
      )}
    </div>
  );
}

function Home({ site, setPage, visitantes, saveSite, adminMode, aoVivo, transmissoesPassadas, oracaoEncontros, avivarNews, doacoes, saveDoacoes, manchete, saveManchete, onOpenNews, oracaoLocalDia, escala, onOpenCursos, celulas, onOpenCelula, onOpenHistoria, visitantesDoDia, saveVisitantesDoDia, podeVisitantesDia }) {
  const recentVisitors = [...visitantes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);
  const homeCards = site.homeCards || DEFAULT_HOMECARDS;
  return (
    <div>
      <MancheteBar manchete={manchete} save={saveManchete} adminMode={adminMode} avivarNews={avivarNews} oracaoLocalDia={oracaoLocalDia} setPage={setPage} onOpenNews={onOpenNews} escala={escala} visitantesDoDia={visitantesDoDia} saveVisitantesDoDia={saveVisitantesDoDia} podeVisitantesDia={podeVisitantesDia} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 grid lg:grid-cols-[1fr_1.7fr_1fr] gap-3 sm:gap-4 items-stretch">
        {/* Coluna 1 — Ministério: nome, logo e um breve histórico. O nome/logo é
            clicável e leva para a página "Nossa História" (histórico completo,
            fotos antigas e diretoria). Só no celular ela vem depois da coluna
            central; do lg pra cima, vem primeiro. */}
        <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden h-full min-h-[280px] sm:min-h-[360px]" style={{ background: C.black }}>
          <img src={site.heroMiddleBg || HERO_BANNER} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(1px) brightness(0.5)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #00000066, #1F1B2ECC)" }} />
          <button onClick={onOpenHistoria} className="relative h-full w-full flex flex-col items-center justify-center text-center px-4 focus:outline-none focus:ring-2" title="Conheça a história do Ministério">
            <img src={LOGO_ICON} alt={site.churchName} className="h-14 w-auto mb-3" />
            <h1 className="font-script text-3xl sm:text-5xl" style={{ color: C.goldBright }}>{site.churchName}</h1>
            <p className="mt-3 text-xs sm:text-sm max-w-xl" style={{ color: "#ffffffdd" }}>
              {site.heroHistoricoBreve || DEFAULT_SITE.heroHistoricoBreve}
            </p>
            <span className="mt-2 text-[11px] font-mono underline" style={{ color: C.goldBright }}>Conheça nossa história →</span>
          </button>
        </div>

        {/* Coluna central — dividida ao meio, mantendo a largura: em cima, a
            transmissão ao vivo (ou a próxima agendada, ou a última publicada); embaixo,
            as Notícias do Evangelho (que antes ficavam na coluna 1). */}
        <div className="order-1 lg:order-2 flex flex-col gap-3 h-full min-h-[280px] sm:min-h-[360px]">
          <div className="flex-1 min-h-0">
            <HeroLiveVideoCard aoVivo={aoVivo} passadas={transmissoesPassadas} onAmpliar={() => setPage("aovivo")} />
          </div>
          <div className="flex-1 min-h-0">
            <HeroNewsColumn news={avivarNews || []} bgImage={site.heroLeftBg} onClick={() => setPage("aovivo")} onOpenNews={onOpenNews} />
          </div>
        </div>

        <div className="order-3 lg:order-3 flex flex-col gap-3 h-full">
          <div className="flex-[7] min-h-0">
            <HeroDoacoesCard data={doacoes || DEFAULT_DOACOES} bgImage={site.heroRightBg} onClick={() => {}} />
          </div>
          <div className="flex-[3] min-h-0">
            <PedidoOracaoCard compact onClick={() => setPage("pedidooracao")} />
          </div>
        </div>
      </div>

      {adminMode && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-3 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
          <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · imagens de fundo do topo e contato</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Fundo — coluna 1 (Ministério)"><input className={inputCls} style={{ borderColor: C.line }} value={site.heroMiddleBg || ""} onChange={(e) => saveSite({ ...site, heroMiddleBg: e.target.value })} /></Field>
            <Field label="Fundo — Notícias (metade de baixo da coluna central)"><input className={inputCls} style={{ borderColor: C.line }} value={site.heroLeftBg || ""} onChange={(e) => saveSite({ ...site, heroLeftBg: e.target.value })} /></Field>
            <Field label="Fundo — coluna Doações (direita)"><input className={inputCls} style={{ borderColor: C.line }} value={site.heroRightBg || ""} onChange={(e) => saveSite({ ...site, heroRightBg: e.target.value })} /></Field>
            <Field label="Histórico breve — coluna 1 (Ministério)"><textarea rows={3} className={inputCls} style={{ borderColor: C.line }} value={site.heroHistoricoBreve || ""} onChange={(e) => saveSite({ ...site, heroHistoricoBreve: e.target.value })} /></Field>
            <Field label="WhatsApp do Ministério (com DDD, só números)"><input className={inputCls} style={{ borderColor: C.line }} value={site.whatsappMinisterio || ""} onChange={(e) => saveSite({ ...site, whatsappMinisterio: e.target.value })} /></Field>
          </div>
        </div>
      )}

      {/* Configuração da chave Pix do card "Dízimo e Oferta" — antes vivia numa
          página própria de Dízimos e Ofertas (removida a pedido do Marcos); o
          card com QR Code continua aqui na Home, então o ajuste da chave
          também fica aqui, só visível pro admin. */}
      {adminMode && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-3 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
          <p className="text-xs font-mono mb-3" style={{ color: C.stone }}>ADMIN · Dízimo e Oferta (chave Pix do card da Home)</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Chave PIX"><input className={inputCls} style={{ borderColor: C.line }} value={(doacoes || DEFAULT_DOACOES).pixKey || ""} onChange={(e) => saveDoacoes({ ...(doacoes || DEFAULT_DOACOES), pixKey: e.target.value })} /></Field>
            <Field label="Nome do recebedor (aparece no QR)"><input className={inputCls} style={{ borderColor: C.line }} value={(doacoes || DEFAULT_DOACOES).nomeRecebedor || ""} onChange={(e) => saveDoacoes({ ...(doacoes || DEFAULT_DOACOES), nomeRecebedor: e.target.value })} /></Field>
            <Field label="Cidade do recebedor (aparece no QR)"><input className={inputCls} style={{ borderColor: C.line }} value={(doacoes || DEFAULT_DOACOES).cidade || ""} onChange={(e) => saveDoacoes({ ...(doacoes || DEFAULT_DOACOES), cidade: e.target.value })} /></Field>
            <Field label="Link Mercado Pago (opcional — pagamento por cartão)"><input className={inputCls} style={{ borderColor: C.line }} value={(doacoes || DEFAULT_DOACOES).mercadoPagoUrl || ""} onChange={(e) => saveDoacoes({ ...(doacoes || DEFAULT_DOACOES), mercadoPagoUrl: e.target.value })} /></Field>
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

      <section id="celulas" className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 scroll-mt-24">
        <Eyebrow><Layers size={12} className="inline mr-1" />Comunhão em pequenos grupos</Eyebrow>
        <SectionTitle>Células Avivar</SectionTitle>
        {celulas && celulas.coordenador && (
          <p className="text-sm mb-5" style={{ color: C.stone }}>Coordenador das Células Avivar: <strong style={{ color: C.ink }}>{celulas.coordenador}</strong></p>
        )}
        {/* Grid própria das Células (não usa GRID3): no celular, 1 card por linha —
            cada card se divide em logo (topo) + dados (abaixo), senão a logo fixa ao
            lado espremia demais o texto quando duas células ficavam lado a lado.
            A partir do "sm" volta ao layout horizontal (logo à esquerda) em 3 colunas. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {CELULA_KEYS.map((chave) => (
            <CelulaCard key={chave} chave={chave} celula={(celulas && celulas[chave]) || CELULA_VAZIA(chave)} onOpen={() => onOpenCelula(chave)} />
          ))}
          <CelulaFuturaCard />
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Células Avivar — card (Home) + página própria de cada célula        */
/* ---------------------------------------------------------------- */
function CelulaCard({ chave, celula, onOpen }) {
  const cor = CELULA_CORES[chave] || C.gold;
  const nParticipantes = (celula.participantes || "").split("\n").map((s) => s.trim()).filter(Boolean).length;
  const ultimoEncontro = [...(celula.encontros || [])].sort((a, b) => new Date(b.data) - new Date(a.data))[0];
  return (
    // Layout a pedido do Marcos: no celular, logo em cima (altura fixa, largura
    // total) e os dados embaixo — evita o card ficar gigante na vertical e o texto
    // ser espremido/encoberto do lado da logo. Do "sm" em diante, volta ao layout
    // horizontal (logo à esquerda, ocupando a altura inteira, histórico ao lado).
    // h-full + justify-between no texto faz os cards da mesma linha terminarem
    // alinhados na base, mesmo com históricos de tamanhos diferentes.
    <button onClick={onOpen} className="text-left rounded-2xl overflow-hidden border-2 shadow-md focus:outline-none focus:ring-2 hover:opacity-95 flex flex-col sm:flex-row sm:items-stretch h-full" style={{ borderColor: cor, background: "#fff" }}>
      <div className="w-full h-28 sm:h-auto sm:w-28 lg:w-32 shrink-0 flex items-center justify-center" style={{ background: cor + "1a" }}>
        <ImgOrPlaceholder url={celula.logoUrl} alt={celula.nome} className="h-full w-full object-contain p-3" ph="Logo — a enviar" />
      </div>
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg" style={{ color: C.ink }}>{celula.nome}</h3>
          {celula.historia && <p className="text-xs mt-1.5 leading-relaxed line-clamp-3" style={{ color: C.stone }}>{celula.historia}</p>}
          {celula.anfitriao && <p className="text-xs mt-1.5" style={{ color: C.stone }}>Anfitrião(ã): {celula.anfitriao}</p>}
          {nParticipantes > 0 && <p className="text-xs mt-0.5" style={{ color: C.stone }}>{nParticipantes} participante{nParticipantes > 1 ? "s" : ""}</p>}
          {ultimoEncontro && (
            <p className="text-xs mt-1" style={{ color: cor }}>
              <Calendar size={11} className="inline mr-1" />{fmtDate(ultimoEncontro.data)}{ultimoEncontro.local ? ` · ${ultimoEncontro.local}` : ""}
            </p>
          )}
        </div>
        <span className="text-xs underline mt-3 inline-block" style={{ color: C.violet }}>Ver célula →</span>
      </div>
    </button>
  );
}

// Espaço reservado para uma futura Célula Avivar — mesmo visual dos cards reais
// (borda tracejada pra indicar "ainda não é uma célula"), com uma palavra bíblica
// sobre congregar/comunhão enquanto a vaga não é preenchida.
function CelulaFuturaCard() {
  return (
    <div className="text-left rounded-2xl overflow-hidden border-2 border-dashed shadow-md flex flex-col sm:flex-row sm:items-stretch h-full" style={{ borderColor: C.line, background: "#fff" }}>
      <div className="w-full h-28 sm:h-auto sm:w-28 lg:w-32 shrink-0 flex items-center justify-center" style={{ background: C.gold + "1a" }}>
        <Plus size={30} style={{ color: C.gold }} />
      </div>
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg" style={{ color: C.ink }}>Uma nova Célula Avivar</h3>
          <p className="text-xs mt-1.5 leading-relaxed italic" style={{ color: C.stone }}>
            "Não deixemos de congregar-nos, como é costume de alguns, mas exortemo-nos uns aos outros; e tanto mais quanto vedes que se aproxima aquele Dia." — Hebreus 10:25
          </p>
        </div>
        <span className="text-xs mt-3 inline-block italic" style={{ color: C.stone }}>Em breve, mais um espaço para congregar.</span>
      </div>
    </div>
  );
}

function PaginaCelula({ chave, celula, coordenador, liderCode, liderCodeActive, adminMode, onSave, onPatchTop, onVoltar }) {
  const cor = CELULA_CORES[chave] || C.gold;
  // Acesso do Líder de Células (Diácono Gilvan, coordenador das 3 células) — mesmo
  // padrão de código/gate já usado nas Unidades Avivar (IgrejaCard/PaginaIgreja):
  // um único código, gerado e revogável pelo admin, dá direito de editar as 3 células.
  const [gateOpen, setGateOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const canManage = adminMode || unlocked;

  const participantesLista = (celula.participantes || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const [editandoDados, setEditandoDados] = useState(false);
  const [logoUrl, setLogoUrl] = useState(celula.logoUrl || "");
  const [anfitriao, setAnfitriao] = useState(celula.anfitriao || "");
  const [participantesTexto, setParticipantesTexto] = useState(celula.participantes || "");
  const [historiaTexto, setHistoriaTexto] = useState(celula.historia || "");

  const salvarDados = () => {
    onSave({ ...celula, logoUrl, anfitriao, participantes: participantesTexto, historia: historiaTexto });
    setEditandoDados(false);
  };

  const encontros = celula.encontros || [];
  const addEncontro = (v) => onSave({ ...celula, encontros: [...encontros, { id: uid(), ...v, fotos: [] }] });
  const delEncontro = (id) => onSave({ ...celula, encontros: encontros.filter((e) => e.id !== id) });
  const addFoto = (id, url) => {
    if (!url.trim()) return;
    onSave({ ...celula, encontros: encontros.map((e) => (e.id === id ? { ...e, fotos: [...(e.fotos || []), url.trim()] } : e)) });
  };
  const delFoto = (id, idx) => {
    onSave({ ...celula, encontros: encontros.map((e) => (e.id === id ? { ...e, fotos: e.fotos.filter((_, i) => i !== idx) } : e)) });
  };
  const encontrosOrdenados = [...encontros].sort((a, b) => new Date(b.data) - new Date(a.data));

  const regenCodigo = () => onPatchTop({ liderCode: "LIDER-" + Math.random().toString(36).slice(2, 7).toUpperCase() });
  const toggleCodigo = () => onPatchTop({ liderCodeActive: !liderCodeActive });

  // Foto ampliada (lightbox) — ao clicar em qualquer foto, grande ou da
  // galeria menor, de qualquer encontro, ela abre em tela cheia.
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  return (
    <div className="min-h-screen font-body" style={{ background: C.parchment, color: C.ink }}>
      <header className="sticky top-0 z-40 border-b" style={{ background: C.black, borderColor: cor + "55" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 py-3">
          <button onClick={onVoltar} className="flex items-center gap-2 text-sm focus:outline-none focus:ring-2 rounded-md" style={{ color: cor }}>
            <ArrowLeft size={16} /> Voltar ao site
          </button>
          <div className="flex items-center gap-2">
            <img src={celula.logoUrl || LOGO_ICON} alt={celula.nome} className="h-9 w-auto rounded" />
            <span className="font-display font-semibold text-sm hidden sm:inline" style={{ color: "#fff" }}>{celula.nome}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Eyebrow color={cor}><Layers size={12} className="inline mr-1" />Células Avivar{coordenador ? ` · Coordenador: ${coordenador}` : ""}</Eyebrow>
        <SectionTitle>{celula.nome}</SectionTitle>
        {celula.anfitriao && <p className="text-sm" style={{ color: C.stone }}>Anfitrião(ã): <strong style={{ color: C.ink }}>{celula.anfitriao}</strong></p>}

        {celula.historia && <p className="text-sm mt-4 max-w-2xl leading-relaxed" style={{ color: C.stone }}>{celula.historia}</p>}

        <a href={BIBLIA_URL} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 px-3 py-2 rounded-md border mt-3" style={{ borderColor: C.gold, color: C.goldDeep }}>
          <BookOpen size={13} /> Bíblia Avivar
        </a>

        <div className="mt-3">
          {!canManage ? (
            <button onClick={() => setGateOpen((v) => !v)} className="text-xs underline" style={{ color: C.violet }}>Sou o Líder de Células</button>
          ) : (
            <span className="text-xs" style={{ color: "#2E7D4F" }}>Editando como {adminMode ? "admin" : "Líder de Células"}</span>
          )}
          {gateOpen && !canManage && (
            <div className="flex gap-2 mt-2">
              <input placeholder="Código do Líder de Células" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} className={`${inputCls} max-w-xs text-xs`} style={{ borderColor: C.line }} />
              <Btn variant="ghost" color={cor} onClick={() => { if (liderCodeActive && codeInput.trim().toUpperCase() === liderCode) setUnlocked(true); }}>Entrar</Btn>
            </div>
          )}
        </div>

        {canManage && (
          editandoDados ? (
            <div className="mt-5 p-4 rounded-lg border grid sm:grid-cols-2 gap-3" style={{ borderColor: C.line, background: "#00000006" }}>
              <Field label="URL do logotipo da célula"><input className={inputCls} style={{ borderColor: C.line }} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} /></Field>
              <Field label="Anfitrião(ã)"><input className={inputCls} style={{ borderColor: C.line }} value={anfitriao} onChange={(e) => setAnfitriao(e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="Histórico da célula"><textarea rows={3} className={inputCls} style={{ borderColor: C.line }} value={historiaTexto} onChange={(e) => setHistoriaTexto(e.target.value)} /></Field></div>
              <div className="sm:col-span-2"><Field label="Participantes (um nome por linha — editável pelo admin ou pelo Líder de Células)"><textarea rows={4} className={inputCls} style={{ borderColor: C.line }} value={participantesTexto} onChange={(e) => setParticipantesTexto(e.target.value)} /></Field></div>
              <div className="flex gap-2 sm:col-span-2">
                <Btn color={cor} onClick={salvarDados}><Save size={13} /> Salvar</Btn>
                <Btn variant="ghost" color={cor} onClick={() => setEditandoDados(false)}>Cancelar</Btn>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditandoDados(true)} className="text-xs underline mt-4 flex items-center gap-1" style={{ color: C.ember }}>
              <Pencil size={12} /> editar dados da célula
            </button>
          )
        )}

        <div className="mt-8">
          <p className="text-sm font-display font-semibold mb-3" style={{ color: C.ink }}>Participantes</p>
          {participantesLista.length === 0 ? (
            <Empty text="Nenhum participante cadastrado ainda." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {participantesLista.map((nome, idx) => (
                <span key={idx} className="text-xs px-3 py-1.5 rounded-full" style={{ background: cor + "1a", color: C.ink }}>{nome}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <p className="text-sm font-display font-semibold mb-3" style={{ color: C.ink }}>Encontros</p>
          {encontrosOrdenados.length === 0 && <Empty text="Nenhum encontro registrado ainda." />}
          {/* Um bloco por encontro (empilhados), em vez da antiga grade de 3
              colunas: a primeira foto do encontro aparece bem maior (pelo menos
              4x o tamanho da miniatura antiga), com o relato e a relação dos
              presentes ao lado; abaixo, uma galeria com o restante das fotos,
              menores, que ampliam ao clicar. */}
          <div className="flex flex-col gap-6">
            {encontrosOrdenados.map((e) => {
              const fotos = e.fotos || [];
              const fotoDestaque = fotos[0] || "";
              const galeria = fotos.slice(1);
              const presentesLista = (e.presentes || "").split("\n").map((s) => s.trim()).filter(Boolean);
              return (
                <div key={e.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.line, background: "#fff" }}>
                  <div className="flex items-start justify-between px-4 pt-4">
                    <p className="font-display font-semibold text-sm">{fmtDate(e.data)}</p>
                    {canManage && <button onClick={() => delEncontro(e.id)}><Trash2 size={13} color={C.stone} /></button>}
                  </div>

                  <div className="grid md:grid-cols-[2fr_1fr] gap-4 p-4 items-start">
                    {/* Foto em destaque do encontro — bem maior que a galeria abaixo */}
                    {fotoDestaque ? (
                      <div className="relative">
                        <button onClick={() => setFotoAmpliada(fotoDestaque)} className="block w-full focus:outline-none focus:ring-2 rounded-lg overflow-hidden" style={{ background: cor + "0f" }}>
                          <img src={fotoDestaque} alt={`Encontro de ${fmtDate(e.data)}`} className="w-full h-64 sm:h-[26rem] object-cover" />
                        </button>
                        {canManage && (
                          <button onClick={() => delFoto(e.id, 0)} className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                            <X size={13} color="#fff" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-64 sm:h-[26rem] rounded-lg flex items-center justify-center text-xs" style={{ background: cor + "0f", color: C.stone }}>
                        Foto — a enviar
                      </div>
                    )}

                    {/* Relato + relação dos presentes, ao lado da foto em destaque */}
                    <div>
                      {e.anfitriao && <p className="text-xs" style={{ color: C.stone }}>Anfitrião(ã): {e.anfitriao}</p>}
                      {e.local && <p className="text-xs mt-1" style={{ color: C.stone }}>{e.local}</p>}
                      {e.relato && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold" style={{ color: C.ink }}>Relato do encontro</p>
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.stone }}>{e.relato}</p>
                        </div>
                      )}
                      <div className="mt-3">
                        <p className="text-xs font-semibold" style={{ color: C.ink }}>Relação dos presentes</p>
                        {presentesLista.length === 0 ? (
                          <p className="text-xs mt-1" style={{ color: C.stone }}>Não registrada ainda.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {presentesLista.map((nome, idx) => (
                              <span key={idx} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: cor + "1a", color: C.ink }}>{nome}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Galeria com o restante das fotos — menores, ampliam ao clicar */}
                  {galeria.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 px-4 pb-3">
                      {galeria.map((f, idx) => (
                        <div key={idx} className="relative">
                          <button onClick={() => setFotoAmpliada(f)} className="block w-full focus:outline-none focus:ring-2 rounded">
                            <img src={f} className="w-full h-16 sm:h-20 object-cover rounded" />
                          </button>
                          {canManage && (
                            <button onClick={() => delFoto(e.id, idx + 1)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5">
                              <X size={10} color="#fff" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {canManage && (
                    <div className="px-4 pb-4">
                      <MiniPhotoAdder onAdd={(url) => addFoto(e.id, url)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {canManage && (
            <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
              <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>Novo encontro — relato do líder (quantas harpas louvaram, qual foi a palavra do dia, etc.) e relação dos presentes</p>
              <DynamicForm fields={CELULA_ENCONTRO_FIELDS} accent={cor} onSubmit={(v) => v.data && addEncontro(v)} submitLabel="Cadastrar encontro" />
            </div>
          )}
        </div>

        {fotoAmpliada && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "#000000e0" }} onClick={() => setFotoAmpliada(null)}>
            <button onClick={() => setFotoAmpliada(null)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: "#ffffff22" }}>
              <X size={20} color="#fff" />
            </button>
            <img src={fotoAmpliada} alt="" className="max-w-full max-h-full rounded-lg object-contain" onClick={(ev) => ev.stopPropagation()} />
          </div>
        )}

        {adminMode && (
          <div className="mt-10 pt-4 border-t text-xs" style={{ borderColor: C.line, color: C.stone }}>
            Código do Líder de Células (válido para as 3 células): <strong style={{ color: C.ink }}>{liderCode}</strong> · {liderCodeActive ? "ativo" : "revogado"}
            <button onClick={toggleCodigo} className="underline ml-3" style={{ color: C.violet }}>{liderCodeActive ? "revogar" : "reativar"}</button>
            <button onClick={regenCodigo} className="underline ml-3" style={{ color: C.ember }}>resetar código</button>
          </div>
        )}
      </div>

      <div className="py-10 text-center">
        <button onClick={onVoltar} className="text-sm underline" style={{ color: C.violet }}>← Voltar ao site do Ministério Avivar do Espírito</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Nossa História — aberta pelo clique no nome/logo do Hero da Home    */
/* ---------------------------------------------------------------- */
function PaginaHistoria({ historia, save, adminMode, onVoltar }) {
  const [editandoTexto, setEditandoTexto] = useState(false);
  const [texto, setTexto] = useState(historia.texto || "");
  const salvarTexto = () => { save({ ...historia, texto }); setEditandoTexto(false); };

  const fotos = historia.fotosAntigas || [];
  const addFoto = (url) => { if (url.trim()) save({ ...historia, fotosAntigas: [...fotos, url.trim()] }); };
  const delFoto = (idx) => save({ ...historia, fotosAntigas: fotos.filter((_, i) => i !== idx) });

  const diretoria = historia.diretoria || [];
  const addDiretor = (v) => save({ ...historia, diretoria: [...diretoria, { id: uid(), ...v }] });
  const delDiretor = (id) => save({ ...historia, diretoria: diretoria.filter((d) => d.id !== id) });

  return (
    <div className="min-h-screen font-body" style={{ background: C.parchment, color: C.ink }}>
      <header className="sticky top-0 z-40 border-b" style={{ background: C.black, borderColor: C.gold + "55" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 py-3">
          <button onClick={onVoltar} className="flex items-center gap-2 text-sm focus:outline-none focus:ring-2 rounded-md" style={{ color: C.goldBright }}>
            <ArrowLeft size={16} /> Voltar ao site
          </button>
          <div className="flex items-center gap-2">
            <img src={LOGO_ICON} alt="" className="h-9 w-auto rounded" />
            <span className="font-display font-semibold text-sm hidden sm:inline" style={{ color: "#fff" }}>Nossa História</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Eyebrow><History size={12} className="inline mr-1" />Uma casa de fé aberta a todos</Eyebrow>
        <SectionTitle>Nossa História</SectionTitle>

        {editandoTexto ? (
          <div className="mt-4 space-y-2 max-w-2xl">
            <textarea rows={10} className={inputCls} style={{ borderColor: C.line }} value={texto} onChange={(e) => setTexto(e.target.value)} />
            <div className="flex gap-2">
              <Btn onClick={salvarTexto}><Save size={13} /> Salvar</Btn>
              <Btn variant="ghost" onClick={() => setEditandoTexto(false)}>Cancelar</Btn>
            </div>
          </div>
        ) : (
          <div className="mt-4 max-w-2xl">
            {(historia.texto || "").split("\n\n").map((p, idx) => (
              <p key={idx} className="text-sm mt-3 leading-relaxed" style={{ color: C.stone }}>{p}</p>
            ))}
            {adminMode && (
              <button onClick={() => setEditandoTexto(true)} className="text-xs underline mt-3 flex items-center gap-1" style={{ color: C.ember }}>
                <Pencil size={12} /> editar histórico
              </button>
            )}
          </div>
        )}

        <div className="mt-12">
          <p className="text-sm font-display font-semibold mb-3" style={{ color: C.ink }}>Fotos antigas</p>
          {fotos.length === 0 && <Empty text="Nenhuma foto antiga cadastrada ainda." />}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {fotos.map((url, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden border" style={{ borderColor: C.line }}>
                <img src={url} className="w-full h-32 object-cover" />
                {adminMode && (
                  <button onClick={() => delFoto(idx)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
                    <X size={11} color="#fff" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {adminMode && <div className="mt-3"><MiniPhotoAdder onAdd={addFoto} /></div>}
        </div>

        <div className="mt-12">
          <p className="text-sm font-display font-semibold mb-3" style={{ color: C.ink }}>Diretoria</p>
          {diretoria.length === 0 && <Empty text="Nenhum membro da diretoria cadastrado ainda." />}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {diretoria.map((d) => (
              <div key={d.id} className="rounded-lg border overflow-hidden" style={{ borderColor: C.line, background: "#fff" }}>
                <ImgOrPlaceholder url={d.fotoUrl} alt={d.nome} className="w-full h-32 object-cover" ph={d.nome} />
                <div className="p-2">
                  <p className="font-display font-semibold text-xs leading-snug">{d.nome}</p>
                  <p className="text-[10px]" style={{ color: C.ember }}>{d.cargo}</p>
                  {adminMode && <button onClick={() => delDiretor(d.id)} className="text-[10px] underline mt-1" style={{ color: "#B03428" }}>excluir</button>}
                </div>
              </div>
            ))}
          </div>
          {adminMode && (
            <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
              <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · novo membro da diretoria</p>
              <DynamicForm fields={DIRETORIA_FIELDS} onSubmit={(v) => v.nome && addDiretor(v)} submitLabel="Cadastrar" />
            </div>
          )}
        </div>
      </div>

      <div className="py-10 text-center">
        <button onClick={onVoltar} className="text-sm underline" style={{ color: C.violet }}>← Voltar ao site do Ministério Avivar do Espírito</button>
      </div>
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

// Os 3 níveis de assinatura de Códigos Avivar, na ordem da hierarquia angélica
// usada (do acesso básico ao mais pleno, mais próximo do "trono").
/* ================================================================ */
/* CUPONS DE DESCONTO — Códigos Avivar (módulo portátil)             */
/* ---------------------------------------------------------------- */
/* Tudo o que é regra de cupom está aqui, em funções puras, sem React */
/* e sem depender do resto do site: recebem dados, devolvem dados.    */
/* Os cupons moram em `codigos.cupons` (JSON simples). Pra levar ao   */
/* app independente de Códigos Avivar basta copiar este bloco e a     */
/* lista `cupons`; lá, a validação deve rodar no servidor.            */
/*                                                                    */
/* Formato de um cupom:                                               */
/*   { id, codigo, percentual (100|50|20), limiteUsos (0 = sem        */
/*     limite), usos, ativo, validade ("AAAA-MM-DD" ou ""), nota,     */
/*     criadoEm (ISO), resgates: [{ nome, email, plano, data }] }     */
/* ================================================================ */
const CUPOM_PERCENTUAIS = [100, 50, 20];
// Sem 0/O/1/I pra ninguém errar ao digitar.
const CUPOM_ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const gerarCodigoCupom = (percentual) => {
  let sufixo = "";
  for (let i = 0; i < 6; i++) sufixo += CUPOM_ALFABETO[Math.floor(Math.random() * CUPOM_ALFABETO.length)];
  return `AVIVAR${percentual}-${sufixo}`;
};
const novoCupom = ({ percentual, limiteUsos = 1, validade = "", nota = "" }) => ({
  id: uid(),
  codigo: gerarCodigoCupom(percentual),
  percentual: Number(percentual),
  limiteUsos: Math.max(0, parseInt(limiteUsos, 10) || 0),
  usos: 0,
  ativo: true,
  validade: validade || "",
  nota: nota || "",
  criadoEm: new Date().toISOString(),
  resgates: [],
});
const normalizarCodigoCupom = (c) => (c || "").trim().toUpperCase().replace(/\s+/g, "");
// Devolve { ok, cupom, motivo } — nunca lança erro.
const validarCupom = (cupons, codigoDigitado, agora = new Date()) => {
  const codigo = normalizarCodigoCupom(codigoDigitado);
  if (!codigo) return { ok: false, cupom: null, motivo: "Digite o código do cupom." };
  const cupom = (cupons || []).find((c) => normalizarCodigoCupom(c.codigo) === codigo);
  if (!cupom) return { ok: false, cupom: null, motivo: "Cupom não encontrado." };
  if (!cupom.ativo) return { ok: false, cupom, motivo: "Este cupom foi desativado." };
  if (cupom.validade && new Date(cupom.validade + "T23:59:59") < agora) return { ok: false, cupom, motivo: "Este cupom já venceu." };
  if (cupom.limiteUsos > 0 && (cupom.usos || 0) >= cupom.limiteUsos) return { ok: false, cupom, motivo: "Este cupom já foi totalmente utilizado." };
  return { ok: true, cupom, motivo: "" };
};
// Registra um uso e devolve a NOVA lista de cupons (não altera a original).
const registrarUsoCupom = (cupons, cupomId, resgate) =>
  (cupons || []).map((c) =>
    c.id === cupomId ? { ...c, usos: (c.usos || 0) + 1, resgates: [...(c.resgates || []), { ...resgate, data: new Date().toISOString() }] } : c
  );
// "R$ 49,90" + 50 -> "R$ 24,95". Devolve "" se o preço ainda não foi definido.
const aplicarDescontoCupom = (precoTexto, percentual) => {
  const limpo = String(precoTexto || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const valor = parseFloat(limpo);
  if (isNaN(valor)) return "";
  const final = Math.max(0, valor * (1 - Number(percentual) / 100));
  return "R$ " + final.toFixed(2).replace(".", ",");
};
const statusCupom = (c, agora = new Date()) => {
  if (!c.ativo) return "desativado";
  if (c.validade && new Date(c.validade + "T23:59:59") < agora) return "vencido";
  if (c.limiteUsos > 0 && (c.usos || 0) >= c.limiteUsos) return "esgotado";
  return "ativo";
};
/* ===================== fim do módulo de cupons ===================== */

const PLANO_TIERS = [
  { key: "anjo", nome: "Anjo", tagline: "Acesso básico — porta de entrada", gratis: true, icon: Feather, cor: "#9BB6D8" },
  { key: "querubim", nome: "Querubim", tagline: "Acesso intermediário", gratis: false, icon: Gem, cor: C.violet },
  { key: "serafim", nome: "Serafim", tagline: "Acesso completo — libera tudo", gratis: false, icon: Crown, cor: C.gold },
];

// Um card de plano, com modo de edição pelo admin (preço semestral/anual,
// imagem — só o caminho/URL, o arquivo em si sempre sobe manual pelo GitHub —,
// texto de apresentação e lista de benefícios, um por linha).
function PlanoCard({ tier, plano, adminMode, onEscolher, onSalvar }) {
  const [editando, setEditando] = useState(false);
  const [v, setV] = useState({
    precoSemestral: plano.precoSemestral || "",
    precoAnual: plano.precoAnual || "",
    imagemUrl: plano.imagemUrl || "",
    resumo: plano.resumo || "",
    beneficios: plano.beneficios || "",
  });
  const Icon = tier.icon;
  const beneficiosLista = (plano.beneficios || "").split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <div className="rounded-2xl overflow-hidden border-2 shadow-xl flex flex-col" style={{ borderColor: tier.cor, background: "#ffffff0a" }}>
      <div className="p-5 text-center" style={{ background: tier.cor + "22" }}>
        <Icon size={30} color={tier.cor} className="mx-auto" />
        <h3 className="font-display text-2xl font-semibold text-white mt-2">{tier.nome}</h3>
        <p className="text-xs mt-1" style={{ color: "#ffffffbb" }}>{tier.tagline}</p>
      </div>

      <ImgOrPlaceholder url={plano.imagemUrl} alt={`Imagem do plano ${tier.nome}`} className="w-full object-cover max-h-[160px]" ph={`Imagem do plano ${tier.nome} — inserir depois`} />

      <div className="p-5 flex-1 flex flex-col">
        {tier.gratis ? (
          <p className="text-center font-display text-xl font-semibold" style={{ color: tier.cor }}>Grátis</p>
        ) : (
          <div className="text-center">
            <p className="font-display text-lg font-semibold text-white">
              {plano.precoSemestral ? plano.precoSemestral + " / semestre" : "Valor a definir em breve"}
            </p>
            {plano.precoAnual && <p className="text-xs mt-0.5" style={{ color: "#ffffffaa" }}>ou {plano.precoAnual} / ano</p>}
          </div>
        )}

        <p className="text-sm mt-4 leading-relaxed italic" style={{ color: "#EDE7FA" }}>{plano.resumo}</p>

        <ul className="mt-4 space-y-2 flex-1">
          {beneficiosLista.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#ffffffdd" }}>
              <CheckCircle2 size={15} color={tier.cor} className="shrink-0 mt-0.5" />
              {b}
            </li>
          ))}
        </ul>

        <Btn color={tier.cor} className="w-full justify-center mt-5" onClick={() => onEscolher(tier.nome)}>
          <Sparkles size={15} /> Quero ser {tier.nome}
        </Btn>

        {adminMode && !editando && (
          <button onClick={() => setEditando(true)} className="mt-3 text-xs underline inline-flex items-center gap-1 justify-center" style={{ color: "#ffffffaa" }}>
            <Pencil size={11} /> editar este plano
          </button>
        )}

        {adminMode && editando && (
          <div className="mt-4 space-y-2 text-left p-3 rounded-lg" style={{ background: "#00000033" }}>
            <Field label="Preço semestral (ex: R$ 49,90)"><input value={v.precoSemestral} onChange={(e) => setV({ ...v, precoSemestral: e.target.value })} className={inputCls} /></Field>
            <Field label="Preço anual (ex: R$ 89,90)"><input value={v.precoAnual} onChange={(e) => setV({ ...v, precoAnual: e.target.value })} className={inputCls} /></Field>
            <Field label="Imagem do plano — caminho (ex: /93-plano-querubim.jpg)"><input value={v.imagemUrl} onChange={(e) => setV({ ...v, imagemUrl: e.target.value })} className={inputCls} /></Field>
            <Field label="Texto de apresentação"><textarea rows={3} value={v.resumo} onChange={(e) => setV({ ...v, resumo: e.target.value })} className={inputCls} /></Field>
            <Field label="Benefícios (um por linha)"><textarea rows={5} value={v.beneficios} onChange={(e) => setV({ ...v, beneficios: e.target.value })} className={inputCls} /></Field>
            <div className="flex gap-2">
              <Btn color={tier.cor} onClick={() => { onSalvar(tier.key, v); setEditando(false); }}><Save size={14} /> Salvar</Btn>
              <Btn variant="ghost" color="#fff" onClick={() => setEditando(false)}>Cancelar</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Página de venda — explica os 3 planos, um por um, em tom místico-espiritual-
// cristão, além dos tópicos. Substitui a tela de login enquanto aberta;
// "Voltar" devolve pra tela de login/assinatura.
function CodigosPlanosView({ data, save, adminMode, onVoltar, onEscolherPlano }) {
  const planos = data.planos || DEFAULT_CODIGOS.planos;
  const salvarPlano = (tierKey, novosValores) => {
    save({ ...data, planos: { ...planos, [tierKey]: { ...planos[tierKey], ...novosValores } } });
  };
  return (
    <div style={{ background: C.violetDeep, minHeight: "70vh" }} className="pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <VoltarBtn onClick={onVoltar} />
        <div className="text-center mt-6 max-w-2xl mx-auto">
          <FlameMark size={34} color={C.gold} />
          <h2 className="font-display text-3xl font-semibold mt-3 text-white">Três Níveis, Um Só Chamado</h2>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: "#D9D2EA" }}>
            Assim como na visão profética há coros de anjos, querubins e serafins — cada um numa proximidade diferente do trono (Isaías 6; Ezequiel 10) —
            Códigos Avivar abre três portas de acesso ao conhecimento revelado pelo Espírito Santo. Comece pela entrada gratuita e, quando o Espírito chamar,
            suba de nível até a revelação plena.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5 items-stretch">
          {PLANO_TIERS.map((tier) => (
            <PlanoCard key={tier.key} tier={tier} plano={planos[tier.key] || {}} adminMode={adminMode} onEscolher={onEscolherPlano} onSalvar={salvarPlano} />
          ))}
        </div>

        <p className="text-xs text-center italic mt-8" style={{ color: "#D9D2EA" }}>
          Pagamento semestral ou anual, via Pix ou cartão. Enquanto o checkout automático não entra no ar, sua assinatura é confirmada manualmente após o pagamento —
          escolha seu plano abaixo e deixe seus dados que entraremos em contato.
        </p>
      </div>
    </div>
  );
}

function CodigosAvivar({ data, save, adminMode, loja, saveLoja, avivarNews, setPage, onOpenNews, unlocked, setUnlocked, forumPosts, addForumPost }) {
  const [holderName, setHolderName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [err, setErr] = useState("");
  const [showAccessMgmt, setShowAccessMgmt] = useState(false);
  const [selectedTema, setSelectedTema] = useState(null);
  const [holderTier, setHolderTier] = useState("geral");
  const [livroInternoAberto, setLivroInternoAberto] = useState(null);

  // Página de venda dos planos + formulário de interesse em assinar.
  const [showPlanos, setShowPlanos] = useState(false);
  const [showLeadsAdmin, setShowLeadsAdmin] = useState(false);
  const [leadNome, setLeadNome] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadWhats, setLeadWhats] = useState("");
  const [leadPlano, setLeadPlano] = useState("Anjo (grátis)");
  const [leadEnviado, setLeadEnviado] = useState(false);
  // Cupons de desconto (regras no módulo "CUPONS DE DESCONTO", acima).
  const [leadCupom, setLeadCupom] = useState("");
  const [leadCupomErro, setLeadCupomErro] = useState("");
  const [showCupons, setShowCupons] = useState(false);
  const [cupomPct, setCupomPct] = useState(100);
  const [cupomLimite, setCupomLimite] = useState("1");
  const [cupomValidade, setCupomValidade] = useState("");
  const [cupomNota, setCupomNota] = useState("");
  const [cupomCopiado, setCupomCopiado] = useState("");
  const cupons = data.cupons || [];
  const cupomCheck = leadCupom.trim() ? validarCupom(cupons, leadCupom) : null;
  const planoKeyDoLead = leadPlano === "Querubim" ? "querubim" : leadPlano === "Serafim" ? "serafim" : null;
  const precoPlanoLead = planoKeyDoLead ? ((data.planos || {})[planoKeyDoLead] || {}).precoSemestral : "";
  const precoComCupom = cupomCheck && cupomCheck.ok && precoPlanoLead ? aplicarDescontoCupom(precoPlanoLead, cupomCheck.cupom.percentual) : "";
  const criarCupom = () => save({ ...data, cupons: [novoCupom({ percentual: cupomPct, limiteUsos: cupomLimite, validade: cupomValidade, nota: cupomNota }), ...cupons] });
  const toggleCupom = (id) => save({ ...data, cupons: cupons.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c)) });
  const delCupom = (id) => save({ ...data, cupons: cupons.filter((c) => c.id !== id) });
  const copiarCupom = (codigo) => {
    try { navigator.clipboard.writeText(codigo); } catch (e) { /* sem área de transferência */ }
    setCupomCopiado(codigo);
  };

  const enviarInteresse = () => {
    if (!leadNome.trim() || !leadEmail.trim()) return;
    let cuponsAtualizados = cupons;
    let cupomDoLead = null;
    if (leadCupom.trim()) {
      const r = validarCupom(cupons, leadCupom);
      if (!r.ok) { setLeadCupomErro(r.motivo); return; }
      cupomDoLead = { codigo: r.cupom.codigo, percentual: r.cupom.percentual };
      cuponsAtualizados = registrarUsoCupom(cupons, r.cupom.id, { nome: leadNome.trim(), email: leadEmail.trim(), plano: leadPlano });
    }
    setLeadCupomErro("");
    const novoLead = {
      id: uid(),
      nome: leadNome.trim(),
      email: leadEmail.trim(),
      whatsapp: leadWhats.trim(),
      plano: leadPlano,
      data: new Date().toISOString(),
      contatado: false,
      cupom: cupomDoLead,
    };
    save({ ...data, leads: [...(data.leads || []), novoLead], cupons: cuponsAtualizados });
    setLeadNome(""); setLeadEmail(""); setLeadWhats(""); setLeadCupom("");
    setLeadEnviado(true);
  };
  const toggleLeadContatado = (id) => save({ ...data, leads: (data.leads || []).map((l) => (l.id === id ? { ...l, contatado: !l.contatado } : l)) });
  const delLead = (id) => save({ ...data, leads: (data.leads || []).filter((l) => l.id !== id) });

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

  if (showPlanos) {
    return (
      <CodigosPlanosView
        data={data}
        save={save}
        adminMode={adminMode}
        onVoltar={() => setShowPlanos(false)}
        onEscolherPlano={(nomePlano) => {
          setLeadPlano(nomePlano === "Anjo" ? "Anjo (grátis)" : nomePlano);
          setShowPlanos(false);
        }}
      />
    );
  }

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
                O conhecimento revelado pelo Espírito Santo, em três níveis — do chamado gratuito à revelação plena.
              </p>

              {/* Formulário de assinatura — fica ACIMA das credenciais de entrada,
                  pra quem ainda não tem código e quer se tornar assinante(a). */}
              <div className="mt-5 rounded-lg border p-4 text-left" style={{ borderColor: C.goldBright + "55", background: "#ffffff0f" }}>
                <p className="font-display font-semibold text-sm text-white flex items-center gap-1.5">
                  <Sparkles size={14} color={C.goldBright} /> Ainda não é assinante?
                </p>
                <p className="text-xs mt-1.5" style={{ color: "#D9D2EA" }}>
                  Deixe seus dados que entraremos em contato para ativar seu acesso — ou conheça os planos antes de decidir.
                </p>
                <button onClick={() => setShowPlanos(true)} className="text-xs underline font-semibold mt-2 inline-block" style={{ color: C.goldBright }}>
                  Ver os 3 planos e seus benefícios →
                </button>

                {leadEnviado ? (
                  <p className="text-sm mt-3 px-3 py-2 rounded-md flex items-center gap-2" style={{ background: "#2E7D4F33", color: "#A9E4BE" }}>
                    <CheckCircle2 size={15} /> Recebemos seu interesse! Em breve entraremos em contato.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    <input placeholder="Seu nome" value={leadNome} onChange={(e) => setLeadNome(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                    <input placeholder="Seu e-mail" type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                    <input placeholder="WhatsApp (com DDD)" value={leadWhats} onChange={(e) => setLeadWhats(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                    <select value={leadPlano} onChange={(e) => setLeadPlano(e.target.value)} className="w-full rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2">
                      <option>Anjo (grátis)</option>
                      <option>Querubim</option>
                      <option>Serafim</option>
                      <option>Ainda não sei — quero saber mais</option>
                    </select>
                    <input placeholder="Cupom de desconto (se tiver)" value={leadCupom} onChange={(e) => { setLeadCupom(e.target.value); setLeadCupomErro(""); }} className="w-full rounded-md px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2" />
                    {cupomCheck && cupomCheck.ok && (
                      <p className="text-xs px-2 py-1.5 rounded-md" style={{ background: "#2E7D4F33", color: "#A9E4BE" }}>
                        <CheckCircle2 size={12} className="inline mr-1" />
                        Cupom válido: {cupomCheck.cupom.percentual}% de desconto{cupomCheck.cupom.percentual === 100 ? " — assinatura gratuita" : ""}.
                        {precoComCupom && cupomCheck.cupom.percentual < 100 ? ` O plano ${leadPlano} sai por ${precoComCupom} / semestre.` : ""}
                      </p>
                    )}
                    {((cupomCheck && !cupomCheck.ok) || leadCupomErro) && (
                      <p className="text-xs" style={{ color: "#F2A6A6" }}>{leadCupomErro || cupomCheck.motivo}</p>
                    )}
                    <Btn color={C.goldBright} className="w-full justify-center" onClick={enviarInteresse}>
                      <Send size={14} /> Quero assinar
                    </Btn>
                  </div>
                )}
              </div>

              {/* Incentivo místico-espiritual acima do formulário de login, convidando a entrar */}
              <p className="text-xs italic mt-5 px-2 py-2 rounded-md" style={{ color: C.goldBright, background: "#ffffff0f" }}>
                <Sparkles size={11} className="inline mr-1" />
                Já é assinante? Sua frequência espiritual está prestes a mudar de nível: entre e vivencie a energia quântica da revelação, onde ciência e fé se encontram para elevar sua consciência.
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
                <div className="mt-6 flex flex-col items-center gap-1.5">
                  <button onClick={() => setShowAccessMgmt(true)} className="text-xs underline" style={{ color: "#D9D2EA" }}>
                    Gerenciar códigos de acesso (admin)
                  </button>
                  <button onClick={() => setShowCupons(true)} className="text-xs underline" style={{ color: "#D9D2EA" }}>
                    Gerar cupons de desconto (admin) — {cupons.length}
                  </button>
                  <button onClick={() => setShowLeadsAdmin(true)} className="text-xs underline" style={{ color: "#D9D2EA" }}>
                    Ver interessados em assinar (admin) — {(data.leads || []).length}
                  </button>
                </div>
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

        {showCupons && adminMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#00000077" }}>
            <div className="w-full max-w-2xl rounded-xl p-6 max-h-[85vh] overflow-y-auto" style={{ background: C.cream }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-semibold text-lg" style={{ color: C.ink }}>Cupons de desconto — Códigos Avivar</h3>
                <button onClick={() => setShowCupons(false)}><X size={18} /></button>
              </div>
              <div className="p-4 rounded-lg border" style={{ borderColor: C.line, background: "#00000006" }}>
                <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>DESCONTO</p>
                <div className="flex gap-2">
                  {CUPOM_PERCENTUAIS.map((pct) => (
                    <button key={pct} onClick={() => setCupomPct(pct)} className="flex-1 py-2 rounded-md font-display font-bold text-lg border-2" style={{ borderColor: C.violet, background: cupomPct === pct ? C.violet : "#fff", color: cupomPct === pct ? "#fff" : C.violet }}>
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <Field label="Quantas pessoas podem usar (0 = sem limite)">
                    <input type="number" min="0" className={inputCls} style={{ borderColor: C.line }} value={cupomLimite} onChange={(e) => setCupomLimite(e.target.value)} />
                  </Field>
                  <Field label="Válido até (opcional)">
                    <input type="date" className={inputCls} style={{ borderColor: C.line }} value={cupomValidade} onChange={(e) => setCupomValidade(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="Anotação — pra quem é / motivo (opcional)">
                    <input className={inputCls} style={{ borderColor: C.line }} value={cupomNota} onChange={(e) => setCupomNota(e.target.value)} />
                  </Field>
                </div>
                <Btn color={C.violet} className="mt-3" onClick={() => { criarCupom(); setCupomNota(""); }}>
                  <Plus size={16} /> Gerar cupom de {cupomPct}%
                </Btn>
              </div>

              <div className="mt-4 space-y-2">
                {cupons.length === 0 && <Empty text="Nenhum cupom gerado ainda." />}
                {cupons.map((c) => {
                  const st = statusCupom(c);
                  return (
                    <div key={c.id} className="p-3 rounded-md text-sm" style={{ background: C.parchment }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono font-semibold break-all" style={{ color: C.ink }}>{c.codigo}</p>
                          <p className="text-xs mt-0.5" style={{ color: C.stone }}>
                            <b style={{ color: C.ember }}>{c.percentual}% de desconto</b> · usado {c.usos || 0}{c.limiteUsos > 0 ? ` de ${c.limiteUsos}` : " (sem limite)"}
                            {c.validade ? ` · válido até ${fmtDate(c.validade)}` : ""}
                          </p>
                          {c.nota && <p className="text-xs mt-0.5 italic" style={{ color: C.stone }}>{c.nota}</p>}
                          {(c.resgates || []).map((r, i) => (
                            <p key={i} className="text-[11px] mt-0.5" style={{ color: C.stone }}>↳ {r.nome} ({r.email}) — {r.plano} · {new Date(r.data).toLocaleDateString("pt-BR")}</p>
                          ))}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: st === "ativo" ? "#2E7D4F22" : "#B0342822", color: st === "ativo" ? "#2E7D4F" : "#B03428" }}>{st}</span>
                          <button onClick={() => copiarCupom(c.codigo)} className="text-xs underline flex items-center gap-1" style={{ color: C.violet }}>
                            <Copy size={11} /> {cupomCopiado === c.codigo ? "copiado!" : "copiar"}
                          </button>
                          <button onClick={() => toggleCupom(c.id)} className="text-xs underline" style={{ color: C.violet }}>{c.ativo ? "desativar" : "reativar"}</button>
                          <button onClick={() => delCupom(c.id)} className="text-xs underline" style={{ color: C.ember }}>excluir</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs italic mt-4" style={{ color: C.stone }}>
                Os cupons valem só para a assinatura de Códigos Avivar. A pessoa digita o código no formulário "Quero assinar"; o uso fica registrado aqui e na lista de interessados.
              </p>
            </div>
          </div>
        )}

        {showLeadsAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#00000077" }}>
            <div className="w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-y-auto" style={{ background: C.cream }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-semibold text-lg" style={{ color: C.ink }}>Interessados em assinar Códigos Avivar</h3>
                <button onClick={() => setShowLeadsAdmin(false)}><X size={18} /></button>
              </div>
              {(data.leads || []).length === 0 ? (
                <Empty text="Ninguém preencheu o formulário de assinatura ainda." />
              ) : (
                <div className="space-y-2">
                  {[...(data.leads || [])].reverse().map((l) => (
                    <div key={l.id} className="p-3 rounded-md text-sm" style={{ background: C.parchment }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold" style={{ color: C.ink }}>{l.nome}</p>
                          <p className="text-xs" style={{ color: C.stone }}>{l.email}{l.whatsapp ? " · " + l.whatsapp : ""}</p>
                          <p className="text-xs mt-0.5" style={{ color: C.stone }}>Interesse: <b>{l.plano}</b> · {new Date(l.data).toLocaleDateString("pt-BR")}</p>
                          {l.cupom && <p className="text-xs mt-0.5 font-mono" style={{ color: C.ember }}>Cupom {l.cupom.codigo} — {l.cupom.percentual}% de desconto</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <button onClick={() => toggleLeadContatado(l.id)} className="text-xs px-2 py-0.5 rounded-full" style={{ background: l.contatado ? "#2E7D4F22" : "#00000011", color: l.contatado ? "#2E7D4F" : C.stone }}>
                            {l.contatado ? "já contatado" : "marcar contatado"}
                          </button>
                          <button onClick={() => delLead(l.id)} className="text-xs underline" style={{ color: C.ember }}>excluir</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs italic mt-4" style={{ color: C.stone }}>
                Esta lista já fica pronta para ser exportada/migrada quando o app independente de Códigos Avivar sair do papel.
              </p>
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

        {/* Fórum — antes era uma coluna fixa flutuando sobre o site inteiro; agora
            mora aqui dentro, só pra quem já tem acesso a Códigos Avivar. */}
        <div className="mt-8">
          <Forum posts={forumPosts || []} addPost={(p) => addForumPost && addForumPost(p)} />
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
// Categorias das "estantes" de VOD da Avivar News TV (estilo streaming). "Treinamento
// Profundo" é a única que fica bloqueada — só abre pra quem já destravou os Códigos
// Avivar (ou é admin); as outras são "Sinal Aberto", abertas a qualquer visitante.
const ANT_CATEGORIAS = ["Transmissões Gerais", "Profetas dos Últimos Dias", "Manifestações e Milagres", "Avivar Music", "Treinamento Profundo"];
const ANT_CATEGORIA_BLOQUEADA = "Treinamento Profundo";

const PASSADA_FIELDS = [
  { key: "titulo", label: "Título da transmissão" },
  { key: "data", label: "Data", type: "date" },
  { key: "videoUrl", label: "Link do vídeo (YouTube ou Vimeo)", type: "url" },
  { key: "categoria", label: "Categoria (estante da Avivar News TV)", type: "select", options: ANT_CATEGORIAS },
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
  // "Fixar no topo" — o admin escolhe qual vídeo fica em primeiro na lista
  // (independente da data); só um por vez (fixar outro desmarca o anterior).
  // Sem nenhum fixado, continua por data, mais recente primeiro — como já era.
  const toggleDestaquePassada = (id) =>
    savePassadas(passadas.map((p) => ({ ...p, destaque: p.id === id ? !p.destaque : false })));
  const sortedPassadas = [...passadas].sort((a, b) => {
    if (!!a.destaque !== !!b.destaque) return a.destaque ? -1 : 1;
    return new Date(b.data) - new Date(a.data);
  });
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
                <p className="text-xs font-mono mt-4 mb-2" style={{ color: C.stone }}>
                  Próxima transmissão agendada (opcional) — enquanto não estiver ao vivo, a Home mostra um cronômetro regressivo até essa data/hora
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Data e hora"><input type="datetime-local" className={inputCls} style={{ borderColor: C.line }} value={data.proximaTransmissaoEm || ""} onChange={(e) => save({ ...data, proximaTransmissaoEm: e.target.value })} /></Field>
                  <Field label="Título (ex: Culto de Domingo)"><input className={inputCls} style={{ borderColor: C.line }} value={data.proximaTransmissaoTitulo || ""} onChange={(e) => save({ ...data, proximaTransmissaoTitulo: e.target.value })} /></Field>
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
                      <p className="text-xs font-medium leading-snug line-clamp-2 flex items-center gap-1">
                        {p.destaque && <Sparkles size={10} color={C.gold} className="shrink-0" />} {p.titulo}
                      </p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: C.stone }}>{fmtDate(p.data)}</p>
                    </div>
                  </button>
                  {adminMode && (
                    <div className="flex flex-col items-center gap-1.5 shrink-0 mt-1">
                      <button onClick={() => toggleDestaquePassada(p.id)} title={p.destaque ? "Tirar do topo" : "Fixar no topo"}>
                        <Sparkles size={12} color={p.destaque ? C.gold : C.stone} />
                      </button>
                      <button onClick={() => delPassada(p.id)} title="Remover"><Trash2 size={12} color={C.stone} /></button>
                    </div>
                  )}
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
/* Avivar News TV (ANT) — página cheia, sem rolagem pro player           */
/* ---------------------------------------------------------------- */
// Paleta própria da ANT: dark mode absoluto (identidade do produto, não uma
// preferência de tema) — roxo espiritual vibrante, dourado pro Botão Rhema,
// vermelho-fogo pro "ao vivo". Mantida separada da paleta C.* do resto do
// site de propósito: quando isso virar app de Smart TV/mobile, essa
// identidade visual sai praticamente pronta.
const ANT = {
  bg: "#0A0A0A", surface: "#121212", surface2: "#1B1B1E", surface3: "#232327",
  text: "#F5F5F7", dim: "#9A9AA2", border: "rgba(255,255,255,.08)",
  accent: "#8B5CF6", accentDeep: "#6D28D9",
  gold: "#E8B339", goldDeep: "#B9872A",
  fire: "#E8463B",
};
const ANT_RHEMAS = [
  { texto: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", ref: "Isaías 41:10" },
  { texto: "O Senhor é o meu pastor; nada me faltará.", ref: "Salmos 23:1" },
  { texto: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { texto: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", ref: "Salmos 37:5" },
];

// Player principal da ANT — mesma máquina de estados do card da Home
// (HeroLiveVideoCard: ao vivo > contagem regressiva > transmissão fixada/mais
// recente > mensagem padrão), só que ocupando a tela quase inteira, com o
// Botão Rhema e o Modo Vigília por cima.
function AntHeroPlayer({ aoVivo, passadas }) {
  const [agora, setAgora] = useState(() => new Date());
  const [vigilia, setVigilia] = useState(false);
  const [rhema, setRhema] = useState(null);
  const playerRef = useRef(null);
  const rhemaTimer = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const data = aoVivo || DEFAULT_AOVIVO;
  const sortedPassadas = [...(passadas || [])].sort((a, b) => {
    if (!!a.destaque !== !!b.destaque) return a.destaque ? -1 : 1;
    return new Date(b.data) - new Date(a.data);
  });
  const destaquePassada = sortedPassadas[0] || null;

  const alvo = data.proximaTransmissaoEm ? new Date(data.proximaTransmissaoEm) : null;
  const contandoRegressiva = !data.isLive && alvo && !isNaN(alvo.getTime()) && alvo.getTime() > agora.getTime();
  const diffSeg = contandoRegressiva ? Math.floor((alvo.getTime() - agora.getTime()) / 1000) : 0;
  const dd = Math.floor(diffSeg / 86400), hh = Math.floor((diffSeg % 86400) / 3600), mm = Math.floor((diffSeg % 3600) / 60), ss = diffSeg % 60;
  const pad = (n) => String(n).padStart(2, "0");

  function abrirRhema() {
    setRhema(ANT_RHEMAS[Math.floor(Math.random() * ANT_RHEMAS.length)]);
    clearTimeout(rhemaTimer.current);
    rhemaTimer.current = setTimeout(() => setRhema(null), 4200);
  }
  async function alternarTelaCheia() {
    try {
      if (!document.fullscreenElement) await playerRef.current?.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch { /* ignora silenciosamente — nem todo navegador suporta */ }
  }

  const temIframe = (data.isLive && data.embedUrl) || (!contandoRegressiva && destaquePassada);

  return (
    <div ref={playerRef} className="relative isolate w-full h-full overflow-hidden rounded-[22px] bg-black shadow-2xl">
      {data.isLive && data.embedUrl ? (
        <iframe title="Avivar News TV — ao vivo" src={getEmbedUrl(data.embedUrl)} className="absolute inset-0 w-full h-full" allowFullScreen />
      ) : contandoRegressiva ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center" style={{ background: `radial-gradient(ellipse at 50% 30%, ${ANT.accentDeep}55, transparent 60%), ${ANT.bg}` }}>
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider" style={{ color: ANT.gold }}>Próxima transmissão</p>
          <p className="font-display text-lg sm:text-2xl font-bold text-white mt-1">{data.proximaTransmissaoTitulo || "Em breve"}</p>
          <p className="font-mono text-2xl sm:text-4xl mt-2 tracking-wider tabular-nums" style={{ color: ANT.accent }}>
            {dd > 0 ? `${dd}d ` : ""}{pad(hh)}:{pad(mm)}:{pad(ss)}
          </p>
        </div>
      ) : destaquePassada ? (
        <iframe title={destaquePassada.titulo} src={getEmbedUrl(destaquePassada.videoUrl)} className="absolute inset-0 w-full h-full" allowFullScreen />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center" style={{ background: ANT.bg }}>
          <Tv size={28} color={ANT.accent} />
          <p className="text-sm mt-1" style={{ color: ANT.dim }}>{data.mensagem || "Nenhuma transmissão no momento."}</p>
        </div>
      )}

      {/* topo: badge LIVE (botão vermelho pulsante, canto superior esquerdo) + Botão Rhema */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3 sm:p-5 pointer-events-none">
        {data.isLive ? (
          <span className="live-pulse pointer-events-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-lg" style={{ background: "#E14D3A" }}>
            <Radio size={12} color="#fff" /> <span className="text-[11px] font-bold tracking-wide text-white">LIVE</span>
          </span>
        ) : <span />}
        <button
          onClick={abrirRhema}
          className="pointer-events-auto ml-auto flex items-center gap-1.5 rounded-full px-3.5 sm:px-4 py-2 text-xs font-bold shadow-lg"
          style={{ background: `linear-gradient(135deg,#FFDA7A,${ANT.gold} 55%,${ANT.goldDeep})`, color: "#1A1203" }}
        >
          <Flame size={15} /> Rhema
        </button>
      </div>

      {rhema && (
        <div className="absolute right-3 sm:right-5 top-14 sm:top-16 z-20 w-[min(280px,70%)] rounded-2xl p-4 shadow-2xl border" style={{ background: "linear-gradient(160deg,#1C1406,#0E0A03)", borderColor: ANT.gold + "55" }}>
          <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: ANT.gold }}>Palavra Rhema de agora</p>
          <p className="mt-2 font-display text-sm font-semibold leading-snug" style={{ color: "#FCEFC9" }}>“{rhema.texto}”</p>
          <p className="mt-2 text-[11px] font-semibold" style={{ color: "#8a7239" }}>{rhema.ref}</p>
        </div>
      )}

      {/* rodapé: Modo Vigília + tela cheia (só quando há vídeo de verdade pra controlar) */}
      {temIframe && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-end gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
          <label className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ color: ANT.dim }}>Modo Vigília</span>
            <button
              role="switch" aria-checked={vigilia} onClick={() => setVigilia((v) => !v)}
              className="relative h-[22px] w-[38px] rounded-full transition"
              style={{ background: vigilia ? ANT.accent : "rgba(255,255,255,.2)" }}
            >
              <span className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-transform" style={{ transform: vigilia ? "translateX(16px)" : "translateX(2px)" }} />
            </button>
          </label>
          <button onClick={alternarTelaCheia} aria-label="Tela cheia" className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/10 text-white hover:bg-white/20">
            <Maximize size={15} />
          </button>
        </div>
      )}

      {/* overlay do Modo Vigília — escurece a tela, o áudio do vídeo continua por trás */}
      {vigilia && temIframe && (
        <div
          role="button" tabIndex={0} onClick={() => setVigilia(false)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setVigilia(false)}
          className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-4 bg-black"
        >
          <div className="flex h-11 items-end gap-1">
            {[22, 34, 14, 40, 20].map((h, i) => (
              <span key={i} className="w-1 rounded-sm animate-pulse" style={{ height: h, background: `linear-gradient(to top,${ANT.accentDeep},${ANT.accent})`, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide" style={{ color: ANT.dim }}>Modo Vigília ativo</p>
          <p className="text-xs" style={{ color: "#6b6b72" }}>Só o áudio continua — toque na tela pra voltar ao vídeo.</p>
        </div>
      )}
    </div>
  );
}

// Radar de Intercessão — feed público de pedidos curtos (sem contato/telefone;
// pra isso já existe o Pedido de Oração privado). Qualquer visitante pode
// publicar um pedido breve e qualquer visitante pode clicar "Orar agora", que
// soma no contador — pensado pra dar a sensação de comunidade orando junto,
// ao vivo, enquanto assiste.
function RadarIntercessao({ itens, save, adminMode }) {
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const sorted = [...(itens || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 30);
  const totalOrando = (itens || []).reduce((n, i) => n + (i.oracoes || 0), 0);

  function publicar() {
    if (!mensagem.trim()) return;
    save([...(itens || []), { id: uid(), nome: nome.trim() || "Anônimo", mensagem: mensagem.trim(), timestamp: nowISO(), oracoes: 0 }]);
    setNome(""); setMensagem("");
  }
  function orarAgora(id) {
    save((itens || []).map((i) => (i.id === id ? { ...i, oracoes: (i.oracoes || 0) + 1 } : i)));
  }

  return (
    <aside className="flex h-full min-h-[300px] flex-col overflow-hidden rounded-[22px] border" style={{ borderColor: ANT.border, background: ANT.surface }}>
      <div className="flex items-center justify-between border-b px-4 py-3.5" style={{ borderColor: ANT.border }}>
        <span className="flex items-center gap-2 font-display text-sm font-bold" style={{ color: ANT.text }}>
          <Radio size={12} color={ANT.fire} /> Radar de Intercessão
        </span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: ANT.dim }}>{totalOrando} orações</span>
      </div>

      <div className="space-y-2 overflow-y-auto p-3" style={{ maxHeight: 360 }}>
        {sorted.length === 0 && <p className="px-1 py-6 text-center text-xs" style={{ color: ANT.dim }}>Nenhum pedido no momento — seja o primeiro a publicar.</p>}
        {sorted.map((i) => (
          <div key={i.id} className="rounded-[14px] border p-3" style={{ borderColor: ANT.border, background: ANT.surface2 }}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-bold" style={{ color: ANT.text }}>{i.nome}</span>
              <span className="text-[10px]" style={{ color: ANT.dim }}>{fmtDateTime(i.timestamp)}</span>
            </div>
            <p className="mb-2.5 text-[12.5px] leading-relaxed" style={{ color: "#C9C9D1" }}>{i.mensagem}</p>
            <div className="flex items-center justify-between">
              <button onClick={() => orarAgora(i.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: ANT.accent + "26", color: "#C7B2FF" }}>
                <HandHeart size={12} /> Orar agora
              </button>
              {i.oracoes > 0 && <span className="text-[10px] font-semibold tabular-nums" style={{ color: ANT.dim }}>{i.oracoes} orando</span>}
              {adminMode && (
                <button onClick={() => save((itens || []).filter((x) => x.id !== i.id))} className="ml-2"><Trash2 size={12} color={ANT.dim} /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-2 border-t p-3" style={{ borderColor: ANT.border }}>
        <p className="text-[10px]" style={{ color: ANT.dim }}>Visível publicamente — não coloque dados de contato aqui.</p>
        <input
          value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome (opcional)"
          className="w-full rounded-lg px-3 py-2 text-xs"
          style={{ background: ANT.surface3, color: ANT.text, border: `1px solid ${ANT.border}` }}
        />
        <div className="flex gap-2">
          <input
            value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Seu pedido, em poucas palavras..."
            onKeyDown={(e) => e.key === "Enter" && publicar()}
            className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs"
            style={{ background: ANT.surface3, color: ANT.text, border: `1px solid ${ANT.border}` }}
          />
          <button onClick={publicar} className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold" style={{ background: ANT.accent, color: "#fff" }}>
            <Send size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// Estante de VOD estilo streaming — uma categoria, rolagem horizontal. Vídeos
// da categoria "Treinamento Profundo" aparecem com cadeado quando `unlocked`
// é falso (mesma regra de acesso dos Códigos Avivar já usada no resto do site).
function AntVodShelf({ categoria, videos, unlocked, adminMode, onAbrirCodigos }) {
  if (!videos || videos.length === 0) return null;
  const bloqueada = categoria === ANT_CATEGORIA_BLOQUEADA;
  return (
    <section className="pt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base sm:text-lg font-bold" style={{ color: ANT.text }}>{categoria}</h2>
        {bloqueada && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: ANT.accent }}>
            <Lock size={12} /> Código Avivar
          </span>
        )}
      </div>
      <div className="flex gap-3.5 overflow-x-auto pb-3" style={{ scrollSnapType: "x proximity" }}>
        {videos.map((v) => {
          const travado = bloqueada && !unlocked && !adminMode;
          return (
            <button
              key={v.id}
              onClick={() => (travado ? onAbrirCodigos?.() : window.open(v.videoUrl, "_blank", "noopener,noreferrer"))}
              className="group relative aspect-[16/10] w-[210px] sm:w-[230px] flex-none overflow-hidden rounded-[14px] transition-transform duration-200 ease-out hover:scale-[1.045]"
              style={{ background: ANT.surface2, scrollSnapAlign: "start" }}
            >
              <div className={`absolute inset-0 ${travado ? "brightness-[.45] saturate-[.7]" : ""}`} style={{ background: `radial-gradient(circle at 30% 20%, ${ANT.accent}33, transparent 60%), linear-gradient(160deg, ${ANT.accentDeep}44, ${ANT.surface2})` }} />
              {travado ? (
                <span className="absolute right-2.5 top-2.5 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-lg" style={{ background: ANT.accentDeep + "d9" }}>
                  <Lock size={13} color="#fff" />
                </span>
              ) : (
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
                  <PlayCircle size={32} color="#fff" />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2.5 text-left">
                <span className="block text-[12.5px] font-bold leading-tight text-white">{v.titulo}</span>
                <span className="block text-[10px] font-semibold" style={{ color: ANT.dim }}>{fmtDate(v.data)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PaginaAvivarNewsTV({ aoVivo, saveAoVivo, passadas, savePassadas, news, saveNews, adminMode, onOpenNews, unlocked, intercessao, saveIntercessao, onVoltar, onAbrirCodigos }) {
  const porCategoria = ANT_CATEGORIAS.map((cat) => ({
    categoria: cat,
    videos: (passadas || []).filter((p) => (p.categoria || "Transmissões Gerais") === cat),
  }));

  return (
    <div className="min-h-screen font-body" style={{ background: ANT.bg, color: ANT.text }}>
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 sm:px-8 py-3.5" style={{ background: "linear-gradient(to bottom, rgba(10,10,10,.97), rgba(10,10,10,.8) 70%, transparent)", backdropFilter: "blur(6px)" }}>
        <button onClick={onVoltar} className="flex items-center gap-2 text-sm font-semibold focus:outline-none focus:ring-2 rounded-md" style={{ color: "#fff" }}>
          <ArrowLeft size={16} /> Voltar ao site
        </button>
        <div className="flex items-center gap-2">
          <Tv size={17} color={ANT.accent} />
          <span className="font-display text-sm font-bold">Avivar News TV</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        {/* Dobra 1 — player + radar, pensado pra caber sem rolar na maioria das telas */}
        <div className="flex flex-col gap-4 lg:h-[calc(100vh-110px)] lg:flex-row">
          <div className="min-h-[280px] flex-1 lg:min-h-0">
            <AntHeroPlayer aoVivo={aoVivo} passadas={passadas} />
          </div>
          <div className="lg:w-[320px] lg:flex-none">
            <RadarIntercessao itens={intercessao} save={saveIntercessao} adminMode={adminMode} />
          </div>
        </div>

        {/* Biblioteca de VOD — estilo streaming, abaixo da dobra */}
        {porCategoria.map(({ categoria, videos }) => (
          <AntVodShelf key={categoria} categoria={categoria} videos={videos} unlocked={unlocked} adminMode={adminMode} onAbrirCodigos={onAbrirCodigos} />
        ))}

        {/* Gerenciamento (admin) — reaproveita a tela já existente de configuração da
            transmissão, transmissões anteriores e grade semanal. */}
        <div className="mt-10 rounded-[24px] overflow-hidden" style={{ background: C.parchment }}>
          <div className="px-5 pt-5">
            <p className="text-[11px] font-mono uppercase tracking-wide" style={{ color: C.stone }}>Gerenciar (visível a todos, edição só pro admin)</p>
          </div>
          <AoVivo data={aoVivo} save={saveAoVivo} passadas={passadas} savePassadas={savePassadas} news={news} saveNews={saveNews} adminMode={adminMode} onOpenNews={onOpenNews} />
        </div>
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
  { key: "pdfUrl", label: "URL do PDF completo — o miolo (liberado pro leitor só depois do pagamento confirmado)", type: "url" },
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

function Loja({ items, save, adminMode: adminReal, operatorMode, onRequestOperator, doacoes, pedidosFisicos, savePedidosFisicos }) {
  // Servidor com código do setor "loja" tem os mesmos poderes do admin dentro da Loja (incluir, editar, excluir).
  const adminMode = adminReal || operatorMode;
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
  // Edição completa do produto (nome, sinopse, imagem da capa, preços...) — permite
  // ao admin corrigir qualquer item já publicado (ex: encurtar uma sinopse comprida
  // ou trocar a URL da capa se ela não aparecer) sem precisar excluir e recadastrar.
  const [editandoProdutoId, setEditandoProdutoId] = useState(null);

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
                <ImgOrPlaceholder url={p.imageUrl} alt={p.nome} className="w-full h-32 lg:h-full object-contain object-top" />
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

                  {adminMode && (
                    <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: C.ember, background: "#00000006" }}>
                      {editandoProdutoId === produtoAberto.id ? (
                        <div>
                          <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · editar produto (nome, sinopse, capa, preços...)</p>
                          <DynamicForm
                            fields={LOJA_FIELDS}
                            initial={produtoAberto}
                            accent={C.ember}
                            submitLabel="Salvar alterações"
                            onSubmit={(v) => {
                              save(items.map((i) => (i.id === produtoAberto.id ? { ...i, ...v } : i)));
                              setEditandoProdutoId(null);
                            }}
                          />
                          <button onClick={() => setEditandoProdutoId(null)} className="text-xs underline mt-2" style={{ color: C.stone }}>cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditandoProdutoId(produtoAberto.id)} className="text-xs underline flex items-center gap-1" style={{ color: C.ember }}>
                          <Pencil size={12} /> editar produto completo
                        </button>
                      )}
                    </div>
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
/* Doações — usado só dentro da página de cada Unidade Avivar/Igreja     */
/* (PaginaIgreja). A seção "Dízimos e Ofertas" do site principal, que     */
/* ficava aqui embaixo antes do cadastro de Visitantes, foi removida a    */
/* pedido do Marcos — duplicava o card "Dízimo e Oferta" já existente na  */
/* Home (HeroDoacoesCard, com o mesmo QR Code Pix). O ajuste da chave Pix */
/* principal pelo admin passou a viver direto na Home (bloco ADMIN logo   */
/* abaixo do Hero, em Home()) — este componente Doacoes abaixo continua   */
/* existindo só para a chave Pix própria de cada Unidade/Igreja.          */
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
/* Liderança em destaque — Pastor e Pastora, fixos no topo de Colaboradores */
/* ---------------------------------------------------------------- */
const DEFAULT_LIDERANCA = {
  marcos: { nome: "Pastor Marcos Fagner", texto: "Pastor Marcos Fagner, líder e fundador do Ministério Avivar do Espírito.", fotoUrl: "" },
  wladia: { nome: "Wládia Silva", texto: "Wládia Silva, pastora e vice-líder do Ministério Avivar do Espírito.", fotoUrl: "" },
};

function LiderancaCard({ pessoa, onChange, adminMode }) {
  return (
    <div className="rounded-xl border-2 overflow-hidden flex flex-col sm:flex-row" style={{ borderColor: C.gold, background: "#fff" }}>
      {/* Altura fixa em todas as telas (não só no celular) — garante que a foto do
          Pastor Marcos e da Pastora Wládia fiquem sempre do MESMO tamanho, não
          importa se o texto ao lado de cada um tem um tamanho diferente. */}
      <ImgOrPlaceholder url={pessoa.fotoUrl} alt={pessoa.nome} className="w-full sm:w-40 h-56 object-contain bg-[#F1E7D3] p-2 shrink-0" ph={pessoa.nome} />
      <div className="p-4 flex items-center">
        <p className="text-sm leading-relaxed" style={{ color: C.ink }}>{pessoa.texto}</p>
      </div>
      {adminMode && (
        <div className="p-3 border-t sm:border-t-0 sm:border-l shrink-0 sm:w-64" style={{ borderColor: C.line, background: "#00000006" }}>
          <Field label="URL da foto"><input className={inputCls} style={{ borderColor: C.line }} value={pessoa.fotoUrl || ""} onChange={(e) => onChange({ ...pessoa, fotoUrl: e.target.value })} /></Field>
          <div className="mt-2"><Field label="Texto"><textarea rows={3} className={inputCls} style={{ borderColor: C.line }} value={pessoa.texto || ""} onChange={(e) => onChange({ ...pessoa, texto: e.target.value })} /></Field></div>
        </div>
      )}
    </div>
  );
}

function LiderancaDestaque({ data, save, adminMode }) {
  const d = data || DEFAULT_LIDERANCA;
  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-10">
      <LiderancaCard pessoa={d.marcos || DEFAULT_LIDERANCA.marcos} onChange={(v) => save({ ...d, marcos: v })} adminMode={adminMode} />
      <LiderancaCard pessoa={d.wladia || DEFAULT_LIDERANCA.wladia} onChange={(v) => save({ ...d, wladia: v })} adminMode={adminMode} />
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

function ColaboradorCard({ c, adminMode, onDel, contido }) {
  // "contido" (object-contain, com fundo) evita cortar a cabeça de fotos mais
  // verticais/ampliadas — a foto inteira aparece, só um pouco menor dentro do
  // quadro, em vez de preencher o quadro cortando as bordas (object-cover).
  const imgCls = contido ? "w-full h-44 object-contain bg-[#F1E7D3] p-1.5" : "w-full h-44 object-cover";
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.line, background: C.parchment }}>
      <ImgOrPlaceholder url={c.fotoUrl} alt={c.nome} className={imgCls} ph={c.nome} />
      <div className="p-2" style={{ background: C.parchment }}>
        <p className="font-display font-semibold text-xs leading-snug">{c.nome}</p>
        {c.cargo && <p className="text-[10px]" style={{ color: C.ember }}>{c.cargo}</p>}
        {c.ministerio && <p className="text-[10px] mt-0.5" style={{ color: C.stone }}>{c.ministerio}</p>}
        {c.telefone && <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: C.stone }}><Phone size={10} />{c.telefone}</p>}
        {adminMode && <button onClick={onDel} className="text-[10px] underline mt-1" style={{ color: "#B03428" }}>excluir</button>}
      </div>
    </div>
  );
}

// Avivar Kids — seção própria abaixo de Colaboradores, com fotos das crianças/
// jovens do ministério infantil. Campos simples (só nome + foto), já que não
// têm cargo/ministério/telefone como os colaboradores adultos.
const AVIVAR_KIDS_FIELDS = [
  { key: "nome", label: "Nome" },
  { key: "fotoUrl", label: "URL da foto", type: "url" },
];

function Colaboradores({ items, save, adminMode, kidsItems, saveKids, lideranca, saveLideranca }) {
  const add = (v) => save([...items, { id: uid(), ...v }]);
  const del = (id) => save(items.filter((i) => i.id !== id));
  const porNome = (a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR");
  // Pastor Marcos e Pastora Wládia ficam SÓ no bloco de destaque no topo (Lideranca
  // Destaque) — nunca na lista comum de colaboradores, mesmo que sejam recadastrados
  // de novo por engano. Esse filtro roda toda vez que a tela é montada (não só uma
  // vez, como o seed de migração), então eles nunca voltam a aparecer duplicados.
  const semLideranca = items.filter((i) => !semAcento(i.nome).includes("marcos") && !semAcento(i.nome).includes("wladia"));
  // Lista separada em dois grupos, pedido do Marcos: os colaboradores que já
  // existiam (sem a marca "novo") primeiro, e os recém-cadastrados depois.
  let antigos = semLideranca.filter((i) => i.grupo !== "novo").sort(porNome);
  let novos = semLideranca.filter((i) => i.grupo === "novo").sort(porNome);
  // Pedido do Marcos: a Ir. Vitória Dimas aparece sempre logo ao lado da Ir. Vitória
  // Castro — no mesmo grupo dela, imediatamente depois, com o mesmo estilo de foto.
  const ehDimas = (c) => semAcento(c.nome).includes("vitoria dimas");
  const ehCastro = (c) => semAcento(c.nome).includes("vitoria castro");
  const dimas = semLideranca.find(ehDimas);
  if (dimas && semLideranca.some(ehCastro)) {
    const aoLado = (lista) => {
      const semDimas = lista.filter((c) => !ehDimas(c));
      const idx = semDimas.findIndex(ehCastro);
      if (idx === -1) return semDimas;
      return [...semDimas.slice(0, idx + 1), dimas, ...semDimas.slice(idx + 1)];
    };
    antigos = aoLado(antigos);
    novos = aoLado(novos);
  }

  const addKid = (v) => saveKids([...(kidsItems || []), { id: uid(), ...v }]);
  const delKid = (id) => saveKids((kidsItems || []).filter((i) => i.id !== id));
  const kidsOrdenados = [...(kidsItems || [])].sort(porNome);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Eyebrow>Quem serve conosco</Eyebrow>
      <SectionTitle>Colaboradores</SectionTitle>

      <LiderancaDestaque data={lideranca} save={saveLideranca} adminMode={adminMode} />

      {semLideranca.length === 0 && <div className="mt-6"><Empty text="Nenhum colaborador cadastrado ainda." /></div>}
      {antigos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
          {antigos.map((c) => (
            <ColaboradorCard key={c.id} c={c} adminMode={adminMode} onDel={() => del(c.id)} />
          ))}
        </div>
      )}
      {novos.length > 0 && (
        <div className="mt-10 p-4 rounded-xl" style={{ background: C.cream }}>
          <p className="text-xs font-mono mb-3 uppercase tracking-wide" style={{ color: C.stone }}>Nossos Colaboradores</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {novos.map((c) => (
              <ColaboradorCard key={c.id} c={c} adminMode={adminMode} onDel={() => del(c.id)} contido />
            ))}
          </div>
        </div>
      )}
      {adminMode && (
        <div className="mt-8">
          <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · novo colaborador</p>
          <DynamicForm fields={COLAB_FIELDS} onSubmit={add} submitLabel="Cadastrar" />
        </div>
      )}

      {/* Avivar Kids — seção própria, abaixo de Colaboradores */}
      <div className="mt-14 pt-10 border-t" style={{ borderColor: C.line }}>
        <Eyebrow color={C.ember}><Sparkles size={12} className="inline mr-1" />Ministério infantil</Eyebrow>
        <SectionTitle>Avivar Kids</SectionTitle>
        {kidsOrdenados.length === 0 ? (
          <div className="mt-6"><Empty text="Nenhuma criança cadastrada ainda." /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
            {kidsOrdenados.map((k) => (
              <ColaboradorCard key={k.id} c={k} adminMode={adminMode} onDel={() => delKid(k.id)} />
            ))}
          </div>
        )}
        {adminMode && (
          <div className="mt-8">
            <p className="text-xs font-mono mb-2" style={{ color: C.stone }}>ADMIN · nova criança em Avivar Kids</p>
            <DynamicForm fields={AVIVAR_KIDS_FIELDS} onSubmit={addKid} submitLabel="Cadastrar" />
          </div>
        )}
      </div>
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
function EscalaObreiros({ data, save, adminMode: adminReal, operatorMode, onRequestOperator }) {
  // Código do setor "escala" = poderes completos de admin dentro da Escala.
  const adminMode = adminReal || operatorMode;
  const canManage = adminMode;
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

function OracoesLares({ items, save, encontros, saveEncontros, adminMode: adminReal, operatorMode, onRequestOperator, localDia, saveLocalDia }) {
  // Código do setor "oracoes" = poderes completos de admin dentro de Oração nos Lares.
  const adminMode = adminReal || operatorMode;
  const canManageAgenda = adminMode;
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
/* Avivar Music — página cheia, sem rolagem pro painel inicial           */
/* ---------------------------------------------------------------- */
// Paleta própria do Avivar Music: roxo espiritual sobre fundo creme — mesma
// identidade já aprovada no protótipo, mantida separada da paleta C.* do
// resto do site de propósito (vira app independente mais pra frente).
const AM = { bg: "#FBF7F0", card: "#FFFFFF", card2: "#F1E9F7", accent: "#6A1B9A", accentDeep: "#4A1270", ink: "#2B1A3A", dim: "#6B5A7A", line: "rgba(43,26,58,.1)" };

/* ================================================================ */
/* AVIVAR MUSIC — mini-app (módulo portátil)                          */
/* ---------------------------------------------------------------- */
/* Tudo o que é do mini-app mora neste bloco e num único registro de  */
/* dados (`avivar:musicapp`), pra sair do site como app independente. */
/* Formato dos dados (equivale às tabelas do app futuro):             */
/*   acessos:    [{ id, nome, instrumento, email, codigo, senhaHash,  */
/*                 ativo, criadoEm }]              -> musicians        */
/*   acervo:     [{ id, titulo, artista, tomIgreja, tomOriginal, bpm, */
/*                 youtubeUrl, cifra, estrutura:[parte], observacoes, */
/*                 criadoEm, atualizadoEm }]       -> songs            */
/*   eventos:    [{ id, tipo, titulo, data, hora, local,              */
/*                 vagas:[{instrumento,qtd}],                         */
/*                 escalados: [{ musicoId, instrumento }],            */
/*                 musicas: [songId] }]            -> events/scales   */
/*   disponibilidade: [{ musicoId, eventoId, status, motivo,          */
/*                 avisado }]   status: confirmado|nao (pendente =    */
/*                 sem registro)                   -> availability    */
/*   favoritos:  [{ musicoId, musicaId }]          -> favorites       */
/*   preparacao: [{ musicoId, eventoId, itens:[bool] }]               */
/*                                       -> preparation_checklists    */
/*   notificacoes: [{ id, para, tipo, texto, em, lida }]              */
/*                 (estrutura pronta p/ push, e-mail e WhatsApp)      */
/*   auditoria:  [{ id, em, quem, acao }]          -> audit_logs      */
/*   patrimonio: [{ id, nome, numero, local, aquisicao, status, obs,  */
/*                 manutencoes:[{id,data,texto}] }]-> equipment       */
/* ================================================================ */
const DEFAULT_MUSICAPP = { acessos: [], acervo: [], eventos: [], disponibilidade: [], favoritos: [], preparacao: [], notificacoes: [], auditoria: [], patrimonio: [], equipeImportada: false };
const AM_TIPOS_EVENTO = ["Culto", "Ensaio", "Treinamento"];
const AM_STATUS_PATRIMONIO = ["Operacional", "Defeito", "Em Manutenção"];
const AM_MOTIVOS = ["Trabalho", "Viagem", "Compromisso", "Saúde", "Outro"];
const AM_PREP_ITENS = ["Confirmei minha escala", "Estudei as músicas", "Conferi os tons", "Conferi o BPM", "Separei meu equipamento", "Estou pronto"];
const AM_PARTES = ["Intro", "Verso", "Pré-refrão", "Refrão", "Ponte", "Final"];
const AM_COR = { confirmado: "#2E7D4F", pendente: "#B7791F", nao: "#B03428" };
const AM_ROTULO = { confirmado: "🟢 Confirmado", pendente: "🟡 Pendente", nao: "🔴 Não posso" };
// Músicos que NÃO entram na equipe de acesso (decisão do Marcos): comparados pelo primeiro nome / qualquer parte do nome.
const AM_IGNORAR_EQUIPE = ["wladia", "marcos"];
const AM_ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const amGerarCodigo = () => { let s = ""; for (let i = 0; i < 6; i++) s += AM_ALFABETO[Math.floor(Math.random() * AM_ALFABETO.length)]; return "AM-" + s; };
// A senha nunca é guardada em texto: guarda-se só o resumo (SHA-256) dela com o código.
async function amHashSenha(codigo, senha) {
  const texto = `avivar-music|${String(codigo).toUpperCase()}|${senha}`;
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    let h = 5381; for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
    return "f" + h.toString(16);
  }
}
const amTema = (escuro) => escuro
  ? { bg: "#120B1A", card: "#1E1429", card2: "#2A1D3A", accent: "#B97BE0", accentDeep: "#2B0F42", ink: "#F3EAFB", dim: "#B7A6C8", line: "rgba(255,255,255,.12)", onAccent: "#1A0B26" }
  : { ...AM, onAccent: "#FFFFFF" };
const amDataHora = (ev) => `${fmtDate(ev.data)}${ev.hora ? " · " + ev.hora : ""}`;
const amHoje = () => { const h = new Date(); h.setHours(0, 0, 0, 0); return h; };
const amOrdenar = (a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || ""));
const amEventosFuturos = (eventos) => [...(eventos || [])].filter((e) => e.data && new Date(e.data + "T00:00:00") >= amHoje()).sort(amOrdenar);
const amEventosPassados = (eventos) => [...(eventos || [])].filter((e) => e.data && new Date(e.data + "T00:00:00") < amHoje()).sort((a, b) => amOrdenar(b, a));
const amMesmoInstr = (a, b) => { const x = semAcento(a).trim(); const y = semAcento(b).trim(); return !!x && !!y && (x === y || x.includes(y) || y.includes(x)); };

// Disponibilidade: "pendente" = ainda sem resposta (não há registro). Aceita o formato antigo { pode: true/false }.
function amDispDe(dados, musicoId, eventoId) {
  const d = (dados.disponibilidade || []).find((x) => x.musicoId === musicoId && x.eventoId === eventoId);
  if (!d) return { status: "pendente", motivo: "", avisado: false };
  const status = d.status || (d.pode === true ? "confirmado" : d.pode === false ? "nao" : "pendente");
  return { status, motivo: d.motivo || "", avisado: !!d.avisado };
}
function amSetDisp(dados, musicoId, eventoId, patch) {
  const resto = (dados.disponibilidade || []).filter((x) => !(x.musicoId === musicoId && x.eventoId === eventoId));
  const novo = { musicoId, eventoId, ...amDispDe(dados, musicoId, eventoId), ...patch };
  if (novo.status === "pendente") return { ...dados, disponibilidade: resto };
  return { ...dados, disponibilidade: [...resto, novo] };
}
// Eventos internos de aviso — hoje só aparecem dentro do app; a estrutura já serve p/ push, e-mail e WhatsApp.
const amNotif = (dados, para, tipo, texto) => ({ ...dados, notificacoes: [{ id: uid(), para, tipo, texto, em: new Date().toISOString(), lida: false }, ...(dados.notificacoes || [])].slice(0, 150) });
const amNotifVarios = (dados, lista, tipo, texto) => lista.reduce((acc, para) => amNotif(acc, para, tipo, texto), dados);
const amAud = (dados, acao) => ({ ...dados, auditoria: [{ id: uid(), em: new Date().toISOString(), quem: "Liderança", acao }, ...(dados.auditoria || [])].slice(0, 300) });

// Equipe: monta os acessos a partir dos músicos do Grupo, sem duplicar nome e sem os ignorados.
const amNomeIgnorado = (nome) => semAcento(nome).split(/\s+/).some((p) => AM_IGNORAR_EQUIPE.includes(p));
function amImportarEquipe(dados, musicosGrupo) {
  const acessos = dados.acessos || [];
  const jaTem = new Set(acessos.map((a) => semAcento(a.nome).trim()));
  const usados = new Set(acessos.map((a) => a.codigo));
  const novos = []; const ignorados = [];
  (musicosGrupo || []).forEach((m) => {
    const nome = (m.nome || "").trim();
    if (!nome) return;
    if (amNomeIgnorado(nome)) { ignorados.push(nome); return; }
    const k = semAcento(nome).trim();
    if (jaTem.has(k)) return;
    jaTem.add(k);
    let codigo = amGerarCodigo(); while (usados.has(codigo)) codigo = amGerarCodigo(); usados.add(codigo);
    novos.push({ id: uid(), nome, instrumento: (m.instrumento || "").trim(), email: "", codigo, senhaHash: "", ativo: true, criadoEm: new Date().toISOString(), origemGrupo: m.id });
  });
  return { novos, ignorados };
}

function AmBotao({ t, children, onClick, tom = "cheio", className = "", ...rest }) {
  const estilo = tom === "cheio" ? { background: t.accent, color: t.onAccent } : tom === "perigo" ? { background: "transparent", color: "#D0473A", border: "1px solid #D0473A66" } : { background: t.card2, color: t.ink };
  return <button onClick={onClick} className={`min-h-[48px] px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 ${className}`} style={estilo} {...rest}>{children}</button>;
}
function AmCard({ t, children, className = "" }) {
  return <div className={`rounded-2xl p-4 sm:p-5 shadow-sm ${className}`} style={{ background: t.card, border: `1px solid ${t.line}` }}>{children}</div>;
}
function AmInput({ t, ...rest }) {
  return <input {...rest} className="w-full min-h-[48px] rounded-xl px-3 text-sm focus:outline-none focus:ring-2" style={{ background: t.card2, color: t.ink, border: `1px solid ${t.line}` }} />;
}
// Campo de senha com "olho": a pessoa confere o que digitou antes de entrar.
function AmSenha({ t, ...rest }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="relative">
      <input {...rest} type={ver ? "text" : "password"} autoComplete="off" className="w-full min-h-[48px] rounded-xl pl-3 pr-12 text-sm focus:outline-none focus:ring-2" style={{ background: t.card2, color: t.ink, border: `1px solid ${t.line}` }} />
      <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? "Esconder senha" : "Mostrar senha"} aria-pressed={ver} className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center" style={{ color: t.dim }}>
        {ver ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
function AmSelect({ t, children, ...rest }) {
  return <select {...rest} className="w-full min-h-[48px] rounded-xl px-3 text-sm focus:outline-none focus:ring-2" style={{ background: t.card2, color: t.ink, border: `1px solid ${t.line}` }}>{children}</select>;
}
function AmVazio({ t, children }) {
  return <AmCard t={t}><p className="text-sm text-center py-3" style={{ color: t.dim }}>{children}</p></AmCard>;
}

function AmLogin({ t, dados, salvar, onEntrar, tentarCodigoLider }) {
  const [modo, setModo] = useState("entrar"); // entrar | primeiro | lider
  const [ident, setIdent] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [erro, setErro] = useState("");
  const achar = (v) => {
    const x = v.trim().toLowerCase();
    return (dados.acessos || []).find((a) => a.ativo !== false && (a.codigo.toLowerCase() === x || (a.email && a.email.trim().toLowerCase() === x)));
  };
  const entrar = async () => {
    setErro("");
    if (modo === "lider") { if (!tentarCodigoLider(ident.trim())) setErro("Código de liderança inválido."); return; }
    const a = achar(ident);
    if (!a) { setErro("Código não encontrado ou desativado. Peça ao líder do louvor."); return; }
    if (modo === "primeiro") {
      if (a.senhaHash) { setErro("Este código já tem senha cadastrada. Use \"Já tenho senha\"."); return; }
      if (senha.length < 6) { setErro("A senha precisa ter pelo menos 6 caracteres."); return; }
      if (senha !== senha2) { setErro("As duas senhas não são iguais."); return; }
      const senhaHash = await amHashSenha(a.codigo, senha);
      salvar({ ...dados, acessos: dados.acessos.map((x) => (x.id === a.id ? { ...x, senhaHash } : x)) });
      onEntrar(a.id);
      return;
    }
    if (!a.senhaHash) { setErro("Este código ainda não tem senha. Use \"Primeiro acesso\"."); return; }
    if ((await amHashSenha(a.codigo, senha)) !== a.senhaHash) { setErro("Senha incorreta."); return; }
    onEntrar(a.id);
  };
  return (
    <div className="mx-auto max-w-sm px-4 pt-10 pb-16">
      <AmCard t={t}>
        <div className="flex items-center gap-2" style={{ color: t.accent }}><Lock size={18} /><p className="font-display font-bold text-lg" style={{ color: t.ink }}>Acesso dos músicos</p></div>
        <p className="text-xs mt-1" style={{ color: t.dim }}>O acesso é fechado: o líder do louvor gera um código para cada músico.</p>
        <div className="grid grid-cols-3 gap-1.5 mt-4">
          {[["entrar", "Já tenho senha"], ["primeiro", "Primeiro acesso"], ["lider", "Sou líder"]].map(([k, r]) => (
            <button key={k} type="button" onClick={() => { setModo(k); setErro(""); }} className="min-h-[44px] rounded-xl text-xs font-semibold px-1" style={{ background: modo === k ? t.accent : t.card2, color: modo === k ? t.onAccent : t.ink }}>{r}</button>
          ))}
        </div>
        <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); entrar(); }}>
          {modo === "lider"
            ? <AmSenha t={t} placeholder="Código de liderança" value={ident} onChange={(e) => setIdent(e.target.value)} />
            : <AmInput t={t} placeholder={modo === "primeiro" ? "Código de acesso (ex: AM-7K42QX)" : "Código de acesso ou e-mail"} value={ident} onChange={(e) => setIdent(e.target.value)} autoCapitalize="characters" />}
          {modo !== "lider" && <AmSenha t={t} placeholder={modo === "primeiro" ? "Crie sua senha pessoal" : "Senha"} value={senha} onChange={(e) => setSenha(e.target.value)} />}
          {modo === "primeiro" && <AmSenha t={t} placeholder="Repita a senha" value={senha2} onChange={(e) => setSenha2(e.target.value)} />}
          {erro && <p className="text-xs" style={{ color: "#D0473A" }}>{erro}</p>}
          <AmBotao t={t} type="submit" className="w-full"><Unlock size={16} /> {modo === "primeiro" ? "Cadastrar senha e entrar" : "Entrar"}</AmBotao>
        </form>
      </AmCard>
    </div>
  );
}

/* ---------- Avisos internos (estrutura pronta p/ push, e-mail e WhatsApp) ---------- */
function AmAvisos({ t, dados, salvar, para }) {
  const lista = (dados.notificacoes || []).filter((n) => n.para === para && !n.lida).slice(0, 8);
  if (lista.length === 0) return null;
  const lerTodos = () => salvar({ ...dados, notificacoes: (dados.notificacoes || []).map((n) => (n.para === para ? { ...n, lida: true } : n)) });
  return (
    <AmCard t={t}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-display font-bold inline-flex items-center gap-2" style={{ color: t.ink }}><Bell size={16} style={{ color: t.accent }} /> Avisos</p>
        <button onClick={lerTodos} className="min-h-[44px] px-3 text-xs font-semibold rounded-xl" style={{ background: t.card2, color: t.ink }}>Marcar como lidos</button>
      </div>
      <div className="mt-2 space-y-1.5">
        {lista.map((n) => (
          <div key={n.id} className="rounded-xl px-3 py-2" style={{ background: t.card2 }}>
            <p className="text-sm" style={{ color: t.ink }}>{n.texto}</p>
            <p className="text-[10px] mt-0.5" style={{ color: t.dim }}>{fmtDateTime(n.em)}</p>
          </div>
        ))}
      </div>
    </AmCard>
  );
}

/* ---------- Disponibilidade: Confirmado / Pendente / Não posso (+ motivo + avisar líder) ---------- */
function AmDispControle({ t, dados, salvar, musico, ev }) {
  const d = amDispDe(dados, musico.id, ev.id);
  const mudar = (status) => salvar(amSetDisp(dados, musico.id, ev.id, status === "nao" ? { status } : { status, motivo: "", avisado: false }));
  const avisar = () => {
    const base = amSetDisp(dados, musico.id, ev.id, { avisado: true });
    salvar(amNotif(base, "lider", "ausencia", `${musico.nome} não pode em ${ev.titulo || ev.tipo} (${fmtDate(ev.data)})${d.motivo ? " — motivo: " + d.motivo : ""}.`));
  };
  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        {[["confirmado", "Confirmado"], ["pendente", "Pendente"], ["nao", "Não posso"]].map(([k, r]) => (
          <button key={k} onClick={() => mudar(k)} className="min-h-[48px] rounded-xl text-xs sm:text-sm font-semibold px-1" style={{ background: d.status === k ? AM_COR[k] : t.card, color: d.status === k ? "#fff" : t.ink, border: `1px solid ${t.line}` }}>{r}</button>
        ))}
      </div>
      {d.status === "nao" && (
        <div className="mt-2 grid sm:grid-cols-[1fr_auto] gap-2">
          <AmSelect t={t} value={d.motivo} onChange={(e) => salvar(amSetDisp(dados, musico.id, ev.id, { motivo: e.target.value, avisado: false }))} aria-label="Motivo (opcional)">
            <option value="">Motivo (opcional)</option>
            {AM_MOTIVOS.map((m) => <option key={m}>{m}</option>)}
          </AmSelect>
          <AmBotao t={t} tom={d.avisado ? "suave" : "cheio"} onClick={avisar} disabled={d.avisado}><Send size={15} /> {d.avisado ? "Líder avisado" : "Avisar líder"}</AmBotao>
        </div>
      )}
    </div>
  );
}

/* ---------- A) Dashboard do músico ---------- */
function AmDashboard({ t, dados, salvar, musico, lider, irPara, abrirCulto }) {
  if (!musico) return <AmDashboardLider t={t} dados={dados} salvar={salvar} irPara={irPara} abrirCulto={abrirCulto} />;
  const futuros = amEventosFuturos(dados.eventos);
  const meus = futuros.filter((e) => (e.escalados || []).some((x) => x.musicoId === musico.id));
  const proximo = meus[0] || null;
  const meuInstrumento = proximo ? (proximo.escalados.find((x) => x.musicoId === musico.id) || {}).instrumento : "";
  const st = proximo ? amDispDe(dados, musico.id, proximo.id).status : null;
  const musicasDe = (ev) => (ev.musicas || []).map((id) => (dados.acervo || []).find((m) => m.id === id)).filter(Boolean);
  const semResposta = meus.filter((e) => amDispDe(dados, musico.id, e.id).status === "pendente");
  return (
    <div className="space-y-4">
      <p className="font-display text-xl font-bold" style={{ color: t.ink }}>Olá, {musico.nome.split(" ")[0]}</p>
      <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6A1B9A, #4A1270)" }}>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-white/15 rounded-full px-3 py-1">Próximo culto</span>
        {proximo ? (
          <>
            <p className="font-display text-2xl font-bold mt-3">{proximo.titulo || proximo.tipo}</p>
            <p className="text-sm text-white/85 mt-0.5">{proximo.tipo} · {amDataHora(proximo)}{proximo.local ? ` · ${proximo.local}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {meuInstrumento && <p className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 text-sm font-semibold"><Music size={15} /> Seu instrumento: {meuInstrumento}</p>}
              <p className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 text-sm font-semibold">Status: {AM_ROTULO[st]}</p>
            </div>
            {musicasDe(proximo).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {musicasDe(proximo).map((m) => <span key={m.id} className="text-xs bg-white/15 rounded-full px-2.5 py-1">{m.titulo}{m.tomIgreja ? ` (${m.tomIgreja})` : ""}</span>)}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-white/90 mt-3">Você ainda não possui nenhuma escala.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          <button onClick={() => irPara("escala")} className="min-h-[48px] rounded-xl bg-white text-sm font-bold" style={{ color: "#4A1270" }}>VER ESCALA</button>
          <button onClick={() => irPara("acervo")} className="min-h-[48px] rounded-xl bg-white text-sm font-bold" style={{ color: "#4A1270" }}>VER REPERTÓRIO</button>
          <button onClick={() => irPara("estudio")} className="min-h-[48px] rounded-xl bg-white text-sm font-bold" style={{ color: "#4A1270" }}>ABRIR ESTÚDIO</button>
        </div>
        {proximo && musicasDe(proximo).length > 0 && (
          <button onClick={() => abrirCulto(proximo)} className="mt-2 w-full min-h-[48px] rounded-xl bg-white/15 text-sm font-bold inline-flex items-center justify-center gap-2"><Maximize size={16} /> MODO CULTO</button>
        )}
      </div>

      {semResposta.length > 0 && (
        <AmCard t={t}><p className="text-sm" style={{ color: t.ink }}>🟡 Você ainda não confirmou sua disponibilidade em {semResposta.length === 1 ? "1 data" : `${semResposta.length} datas`}. Responda abaixo para o líder se organizar.</p></AmCard>
      )}
      <AmAvisos t={t} dados={dados} salvar={salvar} para={musico.id} />

      <AmCard t={t}>
        <p className="font-display font-bold" style={{ color: t.ink }}>Minha disponibilidade</p>
        <p className="text-xs mt-0.5" style={{ color: t.dim }}>Confirme, deixe pendente ou avise que não pode. O líder vê sua resposta ao montar a escala.</p>
        {futuros.length === 0 && <p className="text-sm mt-3" style={{ color: t.dim }}>Nenhuma data futura cadastrada ainda.</p>}
        <div className="mt-3 space-y-3">
          {futuros.map((ev) => (
            <div key={ev.id} className="rounded-xl p-3" style={{ background: t.card2 }}>
              <p className="text-sm font-semibold" style={{ color: t.ink }}>{ev.titulo || ev.tipo}</p>
              <p className="text-xs mb-2" style={{ color: t.dim }}>{ev.tipo} · {amDataHora(ev)}</p>
              <AmDispControle t={t} dados={dados} salvar={salvar} musico={musico} ev={ev} />
            </div>
          ))}
        </div>
      </AmCard>
    </div>
  );
}

/* ---------- Dashboard do líder: confirmações, vagas, substituição ---------- */
function AmDashboardLider({ t, dados, salvar, irPara, abrirCulto }) {
  const futuros = amEventosFuturos(dados.eventos);
  const ev = futuros[0] || null;
  const [subst, setSubst] = useState(false);
  const esc = ev ? ev.escalados || [] : [];
  const cont = { confirmado: 0, pendente: 0, nao: 0 };
  esc.forEach((x) => { cont[amDispDe(dados, x.musicoId, ev.id).status]++; });
  const vagas = ev ? (ev.vagas || []).map((v) => ({ ...v, preenchidas: esc.filter((x) => amMesmoInstr(x.instrumento, v.instrumento)).length })) : [];
  const nomeDe = (id) => ((dados.acessos || []).find((a) => a.id === id) || {}).nome || "(removido)";
  const pendentes = ev ? esc.filter((x) => amDispDe(dados, x.musicoId, ev.id).status === "pendente").map((x) => nomeDe(x.musicoId)) : [];
  const faltaVaga = vagas.some((v) => v.preenchidas < v.qtd);
  const temMusicas = ev && (ev.musicas || []).length > 0;
  return (
    <div className="space-y-4">
      <p className="font-display text-xl font-bold" style={{ color: t.ink }}>Painel do líder</p>
      <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6A1B9A, #4A1270)" }}>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-white/15 rounded-full px-3 py-1">Próximo evento</span>
        {ev ? (
          <>
            <p className="font-display text-2xl font-bold mt-3">{ev.titulo || ev.tipo}</p>
            <p className="text-sm text-white/85 mt-0.5">{ev.tipo} · {amDataHora(ev)}{ev.local ? ` · ${ev.local}` : ""}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide mt-4 text-white/70">Confirmações</p>
            {esc.length === 0 ? <p className="text-sm text-white/90 mt-1">Ninguém escalado ainda.</p> : (
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[["confirmado", "confirmados"], ["pendente", "pendentes"], ["nao", "indisponíveis"]].map(([k, r]) => (
                  <div key={k} className="rounded-xl bg-white/15 px-2 py-2 text-center"><p className="text-2xl font-bold">{cont[k]}</p><p className="text-[10px]">{AM_ROTULO[k].split(" ")[0]} {r}</p></div>
                ))}
              </div>
            )}
            {vagas.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wide mt-4 text-white/70">Escala</p>
                <div className="mt-1 grid grid-cols-2 gap-1.5">
                  {vagas.map((v, i) => (
                    <p key={i} className="rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: v.preenchidas < v.qtd ? "#B0342899" : "rgba(255,255,255,.15)" }}>{v.instrumento} — {v.preenchidas}/{v.qtd}{v.preenchidas < v.qtd ? " · vaga aberta" : ""}</p>
                  ))}
                </div>
              </>
            )}
            <div className="grid sm:grid-cols-2 gap-2 mt-4">
              <button onClick={() => setSubst((v) => !v)} className="min-h-[48px] rounded-xl bg-white text-sm font-bold" style={{ color: "#4A1270" }}>ENCONTRAR SUBSTITUTO{cont.nao > 0 || faltaVaga ? " •" : ""}</button>
              {temMusicas && <button onClick={() => abrirCulto(ev)} className="min-h-[48px] rounded-xl bg-white/15 text-sm font-bold inline-flex items-center justify-center gap-2"><Maximize size={16} /> MODO CULTO</button>}
            </div>
          </>
        ) : (
          <p className="text-sm text-white/90 mt-3">Nenhum evento futuro cadastrado. Crie o primeiro em Escalas.</p>
        )}
      </div>

      {subst && ev && <AmSubstituto t={t} dados={dados} salvar={salvar} ev={ev} onFechar={() => setSubst(false)} />}
      {pendentes.length > 0 && <AmCard t={t}><p className="text-sm" style={{ color: t.ink }}>🟡 Ainda não responderam: <b>{pendentes.join(", ")}</b></p></AmCard>}
      <AmAvisos t={t} dados={dados} salvar={salvar} para="lider" />

      <div className="grid grid-cols-2 gap-3">
        <AmBotao t={t} tom="suave" className="flex-col !items-start py-4 h-auto" onClick={() => irPara("escalas")}><Calendar size={20} /> Escalas</AmBotao>
        <AmBotao t={t} tom="suave" className="flex-col !items-start py-4 h-auto" onClick={() => irPara("equipe")}><Users size={20} /> Equipe</AmBotao>
        <AmBotao t={t} tom="suave" className="flex-col !items-start py-4 h-auto" onClick={() => irPara("acervo")}><Library size={20} /> Acervo</AmBotao>
        <AmBotao t={t} tom="suave" className="flex-col !items-start py-4 h-auto" onClick={() => irPara("patrimonio")}><Package size={20} /> Patrimônio</AmBotao>
      </div>
    </div>
  );
}

/* ---------- Sistema de substituição ---------- */
function AmSubstituto({ t, dados, salvar, ev, onFechar }) {
  const esc = ev.escalados || [];
  const nomeDe = (id) => ((dados.acessos || []).find((a) => a.id === id) || {}).nome || "(removido)";
  const primeiroNao = esc.find((x) => amDispDe(dados, x.musicoId, ev.id).status === "nao");
  const [quem, setQuem] = useState((primeiroNao || esc[0] || {}).musicoId || "");
  const alvo = esc.find((x) => x.musicoId === quem) || null;
  const candidatos = alvo
    ? (dados.acessos || []).filter((a) => a.ativo !== false && !esc.some((x) => x.musicoId === a.id))
        .map((a) => ({ a, st: amDispDe(dados, a.id, ev.id).status, mesmo: amMesmoInstr(a.instrumento, alvo.instrumento) }))
        .sort((x, y) => (Number(y.mesmo) - Number(x.mesmo)) || (Number(x.st === "nao") - Number(y.st === "nao")) || (Number(y.st === "confirmado") - Number(x.st === "confirmado")))
    : [];
  const trocar = (cand) => {
    const novoEsc = esc.map((x) => (x.musicoId === quem ? { musicoId: cand.id, instrumento: alvo.instrumento } : x));
    let novo = { ...dados, eventos: dados.eventos.map((e) => (e.id === ev.id ? { ...e, escalados: novoEsc } : e)) };
    const titulo = ev.titulo || ev.tipo;
    novo = amNotif(novo, cand.id, "escalado", `Você foi escalado em ${titulo} (${fmtDate(ev.data)}) — ${alvo.instrumento || "instrumento a definir"}.`);
    novo = amNotif(novo, quem, "substituido", `Você foi substituído em ${titulo} (${fmtDate(ev.data)}).`);
    novo = amAud(novo, `Substituição em ${titulo} (${fmtDate(ev.data)}): ${nomeDe(quem)} → ${cand.nome} (${alvo.instrumento || "—"})`);
    salvar(novo);
    onFechar();
  };
  return (
    <AmCard t={t}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display font-bold" style={{ color: t.ink }}>Encontrar substituto</p>
          <p className="text-xs" style={{ color: t.dim }}>Escolha quem sai. Mostramos primeiro quem toca o mesmo instrumento.</p>
        </div>
        <button aria-label="Fechar" onClick={onFechar} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.card2, color: t.ink }}><X size={16} /></button>
      </div>
      {esc.length === 0 ? <p className="text-sm mt-3" style={{ color: t.dim }}>Ninguém escalado neste evento ainda.</p> : (
        <>
          <div className="mt-3">
            <AmSelect t={t} value={quem} onChange={(e) => setQuem(e.target.value)}>
              {esc.map((x) => <option key={x.musicoId} value={x.musicoId}>{AM_ROTULO[amDispDe(dados, x.musicoId, ev.id).status].split(" ")[0]} {nomeDe(x.musicoId)} — {x.instrumento || "—"}</option>)}
            </AmSelect>
          </div>
          <div className="mt-3 space-y-1.5">
            {candidatos.length === 0 && <p className="text-sm" style={{ color: t.dim }}>Nenhum outro músico ativo disponível na equipe.</p>}
            {candidatos.map(({ a, st, mesmo }) => (
              <div key={a.id} className="rounded-xl px-3 py-2 flex items-center justify-between gap-2" style={{ background: t.card2 }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: t.ink }}>{st === "confirmado" ? "🟢" : st === "nao" ? "🔴" : "🟡"} {a.nome}</p>
                  <p className="text-xs" style={{ color: t.dim }}>{a.instrumento || "Instrumento a definir"}{mesmo ? " · mesmo instrumento" : ""} · {st === "confirmado" ? "disponível" : st === "nao" ? "indisponível" : "ainda não respondeu"}</p>
                </div>
                <AmBotao t={t} className="!min-h-[44px] shrink-0" onClick={() => trocar(a)}>Escalar</AmBotao>
              </div>
            ))}
          </div>
        </>
      )}
    </AmCard>
  );
}

/* ---------- MODO CULTO: tela escura, cifra grande, anterior/próxima ---------- */
function AmModoCulto({ evento, musicas, onSair }) {
  const [i, setI] = useState(0);
  const [fonte, setFonte] = useState(22);
  const areaRef = useRef(null);
  const m = musicas[i];
  useEffect(() => {
    let lock = null;
    try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then((l) => { lock = l; }).catch(() => {}); } catch (e) { /* sem wake lock */ }
    return () => { try { lock && lock.release(); } catch (e) { /* ok */ } };
  }, []);
  useEffect(() => { if (areaRef.current) areaRef.current.scrollTop = 0; }, [i]);
  if (!m) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#07030C", color: "#F3EAFB" }}>
      <div className="flex items-center justify-between gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,.12)" }}>
        <button onClick={onSair} className="min-h-[44px] px-3 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5" style={{ background: "rgba(255,255,255,.1)" }}><X size={16} /> Sair</button>
        <p className="text-xs truncate" style={{ color: "#B7A6C8" }}>{evento.titulo || evento.tipo} · {i + 1}/{musicas.length}</p>
        <div className="flex gap-1.5">
          <button aria-label="Diminuir letra" onClick={() => setFonte((f) => Math.max(14, f - 2))} className="w-11 h-11 rounded-xl font-bold" style={{ background: "rgba(255,255,255,.1)" }}>A−</button>
          <button aria-label="Aumentar letra" onClick={() => setFonte((f) => Math.min(48, f + 2))} className="w-11 h-11 rounded-xl font-bold text-lg" style={{ background: "rgba(255,255,255,.1)" }}>A+</button>
        </div>
      </div>
      <div ref={areaRef} className="flex-1 overflow-y-auto px-4 sm:px-10 py-5">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">{m.titulo}</h2>
          <p className="font-mono text-xl sm:text-2xl mt-2" style={{ color: "#B97BE0" }}>Tom: {m.tomIgreja || "—"} <span style={{ color: "#B7A6C8" }}>·</span> BPM: {m.bpm || "—"}</p>
          {(m.estrutura || []).length > 0 && <p className="mt-3 text-sm uppercase tracking-wide" style={{ color: "#B7A6C8" }}>{m.estrutura.join(" → ")}</p>}
          {m.observacoes && <p className="mt-3 rounded-xl px-4 py-3 text-base" style={{ background: "#3A2552", color: "#F3EAFB" }}>⚠ {m.observacoes}</p>}
          {m.cifra ? <pre className="mt-5 whitespace-pre-wrap font-mono leading-relaxed pb-10" style={{ fontSize: fonte }}>{m.cifra}</pre> : <p className="mt-5" style={{ color: "#B7A6C8" }}>Cifra ainda não cadastrada.</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-3" style={{ borderTop: "1px solid rgba(255,255,255,.12)" }}>
        <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} className="min-h-[64px] rounded-2xl text-lg font-bold inline-flex items-center justify-center gap-2 disabled:opacity-30" style={{ background: "rgba(255,255,255,.1)" }}><ChevronLeft size={22} /> ANTERIOR</button>
        <button onClick={() => setI((v) => Math.min(musicas.length - 1, v + 1))} disabled={i === musicas.length - 1} className="min-h-[64px] rounded-2xl text-lg font-bold inline-flex items-center justify-center gap-2 disabled:opacity-30" style={{ background: "#6A1B9A" }}>PRÓXIMA <ChevronRight size={22} /></button>
      </div>
    </div>
  );
}

/* ---------- Escala do músico + preparação do culto ---------- */
function AmEscalaMusico({ t, dados, salvar, musico, abrirCulto }) {
  const futuros = amEventosFuturos(dados.eventos).filter((e) => (e.escalados || []).some((x) => x.musicoId === musico.id));
  const prepDe = (eid) => ((dados.preparacao || []).find((p) => p.musicoId === musico.id && p.eventoId === eid) || {}).itens || AM_PREP_ITENS.map(() => false);
  const marcarPrep = (eid, idx) => {
    const itens = prepDe(eid).slice(); while (itens.length < AM_PREP_ITENS.length) itens.push(false);
    itens[idx] = !itens[idx];
    const resto = (dados.preparacao || []).filter((p) => !(p.musicoId === musico.id && p.eventoId === eid));
    salvar({ ...dados, preparacao: [...resto, { musicoId: musico.id, eventoId: eid, itens }] });
  };
  return (
    <div className="space-y-4">
      <p className="font-display text-xl font-bold" style={{ color: t.ink }}>Minha escala</p>
      {futuros.length === 0 && <AmVazio t={t}>Você ainda não possui nenhuma escala.</AmVazio>}
      {futuros.map((ev) => {
        const meu = ev.escalados.find((x) => x.musicoId === musico.id);
        const musicas = (ev.musicas || []).map((id) => (dados.acervo || []).find((m) => m.id === id)).filter(Boolean);
        const prep = prepDe(ev.id); const feitos = prep.filter(Boolean).length;
        return (
          <AmCard t={t} key={ev.id}>
            <p className="font-display font-bold text-lg" style={{ color: t.ink }}>{ev.titulo || ev.tipo}</p>
            <p className="text-xs" style={{ color: t.dim }}>{ev.tipo} · {amDataHora(ev)}{ev.local ? ` · ${ev.local}` : ""}</p>
            <p className="text-sm mt-2" style={{ color: t.ink }}>Seu instrumento: <b>{(meu && meu.instrumento) || "a definir"}</b></p>
            <p className="text-xs font-bold uppercase tracking-wide mt-4" style={{ color: t.dim }}>Repertório</p>
            {musicas.length === 0 ? <p className="text-sm mt-1" style={{ color: t.dim }}>Nenhum repertório foi definido para este evento.</p> : (
              <div className="mt-1 space-y-1">
                {musicas.map((m) => <p key={m.id} className="text-sm rounded-xl px-3 py-2" style={{ background: t.card2, color: t.ink }}><b>{m.titulo}</b> <span style={{ color: t.dim }}>· Tom {m.tomIgreja || "—"} · {m.bpm ? m.bpm + " BPM" : "BPM a definir"}</span></p>)}
                <AmBotao t={t} tom="suave" className="w-full mt-1" onClick={() => abrirCulto(ev)}><Maximize size={16} /> Modo Culto</AmBotao>
              </div>
            )}
            <p className="text-xs font-bold uppercase tracking-wide mt-4" style={{ color: t.dim }}>Minha disponibilidade</p>
            <div className="mt-1"><AmDispControle t={t} dados={dados} salvar={salvar} musico={musico} ev={ev} /></div>
            <p className="text-xs font-bold uppercase tracking-wide mt-4" style={{ color: t.dim }}>Preparação · {feitos}/{AM_PREP_ITENS.length}</p>
            <div className="mt-1 space-y-1.5">
              {AM_PREP_ITENS.map((r, idx) => (
                <button key={r} onClick={() => marcarPrep(ev.id, idx)} className="w-full min-h-[48px] rounded-xl px-3 flex items-center gap-3 text-left text-sm" style={{ background: t.card2, color: t.ink }}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: prep[idx] ? "#2E7D4F" : t.card, border: `1px solid ${t.line}`, color: "#fff" }}>{prep[idx] && <Check size={15} />}</span>
                  <span style={{ textDecoration: prep[idx] ? "line-through" : "none", opacity: prep[idx] ? 0.7 : 1 }}>{r}</span>
                </button>
              ))}
            </div>
          </AmCard>
        );
      })}
    </div>
  );
}

/* ---------- B) Acervo + tela da cifra ---------- */
function AmCifra({ musica, onFechar, escuroInicial }) {
  const [escuro, setEscuro] = useState(escuroInicial);
  const [fonte, setFonte] = useState(16);
  const [rolando, setRolando] = useState(false);
  const [vel, setVel] = useState(2);
  const areaRef = useRef(null);
  const t = amTema(escuro);
  useEffect(() => {
    if (!rolando) return undefined;
    const id = setInterval(() => {
      const el = areaRef.current;
      if (!el) return;
      el.scrollTop += vel;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) setRolando(false);
    }, 60);
    return () => clearInterval(id);
  }, [rolando, vel]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: t.bg, color: t.ink }}>
      <div className="flex items-center justify-between gap-2 px-3 py-2" style={{ background: t.card, borderBottom: `1px solid ${t.line}` }}>
        <button onClick={onFechar} className="min-h-[44px] px-3 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: t.ink }}><ArrowLeft size={16} /> Acervo</button>
        <button onClick={() => setEscuro((v) => !v)} className="min-h-[44px] px-3 rounded-xl text-xs font-semibold" style={{ background: t.card2, color: t.ink }}>{escuro ? "Modo claro" : "Modo escuro (altar)"}</button>
      </div>
      <div ref={areaRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold">{musica.titulo}</h2>
          {musica.artista && <p className="text-sm" style={{ color: t.dim }}>{musica.artista}</p>}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[["Tom da igreja", musica.tomIgreja], ["Tom original", musica.tomOriginal], ["BPM", musica.bpm]].map(([r, v]) => (
              <div key={r} className="rounded-xl p-3 text-center" style={{ background: t.card2 }}>
                <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: t.dim }}>{r}</p>
                <p className="font-mono text-xl font-bold mt-0.5" style={{ color: t.accent }}>{v || "—"}</p>
              </div>
            ))}
          </div>
          {(musica.estrutura || []).length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {musica.estrutura.map((p, i) => <span key={i} className="text-xs font-bold uppercase rounded-full px-3 py-1" style={{ background: t.card2, color: t.accent }}>{p}</span>)}
            </div>
          )}
          {musica.observacoes && <p className="mt-3 rounded-xl px-4 py-3 text-sm" style={{ background: t.card2, color: t.ink, borderLeft: `4px solid ${t.accent}` }}><b>Observações do líder:</b> {musica.observacoes}</p>}
          {musica.youtubeUrl && (
            <div className="aspect-video rounded-2xl overflow-hidden bg-black mt-4">
              <iframe title={`Referência — ${musica.titulo}`} src={getEmbedUrl(musica.youtubeUrl)} className="w-full h-full" allowFullScreen />
            </div>
          )}
          {musica.cifra ? (
            <pre className="mt-5 whitespace-pre-wrap font-mono leading-relaxed pb-40" style={{ fontSize: fonte, color: t.ink }}>{musica.cifra}</pre>
          ) : (
            <p className="mt-5 text-sm" style={{ color: t.dim }}>Cifra ainda não cadastrada para esta música.</p>
          )}
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-center gap-2 flex-wrap" style={{ background: t.card, borderTop: `1px solid ${t.line}` }}>
        <button aria-label="Diminuir letra" onClick={() => setFonte((f) => Math.max(11, f - 2))} className="w-12 h-12 rounded-xl font-bold" style={{ background: t.card2, color: t.ink }}>A−</button>
        <button aria-label="Aumentar letra" onClick={() => setFonte((f) => Math.min(34, f + 2))} className="w-12 h-12 rounded-xl font-bold text-lg" style={{ background: t.card2, color: t.ink }}>A+</button>
        <button onClick={() => setRolando((v) => !v)} className="h-12 px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2" style={{ background: t.accent, color: t.onAccent }}>{rolando ? <Pause size={16} /> : <Play size={16} />} Rolagem</button>
        <button aria-label="Rolagem mais lenta" onClick={() => setVel((v) => Math.max(1, v - 1))} className="w-12 h-12 rounded-xl" style={{ background: t.card2, color: t.ink }}><Minus size={16} className="mx-auto" /></button>
        <span className="text-xs font-mono w-6 text-center" style={{ color: t.dim }}>{vel}x</span>
        <button aria-label="Rolagem mais rápida" onClick={() => setVel((v) => Math.min(8, v + 1))} className="w-12 h-12 rounded-xl" style={{ background: t.card2, color: t.ink }}><Plus size={16} className="mx-auto" /></button>
      </div>
    </div>
  );
}

const AM_MUSICA_VAZIA = { titulo: "", artista: "", tomIgreja: "", tomOriginal: "", bpm: "", youtubeUrl: "", cifra: "", estrutura: [], observacoes: "" };
function AmAcervo({ t, dados, salvar, lider, repertorio, escuro, userKey }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas"); // todas | favoritas | recentes
  const [aberta, setAberta] = useState(null);
  const [form, setForm] = useState(null); // null | objeto em edição
  // Músicas do repertório antigo (por culto) entram no acervo só para consulta.
  const doAcervo = dados.acervo || [];
  const titulos = new Set(doAcervo.map((m) => semAcento(m.titulo).trim()));
  const antigas = [];
  (repertorio || []).forEach((c) => (c.musicas || []).forEach((m) => {
    const k = semAcento(m.titulo).trim();
    if (k && !titulos.has(k)) { titulos.add(k); antigas.push({ id: "rep-" + m.id, titulo: m.titulo, tomIgreja: m.tom || "", tomOriginal: "", bpm: "", youtubeUrl: m.youtubeUrl || "", cifra: m.cifra || m.letra || "", doRepertorio: true }); }
  }));
  const todas = [...doAcervo, ...antigas];
  const ehFav = (id) => (dados.favoritos || []).some((f) => f.musicoId === userKey && f.musicaId === id);
  const alternarFav = (id) => salvar({ ...dados, favoritos: ehFav(id) ? dados.favoritos.filter((f) => !(f.musicoId === userKey && f.musicaId === id)) : [...(dados.favoritos || []), { musicoId: userKey, musicaId: id }] });
  let lista = todas.filter((m) => semAcento(m.titulo).includes(semAcento(busca)) || semAcento(m.artista).includes(semAcento(busca)));
  if (filtro === "favoritas") lista = lista.filter((m) => ehFav(m.id));
  if (filtro === "recentes") lista = lista.filter((m) => m.atualizadoEm || m.criadoEm).sort((a, b) => (b.atualizadoEm || b.criadoEm).localeCompare(a.atualizadoEm || a.criadoEm)).slice(0, 15);
  else lista = lista.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR"));
  const gravar = () => {
    if (!form.titulo.trim()) return;
    const agora = new Date().toISOString();
    const limpo = { ...form, titulo: form.titulo.trim(), atualizadoEm: agora }; delete limpo.doRepertorio;
    const existe = doAcervo.some((m) => m.id === form.id);
    const novo = { ...dados, acervo: existe ? doAcervo.map((m) => (m.id === form.id ? limpo : m)) : [...doAcervo, { ...limpo, id: uid(), criadoEm: agora }] };
    let final = amAud(novo, `${existe ? "Música alterada" : "Música cadastrada"}: ${limpo.titulo}`);
    if (existe) {
      const avisar = (dados.eventos || []).filter((e) => (e.musicas || []).includes(form.id) && e.data >= new Date().toISOString().slice(0, 10)).flatMap((e) => (e.escalados || []).map((x) => x.musicoId));
      final = amNotifVarios(final, [...new Set(avisar)], "musica", `A música "${limpo.titulo}" foi atualizada.`);
    }
    salvar(final);
    setForm(null);
  };
  const excluir = (m) => salvar(amAud({ ...dados, acervo: doAcervo.filter((x) => x.id !== m.id), favoritos: (dados.favoritos || []).filter((f) => f.musicaId !== m.id), eventos: (dados.eventos || []).map((e) => ({ ...e, musicas: (e.musicas || []).filter((x) => x !== m.id) })) }, `Música excluída: ${m.titulo}`));
  const vazioMsg = todas.length === 0 ? "Nenhuma música no acervo ainda." : filtro === "favoritas" ? "Você ainda não marcou nenhuma favorita. Toque na ⭐ de uma música." : "Nenhuma música encontrada.";
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-xl font-bold" style={{ color: t.ink }}>Acervo de louvores</p>
        {lider && <AmBotao t={t} onClick={() => setForm({ ...AM_MUSICA_VAZIA })}><Plus size={16} /> Nova</AmBotao>}
      </div>
      <AmInput t={t} placeholder="Pesquisar por música ou artista..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      <div className="grid grid-cols-3 gap-1.5">
        {[["todas", "Todas"], ["favoritas", "⭐ Favoritas"], ["recentes", "Recentes"]].map(([k, r]) => (
          <button key={k} onClick={() => setFiltro(k)} className="min-h-[44px] rounded-xl text-xs font-semibold" style={{ background: filtro === k ? t.accent : t.card2, color: filtro === k ? t.onAccent : t.ink }}>{r}</button>
        ))}
      </div>
      {form && (
        <AmCard t={t}>
          <p className="font-display font-bold mb-3" style={{ color: t.ink }}>{doAcervo.some((m) => m.id === form.id) ? "Editar música" : "Nova música"}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <AmInput t={t} placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            <AmInput t={t} placeholder="Artista / compositor" value={form.artista || ""} onChange={(e) => setForm({ ...form, artista: e.target.value })} />
            <AmInput t={t} placeholder="Tom da igreja (ex: G)" value={form.tomIgreja} onChange={(e) => setForm({ ...form, tomIgreja: e.target.value })} />
            <AmInput t={t} placeholder="Tom original (ex: A)" value={form.tomOriginal} onChange={(e) => setForm({ ...form, tomOriginal: e.target.value })} />
            <AmInput t={t} placeholder="BPM (ex: 72)" inputMode="numeric" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })} />
            <AmInput t={t} placeholder="Link do YouTube (referência de arranjo)" value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} />
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold mb-1.5" style={{ color: t.dim }}>Estrutura da música (toque para adicionar na ordem)</p>
              <div className="flex flex-wrap gap-1.5">
                {AM_PARTES.map((p) => <button key={p} type="button" onClick={() => setForm({ ...form, estrutura: [...(form.estrutura || []), p] })} className="min-h-[40px] px-3 rounded-full text-xs font-bold uppercase" style={{ background: t.card2, color: t.ink }}>+ {p}</button>)}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.estrutura || []).length === 0 && <span className="text-xs" style={{ color: t.dim }}>Nem toda música usa todas as partes — monte só o que ela tem.</span>}
                {(form.estrutura || []).map((p, i) => (
                  <span key={i} className="text-xs font-bold uppercase rounded-full pl-3 pr-1 py-1 inline-flex items-center gap-1" style={{ background: t.accent, color: t.onAccent }}>{p}
                    <button type="button" aria-label={`Tirar ${p}`} onClick={() => setForm({ ...form, estrutura: form.estrutura.filter((_, j) => j !== i) })} className="w-6 h-6 rounded-full flex items-center justify-center"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <textarea rows={3} placeholder="Observações musicais (ex: Bateria entra só no 2º refrão; guitarra faz ambiente na ponte)" value={form.observacoes || ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} className="w-full rounded-xl p-3 text-sm focus:outline-none focus:ring-2" style={{ background: t.card2, color: t.ink, border: `1px solid ${t.line}` }} />
            </div>
            <div className="sm:col-span-2">
              <textarea rows={10} placeholder="Cifra (cole aqui, com os acordes sobre a letra)" value={form.cifra} onChange={(e) => setForm({ ...form, cifra: e.target.value })} className="w-full rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2" style={{ background: t.card2, color: t.ink, border: `1px solid ${t.line}` }} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <AmBotao t={t} onClick={gravar}><Save size={16} /> Salvar</AmBotao>
            <AmBotao t={t} tom="suave" onClick={() => setForm(null)}>Cancelar</AmBotao>
          </div>
        </AmCard>
      )}
      {lista.length === 0 && <AmVazio t={t}>{vazioMsg}</AmVazio>}
      <div className="space-y-2">
        {lista.map((m) => (
          <div key={m.id} className="rounded-2xl flex items-stretch overflow-hidden shadow-sm" style={{ background: t.card, border: `1px solid ${t.line}` }}>
            <button aria-label={ehFav(m.id) ? "Tirar dos favoritos" : "Favoritar"} aria-pressed={ehFav(m.id)} onClick={() => alternarFav(m.id)} className="w-12 flex items-center justify-center shrink-0" style={{ color: ehFav(m.id) ? "#E0A81F" : t.dim }}><Star size={20} fill={ehFav(m.id) ? "#E0A81F" : "none"} /></button>
            <button onClick={() => setAberta(m)} className="flex-1 text-left py-4 pr-3 min-h-[64px] focus:outline-none focus:ring-2">
              <p className="font-semibold" style={{ color: t.ink }}>{m.titulo}</p>
              <p className="text-xs mt-0.5" style={{ color: t.dim }}>
                {m.artista ? `${m.artista} · ` : ""}{m.tomIgreja ? `Tom ${m.tomIgreja}` : "Tom a definir"}{m.bpm ? ` · ${m.bpm} BPM` : ""}{m.cifra ? " · cifra" : ""}{m.youtubeUrl ? " · vídeo" : ""}
              </p>
            </button>
            {lider && (
              <div className="flex items-center gap-1 pr-2">
                <button aria-label="Editar" onClick={() => setForm(m.doRepertorio ? { ...AM_MUSICA_VAZIA, ...m, id: uid() } : { ...AM_MUSICA_VAZIA, ...m })} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.card2, color: t.ink }}><Pencil size={15} /></button>
                {!m.doRepertorio && <button aria-label="Excluir" onClick={() => excluir(m)} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.card2, color: "#D0473A" }}><Trash2 size={15} /></button>}
              </div>
            )}
          </div>
        ))}
      </div>
      {aberta && <AmCifra musica={aberta} onFechar={() => setAberta(null)} escuroInicial={escuro} />}
    </div>
  );
}

/* ---------- C) Gestão de escalas (líder) ---------- */
function AmEscalas({ t, dados, salvar }) {
  const hoje = new Date();
  const [mes, setMes] = useState({ a: hoje.getFullYear(), m: hoje.getMonth() });
  const [dia, setDia] = useState(null); // "AAAA-MM-DD"
  const [novo, setNovo] = useState({ tipo: "Culto", titulo: "", hora: "", local: "" });
  const [addMusico, setAddMusico] = useState({});
  const [vaga, setVaga] = useState({});
  const [substEv, setSubstEv] = useState(null);
  const eventos = dados.eventos || [];
  const iso = (d) => `${mes.a}-${String(mes.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const primeiro = new Date(mes.a, mes.m, 1).getDay();
  const nDias = new Date(mes.a, mes.m + 1, 0).getDate();
  const nomeMes = new Date(mes.a, mes.m, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const mudar = (delta) => { const d = new Date(mes.a, mes.m + delta, 1); setMes({ a: d.getFullYear(), m: d.getMonth() }); setDia(null); };
  const nomeDe = (id) => ((dados.acessos || []).find((a) => a.id === id) || {}).nome || "(removido)";
  const upd = (id, patch, base = dados) => ({ ...base, eventos: base.eventos.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const criar = () => {
    if (!dia) return;
    const titulo = novo.titulo.trim() || novo.tipo;
    salvar(amAud({ ...dados, eventos: [...eventos, { id: uid(), tipo: novo.tipo, titulo, data: dia, hora: novo.hora, local: novo.local.trim(), vagas: [], escalados: [], musicas: [] }] }, `Evento criado: ${titulo} (${fmtDate(dia)})`));
    setNovo({ tipo: "Culto", titulo: "", hora: "", local: "" });
  };
  const excluir = (ev) => salvar(amAud({ ...dados, eventos: eventos.filter((e) => e.id !== ev.id), disponibilidade: (dados.disponibilidade || []).filter((d) => d.eventoId !== ev.id), preparacao: (dados.preparacao || []).filter((p) => p.eventoId !== ev.id) }, `Evento excluído: ${ev.titulo} (${fmtDate(ev.data)})`));
  const escalar = (ev, musicoId, instrumento) => {
    const tit = ev.titulo || ev.tipo;
    let n = upd(ev.id, { escalados: [...(ev.escalados || []), { musicoId, instrumento }] });
    n = amNotif(n, musicoId, "escalado", `Você foi escalado em ${tit} (${fmtDate(ev.data)}) — ${instrumento || "instrumento a definir"}.`);
    salvar(amAud(n, `Escalado em ${tit} (${fmtDate(ev.data)}): ${nomeDe(musicoId)} — ${instrumento || "—"}`));
  };
  const tirar = (ev, musicoId) => {
    const tit = ev.titulo || ev.tipo;
    let n = upd(ev.id, { escalados: ev.escalados.filter((y) => y.musicoId !== musicoId) });
    n = amNotif(n, musicoId, "escala_alterada", `Sua escala em ${tit} (${fmtDate(ev.data)}) foi alterada: você saiu da escala.`);
    salvar(amAud(n, `Retirado da escala de ${tit} (${fmtDate(ev.data)}): ${nomeDe(musicoId)}`));
  };
  const addMusica = (ev, id) => {
    const m = (dados.acervo || []).find((y) => y.id === id);
    let n = upd(ev.id, { musicas: [...(ev.musicas || []), id] });
    n = amNotifVarios(n, (ev.escalados || []).map((x) => x.musicoId), "repertorio", `Novo repertório em ${ev.titulo || ev.tipo} (${fmtDate(ev.data)}): ${m ? m.titulo : "música adicionada"}.`);
    salvar(amAud(n, `Música adicionada a ${ev.titulo || ev.tipo} (${fmtDate(ev.data)}): ${m ? m.titulo : "—"}`));
  };
  const doDia = dia ? eventos.filter((e) => e.data === dia) : [];
  const ativos = (dados.acessos || []).filter((a) => a.ativo !== false);
  return (
    <div className="space-y-4">
      <p className="font-display text-xl font-bold" style={{ color: t.ink }}>Escalas</p>
      <AmCard t={t}>
        <div className="flex items-center justify-between">
          <button aria-label="Mês anterior" onClick={() => mudar(-1)} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.card2, color: t.ink }}><ChevronLeft size={18} /></button>
          <p className="font-display font-bold capitalize" style={{ color: t.ink }}>{nomeMes}</p>
          <button aria-label="Próximo mês" onClick={() => mudar(1)} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.card2, color: t.ink }}><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-3 text-center">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => <span key={i} className="text-[10px] font-bold" style={{ color: t.dim }}>{d}</span>)}
          {Array.from({ length: primeiro }).map((_, i) => <span key={"v" + i} />)}
          {Array.from({ length: nDias }).map((_, i) => {
            const d = i + 1; const k = iso(d); const n = eventos.filter((e) => e.data === k).length; const sel = dia === k;
            return (
              <button key={k} onClick={() => setDia(k)} className="aspect-square rounded-xl text-sm font-semibold flex flex-col items-center justify-center" style={{ background: sel ? t.accent : n ? t.card2 : "transparent", color: sel ? t.onAccent : t.ink, border: `1px solid ${t.line}` }}>
                {d}
                {n > 0 && <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: sel ? t.onAccent : t.accent }} />}
              </button>
            );
          })}
        </div>
      </AmCard>

      {!dia && <p className="text-sm" style={{ color: t.dim }}>Toque em um dia do calendário para ver ou criar eventos.</p>}
      {dia && (
        <AmCard t={t}>
          <p className="font-display font-bold" style={{ color: t.ink }}>Novo evento em {fmtDate(dia)}</p>
          <div className="grid sm:grid-cols-2 gap-2 mt-3">
            <AmSelect t={t} value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}>{AM_TIPOS_EVENTO.map((x) => <option key={x}>{x}</option>)}</AmSelect>
            <AmInput t={t} placeholder="Nome (ex: Culto de Domingo)" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} />
            <AmInput t={t} type="time" value={novo.hora} onChange={(e) => setNovo({ ...novo, hora: e.target.value })} />
            <AmInput t={t} placeholder="Local (opcional)" value={novo.local} onChange={(e) => setNovo({ ...novo, local: e.target.value })} />
          </div>
          <AmBotao t={t} className="mt-3" onClick={criar}><Plus size={16} /> Criar evento</AmBotao>
        </AmCard>
      )}

      {doDia.map((ev) => {
        const sel = addMusico[ev.id] || { musicoId: "", instrumento: "" };
        const vg = vaga[ev.id] || { instrumento: "", qtd: "1" };
        const livres = ativos.filter((a) => !(ev.escalados || []).some((x) => x.musicoId === a.id));
        const musLivres = (dados.acervo || []).filter((m) => !(ev.musicas || []).includes(m.id));
        return (
          <AmCard t={t} key={ev.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-bold text-lg" style={{ color: t.ink }}>{ev.titulo}</p>
                <p className="text-xs" style={{ color: t.dim }}>{ev.tipo} · {amDataHora(ev)}{ev.local ? ` · ${ev.local}` : ""}</p>
              </div>
              <button aria-label="Excluir evento" onClick={() => excluir(ev)} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.card2, color: "#D0473A" }}><Trash2 size={15} /></button>
            </div>

            <p className="text-xs font-bold uppercase tracking-wide mt-4" style={{ color: t.dim }}>Vagas por instrumento (opcional)</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(ev.vagas || []).length === 0 && <p className="text-xs" style={{ color: t.dim }}>Defina quantos músicos precisa de cada instrumento para o painel mostrar o que falta.</p>}
              {(ev.vagas || []).map((v, i) => {
                const n = (ev.escalados || []).filter((x) => amMesmoInstr(x.instrumento, v.instrumento)).length;
                return (
                  <span key={i} className="text-xs rounded-full pl-3 pr-1 py-1 inline-flex items-center gap-1 font-semibold" style={{ background: n < v.qtd ? "#B0342833" : t.card2, color: t.ink }}>
                    {v.instrumento} {n}/{v.qtd}
                    <button aria-label={`Tirar vaga ${v.instrumento}`} onClick={() => salvar(upd(ev.id, { vagas: ev.vagas.filter((_, j) => j !== i) }))} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ color: "#D0473A" }}><X size={13} /></button>
                  </span>
                );
              })}
            </div>
            <div className="grid grid-cols-[1fr_88px_auto] gap-2 mt-2">
              <AmInput t={t} placeholder="Instrumento (ex: Vocal)" value={vg.instrumento} onChange={(e) => setVaga({ ...vaga, [ev.id]: { ...vg, instrumento: e.target.value } })} />
              <AmInput t={t} type="number" min="1" inputMode="numeric" value={vg.qtd} onChange={(e) => setVaga({ ...vaga, [ev.id]: { ...vg, qtd: e.target.value } })} aria-label="Quantidade" />
              <AmBotao t={t} tom="suave" onClick={() => { const q = Math.max(1, parseInt(vg.qtd, 10) || 1); if (!vg.instrumento.trim()) return; salvar(upd(ev.id, { vagas: [...(ev.vagas || []), { instrumento: vg.instrumento.trim(), qtd: q }] })); setVaga({ ...vaga, [ev.id]: { instrumento: "", qtd: "1" } }); }}><Plus size={16} /></AmBotao>
            </div>

            <p className="text-xs font-bold uppercase tracking-wide mt-4" style={{ color: t.dim }}>Músicos</p>
            <div className="mt-2 space-y-1.5">
              {(ev.escalados || []).length === 0 && <p className="text-sm" style={{ color: t.dim }}>Ninguém escalado ainda.</p>}
              {(ev.escalados || []).map((x) => {
                const d = amDispDe(dados, x.musicoId, ev.id);
                return (
                  <div key={x.musicoId} className="rounded-xl px-3 py-2 flex items-center justify-between gap-2" style={{ background: t.card2 }}>
                    <span className="text-sm" style={{ color: t.ink }}>{AM_ROTULO[d.status].split(" ")[0]} <b>{x.instrumento || "—"}</b> · {nomeDe(x.musicoId)}{d.status === "nao" && d.motivo ? ` (${d.motivo})` : ""}</span>
                    <button aria-label="Tirar da escala" onClick={() => tirar(ev, x.musicoId)} className="w-11 h-11 flex items-center justify-center" style={{ color: "#D0473A" }}><X size={16} /></button>
                  </div>
                );
              })}
            </div>
            {(ev.escalados || []).length > 0 && <AmBotao t={t} tom="suave" className="mt-2 w-full" onClick={() => setSubstEv(substEv === ev.id ? null : ev.id)}>Encontrar substituto</AmBotao>}
            {substEv === ev.id && <div className="mt-2"><AmSubstituto t={t} dados={dados} salvar={salvar} ev={ev} onFechar={() => setSubstEv(null)} /></div>}
            {livres.length > 0 && (
              <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 mt-2">
                <AmSelect t={t} value={sel.musicoId} onChange={(e) => { const a = ativos.find((y) => y.id === e.target.value); setAddMusico({ ...addMusico, [ev.id]: { musicoId: e.target.value, instrumento: a ? a.instrumento || "" : "" } }); }}>
                  <option value="">Escolher músico...</option>
                  {livres.map((a) => { const d = amDispDe(dados, a.id, ev.id); return <option key={a.id} value={a.id}>{AM_ROTULO[d.status].split(" ")[0]} {a.nome}{a.instrumento ? ` (${a.instrumento})` : ""}</option>; })}
                </AmSelect>
                <AmInput t={t} placeholder="Instrumento neste evento" value={sel.instrumento} onChange={(e) => setAddMusico({ ...addMusico, [ev.id]: { ...sel, instrumento: e.target.value } })} />
                <AmBotao t={t} onClick={() => { if (!sel.musicoId) return; escalar(ev, sel.musicoId, sel.instrumento); setAddMusico({ ...addMusico, [ev.id]: { musicoId: "", instrumento: "" } }); }}><Plus size={16} /> Escalar</AmBotao>
              </div>
            )}
            {ativos.length === 0 && <p className="text-xs mt-2" style={{ color: t.dim }}>Cadastre os músicos na aba Equipe para poder escalar.</p>}

            <p className="text-xs font-bold uppercase tracking-wide mt-5" style={{ color: t.dim }}>Músicas do evento</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(ev.musicas || []).length === 0 && <p className="text-sm" style={{ color: t.dim }}>Nenhuma música escolhida.</p>}
              {(ev.musicas || []).map((id) => { const m = (dados.acervo || []).find((y) => y.id === id); return (
                <span key={id} className="text-xs rounded-full pl-3 pr-1 py-1 inline-flex items-center gap-1" style={{ background: t.card2, color: t.ink }}>
                  {m ? m.titulo : "(removida)"}{m && m.tomIgreja ? ` (${m.tomIgreja})` : ""}
                  <button aria-label="Tirar música" onClick={() => salvar(upd(ev.id, { musicas: ev.musicas.filter((y) => y !== id) }))} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ color: "#D0473A" }}><X size={13} /></button>
                </span>
              ); })}
            </div>
            {musLivres.length > 0 && (
              <div className="mt-2">
                <AmSelect t={t} value="" onChange={(e) => e.target.value && addMusica(ev, e.target.value)}>
                  <option value="">Adicionar música do acervo...</option>
                  {musLivres.map((m) => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                </AmSelect>
              </div>
            )}
          </AmCard>
        );
      })}
    </div>
  );
}

/* ---------- Equipe: o líder gera o código de acesso de cada músico ---------- */
function AmEquipe({ t, dados, salvar, musicosGrupo }) {
  const [f, setF] = useState({ nome: "", instrumento: "", email: "" });
  const [copiado, setCopiado] = useState("");
  const [msg, setMsg] = useState("");
  const acessos = dados.acessos || [];
  const criar = () => {
    if (!f.nome.trim()) return;
    let codigo = amGerarCodigo();
    while (acessos.some((a) => a.codigo === codigo)) codigo = amGerarCodigo();
    salvar(amAud({ ...dados, acessos: [...acessos, { id: uid(), nome: f.nome.trim(), instrumento: f.instrumento.trim(), email: f.email.trim(), codigo, senhaHash: "", ativo: true, criadoEm: new Date().toISOString() }] }, `Músico cadastrado: ${f.nome.trim()}`));
    setF({ nome: "", instrumento: "", email: "" });
  };
  const upd = (id, patch, acao) => salvar(amAud({ ...dados, acessos: acessos.map((a) => (a.id === id ? { ...a, ...patch } : a)) }, acao));
  const excluir = (a) => salvar(amAud({ ...dados, acessos: acessos.filter((x) => x.id !== a.id), eventos: (dados.eventos || []).map((e) => ({ ...e, escalados: (e.escalados || []).filter((x) => x.musicoId !== a.id) })), disponibilidade: (dados.disponibilidade || []).filter((d) => d.musicoId !== a.id), favoritos: (dados.favoritos || []).filter((x) => x.musicoId !== a.id), preparacao: (dados.preparacao || []).filter((x) => x.musicoId !== a.id) }, `Músico excluído: ${a.nome}`));
  const copiar = (c) => { try { navigator.clipboard.writeText(c); } catch (e) { /* sem área de transferência */ } setCopiado(c); };
  const convite = (a) => `Paz do Senhor, ${a.nome.split(" ")[0]}! Seu acesso ao Avivar Music: abra avivardoespirito.com.br, entre em Avivar Music > "Primeiro acesso" e use o código ${a.codigo} para criar sua senha.`;
  const importar = () => {
    const { novos, ignorados } = amImportarEquipe(dados, musicosGrupo);
    if (novos.length === 0) { setMsg(`Ninguém novo para importar.${ignorados.length ? ` Fora da equipe: ${ignorados.join(", ")}.` : ""}`); return; }
    salvar(amAud({ ...dados, acessos: [...acessos, ...novos], equipeImportada: true }, `Equipe importada do Grupo: ${novos.map((n) => n.nome).join(", ")}`));
    setMsg(`${novos.length} músico(s) importado(s).${ignorados.length ? ` Fora da equipe: ${ignorados.join(", ")}.` : ""}`);
  };
  return (
    <div className="space-y-4">
      <p className="font-display text-xl font-bold" style={{ color: t.ink }}>Equipe e códigos de acesso</p>
      <AmCard t={t}>
        <p className="font-display font-bold" style={{ color: t.ink }}>Montar equipe a partir do Grupo</p>
        <p className="text-xs mt-0.5" style={{ color: t.dim }}>Traz os músicos já cadastrados na aba Grupo e gera um código para cada um. Wládia e Marcos ficam de fora.</p>
        <AmBotao t={t} tom="suave" className="mt-3" onClick={importar}><Users size={16} /> Importar músicos do Grupo</AmBotao>
        {msg && <p className="text-xs mt-2" style={{ color: t.accent }}>{msg}</p>}
      </AmCard>
      <AmCard t={t}>
        <p className="font-display font-bold" style={{ color: t.ink }}>Novo músico</p>
        <p className="text-xs mt-0.5" style={{ color: t.dim }}>Ao salvar, o sistema gera um código único. Entregue o código ao músico: no primeiro acesso ele cria a própria senha.</p>
        <div className="grid sm:grid-cols-3 gap-2 mt-3">
          <AmInput t={t} placeholder="Nome" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
          <AmInput t={t} placeholder="Instrumento principal" value={f.instrumento} onChange={(e) => setF({ ...f, instrumento: e.target.value })} />
          <AmInput t={t} type="email" placeholder="E-mail (opcional)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </div>
        <AmBotao t={t} className="mt-3" onClick={criar}><KeyRound size={16} /> Gerar código de acesso</AmBotao>
      </AmCard>
      {acessos.length === 0 && <AmVazio t={t}>Nenhum músico com acesso ainda.</AmVazio>}
      {acessos.map((a) => (
        <AmCard t={t} key={a.id}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold" style={{ color: t.ink }}>{a.nome}</p>
              <p className="text-xs" style={{ color: t.dim }}>{a.instrumento || "Instrumento a definir"}{a.email ? ` · ${a.email}` : ""}</p>
              <p className="font-mono text-lg font-bold mt-1" style={{ color: t.accent }}>{a.codigo}</p>
              <p className="text-xs" style={{ color: t.dim }}>{a.ativo === false ? "Acesso desativado" : a.senhaHash ? "Senha já cadastrada" : "Aguardando o primeiro acesso"}</p>
            </div>
            <button aria-label="Excluir músico" onClick={() => excluir(a)} className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.card2, color: "#D0473A" }}><Trash2 size={15} /></button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <AmBotao t={t} tom="suave" onClick={() => copiar(a.codigo)}><Copy size={15} /> {copiado === a.codigo ? "Copiado!" : "Copiar código"}</AmBotao>
            <a href={`https://wa.me/?text=${encodeURIComponent(convite(a))}`} target="_blank" rel="noopener noreferrer" className="min-h-[48px] px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2" style={{ background: t.card2, color: t.ink }}><MessageCircle size={15} /> Enviar convite</a>
            {a.senhaHash && <AmBotao t={t} tom="suave" onClick={() => upd(a.id, { senhaHash: "" }, `Senha zerada: ${a.nome}`)}>Zerar senha</AmBotao>}
            <AmBotao t={t} tom="suave" onClick={() => upd(a.id, { ativo: a.ativo === false }, `${a.ativo === false ? "Código reativado" : "Código desativado"}: ${a.nome}`)}>{a.ativo === false ? "Reativar" : "Desativar"}</AmBotao>
          </div>
        </AmCard>
      ))}
    </div>
  );
}

/* ---------- D) Patrimônio (líder) ---------- */
const AM_PAT_VAZIO = { nome: "", numero: "", local: "", aquisicao: "", status: "Operacional", obs: "" };
function AmPatrimonio({ t, dados, salvar }) {
  const [f, setF] = useState(AM_PAT_VAZIO);
  const [edit, setEdit] = useState(null);
  const [manut, setManut] = useState({});
  const itens = dados.patrimonio || [];
  const cor = (s) => (s === "Operacional" ? "#2E7D4F" : s === "Defeito" ? "#B03428" : "#B7791F");
  const bolinha = (s) => (s === "Operacional" ? "🟢" : s === "Defeito" ? "🔴" : "🟡");
  const criar = () => { if (!f.nome.trim()) return; salvar(amAud({ ...dados, patrimonio: [...itens, { id: uid(), ...f, nome: f.nome.trim(), manutencoes: [] }] }, `Patrimônio cadastrado: ${f.nome.trim()}`)); setF(AM_PAT_VAZIO); };
  const upd = (i, patch, acao) => salvar(amAud({ ...dados, patrimonio: itens.map((x) => (x.id === i.id ? { ...x, ...patch } : x)) }, acao || `Patrimônio alterado: ${i.nome}`));
  return (
    <div className="space-y-4">
      <p className="font-display text-xl font-bold" style={{ color: t.ink }}>Patrimônio</p>
      <AmCard t={t}>
        <p className="font-display font-bold" style={{ color: t.ink }}>Novo item</p>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <AmInput t={t} placeholder="Item (ex: Bateria, Violão, Cabos)" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
          <AmInput t={t} placeholder="Nº patrimonial (opcional)" value={f.numero} onChange={(e) => setF({ ...f, numero: e.target.value })} />
          <AmInput t={t} placeholder="Localização (ex: Sala de instrumentos)" value={f.local} onChange={(e) => setF({ ...f, local: e.target.value })} />
          <AmInput t={t} type="date" aria-label="Data de aquisição" value={f.aquisicao} onChange={(e) => setF({ ...f, aquisicao: e.target.value })} />
          <AmSelect t={t} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{AM_STATUS_PATRIMONIO.map((s) => <option key={s}>{s}</option>)}</AmSelect>
          <AmInput t={t} placeholder="Observações (opcional)" value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} />
        </div>
        <AmBotao t={t} className="mt-3" onClick={criar}><Plus size={16} /> Adicionar</AmBotao>
      </AmCard>
      {itens.length === 0 && <AmVazio t={t}>Nenhum equipamento cadastrado.</AmVazio>}
      {itens.map((i) => {
        const mn = manut[i.id] || { data: "", texto: "" };
        return (
          <AmCard t={t} key={i.id}>
            {edit && edit.id === i.id ? (
              <div className="space-y-2">
                <AmInput t={t} value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} />
                <AmInput t={t} placeholder="Nº patrimonial" value={edit.numero} onChange={(e) => setEdit({ ...edit, numero: e.target.value })} />
                <AmInput t={t} placeholder="Localização" value={edit.local} onChange={(e) => setEdit({ ...edit, local: e.target.value })} />
                <AmInput t={t} type="date" aria-label="Data de aquisição" value={edit.aquisicao} onChange={(e) => setEdit({ ...edit, aquisicao: e.target.value })} />
                <AmInput t={t} placeholder="Observações" value={edit.obs} onChange={(e) => setEdit({ ...edit, obs: e.target.value })} />
                <div className="flex gap-2">
                  <AmBotao t={t} onClick={() => { upd(i, { nome: edit.nome.trim() || i.nome, numero: edit.numero, local: edit.local, aquisicao: edit.aquisicao, obs: edit.obs }); setEdit(null); }}><Save size={16} /> Salvar</AmBotao>
                  <AmBotao t={t} tom="suave" onClick={() => setEdit(null)}>Cancelar</AmBotao>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold" style={{ color: t.ink }}>{i.nome}{i.numero ? <span className="font-mono text-xs ml-2" style={{ color: t.dim }}>Nº {i.numero}</span> : null}</p>
                    <p className="text-xs mt-0.5" style={{ color: t.dim }}>{[i.local, i.aquisicao ? `adquirido em ${fmtDate(i.aquisicao)}` : ""].filter(Boolean).join(" · ") || "Localização a definir"}</p>
                    {i.obs && <p className="text-xs mt-0.5" style={{ color: t.dim }}>{i.obs}</p>}
                    <span className="inline-block mt-2 text-xs font-bold rounded-full px-3 py-1 text-white" style={{ background: cor(i.status) }}>{bolinha(i.status)} {i.status}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button aria-label="Editar" onClick={() => setEdit({ id: i.id, nome: i.nome, numero: i.numero || "", local: i.local || "", aquisicao: i.aquisicao || "", obs: i.obs || "" })} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.card2, color: t.ink }}><Pencil size={15} /></button>
                    <button aria-label="Excluir" onClick={() => salvar(amAud({ ...dados, patrimonio: itens.filter((x) => x.id !== i.id) }, `Patrimônio excluído: ${i.nome}`))} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.card2, color: "#D0473A" }}><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {AM_STATUS_PATRIMONIO.map((s) => (
                    <button key={s} onClick={() => upd(i, { status: s }, `Patrimônio ${i.nome}: status → ${s}`)} className="min-h-[44px] rounded-xl text-xs font-semibold px-1" style={{ background: i.status === s ? cor(s) : t.card2, color: i.status === s ? "#fff" : t.ink }}>{s}</button>
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-wide mt-4" style={{ color: t.dim }}>Histórico de manutenção</p>
                <div className="mt-1 space-y-1">
                  {(i.manutencoes || []).length === 0 && <p className="text-xs" style={{ color: t.dim }}>Nenhuma manutenção registrada.</p>}
                  {(i.manutencoes || []).map((m) => (
                    <div key={m.id} className="rounded-xl px-3 py-2 flex items-center justify-between gap-2" style={{ background: t.card2 }}>
                      <span className="text-sm" style={{ color: t.ink }}><span className="font-mono text-xs" style={{ color: t.dim }}>{fmtDate(m.data)}</span> · {m.texto}</span>
                      <button aria-label="Apagar registro" onClick={() => upd(i, { manutencoes: i.manutencoes.filter((x) => x.id !== m.id) }, `Manutenção apagada de ${i.nome}`)} className="w-9 h-9 flex items-center justify-center shrink-0" style={{ color: "#D0473A" }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-[130px_1fr_auto] gap-2 mt-2">
                  <AmInput t={t} type="date" aria-label="Data da manutenção" value={mn.data} onChange={(e) => setManut({ ...manut, [i.id]: { ...mn, data: e.target.value } })} />
                  <AmInput t={t} placeholder="O que foi feito" value={mn.texto} onChange={(e) => setManut({ ...manut, [i.id]: { ...mn, texto: e.target.value } })} />
                  <AmBotao t={t} tom="suave" onClick={() => { if (!mn.texto.trim()) return; upd(i, { manutencoes: [...(i.manutencoes || []), { id: uid(), data: mn.data || new Date().toISOString().slice(0, 10), texto: mn.texto.trim() }] }, `Manutenção registrada em ${i.nome}`); setManut({ ...manut, [i.id]: { data: "", texto: "" } }); }}><Plus size={16} /></AmBotao>
                </div>
              </>
            )}
          </AmCard>
        );
      })}
    </div>
  );
}

/* ---------- Histórico ---------- */
function AmHistorico({ t, dados, musico, lider }) {
  const passados = amEventosPassados(dados.eventos);
  const nomeDe = (id) => ((dados.acessos || []).find((a) => a.id === id) || {}).nome || "(removido)";
  if (!musico) {
    return (
      <div className="space-y-4">
        <p className="font-display text-xl font-bold" style={{ color: t.ink }}>Histórico da equipe</p>
        {passados.length === 0 && <AmVazio t={t}>Ainda não há eventos passados.</AmVazio>}
        {passados.map((ev) => (
          <AmCard t={t} key={ev.id}>
            <p className="font-semibold" style={{ color: t.ink }}>{ev.titulo || ev.tipo} <span className="text-xs font-normal" style={{ color: t.dim }}>· {ev.tipo} · {amDataHora(ev)}</span></p>
            <p className="text-sm mt-1" style={{ color: t.ink }}>{(ev.escalados || []).length === 0 ? "Sem músicos escalados." : (ev.escalados || []).map((x) => `${nomeDe(x.musicoId)} (${x.instrumento || "—"})`).join(", ")}</p>
            {(ev.musicas || []).length > 0 && <p className="text-xs mt-1" style={{ color: t.dim }}>Repertório: {(ev.musicas || []).map((id) => ((dados.acervo || []).find((m) => m.id === id) || {}).titulo || "(removida)").join(" · ")}</p>}
          </AmCard>
        ))}
        <AmCard t={t}>
          <p className="font-display font-bold" style={{ color: t.ink }}>Registro de alterações</p>
          <p className="text-xs" style={{ color: t.dim }}>O que a liderança mudou no app (últimas 40 ações).</p>
          <div className="mt-2 space-y-1">
            {(dados.auditoria || []).length === 0 && <p className="text-sm" style={{ color: t.dim }}>Nenhuma alteração registrada ainda.</p>}
            {(dados.auditoria || []).slice(0, 40).map((a) => <p key={a.id} className="text-xs rounded-lg px-3 py-2" style={{ background: t.card2, color: t.ink }}><span style={{ color: t.dim }}>{fmtDateTime(a.em)}</span> · {a.acao}</p>)}
          </div>
        </AmCard>
      </div>
    );
  }
  const meus = passados.filter((e) => (e.escalados || []).some((x) => x.musicoId === musico.id));
  return (
    <div className="space-y-4">
      <p className="font-display text-xl font-bold" style={{ color: t.ink }}>Meu histórico</p>
      {meus.length === 0 && <AmVazio t={t}>Você ainda não possui nenhuma escala no histórico.</AmVazio>}
      {meus.map((ev) => (
        <AmCard t={t} key={ev.id}>
          <p className="font-semibold" style={{ color: t.ink }}>{ev.titulo || ev.tipo}</p>
          <p className="text-xs" style={{ color: t.dim }}>{amDataHora(ev)} · {ev.tipo} · {(ev.escalados.find((x) => x.musicoId === musico.id) || {}).instrumento || "instrumento a definir"}</p>
        </AmCard>
      ))}
    </div>
  );
}

/* ---------- E) Estúdio: afinador (microfone real + tons de referência) + metrônomo ---------- */
const AM_NOTAS = [["E2", 82.41, "Mi (6ª)"], ["A2", 110.0, "Lá (5ª)"], ["D3", 146.83, "Ré (4ª)"], ["G3", 196.0, "Sol (3ª)"], ["B3", 246.94, "Si (2ª)"], ["E4", 329.63, "Mi (1ª)"], ["A4", 440.0, "Lá 440"]];
const AM_NOMES_NOTA = ["Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá", "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si"];
function amNotaDaFreq(f) {
  const n = 12 * Math.log2(f / 440) + 69; const r = Math.round(n);
  return { nome: AM_NOMES_NOTA[((r % 12) + 12) % 12], oitava: Math.floor(r / 12) - 1, cents: Math.round((n - r) * 100) };
}
// Detecção de altura por autocorrelação: devolve a frequência em Hz, ou -1 se não houver som claro.
function amDetectarFrequencia(buf, sr) {
  const n = buf.length; let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < 0.01) return -1;
  const minLag = Math.floor(sr / 1000); const maxLag = Math.min(Math.floor(sr / 60), Math.floor(n / 2));
  const corr = new Float32Array(maxLag + 2); let max = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0; for (let i = 0; i < n - lag; i++) s += buf[i] * buf[i + lag];
    corr[lag] = s; if (s > max) max = s;
  }
  if (max <= 0) return -1;
  let melhor = -1;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (corr[lag] >= 0.9 * max && corr[lag] >= corr[lag - 1] && corr[lag] >= corr[lag + 1]) { melhor = lag; break; }
  }
  if (melhor < 0) return -1;
  const a = corr[melhor - 1]; const b = corr[melhor]; const c = corr[melhor + 1];
  const den = a - 2 * b + c; const delta = den !== 0 ? (0.5 * (a - c)) / den : 0;
  return sr / (melhor + delta);
}
function AmAfinador({ t }) {
  const [tocando, setTocando] = useState(null);
  const [ouvindo, setOuvindo] = useState(false);
  const [leitura, setLeitura] = useState(null); // { nome, oitava, cents, freq }
  const [erro, setErro] = useState("");
  const ctxRef = useRef(null); const oscRef = useRef(null);
  const micRef = useRef({ stream: null, ctx: null, id: null });
  const parar = () => { try { oscRef.current && oscRef.current.stop(); } catch (e) { /* já parado */ } oscRef.current = null; setTocando(null); };
  const tocar = (nome, freq) => {
    if (tocando === nome) { parar(); return; }
    pararMic(); parar();
    try {
      ctxRef.current = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current; const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq; g.gain.value = 0.2;
      osc.connect(g); g.connect(ctx.destination); osc.start();
      oscRef.current = osc; setTocando(nome);
    } catch (e) { /* navegador sem áudio */ }
  };
  function pararMic() {
    const m = micRef.current;
    if (m.id) clearInterval(m.id);
    try { m.stream && m.stream.getTracks().forEach((x) => x.stop()); } catch (e) { /* ok */ }
    try { m.ctx && m.ctx.close(); } catch (e) { /* ok */ }
    micRef.current = { stream: null, ctx: null, id: null };
    setOuvindo(false); setLeitura(null);
  }
  const ligarMic = async () => {
    setErro(""); parar();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const an = ctx.createAnalyser(); an.fftSize = 4096;
      ctx.createMediaStreamSource(stream).connect(an); // só analisa — nunca toca no alto-falante
      const buf = new Float32Array(an.fftSize); const recentes = [];
      const id = setInterval(() => {
        an.getFloatTimeDomainData(buf);
        const f = amDetectarFrequencia(buf, ctx.sampleRate);
        if (f < 0) { recentes.length = 0; setLeitura(null); return; }
        recentes.push(f); if (recentes.length > 4) recentes.shift();
        const media = recentes.reduce((x, y) => x + y, 0) / recentes.length;
        setLeitura({ ...amNotaDaFreq(media), freq: media });
      }, 120);
      micRef.current = { stream, ctx, id };
      setOuvindo(true);
    } catch (e) {
      setErro("Não foi possível usar o microfone. Permita o acesso nas configurações do navegador e tente de novo.");
    }
  };
  useEffect(() => () => { pararMic(); try { oscRef.current && oscRef.current.stop(); } catch (e) { /* ok */ } }, []);
  const c = leitura ? leitura.cents : 0;
  const afinado = leitura && Math.abs(c) <= 5;
  const cor = !leitura ? t.line : afinado ? "#2E7D4F" : Math.abs(c) <= 20 ? "#B7791F" : "#B03428";
  return (
    <AmCard t={t}>
      <p className="font-display font-bold" style={{ color: t.ink }}>Afinador</p>
      <p className="text-xs mt-0.5" style={{ color: t.dim }}>Toque o instrumento perto do aparelho: o afinador escuta pelo microfone e mostra a nota. Se preferir, ouça um tom de referência.</p>
      <div className="mt-4 mx-auto w-44 h-44 rounded-full flex flex-col items-center justify-center" style={{ border: `6px solid ${ouvindo ? cor : tocando ? t.accent : t.line}`, background: t.card2 }}>
        {ouvindo ? (
          leitura ? (<><p className="font-mono text-4xl font-bold" style={{ color: t.accent }}>{leitura.nome}<span className="text-lg">{leitura.oitava}</span></p><p className="text-xs mt-1" style={{ color: t.dim }}>{leitura.freq.toFixed(1)} Hz</p></>) : <p className="text-sm text-center px-4" style={{ color: t.dim }}>Toque uma corda...</p>
        ) : (<><p className="font-mono text-4xl font-bold" style={{ color: t.accent }}>{tocando || "—"}</p><p className="text-xs mt-1" style={{ color: t.dim }}>{tocando ? `${AM_NOTAS.find((n) => n[0] === tocando)[1]} Hz` : "em silêncio"}</p></>)}
      </div>
      {ouvindo && (
        <div className="mt-4" aria-live="polite">
          <div className="relative h-3 rounded-full" style={{ background: t.card2 }}>
            <span className="absolute top-[-4px] bottom-[-4px] left-1/2 w-0.5" style={{ background: t.dim }} />
            {leitura && <span className="absolute top-[-5px] w-5 h-5 rounded-full -translate-x-1/2 transition-all" style={{ left: `${50 + Math.max(-50, Math.min(50, c)) * 0.9}%`, background: cor }} />}
          </div>
          <div className="flex justify-between text-[10px] mt-1" style={{ color: t.dim }}><span>♭ grave</span><span>afinado</span><span>agudo ♯</span></div>
          <p className="text-center text-sm font-semibold mt-2" style={{ color: leitura ? cor : t.dim }}>{!leitura ? "Aguardando som..." : afinado ? "Afinado ✓" : c < 0 ? `Abaixo (${c} cents) — aperte a corda` : `Acima (+${c} cents) — afrouxe a corda`}</p>
        </div>
      )}
      {erro && <p className="text-xs mt-3" style={{ color: "#D0473A" }}>{erro}</p>}
      <AmBotao t={t} className="w-full mt-4" tom={ouvindo ? "suave" : "cheio"} onClick={ouvindo ? pararMic : ligarMic}><Mic size={16} /> {ouvindo ? "Parar de ouvir" : "Ouvir pelo microfone"}</AmBotao>
      <p className="text-xs font-bold uppercase tracking-wide mt-5" style={{ color: t.dim }}>Tons de referência</p>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {AM_NOTAS.map(([n, f, r]) => (
          <button key={n} onClick={() => tocar(n, f)} className="min-h-[56px] rounded-xl flex flex-col items-center justify-center" style={{ background: tocando === n ? t.accent : t.card2, color: tocando === n ? t.onAccent : t.ink }}>
            <span className="font-mono font-bold">{n}</span><span className="text-[10px]">{r}</span>
          </button>
        ))}
      </div>
    </AmCard>
  );
}
function AmMetronomo({ t }) {
  const [bpm, setBpm] = useState(96);
  const [vol, setVol] = useState(60);
  const [tocando, setTocando] = useState(false);
  const [batida, setBatida] = useState(-1);
  const ctxRef = useRef(null); const volRef = useRef(60); const toquesRef = useRef([]);
  volRef.current = vol;
  useEffect(() => {
    if (!tocando) { setBatida(-1); return undefined; }
    let b = -1;
    const tick = () => {
      b = (b + 1) % 4; setBatida(b);
      try {
        ctxRef.current = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
        const ctx = ctxRef.current; const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.frequency.value = b === 0 ? 1200 : 880;
        const pico = Math.max(0.001, (volRef.current / 100) * 0.4);
        g.gain.setValueAtTime(pico, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.08);
      } catch (e) { /* só visual */ }
    };
    tick();
    const id = setInterval(tick, 60000 / bpm);
    return () => clearInterval(id);
  }, [tocando, bpm]);
  // Tap tempo: média dos últimos toques; zera se passar de 2 s sem tocar.
  const tap = () => {
    const agora = Date.now(); let l = toquesRef.current;
    if (l.length && agora - l[l.length - 1] > 2000) l = [];
    l = [...l, agora].slice(-6); toquesRef.current = l;
    if (l.length >= 2) { const media = (l[l.length - 1] - l[0]) / (l.length - 1); setBpm(Math.max(40, Math.min(220, Math.round(60000 / media)))); }
  };
  return (
    <AmCard t={t}>
      <p className="font-display font-bold" style={{ color: t.ink }}>Metrônomo</p>
      <p className="text-center font-mono text-6xl font-bold tabular-nums mt-3" style={{ color: t.accent }}>{bpm}</p>
      <p className="text-center text-xs" style={{ color: t.dim }}>BPM</p>
      <input aria-label="BPM" type="range" min="40" max="220" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full mt-3" />
      <div className="flex items-center justify-center gap-3 mt-3">
        <button aria-label="Menos 1 BPM" onClick={() => setBpm((v) => Math.max(40, v - 1))} className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: t.card2, color: t.ink }}><Minus size={20} /></button>
        <button aria-label={tocando ? "Pausar" : "Tocar"} onClick={() => setTocando((v) => !v)} className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: t.accent, color: t.onAccent }}>{tocando ? <Pause size={30} /> : <Play size={30} />}</button>
        <button aria-label="Mais 1 BPM" onClick={() => setBpm((v) => Math.min(220, v + 1))} className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: t.card2, color: t.ink }}><Plus size={20} /></button>
      </div>
      <div className="flex justify-center gap-3 mt-4">
        {[0, 1, 2, 3].map((i) => <span key={i} className="w-5 h-5 rounded-full transition" style={{ background: batida === i ? t.accent : t.card2, transform: batida === i ? "scale(1.35)" : "scale(1)" }} />)}
      </div>
      <AmBotao t={t} tom="suave" className="w-full mt-4" onClick={tap}>TAP TEMPO — toque no ritmo</AmBotao>
      <div className="mt-4">
        <p className="text-xs font-semibold" style={{ color: t.dim }}>Volume do clique: {vol}%</p>
        <input aria-label="Volume do metrônomo" type="range" min="0" max="100" value={vol} onChange={(e) => setVol(Number(e.target.value))} className="w-full mt-1" />
      </div>
    </AmCard>
  );
}

/* ---------- Ícones musicais ao redor do app (só telas grandes) ---------- */
function AmDecoracao({ t }) {
  const itens = [
    [Music, "2%", "9%", 54, -12], [Music3, "9%", "20%", 40, 14], [Mic, "3%", "33%", 48, -8], [Music2, "10%", "46%", 44, 10],
    [Headphones, "2%", "60%", 56, -10], [Music4, "9%", "73%", 42, 12], [Music, "3%", "86%", 46, -14],
    [Music2, "93%", "8%", 50, 12], [Mic, "86%", "21%", 42, -10], [Music, "94%", "34%", 56, 8], [Headphones, "87%", "47%", 46, -12],
    [Music3, "93%", "61%", 44, 10], [Music4, "86%", "74%", 52, -8], [Music2, "94%", "87%", 42, 14],
  ];
  return (
    <div aria-hidden="true" className="hidden xl:block fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {itens.map(([Ic, x, y, s, r], i) => (
        <span key={i} className="absolute" style={{ left: x, top: y, transform: `rotate(${r}deg)`, color: t.accent, opacity: 0.14 }}><Ic size={s} strokeWidth={1.6} /></span>
      ))}
    </div>
  );
}

/* ---------- Casca do mini-app ---------- */
function PaginaAvivarMusic({ repertorio, saveRepertorio, musicos, saveMusicos, albuns, saveAlbuns, adminMode, operatorMode, onRequestOperator, onVoltar, musicApp, saveMusicApp, tentarCodigoLider }) {
  const dados = { ...DEFAULT_MUSICAPP, ...(musicApp || {}) };
  const lider = adminMode || operatorMode;
  const [escuro, setEscuro] = useState(false);
  const [tela, setTela] = useState("inicio");
  const [culto, setCulto] = useState(null);
  const [sessaoId, setSessaoId] = useState(() => { try { return sessionStorage.getItem("am-sessao") || ""; } catch (e) { return ""; } });
  const entrar = (id) => { setSessaoId(id); try { sessionStorage.setItem("am-sessao", id); } catch (e) { /* sem storage */ } };
  const sair = () => { setSessaoId(""); setTela("inicio"); try { sessionStorage.removeItem("am-sessao"); } catch (e) { /* sem storage */ } };
  const musico = (dados.acessos || []).find((a) => a.id === sessaoId && a.ativo !== false) || null;
  const logado = lider || !!musico;
  const t = amTema(escuro);
  // Monta a equipe sozinho na primeira vez que o líder abre o app (uma vez só): traz os músicos
  // do Grupo, gera o código de cada um e deixa Wládia e Marcos de fora.
  useEffect(() => {
    if (!lider || dados.equipeImportada || !musicos || musicos.length === 0) return;
    const { novos } = amImportarEquipe(dados, musicos);
    saveMusicApp(amAud({ ...dados, acessos: [...(dados.acessos || []), ...novos], equipeImportada: true }, novos.length ? `Equipe montada a partir do Grupo: ${novos.map((n) => n.nome).join(", ")}` : "Equipe verificada (nada a importar)"));
  }, [lider, dados.equipeImportada, musicos]);
  const abas = musico && !lider
    ? [{ k: "inicio", r: "Início", i: HomeIcon }, { k: "escala", r: "Escala", i: Calendar }, { k: "acervo", r: "Acervo", i: Library }, { k: "estudio", r: "Estúdio", i: Settings2 }, { k: "historico", r: "Histórico", i: History }, { k: "grupo", r: "Grupo", i: Music }]
    : [{ k: "inicio", r: "Painel", i: HomeIcon }, { k: "escalas", r: "Escalas", i: Calendar }, { k: "equipe", r: "Equipe", i: Users }, { k: "acervo", r: "Acervo", i: Library }, { k: "patrimonio", r: "Patrimônio", i: Package }, { k: "estudio", r: "Estúdio", i: Settings2 }, { k: "historico", r: "Histórico", i: History }, { k: "grupo", r: "Grupo", i: Music }];
  const abrirCulto = (ev) => setCulto(ev);
  const musicasCulto = culto ? (culto.musicas || []).map((id) => (dados.acervo || []).find((m) => m.id === id)).filter(Boolean) : [];
  const userKey = musico ? musico.id : "lider";
  return (
    <div className="min-h-screen font-body pb-10 relative" style={{ background: t.bg, color: t.ink }}>
      <AmDecoracao t={t} />
      <div className="sticky top-0 z-40">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-8 py-2.5" style={{ background: "#4A1270" }}>
          <button onClick={onVoltar} className="min-h-[44px] flex items-center gap-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 rounded-md"><ArrowLeft size={16} /> Voltar ao site</button>
          <div className="flex items-center gap-2">
            <Music size={17} color="#E8C875" />
            <span className="font-display text-sm font-bold text-white hidden sm:inline">Avivar Music</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setEscuro((v) => !v)} className="min-h-[44px] px-3 rounded-xl text-xs font-semibold text-white bg-white/15">{escuro ? "Claro" : "Escuro"}</button>
            {musico && !lider && <button aria-label="Sair" onClick={sair} className="w-11 h-11 rounded-xl flex items-center justify-center text-white bg-white/15"><LogOut size={16} /></button>}
          </div>
        </div>
        {logado && (
          <nav className="flex gap-1.5 overflow-x-auto px-3 py-2 lg:justify-center" style={{ background: t.card, borderBottom: `1px solid ${t.line}` }} aria-label="Menu do Avivar Music">
            {abas.map((a) => (
              <button key={a.k} onClick={() => setTela(a.k)} aria-current={tela === a.k ? "page" : undefined} className="shrink-0 min-h-[44px] px-3.5 rounded-full inline-flex items-center gap-1.5 text-xs font-semibold focus:outline-none focus:ring-2" style={{ background: tela === a.k ? t.accent : t.card2, color: tela === a.k ? t.onAccent : t.ink }}>
                <a.i size={16} />{a.r}
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className="relative" style={{ zIndex: 10 }}>
        {!logado ? (
          <AmLogin t={t} dados={dados} salvar={saveMusicApp} onEntrar={entrar} tentarCodigoLider={tentarCodigoLider} />
        ) : (
          <div className="mx-auto max-w-3xl px-4 sm:px-8 pt-6">
            {tela === "inicio" && <AmDashboard t={t} dados={dados} salvar={saveMusicApp} musico={musico && !lider ? musico : null} lider={lider} irPara={setTela} abrirCulto={abrirCulto} />}
            {tela === "escala" && musico && <AmEscalaMusico t={t} dados={dados} salvar={saveMusicApp} musico={musico} abrirCulto={abrirCulto} />}
            {tela === "acervo" && <AmAcervo t={t} dados={dados} salvar={saveMusicApp} lider={lider} repertorio={repertorio} escuro={escuro} userKey={userKey} />}
            {tela === "escalas" && lider && <AmEscalas t={t} dados={dados} salvar={saveMusicApp} />}
            {tela === "equipe" && lider && <AmEquipe t={t} dados={dados} salvar={saveMusicApp} musicosGrupo={musicos} />}
            {tela === "patrimonio" && lider && <AmPatrimonio t={t} dados={dados} salvar={saveMusicApp} />}
            {tela === "estudio" && <div className="space-y-4"><p className="font-display text-xl font-bold" style={{ color: t.ink }}>Estúdio</p><AmAfinador t={t} /><AmMetronomo t={t} /></div>}
            {tela === "historico" && <AmHistorico t={t} dados={dados} musico={musico && !lider ? musico : null} lider={lider} />}
            {tela === "grupo" && (
              <div className="rounded-2xl overflow-hidden -mx-4 sm:mx-0" style={{ background: C.parchment, color: C.ink }}>
                <AvivarMusic repertorio={repertorio} saveRepertorio={saveRepertorio} musicos={musicos} saveMusicos={saveMusicos} albuns={albuns} saveAlbuns={saveAlbuns} adminMode={adminMode} operatorMode={operatorMode} onRequestOperator={onRequestOperator} />
              </div>
            )}
          </div>
        )}
      </div>
      {culto && musicasCulto.length > 0 && <AmModoCulto evento={culto} musicas={musicasCulto} onSair={() => setCulto(null)} />}
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
    // Avivar News TV e Avivar Music não são mais seções da rolagem única —
    // abrem como página cheia própria (mesmo padrão da Unidade Avivar/Cursos).
    if (key === "aovivo") { setPaginaAvivarNewsTVOpen(true); return; }
    if (key === "avivarmusic") { setPaginaAvivarMusicOpen(true); return; }
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
  // Avivar News TV e Avivar Music ganharam o mesmo padrão de página cheia sem
  // rolagem — a dobra inicial (player/dashboard) cabe na tela sem precisar
  // descer, o resto (biblioteca de vídeos, repertório, admin) fica abaixo.
  const [paginaAvivarNewsTVOpen, setPaginaAvivarNewsTVOpen] = useState(false);
  const [paginaAvivarMusicOpen, setPaginaAvivarMusicOpen] = useState(false);
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
  const [avivarKids, setAvivarKids] = useState([]);
  const [lideranca, setLideranca] = useState(DEFAULT_LIDERANCA);
  const [visitantesDoDia, setVisitantesDoDia] = useState(DEFAULT_VISITANTES_DIA);
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
  const [musicApp, setMusicApp] = useState(DEFAULT_MUSICAPP);
  const [escala, setEscala] = useState(DEFAULT_ESCALA_OBREIROS);
  const [biblioteca, setBiblioteca] = useState([]);
  const [manchete, setManchete] = useState(DEFAULT_MANCHETE);
  const [pedidosOracao, setPedidosOracao] = useState([]);
  const [pedidosFisicos, setPedidosFisicos] = useState([]);
  const [oracaoLocalDia, setOracaoLocalDia] = useState({ fotoUrl: "", local: "" });
  // Radar de Intercessão (Avivar News TV) — feed público de pedidos curtos,
  // propositalmente separado do Pedido de Oração privado (que guarda contato).
  const [intercessao, setIntercessao] = useState([]);
  // Células Avivar (Alfa/Beta/Gama) — substituiu a seção "Sobre nós" na Home.
  const [celulas, setCelulas] = useState(DEFAULT_CELULAS);
  const [paginaCelulaKey, setPaginaCelulaKey] = useState(null);
  // "Nossa História" — aberta ao clicar no nome/logo do Ministério no Hero.
  const [historia, setHistoria] = useState(DEFAULT_HISTORIA);
  const [paginaHistoriaOpen, setPaginaHistoriaOpen] = useState(false);
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
    (avivarKids || []).forEach((k) => {
      if (k.fotoUrl) photos.push({ url: k.fotoUrl, label: k.nome, target: "colaboradores" });
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
  }, [galeria, colaboradores, avivarKids, oracaoEncontros, eventos, loja, igrejas, avivarNews, albuns, biblioteca]);

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
      setAvivarKids(await loadKey("avivar:avivarkids", []));
      setLideranca(await loadKey("avivar:lideranca", DEFAULT_LIDERANCA));
      setVisitantesDoDia(await loadKey("avivar:visitantesdodia", DEFAULT_VISITANTES_DIA));
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
      setMusicApp(await loadKey("avivar:musicapp", DEFAULT_MUSICAPP));
      setEscala(await loadKey("avivar:escalaObreiros", DEFAULT_ESCALA_OBREIROS));
      setManchete(await loadKey("avivar:manchete", DEFAULT_MANCHETE));
      setPedidosOracao(await loadKey("avivar:pedidosOracao", []));
      setPedidosFisicos(await loadKey("avivar:pedidosfisicos", []));
      setOracaoLocalDia(await loadKey("avivar:oracaolocaldia", { fotoUrl: "", local: "" }));
      setBiblioteca(await loadKey("avivar:biblioteca", []));
      setIntercessao(await loadKey("avivar:intercessao", []));
      setCelulas(await loadKey("avivar:celulas", DEFAULT_CELULAS));
      setHistoria(await loadKey("avivar:historia", DEFAULT_HISTORIA));
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
    let avivarKidsW = avivarKids || [];
    let liderancaW = lideranca || DEFAULT_LIDERANCA;
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
            descricao: "Deus escreveu dois livros: a Bíblia e o universo. Nesta obra inédita — Volume IX da Série Códigos Avivar — Marcos Fagner S. Alves mostra como as descobertas da física quântica ressoam com o que as Escrituras já revelavam sobre a presença e a soberania do Criador. Um convite a enxergar, na estrutura mais profunda do universo, as marcas de Quem o projetou.",
          },
        ];
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
      }
      todo.lancamentoEnergiaCriador1 = true;
    }
    // Correção: Marcos pediu pra reduzir a sinopse de "A Energia do Criador" (estava
    // comprida demais). Como o seed acima já tinha rodado pra quem já abriu o site,
    // esta correção força a atualização do texto já salvo no Supabase.
    if (!seeds.sinopseEnergiaCriadorCurta1) {
      const sinopseCurta = "Deus escreveu dois livros: a Bíblia e o universo. Nesta obra inédita — Volume IX da Série Códigos Avivar — Marcos Fagner S. Alves mostra como as descobertas da física quântica ressoam com o que as Escrituras já revelavam sobre a presença e a soberania do Criador. Um convite a enxergar, na estrutura mais profunda do universo, as marcas de Quem o projetou.";
      const precisaEncurtar = lojaW.some((p) => p.seedId === "lancamento-energia-criador" && p.descricao !== sinopseCurta);
      if (precisaEncurtar) {
        lojaW = lojaW.map((p) => (p.seedId === "lancamento-energia-criador" ? { ...p, descricao: sinopseCurta } : p));
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
      }
      todo.sinopseEnergiaCriadorCurta1 = true;
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
    if (!seeds.livroCuraDaAlma1) {
      // Livro "Cura da Alma" (Pr. Marcos Fagner) — capa já pronta, aguardando só o
      // miolo/PDF final. Cadastrado em Códigos Avivar (mesmo padrão da trilogia):
      // aparece na vitrine de Códigos Avivar e também na Loja pública. pdfUrl fica
      // em branco até o arquivo final chegar — nesse meio tempo o card mostra "em
      // breve" em vez de abrir/vender.
      const jaTemCuraAlma = lojaW.some((p) => p.seedId === "codigos-cura-da-alma");
      if (!jaTemCuraAlma) {
        lojaW = [
          ...lojaW,
          {
            id: uid(),
            seedId: "codigos-cura-da-alma",
            categoria: "Códigos Avivar",
            paraVenda: true,
            pdfNaoLiberado: true,
            fisicoEsgotado: true,
            titulo: "Cura da Alma",
            nome: "Cura da Alma",
            autor: "Pr. Marcos Fagner",
            imageUrl: LIVRO_CURA_ALMA_CAPA,
            destino: "loja",
            preco: "",
            precoPdf: "",
            precoFisico: "",
            linkCompra: "",
            linkCartao: "",
            descricao: "Cura da Alma — Ciência e Fé Unidas Para Curar. Partindo da tricotomia do homem (corpo, alma e espírito — Hebreus 13:20-21), o livro mostra que a cura é possível quando a Medicina e a fé caminham juntas, trazendo orientação prática e fundamentada sobre esquizofrenia, síndrome do pânico, transtorno de ansiedade e depressão. Em breve disponível — aguardando a finalização do miolo.",
          },
        ];
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
      }
      todo.livroCuraDaAlma1 = true;
    }
    if (!seeds.livrosAnjosEMilagres1) {
      // Mais 2 títulos da Série Códigos Avivar — Profetas dos Últimos Dias:
      // "Anjos: Entre o Trono e a Terra" (Volume IX) e "Os Milagres de Jesus
      // Cristo" (Volume VIII). Mesmo padrão dos demais: capa pronta, pdfUrl em
      // branco até o miolo chegar, aparecem na Loja e na vitrine de Códigos Avivar.
      const jaTemAnjos = lojaW.some((p) => p.seedId === "codigos-anjos-trono-terra");
      const jaTemMilagres = lojaW.some((p) => p.seedId === "codigos-milagres-jesus");
      const novos = [];
      if (!jaTemAnjos) {
        novos.push({
          id: uid(),
          seedId: "codigos-anjos-trono-terra",
          categoria: "Códigos Avivar",
          paraVenda: true,
          pdfNaoLiberado: true,
          fisicoEsgotado: true,
          titulo: "Anjos: Entre o Trono e a Terra",
          nome: "Anjos: Entre o Trono e a Terra",
          autor: "Pr. Marcos Fagner",
          imageUrl: LIVRO_ANJOS_CAPA,
          destino: "loja",
          preco: "",
          precoPdf: "",
          precoFisico: "",
          linkCompra: "",
          linkCartao: "",
          descricao: "Série Códigos Avivar — Profetas dos Últimos Dias, Volume IX. \"Ele envia seus anjos como espíritos, e seus ministros como chama\" (Salmos 104:4). Os anjos são mais do que seres celestiais: são mensageiros, guerreiros, protetores e instrumentos do plano de Deus em todas as eras. Com base nas Escrituras e em diferentes tradições, este livro revela a origem, a hierarquia, as funções, a energia e os segredos dos anjos, mostrando como atuam entre o trono e a terra, guiando, protegendo e influenciando o destino da humanidade. Em breve disponível — aguardando a finalização do miolo.",
        });
      }
      if (!jaTemMilagres) {
        novos.push({
          id: uid(),
          seedId: "codigos-milagres-jesus",
          categoria: "Códigos Avivar",
          paraVenda: true,
          pdfNaoLiberado: true,
          fisicoEsgotado: true,
          titulo: "Os Milagres de Jesus Cristo",
          nome: "Os Milagres de Jesus Cristo",
          autor: "Pr. Marcos Fagner",
          imageUrl: LIVRO_MILAGRES_JESUS_CAPA,
          destino: "loja",
          preco: "",
          precoPdf: "",
          precoFisico: "",
          linkCompra: "",
          linkCartao: "",
          descricao: "Série Códigos Avivar — Profetas dos Últimos Dias, Volume VIII. Energia divina, transformação molecular e o poder que nenhuma ciência consegue medir: uma jornada pelos milagres de Jesus Cristo à luz da fé e da ciência, revelando como o mesmo poder que curou enfermos, abriu olhos cegos e ressuscitou mortos continua disponível à Igreja hoje. Em breve disponível — aguardando a finalização do miolo.",
        });
      }
      if (novos.length > 0) {
        lojaW = [...lojaW, ...novos];
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
      }
      todo.livrosAnjosEMilagres1 = true;
    }
    if (!seeds.resumosLivrosCodigos1) {
      // Resumos revisados dos 3 livros da Série Códigos Avivar, escritos com base
      // na arte de cada capa. Nenhum título está disponível ainda em PDF nem em
      // versão física impressa — deixado explícito no texto para o visitante.
      const resumos = {
        "codigos-cura-da-alma":
          "Cura da Alma — Ciência e Fé Unidas Para Curar. Pr. Marcos Fagner une o conhecimento médico-científico à base bíblica da tricotomia humana — corpo, alma e espírito (Hebreus 13:20-21) — para tratar o sofrimento psíquico sem negar nem a ciência, nem a fé. Esquizofrenia, síndrome do pânico, transtornos de ansiedade e depressão são abordados com acolhimento, fundamentação e esperança, mostrando que a cura plena acontece quando Medicina e Espírito Santo caminham lado a lado. Ainda não disponível — nem em PDF, nem em versão física impressa.",
        "codigos-anjos-trono-terra":
          "Anjos: Entre o Trono e a Terra — Série Códigos Avivar, Volume IX. \"Ele faz dos ventos os seus mensageiros, e do fogo labareda, os seus ministros\" (Salmos 104:4). Pr. Marcos Fagner mergulha no mundo invisível dos mensageiros celestiais — origem, hierarquia, funções e atuação entre o trono de Deus e a vida humana. Guerreiros, guardiões, portadores de revelação: este volume revela como os anjos continuam agindo hoje, protegendo, guiando e executando os propósitos do Altíssimo na terra. Ainda não disponível — nem em PDF, nem em versão física impressa.",
        "codigos-milagres-jesus":
          "Os Milagres de Jesus Cristo — Série Códigos Avivar, Volume VIII. Cegos que voltaram a ver, enfermos curados, mortos que ressuscitaram: Pr. Marcos Fagner revisita os milagres de Jesus à luz da fé e da ciência, explorando a energia divina por trás de cada manifestação de poder. Uma obra que mostra que o mesmo poder que atuou na Galileia continua disponível à Igreja nos dias de hoje. Ainda não disponível — nem em PDF, nem em versão física impressa.",
      };
      const precisaAtualizarResumo = lojaW.some((p) => resumos[p.seedId] && p.descricao !== resumos[p.seedId]);
      if (precisaAtualizarResumo) {
        lojaW = lojaW.map((p) => (resumos[p.seedId] ? { ...p, descricao: resumos[p.seedId] } : p));
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
      }
      todo.resumosLivrosCodigos1 = true;
    }
    // Correção: "Cura da Alma", "Anjos: Entre o Trono e a Terra" e "Os Milagres de
    // Jesus Cristo" são livros do Pr. Marcos Fagner (mesmo padrão da trilogia e de
    // "A Energia do Criador"), e por isso devem aparecer na Loja Avivar pública,
    // mesmo "em breve disponível" — só faltava marcar paraVenda: true (sem isso, o
    // filtro da Loja os escondia, mostrando só na vitrine interna de Códigos Avivar).
    // Isso resolve o Marcos continuar vendo "as capas dos livros não subiram": as
    // imagens sempre estiveram no ar, só não apareciam na página da Loja.
    if (!seeds.livrosCodigosParaVenda1) {
      const idsParaVenda = ["codigos-cura-da-alma", "codigos-anjos-trono-terra", "codigos-milagres-jesus"];
      const precisaCorrigir = lojaW.some((p) => idsParaVenda.includes(p.seedId) && !p.paraVenda);
      if (precisaCorrigir) {
        lojaW = lojaW.map((p) =>
          idsParaVenda.includes(p.seedId)
            ? { ...p, paraVenda: true, pdfNaoLiberado: true, fisicoEsgotado: true, precoPdf: p.precoPdf || "", precoFisico: p.precoFisico || "" }
            : p
        );
        setLoja(lojaW);
        saveKey("avivar:loja", lojaW);
      }
      todo.livrosCodigosParaVenda1 = true;
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
    // Foto enviada pelo Marcos (encontro em casa, grupo reunido na sala) — cadastrada
    // como um encontro de Orações nos Lares com data própria (29/11/2026, segundo o
    // Marcos), já que esse registro tem data e não é só "o local de hoje".
    if (!seeds.oracaoEncontroFoto1) {
      const jaTem = (oracaoEncontros || []).some((e) => e.seedId === "oracao-encontro-29-11");
      if (!jaTem) {
        const novoEncontro = { id: uid(), seedId: "oracao-encontro-29-11", anfitriao: "", diaSemana: "Domingo", data: "2026-11-29", hora: "", endereco: "", contato: "", fotos: ["/96-oracao-lares-encontro.jpg"] };
        const novosEncontros = [...(oracaoEncontros || []), novoEncontro];
        setOracaoEncontros(novosEncontros);
        saveKey("avivar:oracaoencontros", novosEncontros);
      }
      todo.oracaoEncontroFoto1 = true;
    }
    // Logos das 3 Células Avivar (Alfa/Beta/Gama), enviados pelo Marcos — só define
    // se a célula ainda não tiver logo cadastrado, pra nunca sobrescrever o que o
    // admin já tenha trocado.
    if (!seeds.celulaLogos1) {
      const logosPadrao = { alfa: "/103-celula-alfa-logo.png", beta: "/102-celula-beta-logo.png", gama: "/104-celula-gama-logo.png" };
      const celulasAtual = celulas || DEFAULT_CELULAS;
      const precisaLogo = CELULA_KEYS.some((k) => !(celulasAtual[k] && celulasAtual[k].logoUrl));
      if (precisaLogo) {
        const novasCelulas = { ...celulasAtual };
        CELULA_KEYS.forEach((k) => {
          if (!novasCelulas[k] || !novasCelulas[k].logoUrl) {
            novasCelulas[k] = { ...(novasCelulas[k] || CELULA_VAZIA(k)), logoUrl: logosPadrao[k] };
          }
        });
        setCelulas(novasCelulas);
        saveKey("avivar:celulas", novasCelulas);
      }
      todo.celulaLogos1 = true;
    }
    // Marcos achou as logos anteriores das 3 Células confusas e mandou substituir
    // em todo lugar — diferente do seed acima, este sobrescreve de propósito,
    // mesmo já havendo uma logo cadastrada.
    if (!seeds.celulaLogos2) {
      const logosNovas = { alfa: "/109-celula-alfa-logo.png", beta: "/111-celula-beta-logo.png", gama: "/110-celula-gama-logo.png" };
      const celulasAtual = celulas || DEFAULT_CELULAS;
      const novasCelulas = { ...celulasAtual };
      CELULA_KEYS.forEach((k) => {
        novasCelulas[k] = { ...(novasCelulas[k] || CELULA_VAZIA(k)), logoUrl: logosNovas[k] };
      });
      setCelulas(novasCelulas);
      saveKey("avivar:celulas", novasCelulas);
      todo.celulaLogos2 = true;
    }
    // Cinco colaboradores enviados pelo Marcos (fotos individuais) — entram sem
    // cargo definido (pedido dele) e marcados como "novo" pra aparecerem destacados
    // abaixo dos colaboradores que já existiam (ver Colaboradores/ColaboradorCard).
    if (!seeds.colaboradoresCelulas1) {
      const seedIds = ["colab-barbara", "colab-marcio", "colab-sofia", "colab-ezequiel", "colab-tarciana"];
      const jaTem = (colaboradoresW || []).some((c) => seedIds.includes(c.seedId));
      if (!jaTem) {
        const novosColaboradores = [
          { id: uid(), seedId: "colab-barbara", nome: "Ir. Bárbara", cargo: "", ministerio: "", telefone: "", fotoUrl: "/97-colaborador-barbara.jpg", grupo: "novo" },
          { id: uid(), seedId: "colab-marcio", nome: "Ir. Márcio", cargo: "", ministerio: "", telefone: "", fotoUrl: "/98-colaborador-marcio.jpg", grupo: "novo" },
          { id: uid(), seedId: "colab-sofia", nome: "Princesa Sofia", cargo: "", ministerio: "", telefone: "", fotoUrl: "/99-colaborador-sofia.jpg", grupo: "novo" },
          { id: uid(), seedId: "colab-ezequiel", nome: "Ir. Ezequiel", cargo: "", ministerio: "", telefone: "", fotoUrl: "/100-colaborador-ezequiel.jpg", grupo: "novo" },
          { id: uid(), seedId: "colab-tarciana", nome: "Ir. Tarciana", cargo: "", ministerio: "", telefone: "", fotoUrl: "/101-colaborador-tarciana.jpg", grupo: "novo" },
        ];
        colaboradoresW = [...colaboradoresW, ...novosColaboradores];
        setColaboradores(colaboradoresW);
        saveKey("avivar:colaboradores", colaboradoresW);
      }
      todo.colaboradoresCelulas1 = true;
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
    // Remove o card "Dízimos e Ofertas" da grade de 9 cards da Home — a seção
    // própria que ele abria foi removida (duplicava o card de Pix já existente
    // no Hero da Home), então o card da grade ficaria sem destino.
    if (!seeds.homeCardsRemoverDoacoes1) {
      const hcAtual = site.homeCards || DEFAULT_HOMECARDS;
      if (hcAtual.some((c) => c.key === "doacoes")) {
        const hcSemDoacoes = hcAtual.filter((c) => c.key !== "doacoes");
        const siteAtual = site || DEFAULT_SITE;
        const novoSite = { ...siteAtual, homeCards: hcSemDoacoes };
        setSite(novoSite);
        saveKey("avivar:site", novoSite);
      }
      todo.homeCardsRemoverDoacoes1 = true;
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
    // Avivar Kids — nova seção abaixo de Colaboradores, a pedido do Marcos. As
    // fotos de Ir. Ismael, Ir. João e Ir. Gabriel entram aqui, e a foto da
    // Princesa Sofia (antes em Colaboradores) é movida pra cá também.
    if (!seeds.avivarKids1) {
      const sofiaEmColaboradores = colaboradoresW.find((c) => c.seedId === "colab-sofia");
      if (sofiaEmColaboradores) {
        colaboradoresW = colaboradoresW.filter((c) => c.seedId !== "colab-sofia");
        setColaboradores(colaboradoresW);
        saveKey("avivar:colaboradores", colaboradoresW);
      }
      const jaTemKids = avivarKidsW.some((k) => k.seedId && k.seedId.startsWith("kids-"));
      const novosKids = [];
      if (!jaTemKids) {
        novosKids.push(
          { id: uid(), seedId: "kids-ismael", nome: "Ir. Ismael", fotoUrl: "/105-avivar-kids-ismael.jpg" },
          { id: uid(), seedId: "kids-joao", nome: "Ir. João", fotoUrl: "/106-avivar-kids-joao.jpg" },
          { id: uid(), seedId: "kids-gabriel", nome: "Ir. Gabriel", fotoUrl: "/107-avivar-kids-gabriel.jpg" }
        );
      }
      const jaTemSofiaKids = avivarKidsW.some((k) => k.seedId === "colab-sofia");
      if (sofiaEmColaboradores && !jaTemSofiaKids) {
        novosKids.push({ id: uid(), seedId: "colab-sofia", nome: sofiaEmColaboradores.nome || "Princesa Sofia", fotoUrl: sofiaEmColaboradores.fotoUrl });
      }
      if (novosKids.length > 0) {
        avivarKidsW = [...avivarKidsW, ...novosKids];
        setAvivarKids(avivarKidsW);
        saveKey("avivar:avivarkids", avivarKidsW);
      }
      todo.avivarKids1 = true;
    }
    // Liderança em destaque — move Pastor Marcos e Pastora Wládia de dentro da
    // lista normal de Colaboradores pra um bloco fixo no topo da seção, com
    // texto próprio (pedido do Marcos). Busca por nome (sem acento, sem
    // depender de maiúsculas) pra achar os dois cadastros já existentes,
    // feitos pelo próprio admin antes desta atualização, e aproveita a foto
    // que já estava cadastrada neles.
    if (!seeds.liderancaDestaque1) {
      const marcosEntry = colaboradoresW.find((c) => semAcento(c.nome).includes("marcos"));
      const wladiaEntry = colaboradoresW.find((c) => semAcento(c.nome).includes("wladia"));
      let liderancaNova = { ...DEFAULT_LIDERANCA, ...liderancaW };
      let mudouColaboradores = false;
      if (marcosEntry) {
        liderancaNova = { ...liderancaNova, marcos: { ...DEFAULT_LIDERANCA.marcos, ...liderancaNova.marcos, fotoUrl: marcosEntry.fotoUrl || liderancaNova.marcos.fotoUrl } };
        colaboradoresW = colaboradoresW.filter((c) => c.id !== marcosEntry.id);
        mudouColaboradores = true;
      }
      if (wladiaEntry) {
        liderancaNova = { ...liderancaNova, wladia: { ...DEFAULT_LIDERANCA.wladia, ...liderancaNova.wladia, fotoUrl: wladiaEntry.fotoUrl || liderancaNova.wladia.fotoUrl } };
        colaboradoresW = colaboradoresW.filter((c) => c.id !== wladiaEntry.id);
        mudouColaboradores = true;
      }
      liderancaW = liderancaNova;
      setLideranca(liderancaW);
      saveKey("avivar:lideranca", liderancaW);
      if (mudouColaboradores) {
        setColaboradores(colaboradoresW);
        saveKey("avivar:colaboradores", colaboradoresW);
      }
      todo.liderancaDestaque1 = true;
    }
    // A foto da Ir. Vitória Dimas, enviada na mesma leva das 3 fotos de Avivar
    // Kids, é de uma colaboradora adulta — entra em Colaboradores (Nossos
    // Colaboradores), não em Avivar Kids.
    if (!seeds.colaboradoraVitoriaDimas1) {
      const jaTem = colaboradoresW.some((c) => c.seedId === "colab-vitoria-dimas");
      if (!jaTem) {
        colaboradoresW = [...colaboradoresW, { id: uid(), seedId: "colab-vitoria-dimas", nome: "Ir. Vitória Dimas", cargo: "", ministerio: "", telefone: "", fotoUrl: "/108-colaboradora-vitoria-dimas.jpg", grupo: "novo" }];
        setColaboradores(colaboradoresW);
        saveKey("avivar:colaboradores", colaboradoresW);
      }
      todo.colaboradoraVitoriaDimas1 = true;
    }
    // Correções da Loja por NOME (não só por seedId): os livros "A Energia do
    // Criador" e "A Grande Guerra dos Anjos" podem ter sido cadastrados à mão pelo
    // admin (sem seedId), e aí as correções anteriores não os encontravam.
    if (!seeds.lojaCorrecoesPorNome1) {
      const sinopseEnergia = "Deus escreveu dois livros: a Bíblia e o universo. Nesta obra inédita — Volume IX da Série Códigos Avivar — Marcos Fagner S. Alves mostra como as descobertas da física quântica ressoam com o que as Escrituras já revelavam sobre a presença e a soberania do Criador. Um convite a enxergar, na estrutura mais profunda do universo, as marcas de Quem o projetou.";
      // Encurta um texto mantendo frases inteiras, até caber no limite.
      const encurtar = (txt, limite) => {
        const t = (txt || "").trim();
        if (t.length <= limite) return t;
        const frases = t.match(/[^.!?]+[.!?]+["”)]*\s*/g) || [t];
        let out = "";
        for (const f of frases) {
          if ((out + f).trim().length > limite) break;
          out += f;
        }
        return (out.trim() || t.slice(0, limite).trim() + "…");
      };
      const nomeDe = (p) => semAcento(p.nome || p.titulo || "");
      lojaW = lojaW.map((p) => {
        const n = nomeDe(p);
        if (p.seedId === "lancamento-energia-criador" || n.includes("energia do criador")) {
          return { ...p, descricao: sinopseEnergia };
        }
        if (n.includes("grande guerra")) {
          return {
            ...p,
            paraVenda: true,
            imageUrl: "/1-livro-grande-guerra-dos-anjos-capa-recortada.png",
            capaVendaUrl: "/1-livro-grande-guerra-dos-anjos-capa-recortada.png",
            descricao: encurtar(p.descricao, sinopseEnergia.length + 20),
          };
        }
        return p;
      });
      setLoja(lojaW);
      saveKey("avivar:loja", lojaW);
      todo.lojaCorrecoesPorNome1 = true;
    }
    // Ir. Vitória Dimas — garante o cadastro com a foto certa mesmo se o cadastro
    // anterior foi apagado, duplicado ou feito à mão sem foto.
    if (!seeds.colaboradoraVitoriaDimas2) {
      const FOTO_VD = "/108-colaboradora-vitoria-dimas.jpg";
      const ehVD = (c) => semAcento(c.nome).includes("vitoria dimas");
      const existentes = colaboradoresW.filter(ehVD);
      if (existentes.length === 0) {
        colaboradoresW = [...colaboradoresW, { id: uid(), seedId: "colab-vitoria-dimas", nome: "Ir. Vitória Dimas", cargo: "", ministerio: "", telefone: "", fotoUrl: FOTO_VD, grupo: "novo" }];
      } else {
        const manter = existentes[0].id;
        colaboradoresW = colaboradoresW
          .filter((c) => !ehVD(c) || c.id === manter)
          .map((c) => (c.id === manter ? { ...c, fotoUrl: FOTO_VD, grupo: "novo" } : c));
      }
      setColaboradores(colaboradoresW);
      saveKey("avivar:colaboradores", colaboradoresW);
      todo.colaboradoraVitoriaDimas2 = true;
    }
    // Acesso pessoal do Marcos em Códigos Avivar — nome "Admin", nível Serafim
    // (libera todo o conteúdo), pra entrar pelas credenciais sem usar o RESTRITO.
    // Substitui o código provisório AVR-MF-7K42 da versão anterior.
    if (!seeds.codigoAcessoMarcos2) {
      const SENHA = "Impacto131310@";
      const atuais = ((codigos && codigos.codes) || []).filter((c) => (c.code || "").toUpperCase() !== "AVR-MF-7K42" && c.code !== SENHA);
      const novoCodigos = { ...codigos, codes: [...atuais, { id: uid(), holder: "Admin", code: SENHA, active: true, tier: "serafim" }] };
      setCodigos(novoCodigos);
      saveKey("avivar:codigos", novoCodigos);
      todo.codigoAcessoMarcos2 = true;
    }
    // Avivar Kids — Ir. Isaac (foto enviada pelo Marcos).
    if (!seeds.avivarKidsIsaac1) {
      if (!avivarKidsW.some((k) => k.seedId === "kids-isaac" || semAcento(k.nome).includes("isaac"))) {
        avivarKidsW = [...avivarKidsW, { id: uid(), seedId: "kids-isaac", nome: "Ir. Isaac", fotoUrl: "/112-avivar-kids-isaac.jpg" }];
        setAvivarKids(avivarKidsW);
        saveKey("avivar:avivarkids", avivarKidsW);
      }
      todo.avivarKidsIsaac1 = true;
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
    avivarKids: (v) => { setAvivarKids(v); saveKey("avivar:avivarkids", v); },
    lideranca: (v) => { setLideranca(v); saveKey("avivar:lideranca", v); },
    visitantesDoDia: (v) => { setVisitantesDoDia(v); saveKey("avivar:visitantesdodia", v); },
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
    musicApp: (v) => { setMusicApp(v); saveKey("avivar:musicapp", v); },
    escala: (v) => { setEscala(v); saveKey("avivar:escalaObreiros", v); },
    manchete: (v) => { setManchete(v); saveKey("avivar:manchete", v); },
    pedidosOracao: (v) => { setPedidosOracao(v); saveKey("avivar:pedidosOracao", v); },
    pedidosFisicos: (v) => { setPedidosFisicos(v); saveKey("avivar:pedidosfisicos", v); },
    oracaoLocalDia: (v) => { setOracaoLocalDia(v); saveKey("avivar:oracaolocaldia", v); },
    biblioteca: (v) => { setBiblioteca(v); saveKey("avivar:biblioteca", v); },
    musicos: (v) => { setMusicos(v); saveKey("avivar:musicos", v); },
    intercessao: (v) => { setIntercessao(v); saveKey("avivar:intercessao", v); },
    celulas: (v) => { setCelulas(v); saveKey("avivar:celulas", v); },
    historia: (v) => { setHistoria(v); saveKey("avivar:historia", v); },
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

  // Página própria de uma Célula Avivar (Alfa/Beta/Gama) — mesmo padrão de página
  // cheia sem rolagem das demais (Unidade Avivar, Cursos, Avivar News TV/Music).
  if (paginaCelulaKey) {
    return (
      <PaginaCelula
        chave={paginaCelulaKey}
        celula={(celulas && celulas[paginaCelulaKey]) || CELULA_VAZIA(paginaCelulaKey)}
        coordenador={celulas && celulas.coordenador}
        liderCode={celulas && celulas.liderCode}
        liderCodeActive={celulas && celulas.liderCodeActive}
        adminMode={adminMode}
        onSave={(v) => persist.celulas({ ...celulas, [paginaCelulaKey]: v })}
        onPatchTop={(patch) => persist.celulas({ ...celulas, ...patch })}
        onVoltar={() => setPaginaCelulaKey(null)}
      />
    );
  }

  // Página "Nossa História" — aberta pelo clique no nome/logo do Ministério no Hero.
  if (paginaHistoriaOpen) {
    return (
      <PaginaHistoria
        historia={historia}
        save={persist.historia}
        adminMode={adminMode}
        onVoltar={() => setPaginaHistoriaOpen(false)}
      />
    );
  }

  // Avivar News TV — mesmo padrão de página cheia sem rolagem.
  if (paginaAvivarNewsTVOpen) {
    return (
      <PaginaAvivarNewsTV
        aoVivo={aoVivo} saveAoVivo={persist.aoVivo}
        passadas={transmissoesPassadas} savePassadas={persist.transmissoesPassadas}
        news={avivarNews} saveNews={persist.avivarNews}
        adminMode={adminMode} onOpenNews={abrirReportagem}
        unlocked={codigosUnlocked}
        intercessao={intercessao} saveIntercessao={persist.intercessao}
        onVoltar={() => setPaginaAvivarNewsTVOpen(false)}
        onAbrirCodigos={() => { setPaginaAvivarNewsTVOpen(false); scrollToSection("codigos"); }}
      />
    );
  }

  // Avivar Music — mesmo padrão de página cheia sem rolagem.
  if (paginaAvivarMusicOpen) {
    return (
      <PaginaAvivarMusic
        repertorio={repertorio} saveRepertorio={persist.repertorio}
        musicos={musicos} saveMusicos={persist.musicos}
        albuns={albuns} saveAlbuns={persist.albuns}
        adminMode={adminMode} operatorMode={podeSetor("avivarmusic")} onRequestOperator={() => setOperatorGateOpen(true)}
        onVoltar={() => setPaginaAvivarMusicOpen(false)}
        musicApp={musicApp} saveMusicApp={persist.musicApp}
        tentarCodigoLider={(codigo) => {
          const digitado = String(codigo || "").trim().toLowerCase();
          if (!digitado) return false;
          if (String(codigo).trim() === MASTER_ADMIN_PASSWORD) { setOperatorAuth({ nome: "Administração", setores: ["todos"] }); return true; }
          const m = operatorCodes.find((o) => String(o.codigo || "").trim().toLowerCase() === digitado);
          if (!m) return false;
          const setores = parseSetoresOperador(m.setores);
          if (!setores.includes("todos") && !setores.includes("avivarmusic")) return false;
          setOperatorAuth({ nome: m.nome, setores });
          return true;
        }}
      />
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
        @keyframes navPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.75); } 50% { box-shadow: 0 0 0 5px rgba(255,255,255,0); } }
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
        @keyframes visitantePulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.68; transform: scale(1.06); } }
        .visitante-pulse { animation: visitantePulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .visitante-pulse { animation: none; } }
        .font-display { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Playfair Display', serif; font-weight: 700; }
        .font-body { font-family: 'Public Sans', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        @keyframes marquee { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .marquee-track { animation: marquee 14s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }
        @keyframes noticiasMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .noticias-marquee { animation: noticiasMarquee 90s linear infinite; width: max-content; }
        .noticias-marquee:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .noticias-marquee { animation: none; } }
      `}</style>

      <NavBar page={page} setPage={scrollToSection} adminMode={adminMode} churchName={site.churchName} onAdminClick={() => (adminMode ? setAdminMode(false) : setGateOpen(true))} />
      <NoticiasCarousel />
      <SideCarousel photos={sideCarouselPhotos} setPage={scrollToSection} />

      <main className="lg:ml-[200px]">
        <section id="home"><Home site={site} setPage={scrollToSection} visitantes={visitantes} saveSite={persist.site} adminMode={adminMode} aoVivo={aoVivo} transmissoesPassadas={transmissoesPassadas} oracaoEncontros={oracaoEncontros} avivarNews={avivarNews} doacoes={doacoes} saveDoacoes={persist.doacoes} manchete={manchete} saveManchete={persist.manchete} onOpenNews={abrirReportagem} oracaoLocalDia={oracaoLocalDia} escala={escala} onOpenCursos={() => setPaginaCursosOpen(true)} celulas={celulas} onOpenCelula={setPaginaCelulaKey} onOpenHistoria={() => setPaginaHistoriaOpen(true)} visitantesDoDia={visitantesDoDia} saveVisitantesDoDia={persist.visitantesDoDia} podeVisitantesDia={podeSetor("visitantes")} /></section>
        <section id="codigos" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><CodigosAvivar data={codigos} save={persist.codigos} adminMode={adminMode} loja={loja} saveLoja={persist.loja} avivarNews={avivarNews} setPage={scrollToSection} onOpenNews={abrirReportagem} unlocked={codigosUnlocked} setUnlocked={setCodigosUnlocked} forumPosts={forumPosts} addForumPost={(p) => persist.forum([...forumPosts, p])} /></section>
        <section id="loja" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><SetorAcessoBar setor="loja" adminMode={adminMode} operatorAuth={operatorAuth} onEntrar={() => setOperatorGateOpen(true)} onSair={() => setOperatorAuth(null)} irPara={scrollToSection} /><Loja items={loja} save={persist.loja} adminMode={adminMode} operatorMode={podeSetor("loja")} onRequestOperator={() => setOperatorGateOpen(true)} doacoes={doacoes} pedidosFisicos={pedidosFisicos} savePedidosFisicos={persist.pedidosFisicos} /></section>
        <section id="eventos" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><EventosGaleria eventos={eventos} saveEventos={persist.eventos} galeria={galeria} saveGaleria={persist.galeria} adminMode={adminMode} setManchete={persist.manchete} /></section>
        <section id="igrejas" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Igrejas igrejas={igrejas} save={persist.igrejas} adminMode={adminMode} onOpenIgreja={setPaginaIgrejaId} /></section>
        <section id="colaboradores" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Colaboradores items={colaboradores} save={persist.colaboradores} adminMode={adminMode} kidsItems={avivarKids} saveKids={persist.avivarKids} lideranca={lideranca} saveLideranca={persist.lideranca} /></section>
        <section id="escala" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><SetorAcessoBar setor="escala" adminMode={adminMode} operatorAuth={operatorAuth} onEntrar={() => setOperatorGateOpen(true)} onSair={() => setOperatorAuth(null)} irPara={scrollToSection} /><EscalaObreiros data={escala} save={persist.escala} adminMode={adminMode} operatorMode={podeSetor("escala")} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="estudos" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><Estudos items={estudos} save={persist.estudos} adminMode={adminMode} /></section>
        <section id="biblioteca" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><BibliotecaAvivar items={biblioteca} save={persist.biblioteca} adminMode={adminMode} setPage={scrollToSection} /></section>
        <section id="visitantes" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><SetorAcessoBar setor="visitantes" adminMode={adminMode} operatorAuth={operatorAuth} onEntrar={() => setOperatorGateOpen(true)} onSair={() => setOperatorAuth(null)} irPara={scrollToSection} /><Visitantes items={visitantes} save={persist.visitantes} refresh={() => loadKey("avivar:visitantes", []).then(setVisitantes)} adminMode={adminMode} operatorMode={podeSetor("visitantes")} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
        <section id="oracoes" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><SetorAcessoBar setor="oracoes" adminMode={adminMode} operatorAuth={operatorAuth} onEntrar={() => setOperatorGateOpen(true)} onSair={() => setOperatorAuth(null)} irPara={scrollToSection} /><OracoesLares items={oracoes} save={persist.oracoes} encontros={oracaoEncontros} saveEncontros={persist.oracaoEncontros} adminMode={adminMode} operatorMode={podeSetor("oracoes")} onRequestOperator={() => setOperatorGateOpen(true)} localDia={oracaoLocalDia} saveLocalDia={persist.oracaoLocalDia} /></section>
        <section id="pedidooracao" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><PedidoOracao items={pedidosOracao} save={persist.pedidosOracao} adminMode={adminMode} /></section>
        <section id="membros" className="scroll-mt-24"><VoltarBar onVoltar={voltar} /><SetorAcessoBar setor="membros" adminMode={adminMode} operatorAuth={operatorAuth} onEntrar={() => setOperatorGateOpen(true)} onSair={() => setOperatorAuth(null)} irPara={scrollToSection} /><Membros items={membros} save={persist.membros} adminMode={adminMode} operatorMode={podeSetor("membros")} onRequestOperator={() => setOperatorGateOpen(true)} /></section>
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
