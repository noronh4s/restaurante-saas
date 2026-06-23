"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-margify-950 to-margify-900">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 backdrop-blur"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-margify-500 font-bold text-white">
            M
          </div>
          <h1 className="text-2xl font-bold text-white">MargiFy</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Entre na sua conta
          </p>
        </div>

        {erro && (
          <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white placeholder-zinc-500 outline-none focus:border-margify-500"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white placeholder-zinc-500 outline-none focus:border-margify-500"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-margify-600 py-3 font-bold text-white transition hover:bg-margify-500 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Ainda não tem conta?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/cadastro")}
            className="text-margify-400 underline hover:text-margify-300"
          >
            Cadastre-se
          </button>
        </p>
      </form>
    </div>
  );
}
