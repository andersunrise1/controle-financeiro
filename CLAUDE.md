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

## Roteiro: transformação em app mobile (React Native/Expo) — planejado em 2026-08-18, iniciado em 2026-08-19

Decisão de base: **React Native com Expo**, mesmo caminho já usado no projeto irmão `Audiobooks_business` (`packages/mobile`). O backend Next.js não muda nada — ele já é uma API, o mobile só vira mais um cliente dela.

**Exigência confirmada pelo usuário em 2026-08-19, antes de começar**: o mobile precisa ficar **fiel ao site em tudo** — mesmas cores (degradê pôr do sol, tema escuro, verde/vermelho neon), mesmo logo, os 4 dashboards, Nova Transação com todas as regras (descrição/categoria/data/recorrência), Histórico, conversor de moeda com os 16 países, Feedback, e o Admin (gate por e-mail). Isso amplia o escopo original da Etapa 2 (que só mencionava "saldo, formulário, histórico, categorias") para cobrir também **Feedback**, **Admin** e **recorrências** — funcionalidades reais que o site ganhou depois de 18/08 e que também precisam existir no mobile.

1. **Fundação (auth + navegação)** — ~2 dias — **CONCLUÍDA em 2026-08-19**. `mobile/` (Expo SDK 57, React 19, RN 0.86, `create-expo-app` blank template). `src/services/api.js` espelha `frontend/lib/api.ts` (login/register/getMe/logout, mesmas rotas, mesma forma de resposta), trocando `localStorage` por `AsyncStorage`; `src/context/AuthContext.jsx` espelha `auth-context.tsx` com um `isReady` (AsyncStorage é assíncrono, ao contrário do localStorage) pra evitar piscar a tela de login pra quem já tá logado. `src/navigation/AppNavigator.jsx` troca a pilha inteira (não guarda por tela) entre Login/Register e a área logada, seguindo o padrão do projeto irmão. Identidade visual já replicada desde o primeiro dia: `src/theme.js` com os hex exatos do `globals.css`, `GradientText.jsx` (via `MaskedView` + `expo-linear-gradient`, já que RN não tem `background-clip:text`) pro wordmark "DIVISA", e o ícone real (`icon-divisa-final.png`) copiado — não recriado — pro projeto. `HomeScreen.jsx` é um placeholder só provando que a área autenticada renderiza; o dashboard de verdade é a Etapa 2.

   Verificado de ponta a ponta contra o backend real via `expo start --web` (mesma técnica do projeto irmão, já que este ambiente não tem emulador Android/iOS): login com conta existente, erro de senha errada mostrando a mensagem certa do backend, cadastro de conta nova, sessão sobrevivendo a um reload, e logout — todos funcionando com dados reais, não simulados. As cores dos campos de input foram conferidas via `getComputedStyle` e batem em hex exato com o site (`#2a2a2a`/`#555`/`#f3f4f6`). Um detalhe real, não bug: como o CORS do backend (`lib/cors.ts`) trava numa única origem (`FRONTEND_URL`), testar pelo navegador via `expo start --web` exigiu apontar `FRONTEND_URL` temporariamente pra porta do Expo (8081) — revertido pra `:3000` assim que o teste terminou. Isso não afeta o app nativo de verdade (ele não manda cabeçalho `Origin`), só essa via de teste local.

   Pendências reais, já sabidas: sem ESLint configurado ainda no `mobile/` (o template do Expo não traz um pronto); i18n (PT/EN/ES) fica pra Etapa 4, então as telas de login/cadastro estão em português fixo por enquanto — mesma sequência que o roteiro original já previa.

