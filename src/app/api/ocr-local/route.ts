import { NextRequest, NextResponse } from "next/server";

// Fallback para notas que o OCR tradicional não consegue ler bem:
// Tenta extrair padrões comuns de notas fiscais brasileiras via regex nos dados brutos
function extrairItensDoTexto(texto: string) {
  const linhas = texto.split("\n").map((l) => l.trim()).filter((l) => l);
  const itens: { nome: string; quantidade: number; unidade: string; preco_total: number }[] = [];

  for (const linha of linhas) {
    // Ignorar linhas que não são itens
    if (
      /^(total|subtotal|troco|dinheiro|cartão|crédito|débito|cupom|nf|nota|data|hora|cnpj|ie|endereço)/i.test(
        linha
      )
    )
      continue;

    // Padrão 1: "NOME 5 KG 25,50" ou "NOME 5kg 25.50"
    let match = linha.match(
      /^(.+?)\s+(\d+[.,]?\d*)\s*(kg|g|l|L|ml|un|cx|pct|lata|pacote|kit)?\s*[R$]?\s*(\d+[.,]\d+)/i
    );
    if (match) {
      const nome = match[1].trim().replace(/\s+/g, " ");
      itens.push({
        nome: nome.length > 50 ? nome.slice(0, 50) : nome,
        quantidade: parseFloat(match[2].replace(",", ".")) || 1,
        unidade: (match[3] || "un").toLowerCase().replace(/^pacote$/, "pct").replace(/^kit$/, "cx"),
        preco_total: parseFloat(match[4].replace(",", ".")),
      });
      continue;
    }

    // Padrão 2: "NOME R$ 25,50" (sem quantidade, assume 1 un)
    match = linha.match(/^(.+?)\s+[R$]?\s*(\d+[.,]\d+)\s*$/);
    if (match && match[1].length > 2) {
      itens.push({
        nome: match[1].trim(),
        quantidade: 1,
        unidade: "un",
        preco_total: parseFloat(match[2].replace(",", ".")),
      });
    }
  }

  return itens;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ erro: "Nenhuma imagem enviada" }, { status: 400 });
    }

    // Converter a imagem para texto usando Tesseract.js no servidor
    let textoReconhecido = "";
    try {
      const Tesseract = await import("tesseract.js");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await Tesseract.recognize(buffer, "por", {
        logger: () => {}, // quiet mode
      });

      textoReconhecido = result.data.text || "";
    } catch (err) {
      console.error("Tesseract error:", err);
      return NextResponse.json({
        erro: "Erro no OCR da imagem",
        texto: "",
        itens: [],
      });
    }

    if (!textoReconhecido.trim()) {
      return NextResponse.json({
        erro: "Não foi possível ler texto na imagem",
        texto: "",
        itens: [],
      });
    }

    // Tentar extrair itens do texto
    const itens = extrairItensDoTexto(textoReconhecido);

    return NextResponse.json({
      itens,
      texto: textoReconhecido,
    });
  } catch (error: any) {
    console.error("Erro OCR local:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao processar OCR", itens: [] },
      { status: 500 }
    );
  }
}
