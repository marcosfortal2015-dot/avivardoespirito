# Ministério Avivar do Espírito — site

Protótipo funcional do site, pronto para rodar localmente e publicar.

## Rodar no seu computador

Requisitos: [Node.js](https://nodejs.org) instalado (versão 18 ou mais nova).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

## Publicar de graça (link real para compartilhar)

**Opção mais simples — Vercel:**

1. Crie uma conta em [vercel.com](https://vercel.com) (dá para entrar com GitHub).
2. Suba esta pasta para um repositório no GitHub (ou arraste a pasta direto no painel da Vercel, em "Add New Project").
3. A Vercel detecta que é um projeto Vite automaticamente. Clique em "Deploy".
4. Em alguns minutos você recebe um link tipo `avivar-espirito.vercel.app`.

**Alternativa — Netlify (arrastar e soltar, sem GitHub):**

1. Rode `npm run build` aqui no computador — isso cria uma pasta `dist`.
2. Vá em [app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta `dist`.
3. Pronto, gera um link na hora.

## ⚠️ Leia antes de divulgar o link para a igreja

Este projeto salva os dados (eventos, colaboradores, cursos, visitantes...) no
**navegador de quem está usando o site** (`localStorage`), não em um banco de dados
compartilhado. Na prática isso significa:

- O que o admin cadastra no computador da secretaria **não aparece** para quem
  acessa pelo celular, nem para outros visitantes do site.
- Se limpar o histórico/cache do navegador, os dados cadastrados somem.

Isso é ótimo para você testar o site sozinho, ajustar textos e visual, e mostrar
para a liderança — mas **não é ainda um site "ao vivo" com dado real compartilhado
entre todo mundo**. Para isso, o próximo passo é ligar o site a um banco de dados
de verdade. Sugestão mais rápida e gratuita: [Supabase](https://supabase.com)
(funciona direto do navegador, sem precisar manter servidor rodando). Quando
quiser dar esse passo, é só voltar e pedir — o arquivo `src/lib/storage.js` já
foi feito para ser trocado por essa integração sem precisar mexer no resto do
site.

## Onde ajustar as coisas mais comuns

- **Senha de admin (provisória, só para teste):** arquivo `src/App.jsx`, constante
  `MASTER_ADMIN_PASSWORD`, perto do topo do arquivo. Troque antes de divulgar o
  link — e lembre que, por ser só uma senha fixa no código, não é segura para uso
  real; é um placeholder até existir login de verdade num backend.
- **Nome da igreja, banners iniciais:** `src/App.jsx`, constante `DEFAULT_SITE`.
- **Cores e fontes:** `src/App.jsx`, objeto `C` (cores) e o bloco `<style>` dentro
  do componente `App` (fontes, no fim do arquivo).
- **Imagens/vídeos:** neste protótipo, tudo é feito colando uma URL (link de uma
  imagem já hospedada em algum lugar, ou link do YouTube/Vimeo) — não é upload de
  arquivo do computador. Upload de arquivo real também depende de um backend com
  armazenamento (ex: Supabase Storage, Cloudinary).

## Estrutura do projeto

```
avivar-espirito/
├── src/
│   ├── App.jsx          → todo o site (páginas, admin, componentes)
│   ├── lib/storage.js   → onde os dados são salvos (trocar aqui para virar backend real)
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── tailwind.config.js
```
