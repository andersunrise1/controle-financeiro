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

## Identidade visual / logotipo (2026-08-17, em andamento)

Vários conceitos de logo foram explorados em `frontend/public/`, do mais antigo ao aprovado:

- `logo-takenote.svg` — emblema circular azul neon com carrinho de compras (réplica de uma referência: cesta em malha + etiqueta de preço com sinal "smart"), fundo cinza escuro. Nome de trabalho "Takenote". **Ainda é o único integrado no app de verdade** (usado em `app/login/page.tsx` e no cabeçalho de `app/dashboard/page.tsx`) — desatualizado frente às decisões abaixo, precisa ser trocado.
- `logo-digitalnotes.svg` — variação: carrinho cuja cesta é formada por 3 colunas de gráfico ascendente (verde claro, azul neon, azul escuro neon), anel também azul escuro neon, fundo preto. Nome de trabalho "Digital Notes". Não integrado no app.
- `icon-playstore.svg` — **o aprovado pelo usuário ("isso agora sim")**, pensado especificamente como ícone de loja de apps (sem texto embutido — a Play Store já mostra o nome do app separado do ícone): sacola de compras sólida branca em degradê amarelo→laranja→magenta, com um mini gráfico de barras ascendente recortado em negativo dentro dela (mesma cor do fundo aparecendo "através" da sacola). Ainda não integrado em lugar nenhum do app — só existe como arquivo.

**Nome do app ainda não decidido.** Testados e descartados por colisão real com apps já existentes na Play Store (verificado via busca, 2026-08-17):
- "Grana" — já é nome de pelo menos 2 apps financeiros brasileiros reais.
- "Anotaí" — colide fortemente: já existe "Lista de Compras - Anota Aí!" (app de lista de compras) e "Anota ai, Sô" (assistente financeiro com IA, conceito muito parecido com o deste projeto), além de "Anota AI" (plataforma de gestão pra comércios).

**Recomendação em aberto, não confirmada pelo usuário**: **Cartaí** (carrinho + "aí" coloquial brasileiro) — verificado sem colisão na busca, conecta com o elemento "carrinho" presente em todos os logos explorados.

Quando retomar esse assunto: (1) fechar o nome definitivo (Cartaí ou outro), (2) trocar `logo-takenote.svg` por `icon-playstore.svg` (ou uma variante com o nome escolhido) no login/dashboard, (3) gerar as variações de tamanho que a Play Store exige (512x512 é o base usado aqui) quando o app mobile existir de fato.

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
