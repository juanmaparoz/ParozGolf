"use client";

import Link from "next/link";
import { useLeague } from "@/lib/use-league";
import { useFechas } from "@/lib/use-fechas";
import { formatDateDDMMYYYY } from "@/lib/date-utils";

export default function LivePage() {
  const { league } = useLeague();
  const { fechas } = useFechas(league?.id ?? null);

  if (!league) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">En vivo</h1>
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (fechas.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">En vivo</h1>
        <p className="text-slate-500">
          No hay fechas en la liga. Crea o duplica una fecha para cargar golpes.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/liga"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Ir a Liga
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100"
          >
            ← Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">En vivo</h1>
      <p className="text-slate-500">Elige una fecha para cargar golpes:</p>
      <ul className="space-y-2">
        {[...fechas].reverse().map((f) => (
          <li key={f.id}>
            <Link
              href={`/liga/fecha/${f.id}/live`}
              className="block rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-100 hover:bg-slate-800"
            >
              {f.label ?? formatDateDDMMYYYY(f.date)} · {f.players.length} jugadores
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/liga"
        className="inline-block rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100"
      >
        ← Liga
      </Link>
    </div>
  );
}
