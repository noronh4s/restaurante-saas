"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Plus, Trash2, ArrowLeft, Calculator } from "lucide-react";

type Insumo = {
  id: string;
  nome: string;
  unidade: string;
  preco_unitario: number;
};

type FichaItem = {
  id: string;
  insumo_id: string;
  quantidade: number;
  custo_total: number;
  insumos: Insumo;
};

export default function FichaTecnicaPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [prato, setPrato] = useState<any>(null);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [ficha, setFicha] = useState<FichaItem[]>([]);
  const [insumoId, setInsumoId] = useState("");
  const [quantidade, setQuantidade] = useState("");

  useEffect(() => {
    async function carregar() {
      const { data: p } = await supabase
        .from("pratos")
        .select("*")
        .eq("id", id)
        .single();
      setPrato(p);

      const { data: i } = await supabase
        .from("insumos")
        .select("*")
        .order("nome");
      if (i) setInsumos(i);

      const { data: f } = await supabase
        .from("fichas_tecnicas")
        .select("*, insumos(*)")
        .eq("prato_id", id);
      if (f) setFicha(f);
    }
    carregar();
  }, [id]);

  async function adicionarIngrediente(e: React.FormEvent) {
    e.preventDefault();
    if (!insumoId || !quantidade) return;

    const insumo = insumos.find((i) => i.id === insumoId);
    if (!insumo) return;

    const custo = insumo.preco_unitario * parseFloat(quantidade);

    await supabase.from("fichas_tecnicas").insert({
      prato_id: id,
      insumo_id: insumoId,
      quantidade: parseFloat(quantidade),
      custo_total: custo,
    });

    setInsumoId("");
    setQuantidade("");

    const { data: f } = await supabase
      .from("fichas_tecnicas")
      .select("*, insumos(*)")
      .eq("prato_id", id);
    if (f) setFicha(f);
  }

  async function removerIngrediente(fichaId: string) {
    await supabase.from("fichas_tecnicas").delete().eq("id", fichaId);
    setFicha((prev) => prev.filter((f) => f.id !== fichaId));
  }

  async function sugerirPreco() {
    const custoTotal = ficha.reduce((acc, f) => acc + Number(f.custo_total), 0);
    // Margem sugerida de 40% -> preco = custo / (1 - 0.4)
    const margemDesejada = 0.4;
    const precoSugerido = custoTotal / (1 - margemDesejada);

    await supabase
      .from("pratos")
      .update({ preco_venda: Math.round(precoSugerido * 100) / 100 })
      .eq("id", id);

    const { data: p } = await supabase
      .from("pratos")
      .select("*")
      .eq("id", id)
      .single();
    if (p) setPrato(p);

    // Atualiza o preco_sugerido na ficha técnica
    for (const item of ficha) {
      await supabase
        .from("fichas_tecnicas")
        .update({ preco_sugerido: Math.round(precoSugerido * 100) / 100 })
        .eq("id", item.id);
    }
  }

  const custoTotal = ficha.reduce(
    (acc, f) => acc + Number(f.custo_total),
    0
  );
  const margemAtual =
    prato?.preco_venda && prato.preco_venda > 0
      ? ((prato.preco_venda - custoTotal) / prato.preco_venda) * 100
      : 0;

  return (
    <div>
      <button
        onClick={() => router.push("/pratos")}
        className="mb-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft size={16} />
        Voltar para Pratos
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">
            {prato?.nome || "Carregando..."}
          </h1>
          <p className="mt-1 text-zinc-500">Ficha Técnica</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500">Preço de Venda</p>
          <p className="text-2xl font-bold text-emerald-700">
            {prato?.preco_venda
              ? `R$ ${Number(prato.preco_venda).toFixed(2)}`
              : "—"}
          </p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Custo Total do Prato</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            R$ {custoTotal.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Margem Atual</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              margemAtual >= 40 ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {prato?.preco_venda ? `${margemAtual.toFixed(1)}%` : "—"}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">CMV</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              custoTotal > 0 && prato?.preco_venda
                ? (custoTotal / prato.preco_venda) * 100 <= 35
                  ? "text-emerald-600"
                  : "text-red-600"
                : "text-zinc-400"
            }`}
          >
            {prato?.preco_venda && custoTotal > 0
              ? `${((custoTotal / prato.preco_venda) * 100).toFixed(1)}%`
              : "—"}
          </p>
        </div>
      </div>

      {/* Adicionar ingrediente */}
      <form
        onSubmit={adicionarIngrediente}
        className="mb-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 font-semibold text-emerald-900">
          Adicionar Ingrediente
        </h2>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1">
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
                  {i.nome} (R$ {i.preco_unitario}/{i.unidade})
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="mb-1 block text-sm text-zinc-600">
              Quantidade
            </label>
            <div className="flex gap-2">
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
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>
        </div>
      </form>

      {/* Tabela de ingredientes */}
      <div className="rounded-xl border bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-zinc-500">
              <th className="p-4 font-medium">Ingrediente</th>
              <th className="p-4 font-medium">Quantidade</th>
              <th className="p-4 font-medium">Custo</th>
              <th className="p-4 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {ficha.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-400">
                  Nenhum ingrediente adicionado ainda.
                </td>
              </tr>
            )}
            {ficha.map((f) => (
              <tr key={f.id} className="border-b text-sm last:border-0">
                <td className="p-4 font-medium text-zinc-800">
                  {f.insumos?.nome}
                </td>
                <td className="p-4 text-zinc-600">
                  {f.quantidade} {f.insumos?.unidade}
                </td>
                <td className="p-4 text-zinc-800">
                  R$ {Number(f.custo_total).toFixed(2)}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => removerIngrediente(f.id)}
                    className="rounded p-1 text-zinc-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sugerir preço */}
      {ficha.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={sugerirPreco}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition hover:bg-amber-500"
          >
            <Calculator size={18} />
            Sugerir Preço (Margem 40%)
          </button>
        </div>
      )}
    </div>
  );
}