2. **Núcleo financeiro** — ~2-3 dias, escopo ampliado — **CONCLUÍDA em 2026-08-20**. `DashboardScreen.jsx` (Saldo, `TransactionForm`, `RecurringTransactionsList`, `TransactionList`), `FeedbackScreen.jsx` e `AdminScreen.jsx` (gate por `user.isAdmin`, igual ao site) — todos espelhando os componentes web equivalentes, mesmas regras de validação, mesmos textos. Navegação virou abas na parte de baixo (`MainTabs.jsx`, Dashboard/Feedback/Admin — Admin só aparece pra quem é admin) em vez dos links no topo do site, que é a adaptação padrão de mobile pro mesmo conjunto de telas — o projeto irmão TechSpeak fez a mesma escolha. `src/lib/categories.js` e `src/lib/currency.js` replicam as cores de categoria e a formatação de moeda do site (só BRL por enquanto — 16 países é Etapa 4). Dois componentes nativos novos: `SelectField.jsx` (`@react-native-picker/picker`) e `DateField.jsx` (`@react-native-community/datetimepicker`).

   **Não portado nessa etapa, decisão deliberada**: o botão "Bater foto do preço" (OCR via Tesseract.js) do `TransactionForm` web — Tesseract.js depende de Canvas/WASM do navegador, não roda igual em React Native, e essa etapa já estava grande o suficiente. Fica como pendência clara pra uma etapa futura, não foi esquecido nem escondido.

   Verificado de ponta a ponta contra o backend real: criei uma transação, ela apareceu no saldo e no histórico corretamente; enviei um feedback pelo celular e confirmei que chegou certinho no Admin (testado com a conta admin de teste, mesmo processo seguro do backend usado na Etapa 1); marquei o feedback como resolvido e o badge mudou. Achei e corrigi um bug real no processo: o seletor de categoria (`@react-native-picker/picker`) renderizava com fundo branco na versão web do Picker — a caixa escura ao redor não "vazava" através do `<select>` nativo, que é opaco por padrão; corrigido aplicando a cor de fundo direto no próprio Picker, não só no contêiner.

   **Limitação de teste conhecida, não é bug**: o `Alert.alert()` do React Native (usado pra confirmar antes de excluir uma transação) não tem implementação alguma no `react-native-web` — não aparece diálogo nenhum nesse ambiente de preview, então não deu pra clicar em "Remover" pela ferramenta de teste. Verifiquei a chamada real da API de exclusão direto (funciona), mas o fluxo completo com a caixa de confirmação só é testável num Android/iOS de verdade.
3. **Gráficos** — ~2 dias — **CONCLUÍDA em 2026-08-20**. Em vez de uma lib de gráfico de terceiros (Victory Native etc.), os 3 gráficos foram desenhados à mão com `react-native-svg` — já provado confiável nessa etapa (usado no `GradientText` desde a Etapa 1), enquanto duas bibliotecas nativas diferentes (`MaskedView`, `@react-native-picker/picker`) já causaram bugs reais só percebidos em dispositivo real ou depois de teste minucioso. `GroupedBarChart.jsx` é o primitivo compartilhado (barras agrupadas por SVG) por trás dos três: `YearlyChart.jsx` (barra única com o degradê pôr do sol + "Ano que você mais gastou" em `GradientText`), `ClusteredChart.jsx` (entrada verde/saída vermelho) e `CategoryChart.jsx` (uma barra por categoria, cada uma com seu próprio degradê local — portei a função `sunsetColorAt` pro mobile em `src/lib/sunsetGradient.js`, mesma matemática do site). Simplificação real e assumida: sem tooltip ao tocar (o site mostra valores exatos ao passar o mouse); os valores continuam legíveis pelo eixo, mas essa interação não foi portada ainda.

   **Bug pré-existente achado durante o port, corrigido em ambos em 2026-08-20**: o gráfico "Gastos por Categoria por Mês" do **site** (não só o mobile) contava entradas junto com saídas — a função `groupByMonthAndCategory` nunca filtrou por `type`, diferente de `groupByYear` que corretamente só soma `type === "expense"`. Reproduzido ao vivo: um "Salário" (entrada) aparecia nesse gráfico junto com as saídas de Mercado/Moradia/Lazer. Corrigido com o mesmo filtro `if (t.type !== "expense") return;` em `frontend/components/CategoryChart.tsx` e `mobile/src/lib/chartGrouping.js`, mantendo os dois idênticos. Verificado com dados reais nos dois: criei uma entrada de Salário junto com saídas de Mercado, e confirmei que "Salário" não aparece mais na legenda nem nas barras em nenhuma das duas plataformas.

   Verificado de ponta a ponta com dados reais (criei 4 transações via API — 1 entrada, 3 saídas em categorias diferentes): saldo, o gráfico de ano com o valor e degradê corretos, entradas vs saídas com as cores certas, categorias com cores individuais e legenda, formatação compacta do eixo Y ("2,1 mil") batendo com o padrão brasileiro.
