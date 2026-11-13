// O Metro resolve este arquivo no lugar de BannerAdSlot.jsx ao empacotar
// para web — mesmo motivo de ../services/ads.web.js: o pacote de anúncio não
// tem implementação de web. Renderiza nada, em vez de quebrar o import.
export default function BannerAdSlot() {
  return null;
}
