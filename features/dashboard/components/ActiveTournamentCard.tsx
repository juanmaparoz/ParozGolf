"use client";

import Link from "next/link";
import { useTournaments } from "@/lib/use-tournaments";
import { useCourses } from "@/lib/use-courses";
import type { TournamentStatus } from "@/types/tournament";

const statusLabel: Record<TournamentStatus, string> = {
  draft: "Borrador",
  ready: "Listo",
  in_progress: "En curso",
  finished: "Finalizado",
};

export function ActiveTournamentCard() {
  const { tournaments } = useTournaments();
  const { courses } = useCourses();
  const active = tournaments.find(
    (t) => t.status === "in_progress" || t.status === "ready"
  );
  const courseName =
    active && courses.find((c) => c.id === active.courseId)?.name;

  if (!active) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Torneo activo
        </h2>
        <p className="text-slate-400">No hay torneo activo en este momento.</p>
        <p className="mt-1 text-sm text-slate-500">
          Crea un torneo o inicia uno existente desde la lista.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-800/50 bg-slate-800/50 p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Torneo activo
      </h2>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            {active.name}
          </h3>
          <p className="mt-0.5 text-sm text-slate-400">
            {active.date}
            {courseName && ` · ${courseName}`}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex rounded-full bg-emerald-900/50 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
              {statusLabel[active.status]}
            </span>
            <span className="text-sm text-slate-500">
              {active.players.length} jugadores
            </span>
          </div>
        </div>
        <Link
          href="/tournaments"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
        >
          Ver torneo
        </Link>
      </div>
    </div>
  );
}
