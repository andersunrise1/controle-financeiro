// O Metro resolve este arquivo em vez de ads.js quando empacota para web
// (`npm run web`, usado para conferir telas sem emulador):
// react-native-google-mobile-ads não tem implementação de web, e importá-lo
// ali quebra a página inteira.
//
// Por isso os imports de `../services/ads` são SEM extensão em todo o
// projeto — a troca por plataforma do Metro não acontece em import com
// extensão explícita. Acrescentar o `.js` aqui volta a quebrar o web.
//
// Não há anúncio na web (o site é outro projeto, Next.js, e não tem
// anúncio): isto mantém a chamada do AppNavigator inofensiva.
export const AD_UNIT_IDS = { banner: null, interstitial: null };

export function shouldShowAds() {
  return false;
}

export async function initializeAds() {
  return { canRequestAds: false };
}
