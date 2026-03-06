"use client";

import Link from "next/link";
import { useLeague } from "@/lib/use-league";
import { PlayerList } from "./PlayerList";

export function PlayersPageContent() {
  const { league } = useLeague();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Jugadores</h1>
      </div>

      {/* Clasificación de la liga */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
        <h2 className="mb-2 text-base font-semibold text-slate-200">
          Clasificación {league ? `· ${league.name}` : "de la liga"}
        </h2>
        <p className="mb-3 text-sm text-slate-500">
          {league
            ? `Ver la tabla acumulada (individual 85%, 100% y duplas) de todas las fechas de ${league.name}.`
            : "Elegí la liga en la página Liga para ver su clasificación."}
        </p>
        <Link
          href="/liga/clasificacion"
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Ver clasificación →
        </Link>
      </section>

      {/* Lista de jugadores */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-200">
          Lista de jugadores
        </h2>
        <PlayerList />
      </section>
    </div>
  );
}
