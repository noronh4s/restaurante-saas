"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState("30");
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    totalGasto: 0,
    totalMovimentacoes: 0,
    totalInsumos: 0,
    gastoPorDia: [] as { dia: string; valor: number }[],
    gastoPorInsumo: [] as { nome: string; valor: number }[],
    entradas: 0,
    saidas: 0,
    mediaDiaria: 0,
    estimativaMensal: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      const dias = parseInt(periodo);
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - dias);

      // Buscar movimentações do período
      const { data: movs } = await supabase
        .from("movimentacoes_estoque")
        .select("*, insumos(nome)")
        .gte("created_at", dataLimite.toISOString())
        .order("created_at", { ascending: false });

      // Buscar total de insumos
      const { count: totalIns } = await supabase
        .from("insumos")
        .select("*", { count: "exact", head: true });

      let totalGasto = 0;
      let entradas = 0;
      let saidas = 0;
      const gastoPorDiaMap: Record<string, number> = {};
      const gastoPorInsumoMap: Record<string, number> = {};

      movs?.forEach((m) => {
        // Para entradas, estimamos gasto baseado nos insumos
        if (m.tipo === "entrada") {
          entradas++;
          const dia = new Date(m.created_at).toLocaleDateString("pt-BR");
          gastoPorDiaMap[dia] = (gastoPorDiaMap[dia] || 0) + 0; // valor estimado
        } else {
          saidas++;
        }
        totalGasto += 0; // será preenchido com dados reais
      });

      // Buscar insumos com preços para estimar gasto real
      const { data: insumos } = await supabase
        .from("insumos")
        .select("nome, preco_unitario");

      // Para cada movimentação de entrada, estimar gasto
      for (const mov of movs || []) {
        if (mov.tipo !== "entrada") continue;
        const insumo = insumos?.find((i) => i.nome === mov.insumos?.nome);
        if (insumo && mov.quantidade) {
          const gasto = Number(insumo.preco_unitario) * Number(mov.quantidade);
          totalGasto += gasto;

          const dia = new Date(mov.created_at).toLocaleDateString("pt-BR");
          gastoPorDiaMap[dia] = (gastoPorDiaMap[dia] || 0) + gasto;

          const nome = mov.insumos?.nome || "Desconhecido";
          gastoPorInsumoMap[nome] = (gastoPorInsumoMap[nome] || 0) + gasto;
        }
      }

      // Ordenar gasto por dia
      const gastoPorDia = Object.entries(gastoPorDiaMap)
        .map(([dia, valor]) => ({ dia, valor: Math.round(valor * 100) / 100 }))
        .sort((a, b) => a.dia.localeCompare(b.dia));

      // Top insumos por gasto
      const gastoPorInsumo = Object.entries(gastoPorInsumoMap)
        .map(([nome, valor]) => ({
          nome: nome.length > 16 ? nome.slice(0, 16) + "..." : nome,
          valor: Math.round(valor * 100) / 100,
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 8);

      const mediaDiaria = dias > 0 ? totalGasto / dias : 0;

      setDados({
        totalGasto: Math.round(totalGasto * 100) / 100,
        totalMovimentacoes: movs?.length || 0,
        totalInsumos: totalIns || 0,
        gastoPorDia,
        gastoPorInsumo,
        entradas,
        saidas,
        mediaDiaria: Math.round(mediaDiaria * 100) / 100,
        estimativaMensal: Math.round(mediaDiaria * 30 * 100) / 100,
      });

      setLoading(false);
    }
    carregar();
  }, [periodo]);

  const periodos = [
    { value: "7", label: "7 dias" },
    { value: "15", label: "15 dias" },
    { value: "30", label: "30 dias" },
    { value: "90", label: "90 dias" },
  ];

  return (
    <div>
      {/* Cabeçalho com filtro */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Relatórios</h1>
          <p className="text-sm text-zinc-500">
            Análise de gastos com insumos
          </p>
        </div>
        <div className="flex gap-2">
          {periodos.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                periodo === p.value
                  ? "bg-emerald-600 text-white"
                  : "border bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          Carregando...
        </div>
      ) : (
        <>
          {/* Cards do período */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Total Gasto</p>
                <div className="rounded-lg bg-red-100 p-2 text-red-600">
                  <DollarSign size={18} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-800">
                R$ {dados.totalGasto.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                nos últimos {periodo} dias
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Movimentações</p>
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <BarChart3 size={18} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-800">
                {dados.totalMovimentacoes}
              </p>
              <div className="mt-1 flex gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-600">
                  <ArrowUp size={12} /> {dados.entradas} entradas
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <ArrowDown size={12} /> {dados.saidas} saídas
                </span>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Média Diária</p>
                <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                  <TrendingUp size={18} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-800">
                R$ {dados.mediaDiaria.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">gasto por dia</p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Estimativa Mensal</p>
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                  <TrendingDown size={18} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-zinc-800">
                R$ {dados.estimativaMensal.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                projeção para 30 dias
              </p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            {/* Gasto por dia */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-zinc-800">
                Gasto por Dia
              </h2>
              {dados.gastoPorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dados.gastoPorDia}>
                    <XAxis
                      dataKey="dia"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickFormatter={(v) => `R$${v}`}
                    />
                    <Tooltip
                      formatter={(value: unknown) =>
                        `R$ ${Number(value).toFixed(2)}`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-10 text-center text-sm text-zinc-400">
                  Registre movimentações no estoque para ver o gráfico.
                </p>
              )}
            </div>

            {/* Top insumos por gasto */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-zinc-800">
                Insumos com Maior Gasto
              </h2>
              {dados.gastoPorInsumo.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={dados.gastoPorInsumo}
                    layout="vertical"
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickFormatter={(v) => `R$${v}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="nome"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip
                      formatter={(value: unknown) =>
                        `R$ ${Number(value).toFixed(2)}`
                      }
                    />
                    <Bar
                      dataKey="valor"
                      fill="#f59e0b"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-10 text-center text-sm text-zinc-400">
                  Faça entradas no estoque para ver os dados.
                </p>
              )}
            </div>
          </div>

          {/* Tabela de movimentações recentes */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b p-4">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-zinc-400" />
                <h2 className="font-semibold text-zinc-800">
                  Resumo do Período
                </h2>
              </div>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700 font-medium">
                  Total de entradas
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {dados.entradas}
                </p>
                <p className="text-xs text-emerald-500">
                  compras/entradas registradas
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm text-red-700 font-medium">
                  Total de saídas
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {dados.saidas}
                </p>
                <p className="text-xs text-red-500">
                  consumos/saídas registradas
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-700 font-medium">
                  Insumos cadastrados
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {dados.totalInsumos}
                </p>
                <p className="text-xs text-blue-500">
                  total de itens no sistema
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4">
                <p className="text-sm text-amber-700 font-medium">
                  Gasto total estimado
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  R$ {dados.totalGasto.toFixed(2)}
                </p>
                <p className="text-xs text-amber-500">
                  nos últimos {periodo} dias
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
