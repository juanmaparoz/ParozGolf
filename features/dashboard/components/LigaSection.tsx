"use client";

import Link from "next/link";
import { useLeague } from "@/lib/use-league";
import { useFechas } from "@/lib/use-fechas";
import { useCourses } from "@/lib/use-courses";
import { formatDateDDMMYYYY } from "@/lib/date-utils";

export function LigaSection() {
  const { league } = useLeague();
  const { fechas } = useFechas(league?.id ?? null);
  const { courses } = useCourses();
  const courseName = league ? courses.find((c) => c.id === league.courseId)?.name : null;

  if (!league) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Liga
        </h2>
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-700/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-200">{league.name}</h2>
          <p className="text-sm text-slate-500">{courseName ?? "—"}</p>
        </div>
        <Link
          href="/liga"
          className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
        >
          Ver liga →
        </Link>
      </div>
      <div className="p-4">
        {fechas.length === 0 ? (
          <p className="text-slate-500">Aún no hay fechas. Crea o duplica una desde Liga.</p>
        ) : (
          <div className="space-y-2">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Fechas recientes
            </p>
            {[...fechas].reverse().slice(0, 5).map((f) => (
              <Link
                key={f.id}
                href={`/liga/fecha/${f.id}/live`}
                className="block rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-2 text-slate-200 hover:bg-slate-800/50"
              >
                {f.label ?? formatDateDDMMYYYY(f.date)} · {f.players.length} jugadores
              </Link>
            ))}
            {fechas.length > 5 && (
              <Link href="/liga" className="block pt-1 text-sm text-slate-500 hover:text-slate-300">
                Ver todas →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
