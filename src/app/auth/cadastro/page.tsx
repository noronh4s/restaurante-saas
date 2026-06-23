"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nome } },
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    alert("Cadastro feito! Verifique seu email para confirmar a conta.");
    router.push("/auth/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950">
      <form
        onSubmit={handleCadastro}
        className="w-full max-w-sm rounded-2xl border border-emerald-700/50 bg-emerald-800/40 p-8 backdrop-blur"
      >
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          RestaurantPro
        </h1>
        <p className="mb-8 text-center text-sm text-emerald-300">
          Crie sua conta gratuita
        </p>

        {erro && (
          <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-emerald-200">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-emerald-600/50 bg-emerald-900/50 px-4 py-2 text-white placeholder-emerald-400 outline-none focus:border-emerald-400"
              placeholder="Seu nome"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-emerald-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-emerald-600/50 bg-emerald-900/50 px-4 py-2 text-white placeholder-emerald-400 outline-none focus:border-emerald-400"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-emerald-200">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-emerald-600/50 bg-emerald-900/50 px-4 py-2 text-white placeholder-emerald-400 outline-none focus:border-emerald-400"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar Conta"}
        </button>

        <p className="mt-6 text-center text-sm text-emerald-400">
          J&aacute; tem conta?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-emerald-300 underline hover:text-emerald-200"
          >
            Entrar
          </button>
        </p>
      </form>
    </div>
  );
}
