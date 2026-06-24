"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";

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
    <div className="flex min-h-screen bg-black">
      {/* Left - Branding Panel */}
      <div className="relative hidden w-[520px] flex-col justify-between overflow-hidden bg-neutral-900 p-12 lg:flex">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#22c55e]/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-[#22c55e]/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black/40" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e] font-bold text-sm text-black">
              M
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              MargiFy
            </span>
          </Link>
        </div>

        <div className="relative">
          <p className="text-sm leading-relaxed text-white/30">
            "Inteligência que transforma sua margem. Controle de custos do seu restaurante como nunca antes."
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-[360px] animate-scale-in">
          {/* Mobile logo */}
          <div className="mb-12 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e] font-bold text-sm text-black">
              M
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              MargiFy
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Criar conta gratuita
            </h1>
            <p className="mt-1 text-sm text-white/30">
              Comece a controlar seus custos agora.
            </p>
          </div>

          {erro && (
            <div className="mb-6 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {erro}
            </div>
          )}

          <form onSubmit={handleCadastro} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/50">
                Nome completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/15 outline-none transition-all focus:border-white/20 focus:bg-white/[0.07] focus:ring-0"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/50">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/15 outline-none transition-all focus:border-white/20 focus:bg-white/[0.07] focus:ring-0"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/50">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/15 outline-none transition-all focus:border-white/20 focus:bg-white/[0.07] focus:ring-0"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#22c55e] py-3 text-sm font-medium text-black transition-all hover:bg-[#22c55e]/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/25">
            Já tem conta?{" "}
            <Link
              href="/auth/login"
              className="text-white/50 underline underline-offset-4 transition-colors hover:text-white/80"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}