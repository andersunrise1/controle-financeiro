interface FlagIconProps {
  country: "BR" | "US" | "ES";
  className?: string;
}

export default function FlagIcon({ country, className }: FlagIconProps) {
  const style = { display: "block" };

  if (country === "BR") {
    return (
      <svg
        viewBox="0 0 24 16"
        width="22"
        height="16"
        className={`rounded-sm ${className ?? ""}`}
        style={style}
      >
        <rect width="24" height="16" fill="#009739" />
        <polygon points="12,2 22,8 12,14 2,8" fill="#FEDD00" />
        <circle cx="12" cy="8" r="4.2" fill="#012169" />
      </svg>
    );
  }

  if (country === "US") {
    return (
      <svg
        viewBox="0 0 24 16"
        width="22"
        height="16"
        className={`rounded-sm ${className ?? ""}`}
        style={style}
      >
        <rect width="24" height="16" fill="#FFFFFF" />
        <rect y="0" width="24" height="2.29" fill="#B22234" />
        <rect y="4.57" width="24" height="2.29" fill="#B22234" />
        <rect y="9.14" width="24" height="2.29" fill="#B22234" />
        <rect y="13.71" width="24" height="2.29" fill="#B22234" />
        <rect x="0" y="0" width="10" height="8.6" fill="#3C3B6E" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 16"
      width="22"
      height="16"
      className={`rounded-sm ${className ?? ""}`}
      style={style}
    >
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </svg>
  );
}
