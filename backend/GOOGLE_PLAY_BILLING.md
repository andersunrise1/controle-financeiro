# Compra dentro do app — Google Play Billing

Segundo caminho de compra do vitalício, ao lado do Mercado Pago. O do site
vive em `lib/payment.ts`; este vive em `lib/googlePlay.ts`. Aqui está o lado
do servidor (a verificação); o lado do app fica em `mobile/`.

**Por que existe:** o Google exige o Play Billing para conteúdo digital
comprado dentro de um app distribuído pela loja. Apontar para o Mercado Pago
ali é motivo de suspensão. Sem isso, quem instala o DIVISA pela Play Store
simplesmente **não tem como comprar** — o app não pode mostrar preço nem
link para o site, então a conversão por ali é zero.

Os dois caminhos levam ao mesmo `plan = 'lifetime'`. Quem compra pelo app tem
o site liberado, e vice-versa: é a mesma conta.

## 1. Conta de serviço no Google Cloud

1. Em [console.cloud.google.com](https://console.cloud.google.com/), criar um
   projeto (ou reusar um), por exemplo `divisa-play-billing`.
2. Ativar a **Google Play Android Developer API** nesse projeto
   (APIs e serviços → Biblioteca → buscar pelo nome → Ativar).
3. APIs e serviços → Credenciais → Criar credenciais → Conta de serviço.
   Nome livre, por exemplo `play-billing-verificador`. **Não** precisa de
   papel nenhum no nível do Cloud — o acesso é concedido no Play Console, no
   passo seguinte.
4. Abrir a conta de serviço criada → Chaves → Adicionar chave → Criar nova →
   JSON. Baixa um arquivo `.json`. **Trate como senha**: nunca comitar.

## 2. Dar acesso a essa conta no Play Console

1. Play Console → Configuração → **Acesso via API**.
2. O projeto do Cloud do passo 1 deve aparecer vinculado. Se não aparecer,
   seguir o fluxo de vínculo que a própria tela oferece.
3. Achar a conta de serviço na lista e clicar em **Conceder acesso**.
4. Permissão necessária: em **Dados financeiros**, marcar "Ver dados
   financeiros". É o que faz `purchases.products.get` e `.acknowledge`
   funcionarem. Nada além disso é preciso para este uso.

## 3. Colocar a chave onde o servidor a enxergue

No `.env.local` (desenvolvimento):

```
GOOGLE_PLAY_PACKAGE_NAME=com.divisa.mobile
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH=./google-play-service-account.json
```

`GOOGLE_PLAY_PACKAGE_NAME` tem de bater exatamente com o `"package"` de
`mobile/app.json`.

**Em produção (Railway) há uma pegadinha:** a variável aponta para um
*arquivo*, e uma variável de ambiente comum não cria arquivo. O serviço já
tem um volume montado em `/app/data` (é onde mora o SQLite), então o caminho
natural é gravar o JSON lá dentro e apontar
`GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH=/app/data/google-play-service-account.json`.
A alternativa é guardar o conteúdo numa variável e escrever o arquivo no
start. Não está feito — resolver quando houver chave de verdade.

Reiniciar o servidor depois de mexer no `.env`: as variáveis são lidas uma vez,
no start.

## 4. Criar o produto no Play Console

1. O app já precisa existir no Play Console (basta um registro, mesmo em
   teste fechado).
2. Play Console → o app → Monetizar → **Produtos** → Produtos no app →
   Criar produto.
3. ID do produto: exatamente `divisa_vitalicio`. É o mesmo valor de
   `LIFETIME_PRODUCT_ID` em `lib/googlePlay.ts` — mudar um sem o outro
   quebra a verificação inteira, em silêncio.
4. Tipo: **produto gerenciado** (compra única), não assinatura.
5. Preço: R$ 19,90, igual ao do site.
6. Ativar o produto.

**Consequência que vale saber antes:** o preço de um produto no app é fixado
no Play Console, e o nosso código nunca vê nem controla esse valor. O app
deve exibir o preço que o próprio Google informa — é o único número garantido
de ser o que será cobrado.

## 5. Testar antes de valer

O sandbox do Play Billing só funciona para contas cadastradas como
**testadores de licença** (Play Console → Configuração → Teste de licença) e
usando um build distribuído por uma faixa de teste. Um APK instalado à mão
não consegue exercitar uma compra real.

## O que o servidor faz, exatamente

`POST /api/payment/google-play/verify` — autenticado, chamado pelo app logo
depois que a compra termina no aparelho.

Ordem das verificações, que não é acidental:

1. **401** sem autenticação.
2. **400** sem `purchaseToken` no corpo.
3. **200** se a conta já é vitalícia (comprou pelo site, ou é a segunda
   chamada da mesma compra). Vem antes do 503 de propósito: só lê o nosso
   banco, não depende do Google, e responder "não configurado" a quem já
   comprou o mandaria procurar o suporte à toa.
4. **503** se `GOOGLE_PLAY_PACKAGE_NAME`/`GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH`
   não estiverem configurados — mesmo padrão de todo serviço externo aqui.
5. Pergunta ao Google (`purchases.products.get`) se aquele comprovante é real
   e está em `purchaseState === 0`. **Nunca confia no que o app diz**: o app
   roda num aparelho que o usuário controla. **409** se não estiver
   confirmado (pagamento pendente, por exemplo) — não é erro, o app tenta de
   novo depois.
6. Grava `plan = 'lifetime'` e o comprovante em
   `users.google_play_purchase_token`. **409** se aquele comprovante já
   liberou outra conta: um `purchaseToken` é só um texto, e nada impede
   alguém de reenviar o mesmo de outra conta — o Google continuaria dizendo
   "comprado", porque é verdade, só não é daquela pessoa. A trava é nossa.
7. Confirma a compra no Google (`acknowledge`), e só depois de o acesso já
   estar gravado. **O Google estorna sozinho toda compra não confirmada em 3
   dias**, mas o inverso — confirmar e não gravar — deixaria alguém pagando
   por nada.

Repetir a chamada é inofensivo de ponta a ponta, o que importa: o app
reenvia quando o aparelho perde rede no meio da compra.

## O que não está feito

**Reembolso de compra do Play pela tela de admin.** A API do Google tem um
endpoint próprio (`orders.refund`); o código de reembolso atual só sabe
desfazer pagamento do Mercado Pago. Fazer quando aparecer um pedido real.

**Nenhuma compra real foi exercitada.** Falta a conta de serviço, o produto
no Play Console e um build numa faixa de teste. Verificado até aqui, contra o
servidor rodando de verdade: os caminhos 401, 400, 503, o atalho de quem já é
vitalício, a liberação, a repetição inofensiva e a trava de reuso de
comprovante.
