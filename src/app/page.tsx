import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-margify-950 to-margify-900">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-margify-500 font-bold text-white text-sm">
            M
          </div>
          <span className="text-xl font-bold text-white">MargiFy</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="rounded-lg bg-white/10 px-5 py-2 text-white backdrop-blur transition hover:bg-white/20"
          >
            Entrar
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg bg-margify-500 px-5 py-2 font-semibold text-white transition hover:bg-margify-400"
          >
            Começar Grátis
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 pt-24">
        <section className="text-center">
          <div className="mb-6 inline-block rounded-full border border-margify-700/50 bg-margify-800/40 px-4 py-1.5 text-sm text-margify-300 backdrop-blur">
            Inteligência que transforma sua margem
          </div>
          <h2 className="text-5xl font-bold leading-tight text-white">
            Controle total do seu
            <br />
            restaurante em um{" "}
            <span className="text-margify-400">só lugar</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Calcule CMV e margem dos seus pratos, controle estoque e receba
            alertas inteligentes — tudo com ajuda de IA.
          </p>
          <Link
            href="/auth/login"
            className="mt-8 inline-block rounded-lg bg-margify-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-margify-900/50 transition hover:bg-margify-400 hover:shadow-xl hover:shadow-margify-900/30"
          >
            Começar Grátis
          </Link>

          <p className="mt-4 text-sm text-zinc-500">Sem cartão de crédito</p>
        </section>

        <section className="mt-32 grid gap-8 md:grid-cols-3">
          {[
            {
              titulo: "Margem & CMV",
              desc: "Calcule o custo real de cada prato e saiba exatamente sua margem de lucro.",
              icone: "%",
            },
            {
              titulo: "Controle de Estoque",
              desc: "Gerencie entradas e saídas com alertas quando um insumo estiver acabando.",
              icone: "📦",
            },
            {
              titulo: "IA Inteligente",
              desc: "Sugestão de preços baseada em custo real e alertas automáticos de prejuízo.",
              icone: "🤖",
            },
          ].map((card) => (
            <div
              key={card.titulo}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur transition hover:border-margify-700/50 hover:bg-zinc-800/50"
            >
              <span className="text-2xl">{card.icone}</span>
              <h3 className="mt-4 text-xl font-bold text-white">
                {card.titulo}
              </h3>
              <p className="mt-3 text-zinc-400">{card.desc}</p>
            </div>
          ))}
        </section>

        {/* Features Section */}
        <section className="mt-32 text-center">
          <h2 className="text-3xl font-bold text-white">
            Tudo que voc&ecirc; precisa em um s&oacute; lugar
          </h2>
          <div className="mt-12 grid gap-6 text-left md:grid-cols-2">
            {[
              {
                titulo: "Ficha Técnica Inteligente",
                desc: "Monte seus pratos com ingredientes e veja o custo total na hora.",
              },
              {
                titulo: "3 Cenários de Preço",
                desc: "Sugestão automática de preço com margens de 30%, 40% e 55%.",
              },
              {
                titulo: "Dashboard com Gráficos",
                desc: "Acompanhe CMV, margem e distribuição de custos visualmente.",
              },
              {
                titulo: "Controle de Estoque",
                desc: "Entradas, saídas e alertas de estoque baixo em tempo real.",
              },
            ].map((f) => (
              <div
                key={f.titulo}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6"
              >
                <h3 className="font-semibold text-white">{f.titulo}</h3>
                <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-32 mb-20 rounded-3xl bg-gradient-to-r from-margify-600 to-margify-800 p-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            Pronto para transformar sua margem?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-margify-100">
            Comece grátis. Em 5 minutos você já está controlando os custos do
            seu restaurante.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-bold text-margify-800 transition hover:bg-zinc-100"
          >
            Começar Grátis
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-800 px-8 py-6 text-center text-sm text-zinc-500">
        MargiFy &copy; 2026 &mdash; Intelig&ecirc;ncia que transforma sua
        margem.
      </footer>
    </div>
  );
}
