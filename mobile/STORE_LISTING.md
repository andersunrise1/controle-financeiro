# Ficha da Play Store — DIVISA

Tudo que vai colado no Google Play Console, mais o que só você consegue fazer lá.
Os textos abaixo descrevem apenas o que o app realmente faz hoje — nada de
recurso planejado, porque uma ficha que promete o que o app não entrega vira
avaliação de uma estrela.

---

## Nome do app

```
DIVISA — Controle Financeiro
```

(30 caracteres é o limite; este tem 29.)

---

## Descrição curta

Limite de 80 caracteres. Esta tem 76:

```
Controle suas entradas, saídas e o preço real do seu mercado, mês a mês.
```

---

## Descrição completa

Limite de 4000 caracteres.

```
O DIVISA mostra para onde vai o seu dinheiro, sem complicação.

Anote o que entra e o que sai, e veja na hora o seu saldo. Sem planilha, sem
categoria que você nunca vai usar, sem tutorial de meia hora.

O QUE ELE FAZ

• Saldo sempre à vista
Entradas, saídas e o resultado do mês na primeira tela, assim que você abre.

• Gráficos que respondem perguntas
Quanto você gastou por mês, em que categorias, e como um ano se compara com o
outro. Toque numa barra para ver o total daquele ano.

• Uma aba só para o mercado
Aqui está a diferença do DIVISA. Anote cada produto com preço, quantidade e
unidade (5 kg de arroz, 500 g de café) e acompanhe quanto cada item custa ao
longo dos meses. É assim que você descobre que o arroz subiu, em vez de apenas
sentir que "o mercado está caro".

• Lançamentos que se repetem
Aluguel, salário, assinatura. Cadastre uma vez e o app lança sozinho toda
semana, todo mês ou todo ano.

• Conversor de moedas
Cotação atualizada, útil se você viaja ou recebe em outra moeda.

• Claro ou escuro, você escolhe
E o app lembra da sua escolha.

• Português, inglês e espanhol

TAMBÉM NO NAVEGADOR

Sua conta é a mesma no celular e no site. Lance pelo computador, confira pelo
celular.

GRATUITO, COM ANÚNCIOS

O app é gratuito e se mantém com anúncios. Nada é bloqueado depois de um
período: você usa tudo, sempre.

PRIVACIDADE

O DIVISA não pede localização, contatos, câmera nem fotos. Não nos conectamos
ao seu banco — tudo que aparece no app foi você que digitou.

Os anúncios são exibidos pelo Google AdMob, que coleta dados de publicidade
conforme a política dele. O que você registra no app — seus lançamentos, seus
valores — nunca é compartilhado com anunciantes.

Você pode excluir sua conta e todos os seus dados de dentro do próprio app, a
qualquer momento, sem precisar pedir para ninguém.

Política de privacidade: https://divisa-sigma.vercel.app/privacidade
```

---

## Recursos gráficos

Tudo pronto em **`store-assets/`** (gerado em 2026-11-24):

| Recurso | Arquivo | Medida |
| --- | --- | --- |
| Ícone | `store-assets/icone-512.png` | 512×512 |
| Capa (feature graphic) | `store-assets/capa-1024x500.png` | 1024×500 |
| Captura 1 | `store-assets/01-saldo.png` | 1080×1920 |
| Captura 2 | `store-assets/02-mercado.png` | 1080×1920 |
| Captura 3 | `store-assets/03-produtos.png` | 1080×1920 |
| Captura 4 | `store-assets/04-categorias.png` | 1080×1920 |
| Captura 5 | `store-assets/05-conversor.png` | 1080×1920 |

**Suba as capturas nessa ordem.** A primeira é a que aparece na busca, e
por isso é o saldo: é o que a pessoa quer ver num app de finanças. A
segunda e a terceira são a aba Mercado, que é o diferencial e o que
nenhum concorrente genérico mostra.

As telas são o app real rodando, com uma conta de demonstração de 11 meses
— não são montagens. Cada arte põe o print numa moldura de aparelho sobre
o degradê da marca, com uma frase de benefício no topo. Mínimo exigido pelo
Google: 2 capturas. Máximo: 8.

Para refazer (se a interface mudar): os dados de demonstração e a
composição foram feitos por script, mas fora do repositório. O caminho é
popular uma conta local, capturar as telas em viewport de celular e compor
em 1080×1920. O trabalhoso não é compor, é ter dados que encham os
gráficos: com poucos meses o gráfico do Mercado abre cortando a primeira
barra.

---

