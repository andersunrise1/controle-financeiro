import { Platform } from "react-native";
import mobileAds, { AdsConsent, TestIds } from "react-native-google-mobile-ads";

// Anúncio só no Android. Não existe build de iOS deste app (nem conta de
// desenvolvedor Apple) — ligar anúncio lá seria código sem ninguém para
// executá-lo, não receita.
const PLATAFORMA_COM_ANUNCIO = Platform.OS === "android";

// TODO: trocar pelos identificadores reais da conta do AdMob quando ela
// existir (ver ../ADMOB.md). Estes são os de TESTE publicados pelo próprio
// Google, seguros para subir como provisórios: mostram anúncio de teste e
// não geram receita nem risco.
//
// Aviso que vale repetir: nunca clicar no próprio anúncio real. O Google
// bane conta do AdMob por "tráfego inválido" mesmo quando o clique foi sem
// intenção — por isso o padrão aqui fica no identificador de teste até a
// verificação final num aparelho registrado.
export const AD_UNIT_IDS = {
  banner: TestIds.BANNER,
  interstitial: TestIds.INTERSTITIAL,
};

/**
 * Único lugar que decide se anúncio aparece.
 *
 * Recebe o `access` do AuthContext (não o `user`): é ele que carrega o
 * plano. Quem comprou o Vitalício não vê anúncio — isso é parte do que a
 * compra entrega, não um efeito colateral.
 *
 * Com `access` ainda nulo (a primeira chamada de `getMe` não voltou),
 * responde `false` de propósito: é melhor o anúncio aparecer um instante
 * depois do que piscar na tela de quem pagou para não vê-lo.
 */
export function shouldShowAds(access) {
  if (!PLATAFORMA_COM_ANUNCIO) return false;
  if (!access) return false;
  return access.plan !== "lifetime";
}

let promessaDeInicio = null;

/**
 * Inicia o SDK uma vez por sessão (chamado pelo AppNavigator, na abertura —
 * não depende de estar logado, porque consentimento e inicialização não têm
 * relação com ter conta).
 *
 * O consentimento vem ANTES de `initialize()`: é exigência do próprio UMP do
 * Google, já que a inicialização pode começar a pré-carregar anúncio.
 * `gatherConsent()` é o atalho de uma chamada — pede a informação e só exibe
 * o formulário onde a região realmente obriga (Europa/Reino Unido). O
 * público brasileiro deste app normalmente não vê nada, mas a verificação
 * roda de todo jeito, porque o AdMob serve o mundo inteiro e não vale
 * apostar em quem está de onde.
 */
export async function initializeAds() {
  if (!PLATAFORMA_COM_ANUNCIO) return { canRequestAds: false };
  if (!promessaDeInicio) {
    promessaDeInicio = (async () => {
      try {
        const consentimento = await AdsConsent.gatherConsent();
        if (consentimento.canRequestAds) {
          await mobileAds().initialize();
        }
        return consentimento;
      } catch (erro) {
        // Falhar aqui não pode derrubar a abertura do app: sem anúncio o
        // DIVISA funciona igual.
        console.error("consentimento/início do anúncio falhou", erro);
        return { canRequestAds: false };
      }
    })();
  }
  return promessaDeInicio;
}
