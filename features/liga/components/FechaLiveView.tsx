"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { mockPlayers } from "@/mocks/mockPlayers";
import { mockCourse } from "@/mocks/mockCourse";
import type { League } from "@/types/league";
import type { Fecha, FechaPair } from "@/types/fecha";
import { useFechaScores } from "@/lib/use-fecha-scores";
import { useCourses } from "@/lib/use-courses";
import { useAuth } from "@/features/auth/context/AuthContext";
import { formatDateDDMMYYYY } from "@/lib/date-utils";

function strokesOnHole(adjustedHandicap: number, holeHandicapIndex: number): number {
  return (
    Math.floor(adjustedHandicap / 18) +
    (adjustedHandicap % 18 >= holeHandicapIndex ? 1 : 0)
  );
}

interface PlayerInfo {
  playerId: string;
  name: string;
  adjusted85: number;
  adjusted100: number;
}

interface GroupData {
  groupIndex: number;
  pairA: FechaPair;
  pairB: FechaPair;
  players: PlayerInfo[];
}

interface FechaLiveViewProps {
  league: League;
  fecha: Fecha;
}

export function FechaLiveView({ league, fecha }: FechaLiveViewProps) {
  const [currentHole, setCurrentHole] = useState(1);
  const { currentPlayerId: loggedInPlayerId } = useAuth();
  const [scores, setScores] = useFechaScores(fecha.id);
  const { courses } = useCourses();

  const course = useMemo(
    () => courses.find((c) => c.id === league.courseId) ?? mockCourse,
    [courses, league.courseId]
  );

  const groups: GroupData[] = useMemo(() => {
    const result: GroupData[] = [];
    
    if (fecha.pairs && fecha.pairs.length >= 2) {
      for (let i = 0; i < fecha.pairs.length - 1; i += 2) {
        const pairA = fecha.pairs[i];
        const pairB = fecha.pairs[i + 1];
        const playerIds = [pairA.player1Id, pairA.player2Id, pairB.player1Id, pairB.player2Id];
        const players = playerIds.map((playerId) => {
          const fp = fecha.players.find((p) => p.playerId === playerId);
          const p = mockPlayers.find((x) => x.id === playerId);
          return {
            playerId,
            name: p?.name ?? playerId,
            adjusted85: fp?.adjustedHandicap85 ?? 0,
            adjusted100: fp?.adjustedHandicap100 ?? 0,
          };
        });
        result.push({ groupIndex: result.length, pairA, pairB, players });
      }
    } else if (fecha.pairA && fecha.pairB) {
      const playerIds = [
        fecha.pairA.player1Id,
        fecha.pairA.player2Id,
        fecha.pairB.player1Id,
        fecha.pairB.player2Id,
      ];
      const players = playerIds.map((playerId) => {
        const fp = fecha.players.find((p) => p.playerId === playerId);
        const p = mockPlayers.find((x) => x.id === playerId);
        return {
          playerId,
          name: p?.name ?? playerId,
          adjusted85: fp?.adjustedHandicap85 ?? 0,
          adjusted100: fp?.adjustedHandicap100 ?? 0,
        };
      });
      result.push({ groupIndex: 0, pairA: fecha.pairA, pairB: fecha.pairB, players });
    } else {
      const playerIds = fecha.players.slice(0, 4).map((p) => p.playerId);
      const players = playerIds.map((playerId) => {
        const fp = fecha.players.find((p) => p.playerId === playerId);
        const p = mockPlayers.find((x) => x.id === playerId);
        return {
          playerId,
          name: p?.name ?? playerId,
          adjusted85: fp?.adjustedHandicap85 ?? 0,
          adjusted100: fp?.adjustedHandicap100 ?? 0,
        };
      });
      const pairA = { player1Id: playerIds[0] ?? "", player2Id: playerIds[1] ?? "" };
      const pairB = { player1Id: playerIds[2] ?? "", player2Id: playerIds[3] ?? "" };
      result.push({ groupIndex: 0, pairA, pairB, players });
    }
    
    return result;
  }, [fecha]);

  const myGroup = useMemo(() => {
    if (!loggedInPlayerId) return groups[0] ?? null;
    const found = groups.find((g) => g.players.some((p) => p.playerId === loggedInPlayerId));
    return found ?? groups[0] ?? null;
  }, [groups, loggedInPlayerId]);

  const currentPlayerId =
    loggedInPlayerId && myGroup?.players.some((p) => p.playerId === loggedInPlayerId)
      ? loggedInPlayerId
      : null;

  const orderedPlayers = useMemo(() => {
    if (!myGroup) return [];
    if (!currentPlayerId) return myGroup.players;
    const idx = myGroup.players.findIndex((p) => p.playerId === currentPlayerId);
    if (idx <= 0) return myGroup.players;
    return [
      myGroup.players[idx],
      ...myGroup.players.slice(0, idx),
      ...myGroup.players.slice(idx + 1),
    ];
  }, [myGroup, currentPlayerId]);

  const holeInfo = course.holes.find((h) => h.number === currentHole);
  const par = holeInfo?.par ?? 0;
  const holeHcpIndex = holeInfo?.handicapIndex ?? 1;

  const currentScores = scores[currentHole] ?? {};

  const setGross = (playerId: string, value: number) => {
    const v = value < 0 || Number.isNaN(value) ? 0 : value;
    setScores((prev) => ({
      ...prev,
      [currentHole]: {
        ...(prev[currentHole] ?? {}),
        [playerId]: v,
      },
    }));
  };

  const tableRows = useMemo(() => {
    return orderedPlayers.map((p) => {
      const gross = currentScores[p.playerId] ?? 0;
      const strokes85 = strokesOnHole(p.adjusted85, holeHcpIndex);
      const strokes100 = strokesOnHole(p.adjusted100, holeHcpIndex);
      const net85 = Math.max(0, gross - strokes85);
      const net100 = Math.max(0, gross - strokes100);
      return { ...p, gross, net85, net100 };
    });
  }, [orderedPlayers, currentScores, holeHcpIndex]);

  const groupPoints = useMemo(() => {
    if (!myGroup) return { pointsA: 0, pointsB: 0 };
    
    const pairAIds = new Set([myGroup.pairA.player1Id, myGroup.pairA.player2Id]);
    const pairBIds = new Set([myGroup.pairB.player1Id, myGroup.pairB.player2Id]);
    
    let totalA = 0;
    let totalB = 0;

    for (let holeNum = 1; holeNum <= 18; holeNum++) {
      const holeData = course.holes.find((h) => h.number === holeNum);
      const hcpIndex = holeData?.handicapIndex ?? 1;
      const holeScores = scores[holeNum] ?? {};
      
      const playerNets = myGroup.players.map((p) => {
        const gross = holeScores[p.playerId] ?? 0;
        const str = strokesOnHole(p.adjusted85, hcpIndex);
        return { playerId: p.playerId, net: Math.max(0, gross - str), gross };
      });
      
      const validPlayers = playerNets.filter((p) => p.gross > 0);
      if (validPlayers.length === 0) continue;

      const validNets = validPlayers.map((p) => p.net);
      const bestNet = Math.min(...validNets);
      const worstNet = Math.max(...validNets);
      
      const bestPlayers = validPlayers.filter((p) => p.net === bestNet);
      const worstPlayers = validPlayers.filter((p) => p.net === worstNet);

      const bestFromA = bestPlayers.filter((p) => pairAIds.has(p.playerId)).length;
      const bestFromB = bestPlayers.filter((p) => pairBIds.has(p.playerId)).length;
      if (bestFromA > 0 && bestFromB > 0) {
        totalA += 0.5;
        totalB += 0.5;
      } else if (bestFromA > 0) {
        totalA += 1;
      } else if (bestFromB > 0) {
        totalB += 1;
      }

      const worstFromA = worstPlayers.filter((p) => pairAIds.has(p.playerId)).length;
      const worstFromB = worstPlayers.filter((p) => pairBIds.has(p.playerId)).length;
      if (worstFromA > 0 && worstFromB > 0) {
        totalA += 0.5;
        totalB += 0.5;
      } else if (worstFromA > 0) {
        totalA += 1;
      } else if (worstFromB > 0) {
        totalB += 1;
      }
    }

    return { pointsA: totalA, pointsB: totalB };
  }, [myGroup, scores, course.holes]);

  const pairANames = myGroup
    ? [myGroup.pairA.player1Id, myGroup.pairA.player2Id]
        .map((id) => mockPlayers.find((p) => p.id === id)?.name ?? id)
        .join(" + ")
    : "";

  const pairBNames = myGroup
    ? [myGroup.pairB.player1Id, myGroup.pairB.player2Id]
        .map((id) => mockPlayers.find((p) => p.id === id)?.name ?? id)
        .join(" + ")
    : "";

  const leadingPair = groupPoints.pointsA >= groupPoints.pointsB ? "A" : "B";
  const fechaLabel = fecha.label ?? formatDateDDMMYYYY(fecha.date);

  if (!myGroup) {
    return (
      <div className="p-4">
        <p className="text-slate-500">No hay datos del grupo</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-3 pb-10 sm:px-0">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-100 sm:text-xl">
            {league.name} · {fechaLabel}
          </h1>
          <p className="text-xs text-slate-500">
            {groups.length > 1 && `Grupo ${myGroup.groupIndex + 1} de ${groups.length} · `}
            Golpes guardados automáticamente
          </p>
        </div>
        <Link
          href="/liga"
          className="shrink-0 text-sm text-slate-400 hover:text-slate-200"
        >
          ← Volver a Liga
        </Link>
      </header>

      {/* Hoyo actual: strip compacto + par y navegación */}
      <section className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Hoyo
          </span>
          <span className="text-sm text-slate-400">Par {par}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-0.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => {
              const isCurrent = h === currentHole;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setCurrentHole(h)}
                  className={`min-w-[2rem] rounded py-1.5 px-1 text-center text-sm font-semibold transition ${
                    isCurrent
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700/60 text-slate-400 hover:bg-slate-600 hover:text-slate-200"
                  }`}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  {h}
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setCurrentHole((x) => Math.max(1, x - 1))}
              disabled={currentHole <= 1}
              className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-300 disabled:opacity-40"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setCurrentHole((x) => Math.min(18, x + 1))}
              disabled={currentHole >= 18}
              className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-300 disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* Bloque principal: cargar golpes de los 4 jugadores */}
      <section className="rounded-xl border border-emerald-800/50 bg-slate-800/50 p-4 shadow-sm ring-1 ring-emerald-900/30">
        <h2 className="mb-3 text-sm font-semibold text-slate-200">
          Hoyo {currentHole} — Cargar golpes (gross)
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Anotá los golpes de tu grupo en este hoyo.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {orderedPlayers.map((p) => (
            <div
              key={p.playerId}
              className={`rounded-lg border bg-slate-900/50 p-3 ${
                p.playerId === currentPlayerId
                  ? "border-emerald-600/50 ring-1 ring-emerald-500/30"
                  : "border-slate-700/50"
              }`}
            >
              <label className="mb-1 block truncate text-xs font-medium text-slate-400">
                {p.playerId === currentPlayerId ? "Tú" : p.name}
                {p.playerId === currentPlayerId && p.name !== "Tú" ? ` · ${p.name}` : ""}
              </label>
              <input
                type="number"
                min={0}
                max={99}
                value={currentScores[p.playerId] ?? ""}
                onChange={(e) =>
                  setGross(p.playerId, parseInt(e.target.value, 10) || 0)
                }
                placeholder="—"
                className="w-full rounded border border-slate-600 bg-slate-800 py-2.5 text-center text-lg font-semibold tabular-nums text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Resumen del hoyo (compacto) */}
      <section className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/40">
        <div className="border-b border-slate-700/50 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-500">
          Resumen hoyo {currentHole} (Par {par})
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 text-left text-xs text-slate-500">
              <th className="px-3 py-2">Jugador</th>
              <th className="px-2 py-2 text-right">Gross</th>
              <th className="px-2 py-2 text-right">Neto 85</th>
              <th className="px-2 py-2 text-right">Neto 100</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {tableRows.map((row) => {
              const toPar85 = row.gross > 0 ? row.net85 - par : null;
              const toPar100 = row.gross > 0 ? row.net100 - par : null;
              const fmt = (v: number | null) =>
                v === null ? "—" : v === 0 ? "E" : v > 0 ? `+${v}` : String(v);
              return (
                <tr key={row.playerId} className="bg-slate-800/30">
                  <td className="px-3 py-2 font-medium text-slate-100">
                    {row.playerId === currentPlayerId ? "Tú" : row.name}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-slate-300">
                    {row.gross || "—"}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {row.gross > 0 ? `${row.net85} (${fmt(toPar85)})` : "—"}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {row.gross > 0 ? `${row.net100} (${fmt(toPar100)})` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Parejas */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Parejas
          </span>
          {groupPoints.pointsA !== groupPoints.pointsB && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
              Líder: Pareja {leadingPair}
            </span>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div
            className={`rounded-lg border p-3 ${
              leadingPair === "A" && groupPoints.pointsA !== groupPoints.pointsB
                ? "border-amber-500/50 bg-amber-950/20"
                : "border-slate-700/50 bg-slate-900/30"
            }`}
          >
            <p className="text-xs text-slate-500">Pareja A</p>
            <p className="truncate text-sm text-slate-300">{pairANames || "—"}</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-emerald-400">{groupPoints.pointsA} pts</p>
          </div>
          <div
            className={`rounded-lg border p-3 ${
              leadingPair === "B" && groupPoints.pointsA !== groupPoints.pointsB
                ? "border-amber-500/50 bg-amber-950/20"
                : "border-slate-700/50 bg-slate-900/30"
            }`}
          >
            <p className="text-xs text-slate-500">Pareja B</p>
            <p className="truncate text-sm text-slate-300">{pairBNames || "—"}</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-sky-400">{groupPoints.pointsB} pts</p>
          </div>
        </div>
      </section>
    </div>
  );
}
