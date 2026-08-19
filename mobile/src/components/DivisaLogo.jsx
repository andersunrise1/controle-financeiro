import { View, Image, StyleSheet } from "react-native";
import GradientText from "./GradientText";

// Mirrors the web login/dashboard header exactly: the real icon PNG plus a
// separately-rendered gradient wordmark — matches the two-elements pattern
// the web app itself had to adopt (an SVG <image href> silently fails to
// load when the SVG is used as an <img src>; here there's no such gotcha,
// but the visual result is intentionally identical either way).
export default function DivisaLogo({ size = "large" }) {
  const iconSize = size === "large" ? 112 : 48;
  const fontSize = size === "large" ? 24 : 18;
  const wordmarkWidth = size === "large" ? 220 : 170;
  const wordmarkHeight = size === "large" ? 40 : 30;

  return (
    <View style={size === "large" ? styles.stacked : styles.inline}>
      <Image
        source={require("../../assets/icon-divisa-final.png")}
        style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.22 }}
      />
      {size !== "compact" && (
        <View style={{ marginTop: size === "large" ? 8 : 0, marginLeft: size === "large" ? 0 : 12 }}>
          <GradientText fontSize={fontSize} width={wordmarkWidth} height={wordmarkHeight}>
            DIVISA
          </GradientText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: {
    alignItems: "center",
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
  },
});
