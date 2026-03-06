"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useSidebar } from "@/components/SidebarContext";

const SIDEBAR_ROUTES = ["/dashboard", "/tournaments", "/live", "/courses", "/players", "/liga"] as const;

function isSidebarRoute(pathname: string): boolean {
  return SIDEBAR_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { toggle } = useSidebar();
  const isLoginPage = pathname === "/login";
  const showHamburger = isAuthenticated && isSidebarRoute(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-dark-border bg-dark-surface px-4 py-4 sm:px-6">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {showHamburger && (
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 md:hidden"
              aria-label="Abrir menú"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link href="/" className="truncate text-xl font-semibold text-slate-100">
            Paroz Golf
          </Link>
        </div>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="text-sm text-slate-400 transition hover:text-slate-200"
            >
              Cerrar sesión
            </button>
          ) : !isLoginPage ? (
            <Link
              href="/login"
              className="text-sm text-slate-400 transition hover:text-slate-200"
            >
              Iniciar sesión
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
