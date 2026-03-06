"use client";

import { useMemo } from "react";
import { mockCourse } from "@/mocks/mockCourse";
import type { Course } from "@/types/course";

function strokesOnHole(adjustedHandicap: number, holeHandicapIndex: number): number {
  return (
    Math.floor(adjustedHandicap / 18) +
    (adjustedHandicap % 18 >= holeHandicapIndex ? 1 : 0)
  );
}

export interface LeaderboardPlayer {
  playerId: string;
  name: string;
  adjusted85: number;
  adjusted100: number;
}

export interface LeaderboardProps {
  players: LeaderboardPlayer[];
  scores: Record<number, Record<string, number>>;
  pointsA: number;
  pointsB: number;
  parTotal: number;
  /** Si no se pasa, se usa mockCourse para índices de hoyo */
  course?: Course;
}

export function Leaderboard({
  players,
  scores,
  pointsA,
  pointsB,
  parTotal,
  course = mockCourse,
}: LeaderboardProps) {
  const holes = course.holes;
  const ranked = useMemo(() => {
    const withTotals = players.map((p, index) => {
      let net100Sum = 0;
      for (let holeNum = 1; holeNum <= 18; holeNum++) {
        const holeData = holes.find((h) => h.number === holeNum);
        const hcpIndex = holeData?.handicapIndex ?? 1;
        const gross = (scores[holeNum] ?? {})[p.playerId] ?? 0;
        if (gross <= 0) continue;
        const strokes = strokesOnHole(p.adjusted100, hcpIndex);
        net100Sum += Math.max(0, gross - strokes);
      }
      const matchPoints = index < 2 ? pointsA : pointsB;
      return {
        ...p,
        net100Accumulated: net100Sum,
        toPar: net100Sum > 0 ? net100Sum - parTotal : null,
        matchPoints,
      };
    });

    return [...withTotals].sort((a, b) => a.net100Accumulated - b.net100Accumulated);
  }, [players, scores, pointsA, pointsB, parTotal, holes]);

  const formatToPar = (value: number | null) => {
    if (value === null) return "—";
    if (value === 0) return "E";
    if (value > 0) return `+${value}`;
    return String(value);
  };

  const leader = ranked[0];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
      <div className="border-b border-slate-700/50 bg-slate-900/50 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-slate-200">Clasificación</h2>
          {leader && leader.net100Accumulated > 0 && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              Líder: {leader.name}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          Neto 100 acumulado · Verde bajo par · Rojo sobre par
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] text-sm sm:min-w-[320px]">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/50">
              <th className="w-10 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 sm:w-12 sm:px-3 sm:py-2.5">
                #
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:py-2.5">
                Jugador
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-3 sm:py-2.5">
                Neto 100
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-3 sm:py-2.5">
                Vs Par
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-3 sm:py-2.5">
                Puntos
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {ranked.map((row, index) => {
              const position = index + 1;
              const isPodium = position <= 3;
              const isLeader = position === 1 && row.net100Accumulated > 0;
              return (
                <tr
                  key={row.playerId}
                  className={`transition-colors ${
                    isLeader
                      ? "bg-emerald-950/25"
                      : position === 1
                        ? "bg-amber-950/30"
                        : position === 2
                          ? "bg-slate-700/20"
                          : position === 3
                            ? "bg-amber-900/10"
                            : "bg-slate-800/30"
                  } hover:bg-slate-800/50`}
                >
                  <td className="px-2 py-2.5 text-center sm:px-3 sm:py-3">
                    {isPodium ? (
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm ${
                          position === 1
                            ? "bg-amber-500/20 text-amber-400"
                            : position === 2
                              ? "bg-slate-500/20 text-slate-300"
                              : "bg-amber-700/20 text-amber-600"
                        }`}
                      >
                        {position}
                      </span>
                    ) : (
                      <span className="text-sm font-medium tabular-nums text-slate-500">
                        {position}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="font-medium text-slate-100">
                      {row.name}
                      {isLeader && (
                        <span className="ml-1 text-emerald-400" aria-hidden>★</span>
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono tabular-nums text-slate-300 sm:px-3 sm:py-3">
                    {row.net100Accumulated}
                  </td>
                  <td className="px-2 py-2.5 text-center sm:px-3 sm:py-3">
                    <span
                      className={`font-mono text-sm font-medium tabular-nums ${
                        row.toPar === null
                          ? "text-slate-500"
                          : row.toPar < 0
                            ? "text-emerald-400"
                            : row.toPar > 0
                              ? "text-rose-400"
                              : "text-slate-400"
                      }`}
                    >
                      {formatToPar(row.toPar)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right sm:px-3 sm:py-3">
                    <span className="font-semibold tabular-nums text-slate-200">
                      {row.matchPoints}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
