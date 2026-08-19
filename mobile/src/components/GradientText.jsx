import Svg, { Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";
import { sunsetGradient } from "../theme";

// react-native-svg's gradient-filled <Text> is the reliable, widely-used
// pattern for gradient text in RN — @react-native-masked-view/masked-view
// was tried first but rendered as plain black text on a real device
// (Android, via Expo Go) instead of applying the mask, a known reliability
// gap with that library. This renders correctly cross-platform since SVG
// text is self-contained (no separate layer to mask).
export default function GradientText({
  children,
  fontSize = 24,
  fontWeight = "800",
  letterSpacing = 4,
  width = 220,
  height = 40,
}) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sunset" x1="0" y1="0" x2="1" y2="0">
          {sunsetGradient.colors.map((color, i) => (
            <Stop key={color} offset={sunsetGradient.locations[i]} stopColor={color} />
          ))}
        </LinearGradient>
      </Defs>
      {/*
        textAnchor="middle" alone centers the text's geometric advance box,
        but letter-spacing is added after every character including the
        last one — that trailing gap has no glyph to balance it, so the
        visible letters end up shifted left of true center (confirmed on
        a real device: the D lined up with the icon, the trailing A did
        not). Shifting the anchor left by half a letter-spacing unit
        compensates for that phantom trailing space.
      */}
      <SvgText
        x={width / 2 - letterSpacing / 2}
        y={height * 0.72}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        fill="url(#sunset)"
      >
        {children}
      </SvgText>
    </Svg>
  );
}
