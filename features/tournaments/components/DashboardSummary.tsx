import { mockTournaments } from "@/mocks/mockTournament";
import { mockPlayers } from "@/mocks/mockPlayers";
import { mockCourses } from "@/mocks/mockCourse";

export function DashboardSummary() {
  const activeTournaments = mockTournaments.filter(
    (t) => t.status === "in_progress" || t.status === "ready"
  );
  const totalPlayers = mockPlayers.length;
  const totalCourses = mockCourses.length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border border-dark-border bg-dark-surface p-4">
        <p className="text-sm text-slate-400">Torneos activos</p>
        <p className="text-2xl font-bold text-slate-100">
          {activeTournaments.length}
        </p>
      </div>
      <div className="rounded-lg border border-dark-border bg-dark-surface p-4">
        <p className="text-sm text-slate-400">Jugadores</p>
        <p className="text-2xl font-bold text-slate-100">{totalPlayers}</p>
      </div>
      <div className="rounded-lg border border-dark-border bg-dark-surface p-4">
        <p className="text-sm text-slate-400">Campos</p>
        <p className="text-2xl font-bold text-slate-100">{totalCourses}</p>
      </div>
    </div>
  );
}
