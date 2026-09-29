#!/usr/bin/env node
/**
 * Baixa uma cópia do banco de produção para esta máquina.
 *
 * Por que existe: o backup do Railway guarda os snapshots dentro do mesmo
 * projeto, e a documentação deles avisa que apagar o volume apaga os backups
 * junto. Isso cobre "estraguei os dados" mas não cobre "perdi o projeto". Este
 * script é o segundo lugar, num disco que não é do Railway.
 *
 * Uso:
 *   node scripts/baixarBackup.mjs
 *
 * Pergunta o e-mail e a senha do admin (a senha não aparece na tela e não fica
 * no histórico do terminal, ao contrário de passá-la por argumento).
 *
 * Variáveis opcionais:
 *   API_URL      endereço do servidor (padrão: a produção)
 *   BACKUP_DIR   onde salvar      (padrão: ./backups, fora do versionamento)
 */

import fs from "fs";
import path from "path";
import readline from "readline";

const API_URL =
  process.env.API_URL || "https://controle-financeiro-production-da55.up.railway.app";
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");

function perguntar(texto, oculto = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    if (!oculto) {
      rl.question(texto, (resposta) => {
        rl.close();
        resolve(resposta.trim());
      });
      return;
    }

    // Esconde a senha enquanto é digitada, interceptando a escrita no terminal.
    const escrever = rl._writeToOutput.bind(rl);
    let mascarar = false;
    rl._writeToOutput = (str) => {
      if (mascarar && !str.includes(texto)) return;
      escrever(str);
    };
    rl.question(texto, (resposta) => {
      rl._writeToOutput = escrever;
      rl.close();
      process.stdout.write("\n");
      resolve(resposta.trim());
    });
    mascarar = true;
  });
}

async function main() {
  console.log(`Servidor: ${API_URL}\n`);

  const email = await perguntar("E-mail do admin: ");
  const senha = await perguntar("Senha: ", true);

  if (!email || !senha) {
    console.error("E-mail e senha são obrigatórios.");
    process.exit(1);
  }

  process.stdout.write("Entrando... ");
  const login = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: senha }),
  });

  const dadosLogin = await login.json().catch(() => ({}));
  if (!login.ok) {
    console.error(`falhou (HTTP ${login.status}): ${dadosLogin.error || ""}`);
    process.exit(1);
  }
  console.log("ok");

  process.stdout.write("Gerando a cópia no servidor... ");
  const resposta = await fetch(`${API_URL}/api/admin/backup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${dadosLogin.token}`,
    },
    // A senha vai de novo de propósito: um token sozinho não tira o banco
    // inteiro do servidor. Ver o comentário da rota.
    body: JSON.stringify({ password: senha }),
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    console.error(`falhou (HTTP ${resposta.status}): ${erro.error || ""}`);
    process.exit(1);
  }
  console.log("ok");

  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const nome =
    resposta.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] ||
    `divisa-backup-${Date.now()}.db`;
  const destino = path.join(BACKUP_DIR, nome);

  const conteudo = Buffer.from(await resposta.arrayBuffer());
  fs.writeFileSync(destino, conteudo);

  const contagens = resposta.headers.get("x-backup-counts");

  console.log(`\nSalvo em: ${destino}`);
  console.log(`Tamanho : ${(conteudo.length / 1024).toFixed(1)} KB`);
  if (contagens) {
    const c = JSON.parse(contagens);
    console.log("Conteúdo:");
    for (const [tabela, n] of Object.entries(c)) {
      console.log(`  ${tabela.padEnd(24)} ${n}`);
    }
  }
  console.log(
    "\nUm backup que nunca foi aberto não é um backup comprovado."
  );
  console.log(`Confira com:  node scripts/conferirBackup.mjs "${destino}"`);
}

main().catch((erro) => {
  console.error(`\nErro: ${erro.message}`);
  process.exit(1);
});
