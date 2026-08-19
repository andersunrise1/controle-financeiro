"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button3D from "./Button3D";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { logout } from "@/lib/api";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <header className="border-b border-[#555] bg-bg-card shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/icon-divisa-final.png" alt="Divisa" className="h-12 w-12" />
            <span
              className="hidden text-lg font-extrabold tracking-[0.15em] sm:inline"
              style={{
                background: "linear-gradient(90deg, #ffd93d, #ff8c42, #d6249f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DIVISA
            </span>
          </Link>
          <p className="text-sm text-gray-400">
            {t("greeting")}{" "}
            <span className="font-semibold text-gray-200">{user.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/feedback"
            className="text-sm font-medium text-gray-300 transition hover:text-white"
          >
            {t("navFeedback")}
          </Link>
          {user.isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-semibold transition hover:text-white"
              style={{
                background: "linear-gradient(90deg, #ffd93d, #ff8c42, #d6249f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("navAdmin")}
            </Link>
          )}
          <LanguageSwitcher />
          <Button3D variant="secondary" onClick={handleLogout}>
            {t("logout")}
          </Button3D>
        </div>
      </div>
    </header>
  );
}
