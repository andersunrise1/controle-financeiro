// Mirrors frontend/lib/productColors.ts exactly — same palette, same hash,
// so a product resolves to the same color on both platforms.
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

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getProductColor(productName) {
  const normalized = productName.trim().toLowerCase();
  const index = hashString(normalized) % PRODUCT_COLOR_PALETTE.length;
  return PRODUCT_COLOR_PALETTE[index];
}
