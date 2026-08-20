import Svg, { Rect, Circle, Polygon } from "react-native-svg";

// Mirrors components/FlagIcon.tsx exactly (same shapes/colors per country),
// ported to react-native-svg. Hand-drawn rather than emoji flags for the
// same reason the web app made that choice: emoji flags don't render as
// images on some platforms (Windows was the original trigger).
function FlagSvg({ children, width = 22, height = 16 }) {
  return (
    <Svg viewBox="0 0 24 16" width={width} height={height}>
      {children}
    </Svg>
  );
}

export default function FlagIcon({ country, size = 22 }) {
  const width = size;
  const height = Math.round((size * 16) / 24);

  switch (country) {
    case "BR":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="16" fill="#009739" />
          <Polygon points="12,2 22,8 12,14 2,8" fill="#FEDD00" />
          <Circle cx="12" cy="8" r="4.2" fill="#012169" />
        </FlagSvg>
      );

    case "US":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="16" fill="#FFFFFF" />
          <Rect y="0" width="24" height="2.29" fill="#B22234" />
          <Rect y="4.57" width="24" height="2.29" fill="#B22234" />
          <Rect y="9.14" width="24" height="2.29" fill="#B22234" />
          <Rect y="13.71" width="24" height="2.29" fill="#B22234" />
          <Rect x="0" y="0" width="10" height="8.6" fill="#3C3B6E" />
        </FlagSvg>
      );

    case "AR":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="16" fill="#75AADB" />
          <Rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <Circle cx="12" cy="8" r="1.8" fill="#F6B40E" />
        </FlagSvg>
      );

    case "PY":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="5.33" fill="#D52B1E" />
          <Rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <Rect y="10.67" width="24" height="5.33" fill="#0038A8" />
        </FlagSvg>
      );

    case "UY":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="16" fill="#FFFFFF" />
          <Rect y="1.78" width="24" height="1.78" fill="#4A6DB5" />
          <Rect y="5.33" width="24" height="1.78" fill="#4A6DB5" />
          <Rect y="8.89" width="24" height="1.78" fill="#4A6DB5" />
          <Rect y="12.44" width="24" height="1.78" fill="#4A6DB5" />
          <Rect x="0" y="0" width="9" height="7.11" fill="#FFFFFF" stroke="#4A6DB5" strokeWidth="0.3" />
          <Circle cx="4.5" cy="3.55" r="1.6" fill="#F6B40E" />
        </FlagSvg>
      );

    case "CL":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="8" fill="#FFFFFF" />
          <Rect y="8" width="24" height="8" fill="#D52B1E" />
          <Rect x="0" y="0" width="8" height="8" fill="#0039A6" />
          <Polygon points="4,2.2 4.7,4.2 6.8,4.2 5.1,5.4 5.7,7.4 4,6.1 2.3,7.4 2.9,5.4 1.2,4.2 3.3,4.2" fill="#FFFFFF" />
        </FlagSvg>
      );

    case "VE":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="5.33" fill="#FFCC00" />
          <Rect y="5.33" width="24" height="5.33" fill="#00247D" />
          <Rect y="10.67" width="24" height="5.33" fill="#CF142B" />
          <Circle cx="9" cy="8" r="0.5" fill="#FFFFFF" />
          <Circle cx="10.6" cy="7.3" r="0.5" fill="#FFFFFF" />
          <Circle cx="12.2" cy="7" r="0.5" fill="#FFFFFF" />
          <Circle cx="13.8" cy="7.3" r="0.5" fill="#FFFFFF" />
          <Circle cx="15" cy="8" r="0.5" fill="#FFFFFF" />
        </FlagSvg>
      );

    case "CO":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="8" fill="#FCD116" />
          <Rect y="8" width="24" height="4" fill="#003893" />
          <Rect y="12" width="24" height="4" fill="#CE1126" />
        </FlagSvg>
      );

    case "PE":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="16" fill="#FFFFFF" />
          <Rect x="0" y="0" width="8" height="16" fill="#D91023" />
          <Rect x="16" y="0" width="8" height="16" fill="#D91023" />
        </FlagSvg>
      );

    case "BO":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="5.33" fill="#D52B1E" />
          <Rect y="5.33" width="24" height="5.33" fill="#F9E300" />
          <Rect y="10.67" width="24" height="5.33" fill="#007934" />
        </FlagSvg>
      );

    case "EC":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="8" fill="#FFCD00" />
          <Rect y="8" width="24" height="4" fill="#034EA2" />
          <Rect y="12" width="24" height="4" fill="#ED1C24" />
        </FlagSvg>
      );

    case "SV":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="5.33" fill="#0047AB" />
          <Rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <Rect y="10.67" width="24" height="5.33" fill="#0047AB" />
        </FlagSvg>
      );

    case "MX":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="8" height="16" fill="#006847" />
          <Rect x="8" width="8" height="16" fill="#FFFFFF" />
          <Rect x="16" width="8" height="16" fill="#CE1126" />
        </FlagSvg>
      );

    case "PR":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="16" fill="#FFFFFF" />
          <Rect y="0" width="24" height="3.2" fill="#ED1C24" />
          <Rect y="6.4" width="24" height="3.2" fill="#ED1C24" />
          <Rect y="12.8" width="24" height="3.2" fill="#ED1C24" />
          <Polygon points="0,0 11,8 0,16" fill="#0050F0" />
          <Polygon points="4.3,6.2 4.9,8 3.4,6.9 5.2,6.9 3.7,8" fill="#FFFFFF" />
        </FlagSvg>
      );

    case "HN":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="5.33" fill="#0073CF" />
          <Rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <Rect y="10.67" width="24" height="5.33" fill="#0073CF" />
          <Circle cx="9.5" cy="8" r="0.55" fill="#0073CF" />
          <Circle cx="11" cy="7.2" r="0.55" fill="#0073CF" />
          <Circle cx="12.5" cy="8" r="0.55" fill="#0073CF" />
          <Circle cx="14" cy="7.2" r="0.55" fill="#0073CF" />
          <Circle cx="15.5" cy="8" r="0.55" fill="#0073CF" />
        </FlagSvg>
      );

    case "GT":
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="8" height="16" fill="#4997D0" />
          <Rect x="8" width="8" height="16" fill="#FFFFFF" />
          <Rect x="16" width="8" height="16" fill="#4997D0" />
        </FlagSvg>
      );

    default:
      return (
        <FlagSvg width={width} height={height}>
          <Rect width="24" height="16" fill="#6b7280" />
        </FlagSvg>
      );
  }
}
