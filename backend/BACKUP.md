# Backup do banco do DIVISA

O banco é um arquivo SQLite (`data/finance.db`) que vive num volume do Railway.
Ele guarda as finanças de todos os clientes. **Perder esse arquivo é tão grave
quanto vazá-lo**: quem pagou o vitalício e perdeu dois meses de lançamentos não
volta.

São duas camadas, de propósito, porque nenhuma das duas cobre tudo sozinha.

---

## Camada 1 — Snapshots do Railway (cobre "estraguei os dados")

O Railway faz backup de volumes, e a documentação deles cita o caso por extenso:
*"any other data stored within a volume, such as an SQLite database"*.

**Não vem ligado.** Precisa ser ativado uma vez, à mão:

> Painel do Railway → projeto `mindful-curiosity` → serviço `controle-financeiro`
> → **Settings → Backups** → ativar **Daily** e **Monthly** → e disparar um
> backup manual ali mesmo, para não esperar 24 h pelo primeiro.

| Agendamento | Retenção |
|---|---|
| Daily | 6 dias |
| Weekly | 27 dias |
| Monthly | 89 dias |

Dá para marcar mais de um ao mesmo tempo. Diário + mensal cobre tanto o acidente
recente quanto o estrago que só aparece semanas depois.

### O que esta camada NÃO cobre

A documentação do Railway é explícita: **"Wiping a volume deletes all backups"**,
e *"Backups can only be restored into the same project + environment"*. Os
snapshots vivem dentro do mesmo projeto. Se o projeto for embora — apagado por
engano, problema de cobrança, conta suspensa — os backups vão junto.

É exatamente por isso que existe a camada 2.

---

## Camada 2 — Cópia externa, no seu computador

```bash
npm run backup --workspace=backend        # baixa
npm run backup:conferir --workspace=backend   # confere o que baixou
```

Ou, de dentro de `backend/`:

```bash
npm run backup
npm run backup:conferir
```

O script pergunta o e-mail e a senha do admin (a senha não aparece na tela nem
fica no histórico do terminal), baixa a cópia e salva em `backend/backups/`.

Por padrão aponta para a produção. Para outro servidor:

```bash
API_URL=http://localhost:3001 npm run backup
```

### Por que não é só copiar o arquivo

O banco roda em modo WAL: as escritas mais recentes ficam num arquivo `-wal`
separado até o próximo checkpoint. Um `cp`, um `scp` ou um `railway volume
browse` puxando o `.db` pega o arquivo sem as últimas transações — ou pega o
`.db` e o `-wal` em momentos diferentes e produz uma cópia rasgada que só falha
na hora de restaurar, que é o pior momento possível para descobrir.

`POST /api/admin/backup` usa a API de backup online do próprio SQLite, que copia
página por página coordenando com quem estiver escrevendo.

**Isso foi testado, não suposto:** uma cópia tirada durante 177 escritas
simultâneas saiu com `integrity_check` ok e todos os 209 lançamentos legíveis.

### A rota é a mais perigosa do sistema

O arquivo devolvido contém as finanças de todo mundo e os hashes de senha de
todas as contas. Por isso ela exige, cumulativamente: sessão válida, ser o
admin, **a senha digitada de novo** (para que um token roubado sozinho não tire
o banco de dentro do servidor), método POST, e o mesmo limite de tentativas do
login. Cada download é registrado no log com quem o fez.

Verificado: sem login → 401, conta comum → 403, admin sem senha → 400, admin com
senha errada → 401, admin correto → 200 com o arquivo.

### Onde os arquivos ficam

`backend/backups/` está no `.gitignore`, junto com `*.db`. **Um backup nunca
pode entrar no repositório** — seria publicar o banco inteiro.

Guarde as cópias num lugar que não seja o Railway. Um pendrive, um HD externo ou
uma pasta de nuvem pessoal já resolve; o ponto é que não dependa da mesma conta
que hospeda o app.

---

## Restaurar

### Do snapshot do Railway

Settings → Backups → achar o backup pela data → **Restore** → revisar em
*Details* → **Deploy**. O volume antigo continua no projeto, desmontado, então
dá para voltar atrás.

### Da cópia externa

O arquivo baixado é um banco SQLite completo. Para colocar no lugar:

1. Parar o serviço (ou aceitar a pequena indisponibilidade do redeploy).
2. Substituir `/app/data/finance.db` pelo arquivo, **apagando junto** os
   arquivos `finance.db-wal` e `finance.db-shm` que estiverem lá — deixá-los é
   misturar o WAL de um banco com o corpo de outro, e o resultado não abre.
3. Subir o serviço e conferir um login real.

---

## A parte que ninguém pode pular

**Um backup que nunca foi restaurado não é um backup — é uma suposição.**

`npm run backup:conferir` abre a cópia de verdade, roda o `integrity_check` do
SQLite, confere que todas as tabelas esperadas existem, conta as linhas e lê uma
amostra real (saldo por conta). Ele falha com saída diferente de zero se
qualquer coisa estiver errada, então serve dentro de um script.

Rodar isso depois de cada download leva dois segundos e é a diferença entre ter
backup e achar que tem.

---

## O que ainda não existe

- **Nenhum agendamento automático da cópia externa.** O `npm run backup` é
  manual. Automatizar exigiria guardar a senha do admin em algum lugar, o que
  troca um risco por outro — por enquanto, é um hábito, não um cron.
- **Nenhuma restauração foi ensaiada de verdade em produção.** O procedimento
  acima está escrito e a cópia está comprovadamente íntegra e legível, mas
  substituir o banco de produção por um backup nunca foi feito.
