"use client";

import Link from "next/link";
import { useTournaments } from "@/lib/use-tournaments";
import { useCourses } from "@/lib/use-courses";
import type { TournamentStatus } from "@/types/tournament";

export function TournamentList() {
  const { tournaments } = useTournaments();
  const { courses } = useCourses();

  function getCourseName(courseId: string): string {
    return courses.find((c) => c.id === courseId)?.name ?? "—";
  }

  function statusLabel(status: TournamentStatus): string {
    const labels: Record<TournamentStatus, string> = {
    draft: "Borrador",
    ready: "Listo",
    in_progress: "En curso",
    finished: "Finalizado",
  };
    return labels[status];
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-dark-border">
      <table className="w-full min-w-[400px]">
        <thead className="bg-dark-surface">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
              Campo
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
              Jugadores
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {tournaments.map((t) => (
            <tr key={t.id} className="bg-dark-bg">
              <td className="px-4 py-3">
                <Link
                  href={`/tournaments/${t.id}`}
                  className="font-medium text-slate-100 hover:underline"
                >
                  {t.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-300">{t.date}</td>
              <td className="px-4 py-3 text-slate-300">
                {getCourseName(t.courseId)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.status === "in_progress"
                      ? "bg-green-900/50 text-green-300"
                      : t.status === "finished"
                        ? "bg-slate-700 text-slate-300"
                        : t.status === "ready"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-amber-900/50 text-amber-300"
                  }`}
                >
                  {statusLabel(t.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300">{t.players.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
