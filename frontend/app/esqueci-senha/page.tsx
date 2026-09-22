"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import Button3D from "@/components/Button3D";
import { forgotPassword } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";
import { translateError } from "@/lib/i18n";

export default function EsqueciSenhaPage() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email);
      // The API answers identically for an unknown address, so the wording
      // here has to stay conditional too — "we sent you an email" would
      // leak which addresses are registered.
      setSent(true);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao enviar o código.";
      setError(translateError(raw, locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-6 py-12">
      <div className="card-dark w-full max-w-md rounded-2xl p-8 shadow-md">
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">
          {t("forgotPasswordTitle")}
        </h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          {t("forgotPasswordSubtitle")}
        </p>

        {sent ? (
          <div className="mt-6 flex flex-col gap-4">
            <Alert type="success" message={t("forgotPasswordSent")} />
            <Button3D
              fullWidth
              onClick={() =>
                router.push(`/redefinir-senha?email=${encodeURIComponent(email)}`)
              }
            >
              {t("forgotPasswordHaveCode")}
            </Button3D>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[color:var(--text-secondary)]">
                {t("emailLabel")}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                autoComplete="email"
                required
                className="rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-input)] px-4 py-3 text-[color:var(--text-primary)] outline-none focus:border-[color:var(--border-color-strong)]"
              />
            </label>

            {error && <Alert type="error" message={error} />}

            <Button3D type="submit" fullWidth disabled={loading}>
              {t("forgotPasswordButton")}
            </Button3D>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="text-[color:var(--text-muted)] underline"
          >
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
