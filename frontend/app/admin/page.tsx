"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import Alert from "@/components/Alert";
import {
  getAdminFeedback,
  setFeedbackResolved,
  FeedbackWithUser,
  getAdminUsers,
  setUserLifetime,
  AdminUser,
} from "@/lib/api";
import { translateError } from "@/lib/i18n";

const CATEGORY_STYLES: Record<string, string> = {
  bug: "bg-[#ff073a]/10 text-[color:var(--alert-error-text)] border-[#ff073a]/40",
  sugestao: "bg-[#ffd93d]/10 text-[color:var(--alert-warning-text)] border-[#ffd93d]/40",
  outro: "bg-gray-500/10 text-[color:var(--text-secondary)] border-gray-500/40",
};

/**
 * Quem tem acesso, e um botão para dar acesso.
 *
 * Existe por um motivo concreto: a divulgação prevista é dar o app a
 * criadores de conteúdo de motorhome em troca de falarem dele. Esse acesso
 * não passa por pagamento, então alguém precisa concedê-lo à mão.
 */
function AdminUsers() {
  const { t, locale } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salvando, setSalvando] = useState<number | null>(null);

  // Guarda a mensagem crua do servidor e traduz na renderização: assim trocar
  // o idioma com um erro na tela traduz o que já está ali, e o carregamento
  // não precisa depender de `locale` (o que faria este efeito rodar de novo a
  // cada troca de idioma, buscando a lista outra vez sem motivo).
  const loadUsers = useCallback(async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data.users);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleLifetime = async (conta: AdminUser) => {
    setSalvando(conta.id);
    setError("");
    try {
      await setUserLifetime(conta.id, conta.plan !== "lifetime");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "");
    } finally {
      setSalvando(null);
    }
  };

  const planLabel = (conta: AdminUser) => {
    if (conta.plan === "lifetime") return t("adminUsersPlanLifetime");
    return conta.dias_restantes > 0
      ? `${t("adminUsersPlanTrial")} · ${conta.dias_restantes}d`
      : t("adminUsersPlanExpired");
  };

  const planStyle = (conta: AdminUser) => {
    if (conta.plan === "lifetime")
      return "border-[#39ff14]/40 bg-[#39ff14]/10 text-[color:var(--alert-success-text)]";
    return conta.dias_restantes > 0
      ? "border-[#ffd93d]/40 bg-[#ffd93d]/10 text-[color:var(--alert-warning-text)]"
      : "border-[#ff073a]/40 bg-[#ff073a]/10 text-[color:var(--alert-error-text)]";
  };

  return (
    <section className="mb-10">
      <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
        {t("adminUsersTitle")}
      </h1>
      <p className="mt-1 text-xs text-[color:var(--text-faint)]">
        {t("adminUsersGrantHint")}
      </p>

      {error && (
        <div className="mt-3">
          <Alert type="error" message={translateError(error, locale)} />
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-[color:var(--text-muted)]">{t("loading")}</p>
      ) : users.length === 0 ? (
        <p className="mt-4 text-[color:var(--text-muted)]">
          {t("adminUsersEmpty")}
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {users.map((conta) => (
            <div
              key={conta.id}
              className="card-dark flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 shadow-md"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-[color:var(--text-primary)]">
                  {conta.name}
                </p>
                <p className="truncate text-xs text-[color:var(--text-faint)]">
                  {conta.email}
                </p>
                {conta.paid_at && (
                  <p className="mt-0.5 text-xs text-[color:var(--text-faint)]">
                    {t("adminUsersPaidAt")}{" "}
                    {new Date(conta.paid_at).toLocaleDateString(
                      locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US"
                    )}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${planStyle(conta)}`}
                >
                  {planLabel(conta)}
                </span>
                <button
                  type="button"
                  onClick={() => toggleLifetime(conta)}
                  disabled={salvando === conta.id || Boolean(conta.paid_at)}
                  className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-input)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-secondary)] transition hover:border-[color:var(--hover-border)] hover:text-[color:var(--hover-text)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {conta.plan === "lifetime"
                    ? t("adminUsersRevoke")
                    : t("adminUsersGrant")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminContent() {
  const { t, locale } = useI18n();
  const [feedback, setFeedback] = useState<FeedbackWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeedback = useCallback(async () => {
    try {
      const data = await getAdminFeedback();
      setFeedback(data.feedback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const toggleResolved = async (item: FeedbackWithUser) => {
    await setFeedbackResolved(item.id, item.resolved === 0);
    loadFeedback();
  };

  const categoryLabel = (category: string) => {
    if (category === "bug") return t("feedbackCategoryBug");
    if (category === "sugestao") return t("feedbackCategorySugestao");
    return t("feedbackCategoryOutro");
  };

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <AdminUsers />

        <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
          {t("adminFeedbackTitle")}
        </h1>

        {loading ? (
          <p className="mt-4 text-[color:var(--text-muted)]">{t("loading")}</p>
        ) : feedback.length === 0 ? (
          <p className="mt-4 text-[color:var(--text-muted)]">{t("adminFeedbackEmpty")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="card-dark rounded-2xl p-5 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[item.category]}`}
                    >
                      {categoryLabel(item.category)}
                    </span>
                    {item.resolved === 1 && (
                      <span className="rounded-full border border-[#39ff14]/40 bg-[#39ff14]/10 px-3 py-1 text-xs font-semibold text-[color:var(--alert-success-text)]">
                        {t("adminFeedbackResolvedBadge")}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[color:var(--text-faint)]">
                    {new Date(item.created_at).toLocaleString(
                      locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US"
                    )}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-[color:var(--text-primary)]">
                  {item.message}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-[color:var(--text-faint)]">
                    {item.user_name} · {item.user_email}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleResolved(item)}
                    className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-input)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-secondary)] transition hover:border-[color:var(--hover-border)] hover:text-[color:var(--hover-text)]"
                  >
                    {item.resolved === 1
                      ? t("adminFeedbackReopen")
                      : t("adminFeedbackResolve")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AdminGate() {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark">
        <p className="text-[color:var(--text-muted)]">{t("loading")}</p>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <p className="text-[color:var(--text-muted)]">{t("adminAccessDenied")}</p>
        </main>
      </div>
    );
  }

  return <AdminContent />;
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminGate />
    </ProtectedRoute>
  );
}
