"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Upload, Check, Loader2, Pencil, Trash2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

type ItemExtraido = {
  nome: string;
  quantidade: number;
  unidade: string;
  preco_total: number;
};

const UNIT_COMMON = ["kg", "g", "L", "mL", "un", "cx", "pct", "lata", "pac"];

export default function OcrPage() {
  const [textoBruto, setTextoBruto] = useState("");
  const [itens, setItens] = useState<ItemExtraido[]>([]);
  const [editandoItem, setEditandoItem] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [importando, setImportando] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  function parseTexto() {
    const linhas = textoBruto.split("\n").filter((l) => l.trim());
    const extraidos: ItemExtraido[] = [];

    for (const linha of linhas) {
      // Remove espaços extras, R$, etc
      let l = linha.trim().replace(/^[•\-*\d+.]+\s*/, "");

      // Padrão principal: "Nome 5kg 25,50" ou "Nome 5 kg 25.50"
      let match = l.match(
        /^(.+?)\s+(\d+[.,]?\d*)\s*(kg|g|l|L|ml|un|cx|pct|lata|pac)?\s*[R$]?\s*(\d+[.,]\d+)/i
      );
      if (match) {
        extraidos.push({
          nome: match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1),
          quantidade: parseFloat(match[2].replace(",", ".")) || 1,
          unidade: (match[3] || "un").toLowerCase(),
          preco_total: parseFloat(match[4].replace(",", ".")),
        });
        continue;
      }

      // Padrão 2: "Nome R$ 25,50" (sem qtd)
      match = l.match(/^(.+?)\s+[R$]?\s*(\d+[.,]\d+)\s*$/);
      if (match && match[1].length > 2) {
        extraidos.push({
          nome: match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1),
          quantidade: 1,
          unidade: "un",
          preco_total: parseFloat(match[2].replace(",", ".")),
        });
        continue;
      }

      // Padrão 3: Código + nome + qtd + un + preço (nota fiscal formato NF-e)
      // Ex: "001 ARROZ TIO JOÃO 5 KG 25,90"
      match = l.match(
        /^\d+\s+(.+?)\s+(\d+[.,]?\d*)\s*(kg|g|l|L|ml|un|cx|pct|lata|pac)\s+(\d+[.,]\d+)/i
      );
      if (match) {
        extraidos.push({
          nome: match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1),
          quantidade: parseFloat(match[2].replace(",", ".")) || 1,
          unidade: match[3].toLowerCase(),
          preco_total: parseFloat(match[4].replace(",", ".")),
        });
      }
    }

    if (extraidos.length > 0) {
      setItens(extraidos);
      setErro("");
    } else {
      setErro(
        "Não consegui extrair. Tente no formato: Nome 5kg 25.50 (um por linha)"
      );
    }
  }

  function adicionarItem() {
    setItens([...itens, { nome: "", quantidade: 1, unidade: "un", preco_total: 0 }]);
    setEditandoItem(itens.length);
  }

  function removerItem(index: number) {
    setItens(itens.filter((_, i) => i !== index));
    setEditandoItem(null);
  }

  function atualizarItem(
    index: number,
    campo: keyof ItemExtraido,
    valor: string | number
  ) {
    const novos = [...itens];
    (novos[index] as any)[campo] = valor;
    setItens(novos);
  }

  async function importarItens() {
    setImportando(true);
    const user = (await supabase.auth.getUser()).data.user;

    for (const item of itens) {
      if (!item.nome.trim()) continue;

      const nome = item.nome.trim();
      // Tentar encontrar insumo similar pelo nome
      const { data: existentes } = await supabase
        .from("insumos")
        .select("id, nome, quantidade_estoque")
        .ilike("nome", `%${nome.slice(0, 20)}%`)
        .limit(1);

      const existente = existentes?.[0];

      if (existente) {
        await supabase
          .from("insumos")
          .update({
            quantidade_estoque:
              Number(existente.quantidade_estoque) + item.quantidade,
          })
          .eq("id", existente.id);
      } else {
        const precoUnitario =
          item.quantidade > 0
            ? item.preco_total / item.quantidade
            : item.preco_total;
        await supabase.from("insumos").insert({
          nome: nome,
          unidade: item.unidade,
          preco_unitario: Math.round(precoUnitario * 100) / 100,
          quantidade_estoque: item.quantidade,
          user_id: user?.id,
        });
      }
    }

    setImportando(false);
    setItens([]);
    setTextoBruto("");
    router.push("/insumos");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-emerald-900">
        Importar Nota Fiscal
      </h1>
      <p className="mb-6 text-zinc-600">
        Cole os itens da nota ou digite manualmente. Depois importe direto para
        seus insumos.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Entrada de texto */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" />
            <h2 className="font-semibold text-zinc-800">
              1. Digitar itens
            </h2>
          </div>

          <p className="mb-2 text-sm text-zinc-500">
            Um item por linha no formato:{" "}
            <code className="rounded bg-zinc-100 px-1 text-xs">
              Nome quantidade unidade preço
            </code>
          </p>

          <textarea
            value={textoBruto}
            onChange={(e) => setTextoBruto(e.target.value)}
            className="mb-3 w-full rounded-lg border p-4 text-sm outline-none focus:border-emerald-500"
            rows={8}
            placeholder={
              "Arroz 5kg 25.90\nFeijão 1kg 8.90\nTomate 2kg 12.00\nCarne Moída 3kg 59.70\nÓleo 900ml 7.50"
            }
          />

          <button
            onClick={parseTexto}
            disabled={!textoBruto.trim()}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-40"
          >
            Extrair Itens
          </button>

          <div className="mt-4 rounded-lg border bg-zinc-50 p-3 text-xs text-zinc-500">
            <p className="font-medium text-zinc-700">Formatos aceitos:</p>
            <code className="block mt-1">Tomate 2kg 12.00</code>
            <code className="block">Arroz 5 kg 25,90</code>
            <code className="block">Carne Moída R$ 59.70</code>
            <code className="block">
              001 ARROZ TIO JOÃO 5 KG 25,90
            </code>
          </div>
        </div>

        {/* Resultados */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-800">
              2. Itens extraídos
            </h2>
            <button
              onClick={adicionarItem}
              className="text-sm text-emerald-600 hover:text-emerald-500"
            >
              + Adicionar manual
            </button>
          </div>

          {itens.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
              <Upload size={36} />
              <p className="mt-2 text-sm">
                Digite os itens ao lado e clique em Extrair
              </p>
            </div>
          )}

          {itens.length > 0 && (
            <>
              <div className="mb-3 flex items-center gap-2 text-sm text-emerald-600">
                <Check size={16} />
                <span>{itens.length} item(ns)</span>
                <span className="text-zinc-400">
                  — R$ {itens.reduce((acc, i) => acc + i.preco_total, 0).toFixed(2)}
                </span>
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto">
                {itens.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-zinc-50 p-3 text-sm"
                  >
                    {editandoItem === i ? (
                      <div className="space-y-2">
                        <input
                          value={item.nome}
                          onChange={(e) =>
                            atualizarItem(i, "nome", e.target.value)
                          }
                          className="w-full rounded border px-2 py-1 text-sm"
                          placeholder="Nome"
                        />
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1">
                            <input
                              value={item.quantidade}
                              type="number"
                              step="0.01"
                              onChange={(e) =>
                                atualizarItem(
                                  i,
                                  "quantidade",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full rounded border px-2 py-1 text-xs"
                            />
                          </div>
                          <select
                            value={item.unidade}
                            onChange={(e) =>
                              atualizarItem(i, "unidade", e.target.value)
                            }
                            className="rounded border px-1 py-1 text-xs"
                          >
                            {UNIT_COMMON.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                          <div className="col-span-2">
                            <input
                              value={item.preco_total}
                              type="number"
                              step="0.01"
                              onChange={(e) =>
                                atualizarItem(
                                  i,
                                  "preco_total",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full rounded border px-2 py-1 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditandoItem(null)}
                            className="rounded bg-emerald-600 px-3 py-1 text-xs text-white"
                          >
                            Pronto
                          </button>
                          <button
                            onClick={() => removerItem(i)}
                            className="rounded border border-red-200 px-3 py-1 text-xs text-red-600"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex cursor-pointer items-center justify-between"
                        onClick={() => setEditandoItem(i)}
                      >
                        <div>
                          <p className="font-medium text-zinc-800">
                            {item.nome || "(sem nome)"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {item.quantidade} {item.unidade} — R${" "}
                            {item.preco_total.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Pencil size={14} className="text-zinc-300" />
                          <Trash2
                            size={14}
                            className="text-zinc-300 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              removerItem(i);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={importarItens}
                disabled={importando || itens.every((i) => !i.nome.trim())}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {importando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Importar {itens.length} item(ns) para Insumos
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