4. **Internacionalização + câmbio** — ~2 dias — **CONCLUÍDA em 2026-08-20**. `src/lib/regions.js`, `src/lib/exchangeRates.js` (cache em `AsyncStorage`, TTL 12h) e `src/lib/i18n.js` (dicionário PT/EN/ES completo, ~70 chaves) são ports diretos de `frontend/lib/regions.ts`/`exchangeRates.ts`/`i18n.ts` — lógica pura, sem mudança de comportamento. `src/context/LocaleContext.jsx` (novo, sem equivalente 1:1 no site porque lá cada componente lia `region`/`locale` direto do próprio estado local) centraliza `region` (persistido em `AsyncStorage`), `locale` derivado e `t()`, envolvendo `AuthProvider` em `App.js`. `src/components/FlagIcon.jsx` (as 16 bandeiras, via `react-native-svg`) e `src/components/CurrencyConverter.jsx` são ports completos dos equivalentes web. Todo texto fixo em português das Etapas 1-3 (telas, formulário, gráficos, admin, feedback) passou a usar `t()`; `currency.js`/`chartGrouping.js` dos gráficos (Etapa 3) ganharam `region` como parâmetro em vez de assumir `pt-BR` fixo.

   **Peça nova, sem equivalente no site**: `src/components/RegionPicker.jsx` — o site troca de região por um dropdown com clique-fora-fecha (`LanguageSwitcher`/`RegionSelect`), que não existe em touch; o mobile usa um `Modal` com lista de bandeiras. Usado tanto no cabeçalho (troca global) quanto, com estado próprio, no conversor de moeda (De/Para independentes do idioma do app — igual ao site).

   **Bug real achado e corrigido durante a verificação, não durante a escrita do código**: trocar o idioma de volta pra português (depois de já ter ido pra inglês) não fazia efeito — o clique parecia registrar mas a tela continuava em inglês. Causa raiz: `RegionPicker` renderizava `<Modal visible={open}>` sempre montado, só alternando a prop `visible`; no `react-native-web`, um `Modal` com `visible={false}` não desmonta o conteúdo do DOM, só o esconde — como a `DashboardScreen` tem 3 `RegionPicker`s ao mesmo tempo (cabeçalho + conversor De + conversor Para), havia 3 cópias da lista de 16 países coexistindo no DOM, e o clique podia acertar a cópia errada (escondida) em vez da que estava genuinamente visível. Corrigido renderizando o `<Modal>` condicionalmente (`{open && <Modal visible ...>}`) — um picker fechado agora não contribui nenhum nó ao DOM, eliminando a ambiguidade de vez.

   Verificado de ponta a ponta contra o backend real: troquei pra "Estados Unidos" no cabeçalho e confirmei que todo texto (formulário, categorias, gráficos, histórico, admin) virou inglês, os valores de saldo/histórico/gráficos converteram pra USD corretamente, as datas passaram pro formato americano, e a cotação ao vivo carregou (não caiu no fallback estático) mostrando um valor convertido real e o timestamp de atualização. Confirmei a volta pra "Brasil" depois do fix acima — tudo cascateou de volta pra português/BRL corretamente, incluindo o conversor de moeda (que manteve seu próprio estado De/Para independente do idioma global, como no site).
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
