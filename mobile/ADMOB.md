# Anúncios (Google AdMob)

O código já está pronto e sobe sem quebrar nada, usando os identificadores de
**teste** publicados pelo próprio Google. O que falta é a conta real do AdMob
e a troca de dois identificadores — passos 1 a 3 aqui.

**Uma conta do AdMob serve os dois apps.** Se o TechSpeaking já tiver conta
criada, não crie outra: cada app entra como um app novo dentro da mesma conta,
com seus próprios blocos de anúncio.

## O que foi decidido, e por quê

- **Só Android.** Não existe build de iOS deste app nem conta de
  desenvolvedor Apple. Ligar anúncio lá seria código sem ninguém para
  executá-lo.
- **Quem tem o Vitalício não vê anúncio.** É parte do que a compra de
  R$ 19,90 entrega, não um efeito colateral. A regra fica num lugar só:
  `shouldShowAds()`, em `src/services/ads.js`.
- **O modelo dos 60 dias não mudou.** O anúncio aparece durante o teste e
  depois dele; o travamento em somente-leitura continua como era.
- **Faixa nas duas telas, tela cheia só no Dashboard.** O Mercado também
  salva lançamento, mas pré-carregar o mesmo anúncio nas duas telas (que
  ficam montadas juntas, por serem abas) significaria pedir dois anúncios
  para um intervalo que só deixa exibir um — e pedido que não vira exibição
  piora o *match rate* da conta no AdMob.
- **Tela cheia só depois de salvar, no máximo uma a cada 4 horas.** É o
  único momento em que a pessoa terminou o que veio fazer. Quem organiza as
  contas lança várias coisas seguidas; sem o intervalo seriam cinco telas
  cheias em dois minutos. O intervalo está em `INTERVALO_MINIMO_HORAS`, em
  `src/hooks/useSaveInterstitialAd.js`.
- **Nada de anúncio na abertura do app** (formato *App Open*). Atingiria
  toda sessão, inclusive a de quem só quer lançar R$ 12 de pão — num app
  de uso rápido e diário, é o caminho mais curto para a desinstalação.

## 1. Criar a conta

1. Entre em [admob.google.com](https://admob.google.com) com a mesma conta
   Google do Play Console (não é obrigatório, mas simplifica).
2. Aceite os termos e preencha país e dados de pagamento. Isso é necessário
   para **receber**, não para testar.

## 2. Cadastrar o app e criar os blocos

1. Apps → Add app. Se o DIVISA já estiver publicado, dá para vincular
   buscando o pacote `com.divisa.mobile`; se ainda não, escolha "No" e
   cadastre à mão (dá para vincular à ficha da loja depois).
2. Anote o **App ID** (formato `ca-app-pub-XXXXXXXX~XXXXXXXX`, com `~`).
3. Ad units → Add ad unit, crie dois:
   - **Banner** — a faixa do Dashboard e do Mercado.
   - **Interstitial** — a tela cheia depois de salvar um lançamento.
4. Anote o **Ad unit ID** de cada um (formato
   `ca-app-pub-XXXXXXXX/XXXXXXXX`, com `/` — repare que é diferente do App
   ID acima).

## 3. Trocar os identificadores no código

Dois lugares, os dois hoje com valores de teste:

1. `app.json`, no bloco do plugin `react-native-google-mobile-ads` →
   `androidAppId`, com o App ID do passo 2.2. O `iosAppId` pode continuar
   com o valor de teste: sem build de iOS ele não é usado, e deixá-lo
   preenchido só evita um aviso em cada build.
2. `src/services/ads.js` → `AD_UNIT_IDS.banner` e `AD_UNIT_IDS.interstitial`,
   com os dois IDs do passo 2.4.

As duas mudanças exigem **build novo** (`eas build --platform android`), não
`eas update`: isso é configuração nativa, não JavaScript.

## 4. Testar sem se queimar

**Nunca clique no próprio anúncio real.** O Google bane conta do AdMob por
"tráfego inválido" mesmo quando o clique foi sem querer. Dois caminhos
seguros:

- Continuar com os identificadores de teste (o padrão de hoje) até o fluxo
  inteiro estar conferido, e só então trocar pelos reais.
- Registrar o aparelho como dispositivo de teste: rode o app uma vez com os
  IDs reais, pegue no logcat o identificador do aparelho que o próprio SDK
  imprime (`setTestDeviceIds`) e cadastre-o no menu Testing do AdMob.
  Anúncio servido a um aparelho registrado vem marcado "Test Ad" na tela e
  não conta como exibição nem como clique.

## O que já está construído

| Arquivo | O que faz |
| --- | --- |
| `src/services/ads.js` | `initializeAds()` (consentimento UMP antes de inicializar o SDK) e `shouldShowAds(access)`, a única regra de quem vê anúncio |
| `src/components/BannerAdSlot.jsx` | A faixa, no formato *inline* — ela vive dentro do ScrollView, não grudada no rodapé |
| `src/hooks/useSaveInterstitialAd.js` | A tela cheia depois de salvar, com o intervalo mínimo guardado no aparelho |
| `src/navigation/AppNavigator.jsx` | Chama `initializeAds()` uma vez na abertura |
| `src/screens/DashboardScreen.jsx` | Faixa antes do histórico + tela cheia depois de salvar |
| `src/screens/MercadoScreen.jsx` | Só a faixa, mesma posição |

Cada um desses três primeiros tem um irmão `.web` que o Metro usa ao
empacotar para web, onde o pacote de anúncio não funciona. **Por isso os
imports deles são sem extensão** (`"../services/ads"`, não `"../services/ads.js"`):
com extensão explícita o Metro não faz a troca por plataforma, e o `npm run web`
volta a quebrar.

## O que ainda não foi conferido

O anúncio **aparecendo** nunca foi visto. O que foi verificado de verdade,
no `npm run web`: o pacote não quebra o empacotamento, as telas montam, e
salvar um lançamento continua funcionando com o caminho novo. A exibição em
si precisa de um Android real ou emulador, que esta máquina não tem.

## Expectativa de receita, sem ilusão

Faixa de anúncio no Brasil rende pouco: quem abre o app todo dia gera algo
perto de R$ 0,05 a R$ 0,15 por mês. Para empatar com **uma** venda de
R$ 19,90 levaria anos. O anúncio é colchão quando houver muita gente — a
venda continua sendo a remuneração. O modelo (60 dias, R$ 19,90 vitalício,
compra só no site) está no `CLAUDE.md` da raiz.
