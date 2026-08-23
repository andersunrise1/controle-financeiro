interface AlertProps {
  type: "error" | "success";
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "border-[#ff073a]/40 bg-[#ff073a]/10"
      : "border-[#39ff14]/40 bg-[#39ff14]/10";

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}
      style={{ color: type === "error" ? "var(--alert-error-text)" : "var(--alert-success-text)" }}
      role="alert"
    >
      {message}
    </div>
  );
}
