"use client";

import { ButtonHTMLAttributes } from "react";

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
}

const variants = {
  primary: {
    bg: "bg-blue-500",
    shadow: "shadow-[0_4px_0_#1d4ed8]",
    hover: "hover:bg-blue-400",
    active: "active:shadow-[0_1px_0_#1d4ed8] active:translate-y-[3px]",
  },
  secondary: {
    bg: "bg-gray-500",
    shadow: "shadow-[0_4px_0_#374151]",
    hover: "hover:bg-gray-400",
    active: "active:shadow-[0_1px_0_#374151] active:translate-y-[3px]",
  },
  danger: {
    bg: "bg-red-500",
    shadow: "shadow-[0_4px_0_#b91c1c]",
    hover: "hover:bg-red-400",
    active: "active:shadow-[0_1px_0_#b91c1c] active:translate-y-[3px]",
  },
};

export default function Button3D({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: Button3DProps) {
  const v = variants[variant];

  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        "rounded-xl px-6 py-3 font-semibold text-white transition-all duration-150",
        v.bg,
        v.shadow,
        v.hover,
        v.active,
        fullWidth ? "w-full" : "",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
