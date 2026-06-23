"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Insumo = {
  id: string;
  nome: string;
  unidade: string;
  preco_unitario: number;
  quantidade_estoque: number;
};

const unidades = ["kg", "g", "L", "mL", "un", "cx", "pct", "lata"];

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Insumo | null>(null);
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("un");
  const [preco, setPreco] = useState("");
  const [qtd, setQtd] = useState("");
  const supabase = createClient();

  async function carregar() {
    const { data } = await supabase
      .from("insumos")
      .select("*")
      .order("nome");
    if (data) setInsumos(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nome,
      unidade,
      preco_unitario: parseFloat(preco),
      quantidade_estoque: parseFloat(qtd) || 0,
    };

    if (editando) {
      await supabase.from("insumos").update(payload).eq("id", editando.id);
    } else {
      await supabase.from("insumos").insert(payload);
    }

    setNome("");
    setUnidade("un");
    setPreco("");
    setQtd("");
    setEditando(null);
    setMostrarForm(false);
    carregar();
  }

  function editar(i: Insumo) {
    setNome(i.nome);
    setUnidade(i.unidade);
    setPreco(String(i.preco_unitario));
    setQtd(String(i.quantidade_estoque));
    setEditando(i);
    setMostrarForm(true);
  }

  async function deletar(id: string) {
    if (!confirm("Tem certeza?")) return;
    await supabase.from("insumos").delete().eq("id", id);
    carregar();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-900">Insumos</h1>
        <button
          onClick={() => {
            setEditando(null);
            setNome("");
            setUnidade("un");
            setPreco("");
            setQtd("");
            setMostrarForm(!mostrarForm);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500"
        >
          <Plus size={18} />
          Novo Insumo
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={salvar}
          className="mb-6 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-emerald-900">
            {editando ? "Editar Insumo" : "Novo Insumo"}
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
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
                Unidade
              </label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                {unidades.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">
                Pre&ccedil;o Unit&aacute;rio (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">
                Estoque Atual
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={qtd}
                onChange={(e) => setQtd(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
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
              <th className="p-4 font-medium">Unidade</th>
              <th className="p-4 font-medium">Pre&ccedil;o Unit.</th>
              <th className="p-4 font-medium">Estoque</th>
              <th className="p-4 font-medium">A&ccedil;&otilde;es</th>
            </tr>
          </thead>
          <tbody>
            {insumos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-400">
                  Nenhum insumo cadastrado ainda.
                </td>
              </tr>
            )}
            {insumos.map((i) => (
              <tr key={i.id} className="border-b text-sm last:border-0">
                <td className="p-4 font-medium text-zinc-800">{i.nome}</td>
                <td className="p-4 text-zinc-600">{i.unidade}</td>
                <td className="p-4 text-zinc-800">
                  R$ {i.preco_unitario.toFixed(2)}
                </td>
                <td className="p-4 text-zinc-800">{i.quantidade_estoque}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => editar(i)}
                      className="rounded p-1 text-zinc-400 hover:text-emerald-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deletar(i.id)}
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
