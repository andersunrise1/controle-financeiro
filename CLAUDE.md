# CLAUDE.md

Guia de contexto para o Claude Code ao trabalhar neste repositório.

## Visão do produto

App de controle financeiro pessoal focado em **compras de mercado**. A ideia central do usuário:

- A pessoa vai ao mercado e, conforme coloca itens no carrinho, registra cada produto e seu preço — digitando manualmente **ou** tirando uma foto (do carrinho/nota fiscal) para o app extrair os itens automaticamente via IA.
- Com isso, o app sabe não só "quanto gastei no mercado", mas **quanto cada produto individual custou**, mês a mês.
- Dashboards interativos devem mostrar: quanto a pessoa gastou a mais/a menos em relação aos meses anteriores, e **quais produtos aumentaram de preço** ao longo do tempo.
- Ou seja, o diferencial real não é só "livro-caixa" (entradas x saídas), é rastreamento de **preço por produto ao longo do tempo**.

## Estado atual do código (MVP já implementado)

Monorepo simples, dois apps Next.js separados, sem workspace compartilhado:

```
Controle Financeiro/
├── backend/    → API Next.js (porta 3001) — rotas em app/api/
└── frontend/   → Next.js + React + Tailwind v4 (porta 3000)
```

**Backend** (`backend/`):
- `lib/db.ts` — SQLite via `better-sqlite3` (`data/finance.db`), duas tabelas: `users` (id, name, email, password_hash) e `transactions` (id, user_id, type: 'income'|'expense', amount, description, date).
- `lib/auth.ts` — JWT (`jsonwebtoken` + `bcryptjs`).
- `lib/cors.ts` — helper de CORS/response JSON compartilhado entre rotas.
- Rotas: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET/POST/DELETE /api/transactions` (com `summary`: totalIncome, totalExpense, balance calculados no GET).

**Frontend** (`frontend/`):
- `lib/api.ts` — client HTTP para o backend; `lib/auth-context.tsx` — contexto de auth (token em localStorage).
- Páginas: `/`, `/login`, `/register`, `/dashboard` (protegida via `ProtectedRoute`).
- Componentes do dashboard: `BalanceCard` (saldo), `ClusteredChart` (gráfico de colunas entradas x saídas por mês), `TransactionForm` (form manual: tipo/valor/descrição/data), `TransactionList`.
- Visual: tema dark com botões 3D neon (verde para entrada, vermelho para saída) — já com identidade visual definida, não é genérico.

**O que existe hoje é só um "livro-caixa"**: transação genérica com `description` livre, sem conceito de produto/item, sem mercado/loja, sem histórico de preço por item, sem OCR/câmera, sem app mobile (só web responsivo via Next.js).

**Categorias com cores neon (2026-08-17)**: transações ganharam um campo `category` (7 categorias fixas: Salário, Mercado, Moradia, Transporte, Lazer, Saúde, Outros), cada uma com uma cor neon própria definida em `frontend/lib/categories.ts` (espelhado em `backend/lib/categories.ts` para validação). Migração leve em `db.ts` (`ALTER TABLE ... ADD COLUMN category DEFAULT 'Outros'` se a coluna não existir) — transações antigas viraram automaticamente "Outros". `TransactionForm` ganhou um `<select>` de categoria; `TransactionList` mostra uma badge colorida por categoria. O gráfico original (`ClusteredChart`, Entradas x Saídas) saiu do verde/vermelho pra azul claro/vermelho neon; um novo `CategoryChart` mostra gasto por categoria por mês — só renderiza `<Bar>` para categorias efetivamente usadas nos dados, então o número de cores no gráfico cresce organicamente conforme o usuário varia as categorias (era o pedido original: "não ficar só nesse gráfico vermelho e verde").

Git: branch `feature/mvp-controle-financeiro`, 1 commit (`f4bcb4e`). Havia mudanças não commitadas em quase todos os arquivos de `backend/app`, `backend/lib`, `frontend/app`, `frontend/components`, `frontend/lib` na última vez que foi lido (2026-08-14) — checar `git status`/`git diff` antes de assumir o estado exato, pode já ter mudado.

## Decisões em aberto (perguntei ao usuário em 2026-08-14, ele ainda não respondeu — retomar por aqui)

1. **Como capturar os itens da compra?**
   - (a) Foto do recibo/carrinho, lida por IA (Claude via API de visão da Anthropic — já usado no projeto irmão `Audiobooks_business`, mesmo padrão de integração pode ser reaproveitado) e extraída em lista estruturada de produto+preço.
   - (b) Só digitação manual por enquanto (mais rápido de construir, OCR fica pra fase 2).
   - (c) As duas coisas desde já.

2. **O "app mobile" deve ser nativo de verdade ou um site responsivo?**
   - (a) App nativo React Native/Expo — mesmo padrão já usado em `packages/mobile` do projeto `Audiobooks_business` (Expo SDK, reaproveitar a experiência). Dá acesso real à câmera do celular e é instalável.
   - (b) PWA — melhorar o Next.js existente pra funcionar bem no celular e ser "instalável" via navegador. Mais rápido, mas câmera/experiência de app fica mais limitada.

3. **Modelo de dados: migrar já de "transações genéricas" para "produtos com histórico de preço", ou manter simples por enquanto?**
   - (a) Migrar já — criar tabela de produtos/itens de compra vinculada a cada transação/compra, essencial pra comparar preço do mesmo produto mês a mês (o coração da ideia).
   - (b) Manter como está e adicionar depois.

## Quando retomar

Perguntar ao usuário essas 3 decisões (ou confirmar se já decidiu) antes de implementar. Depois disso, o plano provável é:
- Se (3a): nova tabela `purchase_items` (ou `products` + `price_history`) ligada a uma compra/transação, com nome do produto, preço unitário, quantidade, mercado/loja.
- Se (1a) ou (1c): endpoint de upload de imagem no backend + chamada à API de visão da Anthropic pra extrair itens da foto, com fallback pra edição manual do que a IA leu (não confiar 100% na extração automática).
- Se (2a): novo `packages/mobile`-like app (Expo) reaproveitando o backend Next.js já existente como API.
- Dashboards: adicionar comparação mês a mês por produto (preço subiu/desceu), não só o gráfico atual de entradas x saídas.

## Identidade visual / logotipo — FECHADO (2026-08-18)

**Nome definitivo: Divisa** (palavra real pra "moeda estrangeira", idêntica em PT/ES, verificada sem colisão com apps existentes — ver histórico de nomes descartados abaixo). O produto também mudou de escopo nesse meio-tempo: deixou de ser só "controle de compra de mercado" e virou **controle financeiro + conversor de moeda entre 16 países** (Brasil, EUA + 14 países hispanofalantes da América Latina — ver seção "Região/moeda" abaixo).

Nomes testados e descartados antes de "Divisa", por colisão real com apps existentes (verificado via busca):
- "Grana" — já é nome de pelo menos 2 apps financeiros brasileiros reais.
- "Anotaí" — colide fortemente com "Lista de Compras - Anota Aí!", "Anota ai, Sô" (assistente financeiro com IA) e "Anota AI".
- "Cartaí" — verificado sem colisão, mas descartado porque o app deixou de ser "sobre carrinho de mercado" e o nome não fazia mais sentido.

**Logo atual (em uso de verdade no app)**:
- `frontend/public/icon-divisa-final.png` — ícone: gráfico de barras ascendente + seta subindo + moeda com cifrão de dólar, em branco, sobre fundo degradê pôr do sol (amarelo→laranja→magenta), cantos arredondados. **Não é um desenho meu — é a imagem de referência exata que o usuário forneceu** (`Downloads/moeda cambio.jpg`), recolorida pixel a pixel com um script Node/Jimp (linework original preservado 1:1, só a cor mudou: cinza → degradê, fundo branco mantido).
- `frontend/public/logo-divisa-lockup.svg` — versão com "DIVISA" escrito embaixo — **mantida só como referência visual, não é usada diretamente no app** (ver nota técnica abaixo).
- Usado em `app/login/page.tsx` e no cabeçalho de `app/dashboard/page.tsx` como **dois elementos HTML separados**: `<img src="/icon-divisa-final.png">` + um `<span>` com "DIVISA" em degradê via CSS (`background-clip: text`) — **não** como um único SVG com `<image href>` embutida, porque isso não carrega quando o SVG é usado como `<img src>` dentro do React (o contexto de imagem do navegador não busca recursos externos referenciados dentro do SVG nesse caso).
- Vários outros conceitos de logo foram explorados e descartados ao longo do caminho (`logo-takenote.svg`, `logo-digitalnotes.svg`, `icon-playstore.svg`) — continuam no repo como histórico, não são usados em lugar nenhum.

Pendente: gerar os tamanhos de ícone que a Play Store/App Store exigem (o arquivo atual é 554x554) quando o app mobile existir de fato — ver roteiro abaixo.

## Região / moeda — 16 países (2026-08-18)

O app deixou de ser só sobre "controle de compra de mercado" pra ser **controle financeiro + conversor de câmbio**, com foco em quem viaja entre países da América Latina:

- `frontend/lib/regions.ts` — 16 regiões (Brasil, EUA + Argentina, Paraguai, Uruguai, Chile, Venezuela, Colômbia, Peru, Bolívia, Equador, El Salvador, México, Porto Rico, Honduras, Guatemala), cada uma com moeda, locale ICU (formatação numérica correta por país) e idioma (PT pro Brasil, EN pros EUA, ES pros outros 14 — Equador/El Salvador/Porto Rico usam Dólar de verdade, dolarização real, não erro).
- `backend/app/api/exchange-rates` + `frontend/lib/exchangeRates.ts` — cotação de câmbio **ao vivo**, buscada de uma API gratuita (open.er-api.com, sem chave), com cache de 12h (backend em memória, frontend em localStorage). Se a API cair, cai pra uma tabela fixa em `regions.ts` (`REGION_EXCHANGE_FROM_BRL`) como último recurso.
- `frontend/components/CurrencyConverter.tsx` — conversor independente (De/Para, qualquer um dos 16 países), pensado especificamente pro caso de uso "casal viajando de motorhome pela fronteira" que o usuário descreveu.
- `frontend/components/LanguageSwitcher.tsx` / `RegionSelect.tsx` — seletor de país/moeda (dropdown customizado com bandeiras em SVG próprio — `FlagIcon.tsx` — não emoji, porque o Windows não renderiza emoji de bandeira como imagem, só mostra o código do país em texto).

## Roteiro: transformação em app mobile (React Native/Expo) — planejado em 2026-08-18, ainda não iniciado

Decisão de base: **React Native com Expo**, mesmo caminho já usado no projeto irmão `Audiobooks_business` (`packages/mobile`). O backend Next.js não muda nada — ele já é uma API, o mobile só vira mais um cliente dela.

1. **Fundação (auth + navegação)** — ~2 dias. Projeto Expo, login/cadastro (portar `lib/api.ts`, trocar `localStorage` por `AsyncStorage`), React Navigation.
2. **Núcleo financeiro** — ~2-3 dias. Saldo, formulário de transação, histórico com busca/filtro, categorias.
3. **Gráficos** — ~2 dias. Trocar Recharts (só web) por uma lib compatível com RN (ex: Victory Native); portar os 3 gráficos.
4. **Internacionalização + câmbio** — ~2 dias. Portar traduções e a lógica dos 16 países (é quase copiar/colar, é lógica pura); seletor nativo; conversor + cotação ao vivo.
5. **Identidade visual** — ~1 dia. Gerar `icon-divisa-final.png` nos tamanhos que iOS/Android exigem; splash screen; adaptar tema escuro pro RN.
6. **Testes reais** — ~1-2 dias. Expo Go num celular de verdade (sem precisar de conta paga ainda); ajustes de teclado/área segura.
7. **Publicação** — tempo variável. Configurar EAS Build; **trava até o usuário ter conta de desenvolvedor Apple (paga, ~US$99/ano) e/ou Google Play Console (paga, taxa única ~US$25)** — ação dele, fora do código; preparar ficha da loja.

Total estimado do que depende só de código (etapas 1-6): ~10-12 dias de trabalho focado. Etapa 7 trava em decisão/pagamento do usuário, mesmo padrão já visto nesse projeto (Mercado Pago, hospedagem) e no projeto irmão (contas Apple/Google).

## Problemas conhecidos

**"Erro interno do servidor" em qualquer rota que toca o banco (register/login/transactions)**: o módulo nativo `better-sqlite3` foi compilado para a versão do Node instalada quando `npm install` rodou (junho/2026) — se o Node da máquina for atualizado depois disso, o binário fica com `NODE_MODULE_VERSION` incompatível e todo `require('better-sqlite3')` falha (`ERR_DLOPEN_FAILED`). A rota engole o erro num `catch` genérico sem logar nada, então o único sintoma visível é o 500 no frontend. Corrigido em 2026-08-15 rodando:

```bash
cd backend && npm rebuild better-sqlite3
```

Depois é preciso reiniciar o servidor do backend (o processo antigo mantém o módulo quebrado carregado em memória). Se o erro voltar após uma atualização do Node, repetir esse rebuild — não é um bug de código, é um artefato de build desatualizado (`node_modules` é gitignored, então isso nunca fica "resolvido" permanentemente no repo).

## Comandos

```bash
cd backend && npm run dev   # API em :3001
cd frontend && npm run dev  # Web em :3000
```
