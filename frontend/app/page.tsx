"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Button3D from "@/components/Button3D";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark">
      <div className="text-center">
        <p className="text-[color:var(--text-muted)]">Redirecionando...</p>
        <div className="mt-4 flex justify-center gap-4">
          <Link href="/login">
            <Button3D>Login</Button3D>
          </Link>
          <Link href="/register">
            <Button3D variant="secondary">Cadastro</Button3D>
          </Link>
        </div>
      </div>
    </div>
  );
}
