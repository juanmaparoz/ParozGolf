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

export function TournamentListSection() {
  const { tournaments } = useTournaments();
  const { courses } = useCourses();

  function getCourseName(courseId: string): string {
    return courses.find((c) => c.id === courseId)?.name ?? "—";
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-700/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-200">
          Lista de torneos
        </h2>
        <Link
          href="/tournaments"
          className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
        >
          Ver todos →
        </Link>
      </div>
      <div className="overflow-x-auto">
        {tournaments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Aún no hay torneos. Crea el primero.
          </div>
        ) : (
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Nombre
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell">
                  Fecha
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 md:table-cell">
                  Campo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Jugadores
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {tournaments.map((t) => (
                <tr
                  key={t.id}
                  className="bg-slate-800/30 transition hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/tournaments/${t.id}`}
                      className="font-medium text-slate-100 hover:underline"
                    >
                      {t.name}
                    </Link>
                    {t.status === "in_progress" && (
                      <Link
                        href={`/tournaments/${t.id}/live`}
                        className="ml-2 inline-block rounded bg-emerald-600/80 px-2 py-0.5 text-xs font-medium text-white hover:bg-emerald-500"
                      >
                        En vivo
                      </Link>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">
                    {t.date}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                    {getCourseName(t.courseId)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.status === "in_progress"
                          ? "bg-emerald-900/50 text-emerald-300"
                          : t.status === "finished"
                            ? "bg-slate-700 text-slate-400"
                            : t.status === "ready"
                              ? "bg-sky-900/50 text-sky-300"
                              : "bg-amber-900/50 text-amber-300"
                      }`}
                    >
                      {statusLabel[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {t.players.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
