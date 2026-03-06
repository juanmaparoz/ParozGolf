"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockPlayers } from "@/mocks/mockPlayers";
import { useFechas } from "@/lib/use-fechas";
import { useLeague } from "@/lib/use-league";
import { todayISO, formatDateDDMMYYYY } from "@/lib/date-utils";
import type { FechaPair } from "@/types/fecha";

function adjusted85(h: number): number {
  return Math.round(h * 0.85);
}

export function NuevaFechaForm() {
  const router = useRouter();
  const { league } = useLeague();
  const { addFecha } = useFechas(league?.id ?? null);
  const [date, setDate] = useState(todayISO());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [pairAssignments, setPairAssignments] = useState<Record<string, string | null>>({});

  const selectedPlayers = useMemo(() => {
    return mockPlayers.filter((p) => selectedIds.has(p.id));
  }, [selectedIds]);

  const numPairs = Math.floor(selectedPlayers.length / 2);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setPairAssignments((prevAssign) => {
          const newAssign = { ...prevAssign };
          Object.keys(newAssign).forEach((key) => {
            if (newAssign[key] === id) {
              newAssign[key] = null;
            }
          });
          return newAssign;
        });
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = () => setSelectedIds(new Set(mockPlayers.map((p) => p.id)));
  const clearAll = () => {
    setSelectedIds(new Set());
    setPairAssignments({});
  };

  const assignedIds = useMemo(() => {
    return new Set(Object.values(pairAssignments).filter(Boolean) as string[]);
  }, [pairAssignments]);

  const availableForSlot = useCallback((slotKey: string) => {
    const currentValue = pairAssignments[slotKey];
    return selectedPlayers.filter(
      (p) => p.id === currentValue || !assignedIds.has(p.id)
    );
  }, [selectedPlayers, assignedIds, pairAssignments]);

  const setSlot = useCallback((slotKey: string, value: string | null) => {
    setPairAssignments((prev) => ({ ...prev, [slotKey]: value }));
  }, []);

  const allPairsComplete = useMemo(() => {
    if (numPairs === 0) return false;
    for (let i = 0; i < numPairs; i++) {
      const p1 = pairAssignments[`pair-${i}-1`];
      const p2 = pairAssignments[`pair-${i}-2`];
      if (!p1 || !p2) return false;
    }
    return true;
  }, [numPairs, pairAssignments]);

  const buildPairs = useCallback((): FechaPair[] => {
    const pairs: FechaPair[] = [];
    for (let i = 0; i < numPairs; i++) {
      const p1 = pairAssignments[`pair-${i}-1`];
      const p2 = pairAssignments[`pair-${i}-2`];
      if (p1 && p2) {
        pairs.push({ player1Id: p1, player2Id: p2 });
      }
    }
    return pairs;
  }, [numPairs, pairAssignments]);

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

    const pairs = buildPairs();

    const fecha = addFecha({
      leagueId: league.id,
      date,
      label: formatDateDDMMYYYY(date),
      players,
      pairs,
    });
    router.push(`/liga/fecha/${fecha.id}/live`);
  };

  const getPlayerName = (id: string | null) => {
    if (!id) return "";
    return mockPlayers.find((p) => p.id === id)?.name ?? id;
  };

  const getPairLabel = (index: number): string => {
    return `Pareja ${index + 1}`;
  };

  const getGroupInfo = (pairIndex: number): { groupNum: number; isA: boolean } => {
    const groupNum = Math.floor(pairIndex / 2) + 1;
    const isA = pairIndex % 2 === 0;
    return { groupNum, isA };
  };

  if (!league) {
    return <p className="text-slate-500">Cargando...</p>;
  }

  const numGroups = Math.floor(numPairs / 2);
  const hasOddPair = numPairs % 2 === 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Nueva fecha</h1>
          <p className="mt-1 text-sm text-slate-500">
            Elige la fecha, los jugadores y arma las parejas.
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
          <label className="text-sm font-medium text-slate-400">
            Jugadores ({selectedPlayers.length} seleccionados)
          </label>
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

        {selectedPlayers.length >= 2 && (
          <div className="mb-6 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
            <h3 className="mb-1 text-sm font-medium text-slate-300">
              Armar parejas ({numPairs} {numPairs === 1 ? "pareja" : "parejas"})
            </h3>
            <p className="mb-4 text-xs text-slate-500">
              {numGroups > 0 
                ? `${numGroups} ${numGroups === 1 ? "grupo" : "grupos"} de 4 jugadores (2 parejas compiten entre sí)`
                : "Selecciona al menos 4 jugadores para formar un grupo completo"
              }
              {hasOddPair && numGroups > 0 && " + 1 pareja sin grupo"}
            </p>
            
            <div className="space-y-4">
              {Array.from({ length: numGroups }).map((_, groupIdx) => {
                const pairAIdx = groupIdx * 2;
                const pairBIdx = groupIdx * 2 + 1;
                return (
                  <div key={groupIdx} className="rounded-lg border border-slate-600/50 bg-slate-800/30 p-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Grupo {groupIdx + 1}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <PairSelector
                        pairIndex={pairAIdx}
                        label={getPairLabel(pairAIdx)}
                        isA={true}
                        pairAssignments={pairAssignments}
                        availableForSlot={availableForSlot}
                        setSlot={setSlot}
                        getPlayerName={getPlayerName}
                      />
                      <PairSelector
                        pairIndex={pairBIdx}
                        label={getPairLabel(pairBIdx)}
                        isA={false}
                        pairAssignments={pairAssignments}
                        availableForSlot={availableForSlot}
                        setSlot={setSlot}
                        getPlayerName={getPlayerName}
                      />
                    </div>
                  </div>
                );
              })}
              
              {hasOddPair && numPairs >= 1 && (
                <div className="rounded-lg border border-slate-600/50 bg-slate-800/30 p-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sin grupo (necesita otra pareja)
                  </p>
                  <div className="max-w-xs">
                    <PairSelector
                      pairIndex={numPairs - 1}
                      label={getPairLabel(numPairs - 1)}
                      isA={true}
                      pairAssignments={pairAssignments}
                      availableForSlot={availableForSlot}
                      setSlot={setSlot}
                      getPlayerName={getPlayerName}
                    />
                  </div>
                </div>
              )}
            </div>

            {!allPairsComplete && (
              <p className="mt-3 text-xs text-amber-400">
                Completa todas las parejas para continuar
              </p>
            )}
          </div>
        )}

        {selectedPlayers.length === 1 && (
          <p className="mb-6 text-xs text-slate-500">
            Selecciona al menos 2 jugadores para formar una pareja
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={selectedIds.size === 0 || (numPairs > 0 && !allPairsComplete)}
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

interface PairSelectorProps {
  pairIndex: number;
  label: string;
  isA: boolean;
  pairAssignments: Record<string, string | null>;
  availableForSlot: (slotKey: string) => Array<{ id: string; name: string }>;
  setSlot: (slotKey: string, value: string | null) => void;
  getPlayerName: (id: string | null) => string;
}

function PairSelector({
  pairIndex,
  label,
  isA,
  pairAssignments,
  availableForSlot,
  setSlot,
  getPlayerName,
}: PairSelectorProps) {
  const slot1Key = `pair-${pairIndex}-1`;
  const slot2Key = `pair-${pairIndex}-2`;
  const p1 = pairAssignments[slot1Key] ?? null;
  const p2 = pairAssignments[slot2Key] ?? null;
  
  const borderColor = isA ? "border-emerald-800/50" : "border-sky-800/50";
  const bgColor = isA ? "bg-emerald-950/20" : "bg-sky-950/20";
  const textColor = isA ? "text-emerald-400" : "text-sky-400";
  const summaryColor = isA ? "text-emerald-300" : "text-sky-300";

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-3`}>
      <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${textColor}`}>
        {label}
      </p>
      <div className="space-y-2">
        <select
          value={p1 ?? ""}
          onChange={(e) => setSlot(slot1Key, e.target.value || null)}
          className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-slate-100"
        >
          <option value="">Jugador 1...</option>
          {availableForSlot(slot1Key).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={p2 ?? ""}
          onChange={(e) => setSlot(slot2Key, e.target.value || null)}
          className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-slate-100"
        >
          <option value="">Jugador 2...</option>
          {availableForSlot(slot2Key).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {p1 && p2 && (
        <p className={`mt-2 text-xs ${summaryColor}`}>
          {getPlayerName(p1)} + {getPlayerName(p2)}
        </p>
      )}
    </div>
  );
}
