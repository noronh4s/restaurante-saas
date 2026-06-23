"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BadgePercent,
  DollarSign,
} from "lucide-react";

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

type CenarioPreco = {
  margem: number;
  preco: number;
  lucro: number;
  label: string;
  cor: string;
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
  const [precoEditando, setPrecoEditando] = useState(false);
  const [precoManual, setPrecoManual] = useState("");

  useEffect(() => {
    async function carregar() {
      const { data: p } = await supabase
        .from("pratos")
        .select("*")
        .eq("id", id)
        .single();
      setPrato(p);
      if (p?.preco_venda) setPrecoManual(String(p.preco_venda));

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

  const custoTotal = ficha.reduce((acc, f) => acc + Number(f.custo_total), 0);

  const margemAtual =
    prato?.preco_venda && prato.preco_venda > 0
      ? ((Number(prato.preco_venda) - custoTotal) / Number(prato.preco_venda)) *
        100
      : 0;

  const cmvAtual =
    prato?.preco_venda && custoTotal > 0
      ? (custoTotal / Number(prato.preco_venda)) * 100
      : 0;

  const cenarios: CenarioPreco[] = [
    {
      margem: 30,
      label: "Enxuta",
      cor: "text-amber-400",
      get preco() {
        return custoTotal / (1 - this.margem / 100);
      },
      get lucro() {
        return this.preco - custoTotal;
      },
    },
    {
      margem: 40,
      label: "Ideal",
      cor: "text-emerald-500",
      get preco() {
        return custoTotal / (1 - this.margem / 100);
      },
      get lucro() {
        return this.preco - custoTotal;
      },
    },
    {
      margem: 55,
      label: "Conforto",
      cor: "text-blue-500",
      get preco() {
        return custoTotal / (1 - this.margem / 100);
      },
      get lucro() {
        return this.preco - custoTotal;
      },
    },
  ];

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

  async function aplicarPreco(valor: number) {
    const rounded = Math.round(valor * 100) / 100;
    await supabase.from("pratos").update({ preco_venda: rounded }).eq("id", id);
    const { data: p } = await supabase
      .from("pratos")
      .select("*")
      .eq("id", id)
      .single();
    if (p) {
      setPrato(p);
      setPrecoManual(String(rounded));
    }
    setPrecoEditando(false);
  }

  async function salvarPrecoManual() {
    if (!precoManual) return;
    await aplicarPreco(parseFloat(precoManual));
  }

  // Maiores custos
  const topCustos = [...ficha]
    .sort((a, b) => Number(b.custo_total) - Number(a.custo_total))
    .slice(0, 3);

  const estaNoPrejuizo = prato?.preco_venda && custoTotal > Number(prato.preco_venda);

  return (
    <div>
      <button
        onClick={() => router.push("/pratos")}
        className="mb-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft size={16} />
        Voltar para Pratos
      </button>

      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">
            {prato?.nome || "Carregando..."}
          </h1>
          <p className="mt-1 text-zinc-500">Ficha Técnica</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500">Preço de Venda</p>
          {precoEditando ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={precoManual}
                onChange={(e) => setPrecoManual(e.target.value)}
                className="w-24 rounded border px-2 py-1 text-right text-lg font-bold outline-none focus:border-emerald-500"
                autoFocus
              />
              <button
                onClick={salvarPrecoManual}
                className="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
              >
                OK
              </button>
              <button
                onClick={() => setPrecoEditando(false)}
                className="text-xs text-zinc-400"
              >
                X
              </button>
            </div>
          ) : (
            <p
              className="cursor-pointer text-2xl font-bold text-emerald-700 hover:text-emerald-500"
              onClick={() => setPrecoEditando(true)}
            >
              {prato?.preco_venda
                ? `R$ ${Number(prato.preco_venda).toFixed(2)}`
                : "—"}
            </p>
          )}
        </div>
      </div>

      {/* Alerta de prejuízo */}
      {estaNoPrejuizo && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">
            Esse prato está no PREJUÍZO! O custo (R$ {custoTotal.toFixed(2)}) é
            maior que o preço de venda (R${" "}
            {Number(prato.preco_venda).toFixed(2)}).
          </span>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Custo Total</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            R$ {custoTotal.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <BadgePercent size={16} className="text-zinc-400" />
            <p className="text-sm text-zinc-500">Margem</p>
          </div>
          <p
            className={`mt-1 text-2xl font-bold ${
              prato?.preco_venda
                ? margemAtual >= 40
                  ? "text-emerald-600"
                  : margemAtual > 0
                  ? "text-amber-600"
                  : "text-red-600"
                : "text-zinc-400"
            }`}
          >
            {prato?.preco_venda ? `${margemAtual.toFixed(1)}%` : "—"}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingDown size={16} className="text-zinc-400" />
            <p className="text-sm text-zinc-500">CMV</p>
          </div>
          <p
            className={`mt-1 text-2xl font-bold ${
              prato?.preco_venda
                ? cmvAtual <= 35
                  ? "text-emerald-600"
                  : cmvAtual <= 45
                  ? "text-amber-600"
                  : "text-red-600"
                : "text-zinc-400"
            }`}
          >
            {prato?.preco_venda ? `${cmvAtual.toFixed(1)}%` : "—"}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-zinc-400" />
            <p className="text-sm text-zinc-500">Lucro por prato</p>
          </div>
          <p
            className={`mt-1 text-2xl font-bold ${
              prato?.preco_venda
                ? Number(prato.preco_venda) - custoTotal > 0
                  ? "text-emerald-600"
                  : "text-red-600"
                : "text-zinc-400"
            }`}
          >
            {prato?.preco_venda
              ? `R$ ${(Number(prato.preco_venda) - custoTotal).toFixed(2)}`
              : "—"}
          </p>
        </div>
      </div>

      {/* Seção de Sugestão Inteligente de Preço */}
      {ficha.length > 0 && (
        <div className="mb-6 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Calculator size={20} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-emerald-900">
              Sugestão Inteligente de Preço
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {cenarios.map((c) => {
              const p = c.preco;
              const l = c.lucro;
              const ativo =
                prato?.preco_venda &&
                Math.abs(Number(prato.preco_venda) - p) < 0.01;

              return (
                <div
                  key={c.margem}
                  className={`relative rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                    ativo ? "border-emerald-500 ring-2 ring-emerald-200" : ""
                  }`}
                >
                  {ativo && (
                    <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">
                      Atual
                    </span>
                  )}

                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-500">
                      {c.label}
                    </span>
                    <span className={`font-bold text-lg ${c.cor}`}>
                      {c.margem}%
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-zinc-800">
                    R$ {p.toFixed(2)}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-emerald-600">
                      Lucro: R$ {l.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1">
                    CMV: {((custoTotal / p) * 100).toFixed(1)}%
                  </p>

                  <button
                    onClick={() => aplicarPreco(p)}
                    className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                  >
                    {ativo ? "Manter" : "Aplicar"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Análise de impacto dos ingredientes */}
          <div className="mt-4 rounded-lg border bg-white p-4">
            <p className="mb-2 text-sm font-medium text-zinc-700">
              {topCustos.length > 0
                ? "Ingredientes de maior impacto no custo:"
                : "Adicione ingredientes para ver a análise de custo"}
            </p>
            {topCustos.length > 0 && (
              <div className="space-y-2">
                {topCustos.map((item) => {
                  const percentual =
                    custoTotal > 0
                      ? (Number(item.custo_total) / custoTotal) * 100
                      : 0;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="w-32 truncate text-sm text-zinc-600">
                        {item.insumos?.nome}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-zinc-100">
                        <div
                          className="h-2 rounded-full bg-amber-400"
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs text-zinc-500">
                        {percentual.toFixed(0)}%
                      </span>
                      <span className="w-16 text-right text-xs text-zinc-600">
                        R$ {Number(item.custo_total).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
              <th className="p-4 font-medium">% Custo</th>
              <th className="p-4 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {ficha.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-400">
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
                  <span className="text-zinc-600">
                    {custoTotal > 0
                      ? `${(
                          (Number(f.custo_total) / custoTotal) *
                          100
                        ).toFixed(1)}%`
                      : "—"}
                  </span>
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
    </div>
  );
}
