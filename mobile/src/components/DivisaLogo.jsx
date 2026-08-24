import { Image } from "react-native";

// Mirrors the web login/dashboard header: just the icon PNG, no separate
// wordmark — the new logo already has "DIVISA" drawn into the artwork
// itself, so rendering GradientText alongside it would duplicate the text.
export default function DivisaLogo({ size = "large" }) {
  const iconSize = size === "large" ? 112 : 48;

  return (
    <Image
      source={require("../../assets/icon-divisa-final.png")}
      style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.22 }}
    />
  );
}
