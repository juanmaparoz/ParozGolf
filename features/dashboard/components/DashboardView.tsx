import { DashboardStatsCards } from "./DashboardStatsCards";
import { DashboardActions } from "./DashboardActions";
import { LigaSection } from "./LigaSection";

export function DashboardView() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Resumen y acceso rápido
          </p>
        </div>
        <DashboardActions />
      </header>

      <section>
        <h2 className="sr-only">Estadísticas</h2>
        <DashboardStatsCards />
      </section>

      <section>
        <LigaSection />
      </section>
    </div>
  );
}
