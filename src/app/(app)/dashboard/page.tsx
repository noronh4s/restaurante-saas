"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PratoCMV = {
  nome: string;
  custo: number;
  preco: number;
  cmv: number;
  margem: number;
};

const CORES_PIE = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

export default function DashboardPage() {
  const [resumo, setResumo] = useState({
    totalPratos: 0,
    totalInsumos: 0,
    cmvMedio: 0,
    margemMedia: 0,
  });
  const [pratosCMV, setPratosCMV] = useState<PratoCMV[]>([]);
  const [insumosBaixo, setInsumosBaixo] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function carregar() {
      const { count: insumos } = await supabase
        .from("insumos")
        .select("*", { count: "exact", head: true });

      const { count: pratos } = await supabase
        .from("pratos")
        .select("*", { count: "exact", head: true });

      // Insumos com estoque baixo (<= 5 unidades)
      const { data: ins } = await supabase
        .from("insumos")
        .select("id")
        .lte("quantidade_estoque", 5);
      setInsumosBaixo(ins?.length || 0);

      // Buscar pratos com fichas técnicas
      const { data: p } = await supabase.from("pratos").select("id, nome, preco_venda");
      const pratosComCMV: PratoCMV[] = [];

      if (p) {
        for (const prato of p) {
          const { data: fichas } = await supabase
            .from("fichas_tecnicas")
            .select("custo_total")
            .eq("prato_id", prato.id);

          const custoTotal =
            fichas?.reduce((acc, f) => acc + Number(f.custo_total), 0) || 0;

          pratosComCMV.push({
            nome: prato.nome,
            custo: custoTotal,
            preco: Number(prato.preco_venda) || 0,
            cmv: prato.preco_venda
              ? (custoTotal / Number(prato.preco_venda)) * 100
              : 0,
            margem: prato.preco_venda
              ? 100 - (custoTotal / Number(prato.preco_venda)) * 100
              : 0,
          });
        }
      }

      setPratosCMV(pratosComCMV);

      const comPreco = pratosComCMV.filter((p) => p.preco > 0);
      const cmvMedio =
        comPreco.length > 0
          ? comPreco.reduce((acc, p) => acc + p.cmv, 0) / comPreco.length
          : 0;

      setResumo({
        totalInsumos: insumos || 0,
        totalPratos: pratos || 0,
        cmvMedio: Math.round(cmvMedio),
        margemMedia: Math.round(100 - cmvMedio),
      });
    }
    carregar();
  }, []);

  const cards = [
    {
      titulo: "Pratos",
      valor: resumo.totalPratos,
      icon: TrendingUp,
      cor: "bg-blue-500",
    },
    {
      titulo: "Insumos",
      valor: resumo.totalInsumos,
      icon: Package,
      cor: "bg-emerald-500",
    },
    {
      titulo: "CMV Médio",
      valor: `${resumo.cmvMedio}%`,
      icon: TrendingDown,
      cor: resumo.cmvMedio > 35 ? "bg-red-500" : resumo.cmvMedio > 25 ? "bg-amber-500" : "bg-emerald-500",
    },
    {
      titulo: "Margem Média",
      valor: `${resumo.margemMedia}%`,
      icon: DollarSign,
      cor: resumo.margemMedia > 40 ? "bg-emerald-500" : resumo.margemMedia > 20 ? "bg-amber-500" : "bg-red-500",
    },
  ];

  // Dados para gráfico de pizza (distribuição de custo por prato)
  const dataPizza = pratosCMV
    .filter((p) => p.custo > 0)
    .slice(0, 5)
    .map((p) => ({
      name: p.nome,
      value: Math.round(p.custo * 100) / 100,
    }));

  // Dados para gráfico de barras (CMV por prato)
  const dataBarras = pratosCMV
    .filter((p) => p.preco > 0)
    .map((p) => ({
      name: p.nome.length > 12 ? p.nome.slice(0, 12) + "..." : p.nome,
      cmv: Math.round(p.cmv),
      margem: Math.round(p.margem),
    }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-emerald-900">Dashboard</h1>

      {insumosBaixo > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">
            {insumosBaixo} insumo(s) com estoque baixo — veja em{" "}
            <a href="/estoque" className="underline">
              Estoque
            </a>
          </span>
        </div>
      )}

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.titulo}
              className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">{card.titulo}</p>
                <div className={`rounded-lg p-2 ${card.cor} text-white`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-zinc-800">
                {card.valor}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Pizza - Distribuição de Custo */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-zinc-800">
            Distribuição de Custo por Prato
          </h2>
          {dataPizza.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dataPizza}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) =>
                    `${name}: R$${value.toFixed(0)}`
                  }
                >
                  {dataPizza.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CORES_PIE[i % CORES_PIE.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => `R$ ${Number(value).toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-sm text-zinc-400">
              Adicione ingredientes &agrave;s fichas t&eacute;cnicas para ver o
              gr&aacute;fico.
            </p>
          )}
        </div>

        {/* Barras - CMV por Prato */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-zinc-800">
            CMV vs Margem por Prato
          </h2>
          {dataBarras.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dataBarras}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} unit="%" axisLine={false} />
                <Tooltip formatter={(value: unknown) => `${Number(value).toFixed(1)}%`} />
                <Bar
                  dataKey="cmv"
                  name="CMV %"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="margem"
                  name="Margem %"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-sm text-zinc-400">
              Defina o pre&ccedil;o de venda dos pratos para ver o
              gr&aacute;fico.
            </p>
          )}
        </div>
      </div>

      {/* Tabela de CMV por prato */}
      {pratosCMV.length > 0 && (
        <div className="mt-6 rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-zinc-800">
              Detalhamento por Prato
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-zinc-500">
                  <th className="p-4 font-medium">Prato</th>
                  <th className="p-4 font-medium">Custo Total</th>
                  <th className="p-4 font-medium">Preço Venda</th>
                  <th className="p-4 font-medium">CMV</th>
                  <th className="p-4 font-medium">Margem</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pratosCMV.map((p, i) => (
                  <tr
                    key={i}
                    className="border-b text-sm last:border-0"
                  >
                    <td className="p-4 font-medium text-zinc-800">{p.nome}</td>
                    <td className="p-4 text-zinc-800">
                      R$ {p.custo.toFixed(2)}
                    </td>
                    <td className="p-4 text-zinc-800">
                      {p.preco > 0
                        ? `R$ ${p.preco.toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          p.cmv <= 30
                            ? "text-emerald-600"
                            : p.cmv <= 40
                            ? "text-amber-600"
                            : "text-red-600"
                        }
                      >
                        {p.cmv > 0 ? `${p.cmv.toFixed(1)}%` : "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          p.margem >= 40
                            ? "text-emerald-600"
                            : p.margem >= 25
                            ? "text-amber-600"
                            : "text-red-600"
                        }
                      >
                        {p.margem > 0
                          ? `${p.margem.toFixed(1)}%`
                          : "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.preco > 0 && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.margem >= 40
                              ? "bg-emerald-100 text-emerald-700"
                              : p.margem >= 20
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.margem >= 40
                            ? "Saudável"
                            : p.margem >= 20
                            ? "Atenção"
                            : "Prejuízo"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bem vindo se não tiver dados */}
      {pratosCMV.length === 0 && (
        <div className="mt-8 rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-emerald-900">
            Bem-vindo ao RestaurantPro!
          </h2>
          <p className="text-zinc-600">
            Comece cadastrando seus <strong>insumos</strong>, depois crie as{" "}
            <strong>fichas t&eacute;cnicas</strong> dos seus pratos para
            calcular CMV e margem de lucro automaticamente.
          </p>
          <div className="mt-4 flex gap-3 text-sm text-zinc-500">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              1. Insumos
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              2. Fichas T&eacute;cnicas
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              3. Estoque
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
