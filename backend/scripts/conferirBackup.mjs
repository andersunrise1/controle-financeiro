#!/usr/bin/env node
/**
 * Confere que um arquivo de backup presta.
 *
 * Isto é metade do valor de ter backup. Um arquivo que nunca foi aberto é uma
 * suposição, não uma garantia — e o momento em que se descobre que ele está
 * corrompido não pode ser o momento em que ele é necessário.
 *
 * Abre a cópia de verdade, roda a checagem de integridade do próprio SQLite,
 * confere que o esquema esperado está lá e conta as linhas de cada tabela.
 *
 * Uso:
 *   node scripts/conferirBackup.mjs caminho/do/arquivo.db
 *   node scripts/conferirBackup.mjs            (pega o mais recente em ./backups)
 */

import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const TABELAS_ESPERADAS = [
  "users",
  "transactions",
  "recurring_transactions",
  "feedback",
  "password_resets",
  "login_attempts",
];

function maisRecente(dir) {
  if (!fs.existsSync(dir)) return null;
  const arquivos = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".db"))
    .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return arquivos[0] ? path.join(dir, arquivos[0].f) : null;
}

const alvo =
  process.argv[2] || maisRecente(process.env.BACKUP_DIR || path.join(process.cwd(), "backups"));

if (!alvo || !fs.existsSync(alvo)) {
  console.error("Nenhum backup encontrado. Passe o caminho do arquivo como argumento.");
  process.exit(1);
}

console.log(`Conferindo: ${alvo}`);
console.log(`Tamanho   : ${(fs.statSync(alvo).size / 1024).toFixed(1)} KB\n`);

let db;
try {
  db = new Database(alvo, { readonly: true, fileMustExist: true });
} catch (erro) {
  console.error(`FALHOU: o arquivo não abre como banco SQLite — ${erro.message}`);
  process.exit(1);
}

let problemas = 0;

// A checagem do próprio SQLite: percorre as páginas e acusa corrupção.
const integridade = db.prepare("PRAGMA integrity_check").get();
const resultado = Object.values(integridade)[0];
if (resultado === "ok") {
  console.log("integrity_check ......... ok");
} else {
  console.log(`integrity_check ......... FALHOU: ${resultado}`);
  problemas++;
}

const presentes = new Set(
  db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
    .map((r) => r.name)
);

console.log("\nTabelas:");
for (const tabela of TABELAS_ESPERADAS) {
  if (!presentes.has(tabela)) {
    console.log(`  ${tabela.padEnd(24)} FALTANDO`);
    problemas++;
    continue;
  }
  const { n } = db.prepare(`SELECT COUNT(*) AS n FROM ${tabela}`).get();
  console.log(`  ${tabela.padEnd(24)} ${n}`);
}

// O dado que realmente importa recuperar: se não há usuário, não há nada.
const { n: usuarios } = db.prepare("SELECT COUNT(*) AS n FROM users").get();
if (usuarios === 0) {
  console.log("\nFALHOU: nenhum usuário no backup.");
  problemas++;
}

// Uma leitura de verdade, não só contagem: prova que dá para usar os dados.
if (presentes.has("transactions") && presentes.has("users")) {
  const amostra = db
    .prepare(
      `SELECT u.email, COUNT(t.id) AS lancamentos, COALESCE(SUM(
          CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) AS saldo
         FROM users u LEFT JOIN transactions t ON t.user_id = u.id
        GROUP BY u.id ORDER BY lancamentos DESC LIMIT 3`
    )
    .all();
  if (amostra.length) {
    console.log("\nAmostra (contas com mais lançamentos):");
    for (const linha of amostra) {
      console.log(
        `  ${linha.email.padEnd(30)} ${String(linha.lancamentos).padStart(4)} lanç.  saldo ${linha.saldo.toFixed(2)}`
      );
    }
  }
}

db.close();

console.log(
  problemas === 0
    ? "\nBackup íntegro e legível."
    : `\n${problemas} problema(s) encontrado(s). NÃO confie neste arquivo.`
);
process.exit(problemas === 0 ? 0 : 1);