## Categoria e classificação

- **Categoria:** Finanças
- **Público-alvo:** maiores de 18 (o app não se destina a crianças)
- **Contém anúncios:** **Sim** — AdMob, desde 2026-11-24
- **Compras no app:** Não (a compra do Vitalício acontece no site; quando o
  Play Billing existir, isto vira "Sim")

Declarar "não contém anúncios" num app que exibe anúncios é motivo de
suspensão, não um detalhe de formulário. Esta ficha dizia "Não" até
2026-11-24 porque o app realmente não tinha anúncio nenhum.

---

## Acesso para o revisor — NÃO PULE ESTA PARTE

O DIVISA exige login. Se o Google não receber uma conta de teste, o revisor
abre o app, vê uma tela de login que não consegue passar, e **rejeita a
submissão**. É uma das causas mais comuns de rejeição de primeira viagem.

No Play Console: **Conteúdo do app → Acesso ao app → "Todas as
funcionalidades exigem credenciais"**, e informe:

```
E-mail: revisor@divisa.app
Senha:  DivisaReview2026
```

A conta já existe em produção e já tem 22 lançamentos de três meses, mais uma
recorrência — o revisor abre e vê o app com conteúdo, saldo e gráficos, em vez
de telas vazias que não demonstram nada.

Instruções sugeridas para o campo de observações do revisor:

> O app exige conta. Use as credenciais acima. A aba Mercado é o principal
> diferencial: registra o preço e a quantidade de cada produto ao longo dos
> meses. A conta já contém dados de demonstração.

Não é uma conta descartável: ela precisa continuar existindo enquanto o app
estiver publicado, porque cada atualização passa por revisão de novo.

---

## Formulário de Segurança de Dados

São duas coletas com naturezas diferentes, e o formulário precisa refletir
as duas. **Esta seção mudou em 2026-11-24, quando o AdMob entrou.**

O que o próprio DIVISA coleta:

| Pergunta | Resposta |
| --- | --- |
| Coleta dados? | Sim |
| Quais? | E-mail, nome e as informações financeiras que o usuário digita |
| Para quê? | Funcionamento do app (mostrar os dados de volta ao usuário) |
| Compartilha com terceiros? | Não — nada do que o usuário registra vai para anunciante |
| Dados criptografados em trânsito? | Sim (HTTPS) |
| Usuário pode pedir exclusão? | Sim — existe dentro do app |
| Coleta localização, contatos, fotos, arquivos? | Não |

O que o **AdMob** coleta, e que precisa ser declarado como **compartilhado**
com terceiros (é o Google que recebe):

| Pergunta | Resposta |
| --- | --- |
| ID de publicidade | **Sim** |
| Localização aproximada | Sim |
| Interações no app | Sim |
| Diagnóstico / registros de falha | Sim |

É a mesma declaração usada no TECHSPEAKING em 12/11, pelo mesmo motivo: o
AdMob é o mesmo SDK nos dois.

**Permissões.** Antes do AdMob o manifesto final tinha só `INTERNET` e
`ACCESS_NETWORK_STATE`. O `react-native-google-mobile-ads` acrescenta
`com.google.android.gms.permission.AD_ID` — é ela que sustenta a resposta
"ID de publicidade: Sim" acima. Convém reconferir o manifesto do `.aab`
novo antes de enviar, em vez de confiar nesta nota.

As quatro permissões que o React Native e o `expo-file-system` acrescentavam
por padrão — `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE` e `VIBRATE`
— seguem bloqueadas em `app.json`. Isso importa porque `SYSTEM_ALERT_WINDOW`
("sobrepor outros apps") apareceria na ficha da loja, e num app de finanças
isso afasta gente.

---

## Build

O arquivo enviado à loja é **`.aab`**, não `.apk`. O APK serve só para
instalar direto no aparelho e testar.

```bash
cd mobile
npx eas build --platform android --profile production
npx eas submit --platform android --latest
```

O `eas.json` já está com `autoIncrement` no perfil de produção, então o número
de build sobe sozinho a cada envio. Ver `RELEASE.md` para o procedimento
completo de atualizações depois do lançamento.

---

## O que ainda não existe

Registrado aqui para não ser prometido na ficha por engano:

- O app **não funciona offline**. Os lançamentos vêm do servidor; sem internet
  ele mostra um aviso e um botão de tentar de novo. Só tema, idioma, cotação e
  login ficam guardados no aparelho.
- Não há importação de extrato bancário, exportação de relatório, nem metas de
  gasto.
