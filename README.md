# Controle Financeiro — MVP

Aplicação web de controle financeiro pessoal com frontend e backend separados.

## Estrutura

```
Controle Financeiro/
├── backend/    → API Next.js (porta 3001)
└── frontend/   → Interface Next.js + React + Tailwind (porta 3000)
```

## Como rodar

Abra **dois terminais**:

### Terminal 1 — Backend
```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```

Acesse: **http://localhost:3000**

## Funcionalidades

- Cadastro e login com e-mail e senha
- Sessão persistente (token JWT no localStorage)
- Dashboard com saldo automático (entradas − saídas)
- Gráfico de colunas clusterizado (entradas vs saídas por mês)
- Cadastro manual de transações com data
- Proteção de rotas (não autenticado → login)
