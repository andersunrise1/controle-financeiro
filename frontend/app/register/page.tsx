"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button3D from "@/components/Button3D";
import Alert from "@/components/Alert";
import { register, isValidEmail, isValidPassword, setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (name.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const data = await register(name, email, password);
      setToken(data.token);
      setUser(data.user);
      setSuccess(data.message);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark px-4">
      <div className="card-dark w-full max-w-md rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-100">Cadastro</h1>
        <p className="mt-1 text-sm text-gray-400">
          Crie sua conta gratuitamente
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="input-dark w-full rounded-xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-dark w-full rounded-xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="input-dark w-full rounded-xl px-4 py-3"
              required
            />
          </div>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <Button3D type="submit" fullWidth disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button3D>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-[#39ff14] hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
