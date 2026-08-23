// Mirrors frontend/app/globals.css's CSS variable system — same hex values
// per theme, so the mobile app reads as the same product. Structural
// colors (background, cards, borders, text) change per theme; brand accents
// (neon green/red, sunset gradient) stay constant on purpose — they're
// identity, not chrome, and the neon glow depends on a dark backdrop to
// read as neon at all. accentGreenText/accentRedText are a separate pair
// used specifically for readable text (balances, amounts, links) — pure
// neon only clears ~1.3:1 contrast against the light background, so those
// spots use a darker shade of the same hue in light mode instead.
const DARK = {
  bgDark: "#2d2d2d",
  bgCard: "#3a3a3a",
  bgCardHover: "#454545",
  cardBorder: "#4a4a4a",
  inputBg: "#2a2a2a",
  inputBorder: "#555555",
  textPrimary: "#f3f4f6",
  textSecondary: "#d1d5db",
  textMuted: "#9ca3af",
  textFaint: "#6b7280",
  neonGreen: "#39ff14",
  neonGreenDim: "#2ecc0f",
  neonRed: "#ff073a",
  neonRedDim: "#cc0530",
  accentGreenText: "#39ff14",
  accentRedText: "#ff073a",
  accentCyanText: "#00e5ff",
  warningText: "#fbbf24",
};

const LIGHT = {
  bgDark: "#faf7f2",
  bgCard: "#ffffff",
  bgCardHover: "#f3efe8",
  cardBorder: "#c7bfae",
  inputBg: "#ffffff",
  inputBorder: "#d9d2c5",
  textPrimary: "#211f1c",
  textSecondary: "#4b473f",
  textMuted: "#756f63",
  textFaint: "#948d7f",
  neonGreen: "#39ff14",
  neonGreenDim: "#2ecc0f",
  neonRed: "#ff073a",
  neonRedDim: "#cc0530",
  accentGreenText: "#1a7a0e",
  accentRedText: "#c81e3a",
  accentCyanText: "#0086a3",
  warningText: "#97710a",
};

export function getColors(scheme) {
  return scheme === "light" ? LIGHT : DARK;
}

// Kept for any spot that genuinely never changes with theme (icons,
// splash-screen-era code outside the ThemeProvider tree) — new code should
// prefer useTheme().colors instead.
export const colors = DARK;

// The brand's standard "pôr do sol" gradient (#ffd93d -> #ff8c42 at 45% -> #d6249f),
// same stops used by the web wordmark, the app icon, and every chart. Brand
// identity — doesn't change with theme, same reasoning as neonGreen/neonRed.
export const sunsetGradient = {
  colors: ["#ffd93d", "#ff8c42", "#d6249f"],
  locations: [0, 0.45, 1],
};
