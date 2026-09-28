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

PRIVACIDADE

O DIVISA não pede nenhuma permissão do seu aparelho: sem localização, sem
contatos, sem câmera, sem fotos. Não tem anúncio e não tem rastreamento. Não
nos conectamos ao seu banco — tudo que aparece no app foi você que digitou.

Você pode excluir sua conta e todos os seus dados de dentro do próprio app, a
qualquer momento, sem precisar pedir para ninguém.

Política de privacidade: https://divisa-sigma.vercel.app/privacidade
```

---

## Recursos gráficos

| Recurso | Arquivo | Medida |
| --- | --- | --- |
| Ícone | `assets/icon-divisa-1024.png` (reduzir para 512) | 512×512 |
| Feature graphic | gerado, `feature-graphic.png` | 1024×500 |
| Screenshots | 6 capturas do app real | 1080×2160 |

Os screenshots foram tirados do aplicativo em funcionamento, com dados de
demonstração — não são montagens. Mínimo exigido: 2. Máximo: 8.

---

## Categoria e classificação

- **Categoria:** Finanças
- **Público-alvo:** maiores de 18 (o app não se destina a crianças)
- **Contém anúncios:** Não
- **Compras no app:** Não

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

Aqui a resposta honesta é curta, porque o app realmente coleta pouco.

| Pergunta | Resposta |
| --- | --- |
| Coleta dados? | Sim |
| Quais? | E-mail, nome e as informações financeiras que o usuário digita |
| Para quê? | Funcionamento do app (mostrar os dados de volta ao usuário) |
| Compartilha com terceiros? | Não |
| Dados criptografados em trânsito? | Sim (HTTPS) |
| Usuário pode pedir exclusão? | Sim — existe dentro do app |
| Coleta localização, contatos, fotos, arquivos? | Não |
| Anúncios ou rastreamento? | Não |

Isso é verificável no próprio `.aab` gerado: o manifesto final declara duas
permissões, `INTERNET` e `ACCESS_NETWORK_STATE` (esta vem do `expo-updates`,
para checar se há conexão antes de buscar uma atualização). Nenhuma das duas
é sensível nem gera pedido ao usuário, e o projeto não tem nenhum SDK de
análise ou publicidade.

As quatro permissões que o React Native e o `expo-file-system` acrescentavam
por padrão — `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE` e `VIBRATE`
— estão bloqueadas em `app.json` e foram confirmadas ausentes no manifesto
final. Isso importa porque `SYSTEM_ALERT_WINDOW` ("sobrepor outros apps")
apareceria na ficha da loja, e num app de finanças isso afasta gente.

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
