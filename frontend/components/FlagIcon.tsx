import { Region } from "@/lib/regions";

interface FlagIconProps {
  country: Region;
  className?: string;
}

function FlagSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 16"
      width="22"
      height="16"
      className="rounded-sm"
      style={{ display: "block", flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export default function FlagIcon({ country, className }: FlagIconProps) {
  const wrap = (svg: React.ReactNode) => (
    <span className={className} style={{ display: "inline-flex" }}>
      {svg}
    </span>
  );

  switch (country) {
    case "BR":
      return wrap(
        <FlagSvg>
          <rect width="24" height="16" fill="#009739" />
          <polygon points="12,2 22,8 12,14 2,8" fill="#FEDD00" />
          <circle cx="12" cy="8" r="4.2" fill="#012169" />
        </FlagSvg>
      );

    case "US":
      return wrap(
        <FlagSvg>
          <rect width="24" height="16" fill="#FFFFFF" />
          <rect y="0" width="24" height="2.29" fill="#B22234" />
          <rect y="4.57" width="24" height="2.29" fill="#B22234" />
          <rect y="9.14" width="24" height="2.29" fill="#B22234" />
          <rect y="13.71" width="24" height="2.29" fill="#B22234" />
          <rect x="0" y="0" width="10" height="8.6" fill="#3C3B6E" />
        </FlagSvg>
      );

    case "AR":
      return wrap(
        <FlagSvg>
          <rect width="24" height="16" fill="#75AADB" />
          <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <circle cx="12" cy="8" r="1.8" fill="#F6B40E" />
        </FlagSvg>
      );

    case "PY":
      return wrap(
        <FlagSvg>
          <rect width="24" height="5.33" fill="#D52B1E" />
          <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <rect y="10.67" width="24" height="5.33" fill="#0038A8" />
        </FlagSvg>
      );

    case "UY":
      return wrap(
        <FlagSvg>
          <rect width="24" height="16" fill="#FFFFFF" />
          <rect y="1.78" width="24" height="1.78" fill="#4A6DB5" />
          <rect y="5.33" width="24" height="1.78" fill="#4A6DB5" />
          <rect y="8.89" width="24" height="1.78" fill="#4A6DB5" />
          <rect y="12.44" width="24" height="1.78" fill="#4A6DB5" />
          <rect x="0" y="0" width="9" height="7.11" fill="#FFFFFF" stroke="#4A6DB5" strokeWidth="0.3" />
          <circle cx="4.5" cy="3.55" r="1.6" fill="#F6B40E" />
        </FlagSvg>
      );

    case "CL":
      return wrap(
        <FlagSvg>
          <rect width="24" height="8" fill="#FFFFFF" />
          <rect y="8" width="24" height="8" fill="#D52B1E" />
          <rect x="0" y="0" width="8" height="8" fill="#0039A6" />
          <polygon points="4,2.2 4.7,4.2 6.8,4.2 5.1,5.4 5.7,7.4 4,6.1 2.3,7.4 2.9,5.4 1.2,4.2 3.3,4.2" fill="#FFFFFF" />
        </FlagSvg>
      );

    case "VE":
      return wrap(
        <FlagSvg>
          <rect width="24" height="5.33" fill="#FFCC00" />
          <rect y="5.33" width="24" height="5.33" fill="#00247D" />
          <rect y="10.67" width="24" height="5.33" fill="#CF142B" />
          <circle cx="9" cy="8" r="0.5" fill="#FFFFFF" />
          <circle cx="10.6" cy="7.3" r="0.5" fill="#FFFFFF" />
          <circle cx="12.2" cy="7" r="0.5" fill="#FFFFFF" />
          <circle cx="13.8" cy="7.3" r="0.5" fill="#FFFFFF" />
          <circle cx="15" cy="8" r="0.5" fill="#FFFFFF" />
        </FlagSvg>
      );

    case "CO":
      return wrap(
        <FlagSvg>
          <rect width="24" height="8" fill="#FCD116" />
          <rect y="8" width="24" height="4" fill="#003893" />
          <rect y="12" width="24" height="4" fill="#CE1126" />
        </FlagSvg>
      );

    case "PE":
      return wrap(
        <FlagSvg>
          <rect width="24" height="16" fill="#FFFFFF" />
          <rect x="0" y="0" width="8" height="16" fill="#D91023" />
          <rect x="16" y="0" width="8" height="16" fill="#D91023" />
        </FlagSvg>
      );

    case "BO":
      return wrap(
        <FlagSvg>
          <rect width="24" height="5.33" fill="#D52B1E" />
          <rect y="5.33" width="24" height="5.33" fill="#F9E300" />
          <rect y="10.67" width="24" height="5.33" fill="#007934" />
        </FlagSvg>
      );

    case "EC":
      return wrap(
        <FlagSvg>
          <rect width="24" height="8" fill="#FFCD00" />
          <rect y="8" width="24" height="4" fill="#034EA2" />
          <rect y="12" width="24" height="4" fill="#ED1C24" />
        </FlagSvg>
      );

    case "SV":
      return wrap(
        <FlagSvg>
          <rect width="24" height="5.33" fill="#0047AB" />
          <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <rect y="10.67" width="24" height="5.33" fill="#0047AB" />
        </FlagSvg>
      );

    case "MX":
      return wrap(
        <FlagSvg>
          <rect width="8" height="16" fill="#006847" />
          <rect x="8" width="8" height="16" fill="#FFFFFF" />
          <rect x="16" width="8" height="16" fill="#CE1126" />
        </FlagSvg>
      );

    case "PR":
      return wrap(
        <FlagSvg>
          <rect width="24" height="16" fill="#FFFFFF" />
          <rect y="0" width="24" height="3.2" fill="#ED1C24" />
          <rect y="6.4" width="24" height="3.2" fill="#ED1C24" />
          <rect y="12.8" width="24" height="3.2" fill="#ED1C24" />
          <polygon points="0,0 11,8 0,16" fill="#0050F0" />
          <polygon points="4.3,6.2 4.9,8 3.4,6.9 5.2,6.9 3.7,8" fill="#FFFFFF" />
        </FlagSvg>
      );

    case "HN":
      return wrap(
        <FlagSvg>
          <rect width="24" height="5.33" fill="#0073CF" />
          <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <rect y="10.67" width="24" height="5.33" fill="#0073CF" />
          <circle cx="9.5" cy="8" r="0.55" fill="#0073CF" />
          <circle cx="11" cy="7.2" r="0.55" fill="#0073CF" />
          <circle cx="12.5" cy="8" r="0.55" fill="#0073CF" />
          <circle cx="14" cy="7.2" r="0.55" fill="#0073CF" />
          <circle cx="15.5" cy="8" r="0.55" fill="#0073CF" />
        </FlagSvg>
      );

    case "GT":
      return wrap(
        <FlagSvg>
          <rect width="8" height="16" fill="#4997D0" />
          <rect x="8" width="8" height="16" fill="#FFFFFF" />
          <rect x="16" width="8" height="16" fill="#4997D0" />
        </FlagSvg>
      );

    default:
      return wrap(
        <FlagSvg>
          <rect width="24" height="16" fill="#6b7280" />
        </FlagSvg>
      );
  }
}
