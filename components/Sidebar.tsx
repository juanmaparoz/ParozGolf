"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/liga", label: "Liga" },
  { href: "/live", label: "En vivo" },
  { href: "/courses", label: "Campos" },
  { href: "/players", label: "Jugadores" },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-slate-700 text-slate-100"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Desktop: sidebar siempre visible */}
      <aside className="hidden min-h-full w-48 shrink-0 flex-col border-r border-dark-border bg-dark-surface md:flex sm:w-56">
        <SidebarNav />
      </aside>

      {/* Mobile: backdrop cuando está abierto */}
      <button
        type="button"
        aria-hidden={!isOpen}
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="Cerrar menú"
      />

      {/* Mobile: drawer */}
      <aside
        className={`fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-dark-border bg-dark-surface shadow-xl transition-transform duration-200 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-dark-border p-3">
          <span className="text-sm font-medium text-slate-400">Menú</span>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Cerrar menú"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SidebarNav onNavigate={close} />
      </aside>
    </>
  );
}
