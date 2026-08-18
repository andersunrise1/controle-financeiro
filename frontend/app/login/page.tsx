"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button3D from "@/components/Button3D";
import Alert from "@/components/Alert";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { login, isValidEmail, isValidPassword, setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { translateError } from "@/lib/i18n";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { locale, t } = useI18n();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidEmail(email)) {
      setError(translateError("Informe um e-mail válido.", locale));
      return;
    }

    if (!isValidPassword(password)) {
      setError(translateError("A senha deve ter no mínimo 6 caracteres.", locale));
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      setToken(data.token);
      setUser(data.user);
      setSuccess(data.message);
      router.push("/dashboard");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao fazer login.";
      setError(translateError(raw, locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="card-dark rounded-2xl p-8 shadow-lg">
          <div className="mx-auto mb-4 flex flex-col items-center">
            <img src="/icon-divisa-final.png" alt="Divisa" className="h-28 w-28" />
            <span
              className="mt-2 text-2xl font-extrabold tracking-[0.2em]"
              style={{
                background: "linear-gradient(90deg, #ffd93d, #ff8c42, #d6249f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DIVISA
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">{t("loginTitle")}</h1>
          <p className="mt-1 text-sm text-gray-400">{t("loginSubtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="input-dark w-full rounded-xl px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="input-dark w-full rounded-xl px-4 py-3"
                required
              />
            </div>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <Button3D type="submit" fullWidth disabled={loading}>
              {loading ? t("loginButtonLoading") : t("loginButton")}
            </Button3D>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-semibold text-[#39ff14] hover:underline">
              {t("signUpLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
