// A wide categorical palette for Mercado product bars — deliberately not
// the brand's sunset gradient, since the whole point is that each product
// keeps its own recognizable color across every month (arroz is always the
// same red, feijão is always the same blue), which a shared gradient can't
// do once there are more than a handful of distinct products in one chart.
// 30 colors covers a realistic month's worth of distinct grocery items with
// room to spare; picked for enough saturation/lightness to stay visible as
// a chart bar fill against both the dark and light theme's card background.
const PRODUCT_COLOR_PALETTE = [
  "#e63946",
  "#f77f00",
  "#fcbf49",
  "#06d6a0",
  "#118ab2",
  "#ef476f",
  "#ffd166",
  "#8338ec",
  "#3a86ff",
  "#fb5607",
  "#ff006e",
  "#06a77d",
  "#d62828",
  "#457b9d",
  "#2a9d8f",
  "#e9c46a",
  "#f4a261",
  "#b5179e",
  "#560bad",
  "#480ca8",
  "#3f37c9",
  "#4361ee",
  "#4cc9f0",
  "#7209b7",
  "#f15bb5",
  "#fee440",
  "#00bbf9",
  "#9b5de5",
  "#ff9770",
  "#e76f51",
];

// Same normalization MercadoChart already uses to group products
// ("Leite"/"leite" count as the same item) — a product's color has to be
// derived from the same normalized key so it doesn't shift depending on
// how the name was capitalized on a given purchase.
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getProductColor(productName: string): string {
  const normalized = productName.trim().toLowerCase();
  const index = hashString(normalized) % PRODUCT_COLOR_PALETTE.length;
  return PRODUCT_COLOR_PALETTE[index];
}
