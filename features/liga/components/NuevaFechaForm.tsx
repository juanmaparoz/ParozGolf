"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockPlayers } from "@/mocks/mockPlayers";
import { useFechas } from "@/lib/use-fechas";
import { useLeague } from "@/lib/use-league";
import { todayISO, formatDateDDMMYYYY } from "@/lib/date-utils";

function adjusted85(h: number): number {
  return Math.round(h * 0.85);
}

export function NuevaFechaForm() {
  const router = useRouter();
  const { league } = useLeague();
  const { addFecha } = useFechas(league?.id ?? null);
  const [date, setDate] = useState(todayISO());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(mockPlayers.map((p) => p.id)));
  const clearAll = () => setSelectedIds(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!league) return;
    const players = mockPlayers
      .filter((p) => selectedIds.has(p.id))
      .map((p) => ({
        playerId: p.id,
        adjustedHandicap85: adjusted85(p.handicap),
        adjustedHandicap100: p.handicap,
      }));
    if (players.length === 0) return;
    const fecha = addFecha({
      leagueId: league.id,
      date,
      label: formatDateDDMMYYYY(date),
      players,
    });
    router.push(`/liga/fecha/${fecha.id}/live`);
  };

  if (!league) {
    return <p className="text-slate-500">Cargando...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Nueva fecha</h1>
          <p className="mt-1 text-sm text-slate-500">
            Elige la fecha y los jugadores que juegan esta fecha (normalmente 4 en el mismo grupo).
          </p>
        </div>
        <Link href="/liga" className="text-sm text-slate-400 hover:text-slate-200">
          ← Volver a Liga
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 sm:p-6">
        <div className="mb-6">
          <label htmlFor="fecha-date" className="mb-1 block text-sm font-medium text-slate-400">
            Fecha del partido
          </label>
          <input
            id="fecha-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100"
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-400">Jugadores</label>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="text-xs text-slate-500 hover:text-slate-300">
              Todos
            </button>
            <button type="button" onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-300">
              Ninguno
            </button>
          </div>
        </div>
        <ul className="mb-6 grid gap-2 sm:grid-cols-2">
          {mockPlayers.map((p) => (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-2 hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4 rounded border-slate-600 text-slate-600"
                />
                <span className="font-medium text-slate-200">{p.name}</span>
                <span className="text-sm text-slate-500">Hcp {p.handicap}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={selectedIds.size === 0}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Crear fecha y cargar golpes
          </button>
          <Link href="/liga" className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
