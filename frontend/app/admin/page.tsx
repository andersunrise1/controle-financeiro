"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { getAdminFeedback, setFeedbackResolved, FeedbackWithUser } from "@/lib/api";

const CATEGORY_STYLES: Record<string, string> = {
  bug: "bg-[#ff073a]/10 text-[#ff6b85] border-[#ff073a]/40",
  sugestao: "bg-[#ffd93d]/10 text-[#ffd93d] border-[#ffd93d]/40",
  outro: "bg-gray-500/10 text-gray-300 border-gray-500/40",
};

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
        <h1 className="text-lg font-semibold text-gray-100">
          {t("adminFeedbackTitle")}
        </h1>

        {loading ? (
          <p className="mt-4 text-gray-400">{t("loading")}</p>
        ) : feedback.length === 0 ? (
          <p className="mt-4 text-gray-400">{t("adminFeedbackEmpty")}</p>
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
                      <span className="rounded-full border border-[#39ff14]/40 bg-[#39ff14]/10 px-3 py-1 text-xs font-semibold text-[#7cff5c]">
                        {t("adminFeedbackResolvedBadge")}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleString(
                      locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US"
                    )}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-gray-100">
                  {item.message}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-500">
                    {item.user_name} · {item.user_email}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleResolved(item)}
                    className="rounded-lg border border-[#555] bg-[#2a2a2a] px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-[#6b7280] hover:text-white"
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
        <p className="text-gray-400">{t("loading")}</p>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <p className="text-gray-400">{t("adminAccessDenied")}</p>
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
