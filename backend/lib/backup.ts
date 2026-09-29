import fs from "fs";
import os from "os";
import path from "path";
import { getDb } from "./db";

/**
 * Cópia consistente do banco, com o servidor em uso.
 *
 * **Não copie o arquivo direto.** O banco roda em modo WAL: as escritas mais
 * recentes vivem num arquivo `-wal` separado até o próximo checkpoint, então um
 * `cp` (ou um `scp` puxando o arquivo de dentro do volume) pega o `.db` sem as
 * últimas transações, ou pior, pega os dois em momentos diferentes e produz uma
 * cópia rasgada que só falha na hora de restaurar — o pior momento possível
 * para descobrir.
 *
 * `db.backup()` usa a API de backup online do próprio SQLite, que copia página
 * por página coordenando com quem estiver escrevendo. O resultado é um banco
 * íntegro mesmo que alguém esteja lançando uma despesa no exato instante.
 */
export interface BackupResult {
  /** Caminho do arquivo gerado. Quem chamou é responsável por apagá-lo. */
  filePath: string;
  sizeBytes: number;
  /** Conferência rápida do que veio dentro, para não entregar um arquivo vazio. */
  counts: Record<string, number>;
}

/** Tabelas conferidas depois da cópia. Vazio em todas = algo deu errado. */
const TABELAS = [
  "users",
  "transactions",
  "recurring_transactions",
  "feedback",
] as const;

export async function createConsistentBackup(): Promise<BackupResult> {
  const db = getDb();

  // Vai para o diretório temporário do sistema, não para o volume: o objetivo
  // desta cópia é justamente sair de dentro do volume, e escrever ali dentro
  // ainda ocuparia o mesmo disco que se quer proteger.
  const nome = `divisa-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.db`;
  const filePath = path.join(os.tmpdir(), nome);

  await db.backup(filePath);

  const copia = new (await import("better-sqlite3")).default(filePath, {
    readonly: true,
  });

  try {
    const counts: Record<string, number> = {};
    for (const tabela of TABELAS) {
      const row = copia.prepare(`SELECT COUNT(*) AS n FROM ${tabela}`).get() as {
        n: number;
      };
      counts[tabela] = row.n;
    }

    // Um backup que ninguém abriu não é um backup comprovado. Abrir a cópia e
    // contar as linhas é o mínimo que dá para conferir aqui mesmo, antes de
    // entregar o arquivo como se estivesse tudo bem.
    if (counts.users === 0) {
      throw new Error(
        "A cópia saiu sem nenhum usuário — algo deu errado no backup."
      );
    }

    return { filePath, sizeBytes: fs.statSync(filePath).size, counts };
  } finally {
    copia.close();
  }
}

/** Apaga o arquivo temporário. Silencioso: falhar aqui não invalida a cópia. */
export function discardBackupFile(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // O sistema limpa o diretório temporário sozinho de qualquer forma.
  }
}
