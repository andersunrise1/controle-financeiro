"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Alert from "@/components/Alert";
import Button3D from "@/components/Button3D";
import { deleteAccount } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { translateError } from "@/lib/i18n";

// Mirrors mobile's AccountScreen. Deletion is two steps on purpose: the
// first button only reveals the confirmation, so an irreversible action is
// never a single click away.
function ContaContent() {
  const { locale, t } = useI18n();
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError(
        translateError("Informe sua senha para confirmar a exclusão.", locale)
      );
      return;
    }

    setLoading(true);
    try {
      await deleteAccount(password);
      setUser(null);
      router.replace("/login");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao excluir a conta.";
      setError(translateError(raw, locale));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-10 flex flex-col gap-6">
        <section className="card-dark rounded-2xl p-6 shadow-md">
          <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
            {t("accountDataTitle")}
          </h1>

          <dl className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-[color:var(--text-muted)]">
                {t("nameLabel")}
              </dt>
              <dd className="text-sm font-semibold text-[color:var(--text-primary)]">
                {user?.name}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-[color:var(--text-muted)]">
                {t("emailLabel")}
              </dt>
              <dd className="text-sm font-semibold text-[color:var(--text-primary)] break-all">
                {user?.email}
              </dd>
            </div>
          </dl>

          <Link
            href="/privacidade"
            className="mt-5 inline-block text-sm text-[color:var(--text-muted)] underline"
          >
            {t("privacyPolicyLink")}
          </Link>
        </section>

        <section className="card-dark rounded-2xl border border-[rgba(255,7,58,0.4)] p-6 shadow-md">
          <h2 className="text-base font-bold text-[color:var(--text-accent-red)]">
            {t("deleteAccountTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
            {t("deleteAccountExplanation")}
          </p>

          {!confirming ? (
            <div className="mt-5">
              <Button3D variant="danger" onClick={() => setConfirming(true)}>
                {t("deleteAccountButton")}
              </Button3D>
            </div>
          ) : (
            <form onSubmit={handleDelete} className="mt-5 flex flex-col gap-4">
              <p className="text-sm font-bold leading-relaxed text-[color:var(--text-accent-red)]">
                {t("deleteAccountWarning")}
              </p>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[color:var(--text-secondary)]">
                  {t("deleteAccountPasswordLabel")}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="current-password"
                  className="rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-input)] px-4 py-3 text-[color:var(--text-primary)] outline-none focus:border-[color:var(--border-color-strong)]"
                />
              </label>

              {error && <Alert type="error" message={error} />}

              <div className="flex flex-wrap gap-3">
                <Button3D type="submit" variant="danger" disabled={loading}>
                  {t("deleteAccountConfirmButton")}
                </Button3D>
                <Button3D
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => {
                    setConfirming(false);
                    setPassword("");
                    setError("");
                  }}
                >
                  {t("mercadoCancelButton")}
                </Button3D>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default function ContaPage() {
  return (
    <ProtectedRoute>
      <ContaContent />
    </ProtectedRoute>
  );
}
