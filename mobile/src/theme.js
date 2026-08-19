// Mirrors frontend/app/globals.css's color tokens exactly — same hex values,
// so the mobile app reads as the same product, not an "inspired by" version.
export const colors = {
  bgDark: "#2d2d2d",
  bgCard: "#3a3a3a",
  bgCardHover: "#454545",
  cardBorder: "#4a4a4a",
  inputBg: "#2a2a2a",
  inputBorder: "#555555",
  textPrimary: "#f3f4f6",
  textMuted: "#9ca3af",
  textFaint: "#6b7280",
  neonGreen: "#39ff14",
  neonGreenDim: "#2ecc0f",
  neonRed: "#ff073a",
  neonRedDim: "#cc0530",
};

// The brand's standard "pôr do sol" gradient (#ffd93d -> #ff8c42 at 45% -> #d6249f),
// same stops used by the web wordmark, the app icon, and every chart.
export const sunsetGradient = {
  colors: ["#ffd93d", "#ff8c42", "#d6249f"],
  locations: [0, 0.45, 1],
};
