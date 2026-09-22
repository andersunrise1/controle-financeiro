"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@/components/Alert";
import Button3D from "@/components/Button3D";
import { resetPassword } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";
import { translateError } from "@/lib/i18n";

function RedefinirSenhaForm() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();

  // Both come from the link in the email when the person opens it on the
  // same device; typed by hand otherwise.
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState(params.get("code") ?? "");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email, code.trim(), password);
      setDone(true);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao redefinir a senha.";
      setError(translateError(raw, locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-6 py-12">
      <div className="card-dark w-full max-w-md rounded-2xl p-8 shadow-md">
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">
          {t("resetPasswordTitle")}
        </h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          {t("resetPasswordSubtitle")}
        </p>

        {done ? (
          <div className="mt-6 flex flex-col gap-4">
            <Alert type="success" message={t("resetPasswordDone")} />
            <Button3D fullWidth onClick={() => router.push("/login")}>
              {t("backToLogin")}
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

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[color:var(--text-secondary)]">
                {t("resetPasswordCodeLabel")}
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
                className="rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-input)] px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-[color:var(--text-primary)] outline-none focus:border-[color:var(--border-color-strong)]"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[color:var(--text-secondary)]">
                {t("resetPasswordNewLabel")}
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                autoComplete="new-password"
                required
                className="rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-input)] px-4 py-3 text-[color:var(--text-primary)] outline-none focus:border-[color:var(--border-color-strong)]"
              />
            </label>

            {error && <Alert type="error" message={error} />}

            <Button3D type="submit" fullWidth disabled={loading}>
              {t("resetPasswordButton")}
            </Button3D>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link
            href="/esqueci-senha"
            className="text-[color:var(--text-muted)] underline"
          >
            {t("forgotPasswordButton")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  // useSearchParams needs a Suspense boundary to prerender as static.
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-dark" />}>
      <RedefinirSenhaForm />
    </Suspense>
  );
}
