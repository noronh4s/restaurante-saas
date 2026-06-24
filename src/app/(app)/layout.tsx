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
  ChevronLeft,
  Settings,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/insumos",
    label: "Insumos",
    icon: Package,
  },
  {
    href: "/pratos",
    label: "Pratos",
    icon: UtensilsCrossed,
  },
  {
    href: "/estoque",
    label: "Estoque",
    icon: Warehouse,
  },
  {
    href: "/ocr",
    label: "OCR Nota",
    icon: Scan,
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    icon: BarChart3,
  },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22c55e] font-bold text-black">
            M
          </div>
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-black/5 bg-white transition-all duration-300 md:static ${
          collapsed ? "w-[72px]" : "w-60"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-black/5 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#22c55e] font-bold text-xs text-black">
              M
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight text-neutral-900 whitespace-nowrap">
                MargiFy
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden rounded-md p-1 text-neutral-300 hover:text-neutral-600 md:block"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-md p-1 text-neutral-400 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const ativo =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    ativo
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-black/5 p-2.5">
          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-500">
              {user?.email?.[0]?.toUpperCase() || "?"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-neutral-700">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="truncate text-[11px] text-neutral-400">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title={collapsed ? "Sair" : undefined}
            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-red-500 ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <Menu size={20} />
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#22c55e] font-bold text-[10px] text-black">
              M
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900">
              MargiFy
            </span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}