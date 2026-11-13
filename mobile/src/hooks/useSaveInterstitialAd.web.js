// O Metro resolve este arquivo no lugar de useSaveInterstitialAd.js ao
// empacotar para web — mesmo motivo de ../services/ads.web.js. Fica sem
// efeito, para que as telas possam chamar `mostrarSePuder()` sem verificar
// plataforma.
export function useSaveInterstitialAd() {
  return { mostrarSePuder: async () => false };
}
