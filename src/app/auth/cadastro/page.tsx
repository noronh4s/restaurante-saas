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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-margify-950 to-margify-900">
      <form
        onSubmit={handleCadastro}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 backdrop-blur"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-margify-500 font-bold text-white">
            M
          </div>
          <h1 className="text-2xl font-bold text-white">MargiFy</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Crie sua conta gratuita
          </p>
        </div>

        {erro && (
          <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-white placeholder-zinc-500 outline-none focus:border-margify-500"
              placeholder="Seu nome"
              required
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-margify-600 py-3 font-bold text-white transition hover:bg-margify-500 disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar Conta"}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-margify-400 underline hover:text-margify-300"
          >
            Entrar
          </button>
        </p>
      </form>
    </div>
  );
}
