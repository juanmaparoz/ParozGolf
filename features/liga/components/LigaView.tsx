"use client";

import Link from "next/link";
import { useLeague } from "@/lib/use-league";
import { useFechas } from "@/lib/use-fechas";
import { useCourses } from "@/lib/use-courses";
import { formatDateDDMMYYYY, formatFechaLabel } from "@/lib/date-utils";

export function LigaView() {
  const { league, leagues, setActiveLeagueId, activeLeagueId } = useLeague();
  const { courses } = useCourses();
  const { fechas } = useFechas(league?.id ?? null);

  const courseName = league ? courses.find((c) => c.id === league.courseId)?.name : "—";

  if (!league) {
    return (
      <div className="space-y-4">
        <p className="text-slate-500">Cargando liga...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            {league.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{courseName}</p>
          <p className="mt-0.5 text-xs text-slate-600">
            85% · 100% · Match interno
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {leagues.length >= 1 && (
            <>
              <label htmlFor="liga-select" className="text-sm text-slate-500">
                Liga:
              </label>
              <select
                id="liga-select"
                value={activeLeagueId ?? ""}
                onChange={(e) => setActiveLeagueId(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200"
              >
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <Link
            href="/liga/nueva"
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            Crear liga
          </Link>
          <Link
            href="/liga/fecha/nueva"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Nueva fecha
          </Link>
          <Link
            href="/liga/fecha/duplicar"
            className={`rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ${fechas.length === 0 ? "pointer-events-none opacity-50" : ""}`}
          >
            Duplicar última fecha
          </Link>
          <Link
            href="/liga/clasificacion"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Clasificación
          </Link>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40">
        <div className="border-b border-slate-700/50 p-4">
          <h2 className="text-base font-semibold text-slate-200">Fechas / partidos</h2>
          <p className="text-sm text-slate-500">
            Cada fecha acumula a la tabla de liderazgo. Duplicar copia los jugadores (no los puntajes).
          </p>
        </div>
        <div className="overflow-x-auto">
          {fechas.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Aún no hay fechas. Crea la primera o duplica cuando tengas una.
            </div>
          ) : (
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Día
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Jugadores
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {[...fechas].reverse().map((f) => (
                  <tr key={f.id} className="bg-slate-800/30 hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-100">{formatDateDDMMYYYY(f.date)}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {f.label ?? formatFechaLabel(f.date)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{f.players.length}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/liga/fecha/${f.id}/live`}
                        className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                      >
                        En vivo / Cargar golpes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
