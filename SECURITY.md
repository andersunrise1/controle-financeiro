# Segurança do DIVISA

Levantamento feito em **2026-09-29**, antes da publicação na Play Store, sobre
um app que guarda dado financeiro pessoal e recebe pagamento real.

Cada item abaixo foi conferido no código, e os que dizem "verificado" foram
testados contra o servidor rodando — não apenas lidos.

---

## O que protege os dados hoje

### Senha e sessão

- **Senhas em bcrypt**, custo 12. Nunca em texto puro, em lugar nenhum. O custo
  fica dentro do próprio hash, então as senhas antigas (custo 10) continuam
  válidas e sobem para 12 quando a pessoa trocar a senha.
- **Mínimo de 8 caracteres** para criar ou trocar senha. O **login não aplica
  esse mínimo** de propósito: exigir 8 na entrada trancaria fora do app quem
  criou a conta quando a regra era 6. *Verificado:* conta com senha de 6 e hash
  de custo 10 entra normalmente.
- **JWT assinado**, 7 dias. Em produção o servidor **se recusa a autenticar**
  sem `JWT_SECRET` definido, em vez de cair numa chave de desenvolvimento que
  está publicada no repositório.
- **Cookie de sessão** `httpOnly` + `secure` (produção) + `sameSite=lax`.
- **No celular o token fica no cofre do aparelho** (Keychain no iOS, Keystore no
  Android, via `expo-secure-store`), não no armazenamento comum em texto puro.
  Sessões criadas antes dessa mudança migram sozinhas na primeira leitura.

### Limite de tentativas

- **Login: 10 erros por e-mail e 40 por IP, em janela de 15 minutos**
  (`lib/loginThrottle.ts`). Gravado no banco, não em memória, porque o Railway
  reinicia o servidor a cada deploy e um contador em memória voltaria a zero
  junto. *Verificado:* 11ª tentativa responde 429; um acerto zera o contador;
  o bloqueio de um e-mail não afeta outro.
- O teto por IP é mais alto de propósito — família, escritório e rede de celular
  saem todos pelo mesmo IP, e apertar ali puniria gente inocente.
- **Recuperação de senha: 3 pedidos por hora e 5 tentativas por código**, que já
  existia antes deste levantamento.
- As escritas do contador são **best-effort**: um `database is locked` momentâneo
  registra no log e segue, porque manutenção de contador não pode transformar um
  login com a senha correta em erro 500. *Verificado:* com o banco travado por
  outro processo, o login válido ainda entra.

### Recuperação de senha

Código de 6 dígitos de fonte criptográfica, guardado **só como hash SHA-256**,
válido por 30 minutos, morto após 5 tentativas, comparado com `timingSafeEqual`,
e um código novo invalida o anterior. Um vazamento dessa tabela não entrega
nenhum código utilizável.

### Isolamento entre contas

Toda consulta de dado do usuário filtra por `user_id = ?`. Existem 10 consultas
com `WHERE id = ?` sem `user_id`, todas conferidas uma por uma: leem de volta uma
linha cuja posse já foi provada (`lastInsertRowid`, ou um
`UPDATE ... AND user_id = ?` que só prossegue se alterou algo).
**Nenhum cliente consegue ler o lançamento de outro.**

### Injeção e execução de código

- **SQL:** as ~40 chamadas `prepare()` usam placeholders `?`. Existe **um único**
  SQL montado dinamicamente (`app/api/transactions/route.ts`, no `PUT`), e o que
  ele interpola são dois literais fixos do próprio código, nunca entrada do
  usuário.
- **XSS:** zero `dangerouslySetInnerHTML`, `innerHTML`, `document.write` ou
  `eval` em web, mobile e backend. A única via de renderização é o JSX, que
  escapa por padrão.

### Cabeçalhos

No site (`frontend/next.config.ts`): CSP, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS em produção.
Na API (`backend/next.config.ts`): os mesmos menos a CSP, que não tem o que
proteger numa resposta JSON.

**O que a CSP entrega e o que não entrega:** `script-src` carrega
`'unsafe-inline'` porque o Next injeta scripts inline para hidratar a página, e
evitar isso exigiria nonce por requisição. Ou seja, **esta CSP não é uma barreira
contra XSS** — a barreira contra XSS aqui é o código não ter nenhuma via de
injeção. O que ela realmente entrega é `frame-ancestors 'none'` (ninguém embute
o app num iframe para enganar o usuário), `connect-src` fechado (não há para onde
mandar os dados financeiros além do nosso backend), `form-action 'self'` (um
formulário injetado não posta senha para fora) e `object-src`/`base-uri`.

`cdn.jsdelivr.net` está liberado porque é de lá que o `tesseract.js` baixa o
WASM e os dados de idioma da leitura de preço pela câmera — conferido no código
do pacote instalado, não presumido. *Verificado:* com a CSP ativa, o OCR leu
"R$ 12,90" de uma imagem gerada e preencheu o campo, sem nenhuma violação no
console.

### Pagamento

- **Dado de cartão nunca passa pelo nosso servidor.** O checkout é hospedado pelo
  Mercado Pago; não guardamos, não vemos e não temos obrigação de PCI.
- **Webhook com assinatura HMAC-SHA256 verificada** em comparação timing-safe.
  Ninguém libera acesso vitalício forjando uma notificação.
