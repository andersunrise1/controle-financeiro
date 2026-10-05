#!/usr/bin/env node
/**
 * Lista as contas e concede (ou remove) acesso vitalício de cortesia.
 *
 * Faz pelo terminal o que a tela /admin faz pelo navegador. Existe por dois
 * motivos práticos: o site pode estar atrás do backend num momento em que a
 * concessão é urgente, e conceder acesso aos parceiros de divulgação é uma
 * tarefa recorrente que fica mais rápida assim.
 *
 * É cortesia, não compra: não preenche `paid_at`, então pode ser desfeita.
 * Uma conta que pagou de verdade é recusada pelo servidor (409).
 *
 * Uso:
 *   node scripts/liberarVitalicio.mjs
 *
 * Variável opcional:
 *   API_URL   endereço do servidor (padrão: a produção)
 */

import { criarPerguntador } from "./prompt.mjs";

const API_URL =
  process.env.API_URL || "https://controle-financeiro-production-da55.up.railway.app";

async function api(caminho, { metodo = "GET", corpo, token } = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });
  const dados = await resposta.json().catch(() => ({}));
  return { ok: resposta.ok, status: resposta.status, dados };
}

function rotulo(conta) {
  if (conta.plan === "lifetime") return conta.paid_at ? "VITALÍCIO (comprou)" : "VITALÍCIO (cortesia)";
  return conta.dias_restantes > 0 ? `teste, ${conta.dias_restantes}d` : "TESTE VENCIDO";
}

async function main() {
  const { perguntar, fechar } = criarPerguntador();
  try {
    await executar(perguntar);
  } finally {
    fechar();
  }
}

async function executar(perguntar) {
  console.log(`Servidor: ${API_URL}\n`);

  const email = await perguntar("E-mail do admin: ");
  const senha = await perguntar("Senha: ", true);

  const login = await api("/api/auth/login", {
    metodo: "POST",
    corpo: { email, password: senha },
  });
  if (!login.ok) {
    throw new Error(`Login falhou (HTTP ${login.status}): ${login.dados.error || ""}`);
  }
  const token = login.dados.token;

  const lista = await api("/api/admin/users", { token });
  if (!lista.ok) {
    throw new Error(`Não consegui listar (HTTP ${lista.status}): ${lista.dados.error || ""}`);
  }

  const contas = lista.dados.users;
  console.log(`\n${contas.length} conta(s):\n`);
  contas.forEach((c, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${c.email.padEnd(32)} ${rotulo(c)}`);
  });

  const escolha = await perguntar(
    "\nNúmero da conta para alternar o vitalício (ou Enter para sair): "
  );
  if (!escolha) {
    console.log("Nada alterado.");
    return;
  }

  const indice = Number(escolha) - 1;
  const alvo = contas[indice];
  if (!alvo) {
    throw new Error("Número inválido.");
  }

  const conceder = alvo.plan !== "lifetime";
  const acao = conceder ? "LIBERAR vitalício para" : "REMOVER o vitalício de";
  const confirma = await perguntar(`${acao} ${alvo.email}? (s/N) `);
  if (confirma.toLowerCase() !== "s") {
    console.log("Nada alterado.");
    return;
  }

  const r = await api("/api/admin/users", {
    metodo: "PATCH",
    token,
    corpo: { id: alvo.id, lifetime: conceder },
  });

  if (!r.ok) {
    throw new Error(`Falhou (HTTP ${r.status}): ${r.dados.error || ""}`);
  }

  const depois = await api("/api/admin/users", { token });
  const atual = depois.dados.users?.find((c) => c.id === alvo.id);
  console.log(`\n${alvo.email} -> ${atual ? rotulo(atual) : "?"}`);
}

// `process.exitCode` em vez de `process.exit()`: sair à força enquanto a leitura
// do teclado ainda está fechando dispara uma asserção nativa do libuv no Windows
// ("UV_HANDLE_CLOSING"), que apareceu na tela como um erro assustador logo depois
// de uma falha banal — senha errada. Assim o Node encerra sozinho, no seu tempo,
// já com o código de saída certo.
main().catch((erro) => {
  console.error(`\n${erro.message}`);
  process.exitCode = 1;
});
