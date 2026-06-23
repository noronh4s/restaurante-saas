"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  Warehouse,
  Scan,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/insumos", label: "Insumos", icon: Package },
  { href: "/pratos", label: "Pratos", icon: UtensilsCrossed },
  { href: "/estoque", label: "Estoque", icon: Warehouse },
  { href: "/ocr", label: "OCR Nota", icon: Scan },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-margify-950">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-margify-500 font-bold text-white">
            M
          </div>
          <div className="text-margify-400">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-margify-950 text-white transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-margify-500 font-bold text-white text-sm">
              M
            </div>
            <span className="text-lg font-bold">MargiFy</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-margify-300 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const ativo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                  ativo
                    ? "bg-margify-800 text-white font-medium"
                    : "text-zinc-400 hover:bg-margify-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-margify-800 px-3 py-4">
          <div className="mb-3 px-4 text-xs text-zinc-500 truncate">
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-margify-900 hover:text-white"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b bg-white px-6 py-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-600">
            <Menu size={22} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-margify-500 font-bold text-white text-xs">
              M
            </div>
            <span className="font-bold text-zinc-800">MargiFy</span>
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
