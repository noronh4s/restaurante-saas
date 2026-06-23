"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Plus, ArrowUpDown } from "lucide-react";

type Insumo = {
  id: string;
  nome: string;
  unidade: string;
  quantidade_estoque: number;
};

type Movimentacao = {
  id: string;
  insumo_id: string;
  tipo: string;
  quantidade: number;
  created_at: string;
  observacao: string | null;
  insumos: Insumo;
};

export default function EstoquePage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [insumoId, setInsumoId] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [observacao, setObservacao] = useState("");
  const supabase = createClient();

  async function carregar() {
    const { data: i } = await supabase
      .from("insumos")
      .select("*")
      .order("nome");
    if (i) setInsumos(i);

    const { data: m } = await supabase
      .from("movimentacoes_estoque")
      .select("*, insumos(*)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (m) setMovimentacoes(m);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function movimentar(e: React.FormEvent) {
    e.preventDefault();
    if (!insumoId || !quantidade) return;

    const qtd = parseFloat(quantidade);

    // Registrar movimentação
    await supabase.from("movimentacoes_estoque").insert({
      insumo_id: insumoId,
      tipo,
      quantidade: qtd,
      observacao,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    // Atualizar estoque do insumo
    const insumo = insumos.find((i) => i.id === insumoId);
    if (insumo) {
      const novoEstoque =
        tipo === "entrada"
          ? Number(insumo.quantidade_estoque) + qtd
          : Number(insumo.quantidade_estoque) - qtd;

      await supabase
        .from("insumos")
        .update({ quantidade_estoque: Math.max(0, novoEstoque) })
        .eq("id", insumoId);
    }

    setInsumoId("");
    setQuantidade("");
    setObservacao("");
    setMostrarForm(false);
    carregar();
  }

  const insumosComEstoqueBaixo = insumos.filter(
    (i) => Number(i.quantidade_estoque) <= 5 && Number(i.quantidade_estoque) > 0
  );
  const insumosZerados = insumos.filter(
    (i) => Number(i.quantidade_estoque) <= 0
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-900">Estoque</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500"
        >
          <Plus size={18} />
          Movimentar
        </button>
      </div>

      {/* Alertas */}
      {insumosZerados.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">
            {insumosZerados.length} insumo(s) com estoque zerado!
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-red-600">
            {insumosZerados.map((i) => (
              <li key={i.id}>
                {i.nome} — 0 {i.unidade}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insumosComEstoqueBaixo.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-800">
            {insumosComEstoqueBaixo.length} insumo(s) com estoque baixo!
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-amber-600">
            {insumosComEstoqueBaixo.map((i) => (
              <li key={i.id}>
                {i.nome} — {i.quantidade_estoque} {i.unidade}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulário */}
      {mostrarForm && (
        <form
          onSubmit={movimentar}
          className="mb-6 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-emerald-900">
            Registrar Movimentação
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-600">
                Insumo
              </label>
              <select
                value={insumoId}
                onChange={(e) => setInsumoId(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              >
                <option value="">Selecione...</option>
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} (estoque: {i.quantidade_estoque} {i.unidade})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "entrada" | "saida")}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">
                Quantidade
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">
                Observação
              </label>
              <input
                type="text"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500"
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Registrar
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

      {/* Tabela de estoque atual */}
      <div className="mb-6 rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold text-zinc-800">
            Estoque Atual
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-zinc-500">
              <th className="p-4 font-medium">Insumo</th>
              <th className="p-4 font-medium">Unidade</th>
              <th className="p-4 font-medium">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {insumos
              .filter((i) => Number(i.quantidade_estoque) > 0)
              .map((i) => (
                <tr key={i.id} className="border-b text-sm last:border-0">
                  <td className="p-4 font-medium text-zinc-800">{i.nome}</td>
                  <td className="p-4 text-zinc-600">{i.unidade}</td>
                  <td className="p-4 text-zinc-800">
                    {i.quantidade_estoque}
                  </td>
                </tr>
              ))}
            {insumos.filter((i) => Number(i.quantidade_estoque) > 0).length ===
              0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-zinc-400">
                  Nenhum item em estoque.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Últimas movimentações */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-800">
            <ArrowUpDown size={16} />
            Últimas Movimentações
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-zinc-500">
              <th className="p-4 font-medium">Data</th>
              <th className="p-4 font-medium">Insumo</th>
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium">Qtd</th>
              <th className="p-4 font-medium">Obs</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((m) => (
              <tr key={m.id} className="border-b text-sm last:border-0">
                <td className="p-4 text-zinc-600">
                  {new Date(m.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4 font-medium text-zinc-800">
                  {m.insumos?.nome}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.tipo === "entrada"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {m.tipo === "entrada" ? "Entrada" : "Saída"}
                  </span>
                </td>
                <td className="p-4 text-zinc-800">{m.quantidade}</td>
                <td className="p-4 text-zinc-500">{m.observacao || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