- O webhook **busca o pagamento real na API** e só libera acesso com status
  `approved`, porque o Mercado Pago notifica em toda mudança de estado.

### CORS e vazamento de informação

- CORS restrito a `FRONTEND_URL` (lista separada por vírgula).
- **Erro 500 nunca devolve a mensagem real** ao cliente — texto de exceção carrega
  nome de tabela e coluna. O motivo verdadeiro vai para o log do servidor.
- **Login e "esqueci a senha" respondem igual** exista ou não a conta.
- **Tempo de resposta do login é uniforme** (`padToFloor`, piso de 500 ms
  configurável por `LOGIN_MIN_RESPONSE_MS`). Sem isso, a demora denunciava quais
  e-mails têm conta, mesmo com as duas respostas dizendo a mesma frase.
  *Verificado:* a diferença entre "sem conta", "hash custo 10" e "hash custo 12"
  caiu de 171 ms para 4 ms.

### LGPD

- **Exclusão de conta** dentro do app, em transação, apagando lançamentos,
  recorrências, feedbacks, códigos de recuperação e tentativas de login. Os
  filhos são apagados explicitamente porque o SQLite ignora `ON DELETE CASCADE`
  sem `PRAGMA foreign_keys = ON`, que este projeto nunca ligou — confiar no
  cascade deixaria todos os lançamentos para trás.
- A senha é pedida de novo para confirmar, mesmo com sessão válida: é
  irreversível, e um token é só quem estiver com o celular destravado na mão.
- Política de privacidade em `/privacidade`.

### Segredos

Nenhum `.env` jamais entrou no git — verificado no **histórico completo**, não
só no estado atual. O banco (`backend/data/`) está fora do versionamento.
`.env.example` documenta cada variável sem nenhum valor real.

---

## O que ainda não está resolvido

Por ordem de importância. Nada aqui é desconhecido — é decisão consciente ou
trabalho pendente.

### 1. Backup e cifragem em repouso do banco de produção — *não verificado*

O SQLite vive num volume do Railway. **Não foi confirmado se existe backup
automático nem se o volume é cifrado.** Para dado financeiro, **perder** o banco
é tão grave quanto vazá-lo: um cliente que pagou o vitalício e perdeu dois meses
de lançamentos não volta.

É o item mais importante desta lista e o único que não depende de código.

### 2. Sair não invalida o token

O JWT vale 7 dias e não há lista de revogação — sair apaga a sessão no aparelho,
mas um token já copiado continua valendo até expirar. Resolver exige guardar
sessões no banco (ou reduzir bastante o prazo e criar renovação), o que é uma
mudança de arquitetura, não um ajuste.

### 3. Limite de tentativas depende de um cabeçalho forjável

O teto por IP lê `x-forwarded-for`, que quem fala direto com o servidor pode
inventar. Em produção só o proxy do Railway alcança a aplicação e ele reescreve
o valor, mas é por isso que **o limite por e-mail é a defesa principal** e o de
IP apenas complementa.

### 4. Piso de tempo do login depende da CPU do servidor

`padToFloor` usa 500 ms. Num servidor lento o suficiente para o bcrypt de custo
12 passar disso, as contas de custo 10 voltariam a ser mais rápidas e a
diferença reapareceria. Correção: subir `LOGIN_MIN_RESPONSE_MS`.

### 5. Um admin só, definido por e-mail

Não há papel guardado no banco: `isAdminEmail` compara com `ADMIN_EMAIL`. Simples
e suficiente para um app com um dono, mas não há registro de quem fez o quê na
área administrativa.

### 6. Dependências de desenvolvimento com avisos abertos

`npm audit --omit=dev` está limpo fora de um aviso moderado
(`baseline-browser-mapping`). Os outros (`brace-expansion`, `browserslist`,
`js-yaml`) são ferramentas de build e não vão para produção. O aviso **crítico**
do Next.js 16.2.9 (bypass de middleware, SSRF e DoS em Server Actions) foi
fechado subindo para **16.3.7** em 2026-09-29.

---

## Ao mexer no código

- Toda consulta de dado de usuário precisa de `user_id = ?` no `WHERE`. Se ler
  por `id` sozinho, a posse tem de ter sido provada na instrução anterior.
- Toda conta de tempo acontece **dentro do SQLite**, nunca no JavaScript.
  `datetime('now')` produz `"2026-09-29 14:30:00"` e `Date#toISOString` produz
  `"2026-09-29T14:30:00.000Z"`; comparados como texto, o espaço ordena antes do
  `"T"`, então toda linha parece mais antiga do que é e a janela não casa com
  nada. Esse erro exato já quebrou o limite do reset de senha aqui, em silêncio.
- Escrita de contador ou de manutenção é **best-effort**: nunca deixe uma falha
  dela derrubar uma requisição que o usuário tem direito de ver funcionar.
- Ao acrescentar tabela com dado pessoal, inclua a limpeza em
  `lib/account.ts` — a exclusão de conta é explícita, não automática.
- Ao acrescentar dependência que baixa algo de fora em tempo de execução,
  acrescente a origem na CSP em `frontend/next.config.ts`. Sem isso o recurso é
  bloqueado no navegador e a falha costuma ser silenciosa.
