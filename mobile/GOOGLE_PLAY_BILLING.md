# Compra dentro do app — lado do aplicativo

O lado do servidor (a verificação) está em `backend/GOOGLE_PLAY_BILLING.md`,
inclusive o passo a passo de configuração no Google Cloud e no Play Console.
Aqui fica só o que é do app.

## Por que existe

O Google exige o Play Billing para conteúdo digital comprado dentro de um app
da loja. Até isto entrar, quem instalava o DIVISA pela Play Store **não tinha
como comprar**: o app não pode mostrar preço nem apontar para o site, então a
conversão por ali era zero.

O site continua vendendo pelo Mercado Pago, sem mudança. Os dois caminhos
levam ao mesmo `plan = 'lifetime'`, então quem compra por um tem o outro
liberado — é a mesma conta.

## Onde fica

- `src/screens/VitalicioScreen.jsx` — a tela de compra (Android)
- `src/screens/VitalicioScreen.web.jsx` — a mesma tela sem `expo-iap`
- `src/services/api.js` → `verifyGooglePlayPurchase`
- `src/navigation/MainTabs.jsx` — rota `Vitalicio`, **sem aba**: a barra
  superior tem lista própria e já carrega cinco itens
- `src/screens/AccountScreen.jsx` — o card "Remover anúncios", que leva até
  lá. Some para quem já comprou

## O ID do produto

`divisa_vitalicio`, em `VitalicioScreen.jsx`, tem de ser idêntico ao
`LIFETIME_PRODUCT_ID` de `backend/lib/googlePlay.ts` e ao produto cadastrado
no Play Console. **Divergir não produz erro visível**: a compra simplesmente
nunca é encontrada.

## O preço não é nosso

Um produto no app tem o valor fixado no Play Console. O Google cobra e
localiza esse valor, e nosso código nunca o vê nem o controla. Por isso a tela
mostra `produto.displayPrice`, vindo do próprio Google — é a única forma de
prometer exatamente o que será cobrado. Enquanto o produto não é encontrado,
aparece "Carregando o preço..." em vez de um número inventado.

## A separação por plataforma

`expo-iap` não tem implementação para web: o `useIAP` monta ouvintes nativos e
estoura "Cannot find native module" quando a tela abre, antes de qualquer
tentativa de compra. Daí o par `.jsx` / `.web.jsx`, mesmo padrão já usado para
o AdMob (`ads.web.js`, `BannerAdSlot.web.jsx`).

**O import em `MainTabs.jsx` é sem extensão de propósito.** A resolução por
plataforma do Metro só acontece assim; com `"../screens/VitalicioScreen.jsx"`
explícito, o arquivo nativo seria carregado também na web e o build quebraria.

## Ordem imposta pelo Play Console

Confirmado na tela em 2026-11-26: Monetizar → Produtos → Produtos únicos diz
*"Para incluir produtos únicos, você precisa adicionar a permissão BILLING ao
APK"* e só oferece upload de um build novo. Ou seja, **não dá para criar o
produto antes**. A sequência obrigatória é:

1. este código (feito)
2. `eas build` — é mudança nativa, `eas update` não resolve
3. subir o build numa faixa de teste
4. só então criar `divisa_vitalicio` no Play Console

## Não fixar o kotlinVersion

`expo-build-properties` está nas dependências, mas **não** há pin de
`kotlinVersion` no `app.json`, e não deve haver. No projeto irmão
(TechSpeaking) esse pin foi adicionado junto com o `expo-iap` e quebrou o
build de produção no Gradle: ele mudava só a versão usada pelo Expo/KSP,
enquanto o plugin Kotlin real continuava na versão do React Native. Remover o
pin foi o que resolveu.

## O que foi verificado, e o que não

Verificado, com o Metro e o backend rodando de verdade:

- o app abre e navega sem erro de console;
- o card "Remover anúncios" aparece na Conta e leva à tela;
- a variante web renderiza (título, benefícios e o aviso de Android), sem
  preço nem botão de compra, e sem quebrar;
- o **bundle Android** é gerado com sucesso e contém `divisa_vitalicio` — ou
  seja, a tela nativa e o `expo-iap` compilam e resolvem, sem precisar de
  aparelho;
- o **bundle web** tem zero ocorrências de `divisa_vitalicio` e de `ExpoIap`,
  provando que a separação funciona no nível do bundle, não só na tela.

**Não verificado: nenhuma compra real.** Isso exige o produto criado no Play
Console, uma conta de testador de licença, a conta de serviço do Google Cloud
configurada no servidor e um build numa faixa de teste rodando em aparelho
Android de verdade.
