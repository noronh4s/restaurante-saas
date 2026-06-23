import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950">
      <header className="flex items-center justify-between px-8 py-5">
        <h1 className="text-2xl font-bold text-white">RestaurantPro</h1>
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="rounded-lg bg-white/10 px-5 py-2 text-white backdrop-blur transition hover:bg-white/20"
          >
            Entrar
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-white transition hover:bg-emerald-400"
          >
            Começar Grátis
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 pt-20">
        <section className="text-center">
          <h2 className="text-5xl font-bold leading-tight text-white">
            Controle total do seu
            <br />
            restaurante em um só lugar
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-100">
            Calcule margem e CMV dos seus pratos, controle o estoque e receba
            alertas inteligentes — tudo com ajuda de IA.
          </p>
          <Link
            href="/auth/login"
            className="mt-8 inline-block rounded-lg bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-900/50 transition hover:bg-emerald-400"
          >
            Começar Grátis
          </Link>
        </section>

        <section className="mt-32 grid gap-8 md:grid-cols-3">
          {[
            {
              titulo: "Margem & CMV",
              desc: "Calcule o custo real de cada prato e saiba exatamente sua margem de lucro.",
            },
            {
              titulo: "Controle de Estoque",
              desc: "Gerencie entradas e saídas com alertas quando um insumo estiver acabando.",
            },
            {
              titulo: "IA Inteligente",
              desc: "OCR para notas fiscais e sugestão de preços com base nos seus custos.",
            },
          ].map((card) => (
            <div
              key={card.titulo}
              className="rounded-2xl border border-emerald-700/50 bg-emerald-800/40 p-8 backdrop-blur"
            >
              <h3 className="text-xl font-bold text-white">{card.titulo}</h3>
              <p className="mt-3 text-emerald-200">{card.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mt-32 border-t border-emerald-800/50 px-8 py-6 text-center text-sm text-emerald-400">
        RestaurantPro &copy; 2026 &mdash; Gest&atilde;o Inteligente para
        Restaurantes
      </footer>
    </div>
  );
}
