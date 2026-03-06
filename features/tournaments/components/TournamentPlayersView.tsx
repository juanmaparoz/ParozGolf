"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { mockPlayers } from "@/mocks/mockPlayers";

function hcp85(handicap: number): number {
  return Math.round(handicap * 0.85);
}

export function TournamentPlayersView({
  tournamentId,
  tournamentName,
}: {
  tournamentId: string;
  tournamentName?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(mockPlayers.map((p) => p.id)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  const selectedPlayers = useMemo(
    () => mockPlayers.filter((p) => selectedIds.has(p.id)),
    [selectedIds]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Jugadores del torneo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {tournamentName || `Torneo #${tournamentId}`} · Selección en estado local (no se guarda)
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/tournaments"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            ← Torneos
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-200">
            Lista de jugadores (mock)
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-600"
            >
              Seleccionar todos
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800"
            >
              Quitar todos
            </button>
          </div>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {mockPlayers.map((player) => (
            <li key={player.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-2 transition hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={selectedIds.has(player.id)}
                  onChange={() => togglePlayer(player.id)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-slate-600 focus:ring-slate-500"
                />
                <span className="font-medium text-slate-200">{player.name}</span>
                <span className="text-sm text-slate-500">
                  Hcp {player.handicap}
                  {player.club ? ` · ${player.club}` : ""}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
        <h2 className="border-b border-slate-700/50 bg-slate-900/50 px-4 py-3 text-base font-semibold text-slate-200">
          Jugadores seleccionados · Handicaps calculados
        </h2>
        {selectedPlayers.length === 0 ? (
          <p className="p-6 text-center text-slate-500">
            Selecciona jugadores arriba para ver la tabla.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Jugador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Hcp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    85%
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    100%
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {selectedPlayers.map((player) => (
                  <tr key={player.id} className="bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-100">
                      {player.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {player.handicap}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {hcp85(player.handicap)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {player.handicap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
