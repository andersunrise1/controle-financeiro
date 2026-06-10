interface AlertProps {
  type: "error" | "success";
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "border-red-300 bg-red-50 text-red-700"
      : "border-green-300 bg-green-50 text-green-700";

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}
      role="alert"
    >
      {message}
    </div>
  );
}
