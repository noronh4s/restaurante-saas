import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Logo mark */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e] font-bold text-sm text-black transition-all duration-300 group-hover:scale-105">
              <span className="absolute inset-0 rounded-lg bg-[#22c55e] opacity-0 blur transition-opacity group-hover:opacity-30" />
              M
            </div>
            <span className="text-lg font-semibold tracking-tight">
              MargiFy
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-full px-5 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-all hover:bg-white/90 hover:scale-105"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#22c55e]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#22c55e]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          {/* Badge */}
          <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/50 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            Inteligência que transforma sua margem
          </div>

          {/* Headline */}
          <h1 className="animate-reveal animate-reveal-delay-1 text-balance text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Sua margem de lucro{" "}
            <span className="italic text-[#22c55e]">finalmente</span> sob
            controle
          </h1>

          {/* Subheadline */}
          <p className="animate-reveal animate-reveal-delay-2 mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/40">
            Calcule CMV, precifique pratos com inteligência e controle seu
            estoque — tudo em um só lugar.
          </p>

          {/* CTA */}
          <div className="animate-reveal animate-reveal-delay-3 mt-10 flex flex-col items-center gap-3">
            <Link
              href="/auth/login"
              className="group relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-medium text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]"
            >
              Começar gratuitamente
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <span className="text-xs text-white/25">
              Sem cartão de crédito. Acesso instantâneo.
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative border-t border-white/5 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo que você precisa
            </h2>
            <p className="mt-3 text-white/30">
              Ferramentas que realmente fazem diferença no seu dia a dia.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-3xl border border-white/5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Fichas Técnicas",
                description:
                  "Monte seus pratos, adicione ingredientes e veja o custo em tempo real.",
              },
              {
                number: "02",
                title: "Precificação IA",
                description:
                  "3 cenários de preço com margens de 30%, 40% e 55%. Sem achismo.",
              },
              {
                number: "03",
                title: "Controle de Estoque",
                description:
                  "Entradas, saídas e alertas automáticos de estoque baixo.",
              },
              {
                number: "04",
                title: "Dashboard & Relatórios",
                description:
                  "Gráficos de CMV, gastos por dia e impacto de cada insumo.",
              },
            ].map((f) => (
              <div
                key={f.number}
                className="card-hover flex flex-col gap-4 bg-white/[0.02] p-8"
              >
                <span className="text-xs font-medium text-white/15">
                  {f.number}
                </span>
                <h3 className="text-lg font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/30">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Em 3 minutos você está no controle
            </h2>
          </div>

          <div className="grid gap-12 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Cadastre seus insumos",
                description:
                  "Adicione os ingredientes que você compra — nome, preço e unidade. Ou cole sua nota fiscal de compra.",
              },
              {
                step: "2",
                title: "Monte seus pratos",
                description:
                  "Crie a ficha técnica de cada prato com os ingredientes. O custo é calculado automaticamente.",
              },
              {
                step: "3",
                title: "Controle a margem",
                description:
                  "Veja em tempo real o CMV e margem de cada prato no dashboard com gráficos e alertas.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-base font-medium">
                  {s.step}
                </div>
                <h3 className="mb-3 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-white/30">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/5 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] px-8 py-20 text-center ring-1 ring-white/5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#22c55e]/5 rounded-full blur-[100px]" />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Pronto para transformar sua margem?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-white/30">
                Comece agora. Sem burocracia, sem cartão de crédito.
              </p>
              <Link
                href="/auth/login"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-8 py-4 text-base font-medium text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]"
              >
                Começar gratuitamente →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-xs font-bold">
              M
            </div>
            <span className="text-sm font-medium text-white/20">MargiFy</span>
          </div>
          <span className="text-xs text-white/15">
            &copy; {new Date().getFullYear()} MargiFy. Todos os direitos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}