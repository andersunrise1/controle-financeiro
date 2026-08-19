"use client";

import { useState, FormEvent, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Alert from "@/components/Alert";
import Button3D from "@/components/Button3D";
import { submitFeedback, FeedbackCategory } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";
import { translateError } from "@/lib/i18n";

function FeedbackContent() {
  const { locale, t } = useI18n();
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await submitFeedback({ category, message });
      setSuccess(t("feedbackSuccess"));
      setMessage("");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao salvar.";
      setError(translateError(raw, locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />

      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="card-dark rounded-2xl p-6 shadow-md">
          <h1 className="text-lg font-semibold text-gray-100">
            {t("feedbackPageTitle")}
          </h1>
          <p className="mt-1 text-sm text-gray-400">{t("feedbackPageSubtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                {t("feedbackCategoryLabel")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="input-dark w-full rounded-xl px-4 py-3"
              >
                <option value="bug">{t("feedbackCategoryBug")}</option>
                <option value="sugestao">{t("feedbackCategorySugestao")}</option>
                <option value="outro">{t("feedbackCategoryOutro")}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                {t("feedbackMessageLabel")}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("feedbackMessagePlaceholder")}
                rows={5}
                className="input-dark w-full rounded-xl px-4 py-3"
                required
              />
            </div>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <Button3D type="submit" fullWidth disabled={loading}>
              {loading ? t("feedbackSubmitButtonLoading") : t("feedbackSubmitButton")}
            </Button3D>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <ProtectedRoute>
      <FeedbackContent />
    </ProtectedRoute>
  );
}
