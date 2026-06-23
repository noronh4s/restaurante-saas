import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { erro: "Nenhuma imagem enviada" },
        { status: 400 }
      );
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          erro:
            "Chave da API Anthropic não configurada. Adicione ANTHROPIC_API_KEY no .env.local",
        },
        { status: 500 }
      );
    }

    // Converter imagem para base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extraia os itens desta nota fiscal de compra de insumos para restaurante.

Para cada item, retorne:
- nome: nome do produto
- quantidade: quantidade comprada (apenas o número)
- unidade: unidade de medida (kg, g, L, mL, un, cx, pct, lata etc)
- preco_total: preço total pago pelo item (apenas o número)

Retorne APENAS um JSON válido com array 'itens', sem formatação markdown, sem \`\`\`, sem texto extra.
Exemplo: {"itens":[{"nome":"Tomate","quantidade":5,"unidade":"kg","preco_total":12.50}]}

Se não for uma nota fiscal ou não conseguir ler, retorne {"itens":[]}`,
                },
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mimeType,
                    data: base64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          erro: `Erro Anthropic API: ${response.status} - ${errText.slice(
            0,
            300
          )}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text =
      data?.content?.[0]?.text || "";

    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        erro: "Não foi possível extrair os itens",
        itens: [],
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ itens: parsed.itens || [] });
  } catch (error: any) {
    console.error("Erro OCR:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao processar OCR" },
      { status: 500 }
    );
  }
}
