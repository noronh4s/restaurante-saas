"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

type Prato = {
  id: string;
  nome: string;
  preco_venda: number | null;
};

export default function PratosPage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Prato | null>(null);
  const [nome, setNome] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const supabase = createClient();

  async function carregar() {
    const { data } = await supabase.from("pratos").select("*").order("nome");
    if (data) setPratos(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nome,
      preco_venda: precoVenda ? parseFloat(precoVenda) : null,
    };

    if (editando) {
      await supabase.from("pratos").update(payload).eq("id", editando.id);
    } else {
      await supabase.from("pratos").insert(payload);
    }

    limpar();
    carregar();
  }

  function editar(p: Prato) {
    setNome(p.nome);
    setPrecoVenda(p.preco_venda ? String(p.preco_venda) : "");
    setEditando(p);
    setMostrarForm(true);
  }

  async function deletar(id: string) {
    if (!confirm("Tem certeza?")) return;
    await supabase.from("pratos").delete().eq("id", id);
    carregar();
  }

  function limpar() {
    setNome("");
    setPrecoVenda("");
    setEditando(null);
    setMostrarForm(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-900">Pratos</h1>
        <button
          onClick={() => {
            limpar();
            setMostrarForm(!mostrarForm);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500"
        >
          <Plus size={18} />
          Novo Prato
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={salvar}
          className="mb-6 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-emerald-900">
            {editando ? "Editar Prato" : "Novo Prato"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-zinc-600">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                placeholder="Deixe em branco para calcular depois"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              {editando ? "Salvar" : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="rounded-lg border px-5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-zinc-500">
              <th className="p-4 font-medium">Nome</th>
              <th className="p-4 font-medium">Preço Venda</th>
              <th className="p-4 font-medium">Ficha Técnica</th>
              <th className="p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pratos.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-400">
                  Nenhum prato cadastrado ainda.
                </td>
              </tr>
            )}
            {pratos.map((p) => (
              <tr key={p.id} className="border-b text-sm last:border-0">
                <td className="p-4 font-medium text-zinc-800">{p.nome}</td>
                <td className="p-4 text-zinc-800">
                  {p.preco_venda
                    ? `R$ ${p.preco_venda.toFixed(2)}`
                    : "—"}
                </td>
                <td className="p-4">
                  <Link
                    href={`/pratos/${p.id}`}
                    className="flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <UtensilsCrossed size={15} />
                    Ver Ficha
                  </Link>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => editar(p)}
                      className="rounded p-1 text-zinc-400 hover:text-emerald-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deletar(p.id)}
                      className="rounded p-1 text-zinc-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
