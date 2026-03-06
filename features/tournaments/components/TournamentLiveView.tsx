"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { mockPlayers } from "@/mocks/mockPlayers";
import { mockCourse } from "@/mocks/mockCourse";
import type { Tournament, TournamentPlayer } from "@/types/tournament";
import { Leaderboard } from "./Leaderboard";
import { useTournamentScores } from "@/lib/use-tournament-scores";

/** Strokes received on a hole (handicap index 1–18) */
function strokesOnHole(adjustedHandicap: number, holeHandicapIndex: number): number {
  return (
    Math.floor(adjustedHandicap / 18) +
    (adjustedHandicap % 18 >= holeHandicapIndex ? 1 : 0)
  );
}

interface LiveProps {
  tournament: Tournament;
}

export function TournamentLiveView({ tournament }: LiveProps) {
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useTournamentScores(tournament.id);

  const group = tournament.players.slice(0, 4);
  const playersWithInfo: Array<{
    playerId: string;
    name: string;
    adjusted85: number;
    adjusted100: number;
  }> = useMemo(() => {
    return group.map((tp: TournamentPlayer) => {
      const p = mockPlayers.find((x) => x.id === tp.playerId);
      return {
        playerId: tp.playerId,
        name: p?.name ?? tp.playerId,
        adjusted85: tp.adjustedHandicap85,
        adjusted100: tp.adjustedHandicap100,
      };
    });
  }, [group]);

  const holeInfo = mockCourse.holes.find((h) => h.number === currentHole);
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
    return playersWithInfo.map((p) => {
      const gross = currentScores[p.playerId] ?? 0;
      const strokes85 = strokesOnHole(p.adjusted85, holeHcpIndex);
      const strokes100 = strokesOnHole(p.adjusted100, holeHcpIndex);
      const net85 = Math.max(0, gross - strokes85);
      const net100 = Math.max(0, gross - strokes100);
      return { ...p, gross, net85, net100 };
    });
  }, [playersWithInfo, currentScores, holeHcpIndex]);

  /** Pareja A = jugadores 1-2 (índices 0,1), Pareja B = 3-4 (índices 2,3) */
  const PAIR_A_INDEXES = [0, 1];
  const PAIR_B_INDEXES = [2, 3];

  /** Puntos por hoyo: +1 pareja con mejor neto, +1 pareja con peor neto (usando net85). */
  const { pointsA, pointsB, currentHolePoints } = useMemo(() => {
    let totalA = 0;
    let totalB = 0;
    let bestA = 0;
    let bestB = 0;
    let worstA = 0;
    let worstB = 0;

    for (let holeNum = 1; holeNum <= 18; holeNum++) {
      const holeData = mockCourse.holes.find((h) => h.number === holeNum);
      const hcpIndex = holeData?.handicapIndex ?? 1;
      const holeScores = scores[holeNum] ?? {};
      const nets = playersWithInfo.map((p) => {
        const gross = holeScores[p.playerId] ?? 0;
        const str = strokesOnHole(p.adjusted85, hcpIndex);
        return Math.max(0, gross - str);
      });
      const validIndices = nets
        .map((_, i) => i)
        .filter((i) => (holeScores[playersWithInfo[i].playerId] ?? 0) > 0);
      if (validIndices.length === 0) continue;

      const validNets = validIndices.map((i) => nets[i]);
      const bestNet = Math.min(...validNets);
      const worstNet = Math.max(...validNets);
      const bestIndices = validIndices.filter((i) => nets[i] === bestNet);
      const worstIndices = validIndices.filter((i) => nets[i] === worstNet);

      const bestFromA = bestIndices.filter((i) => PAIR_A_INDEXES.includes(i)).length;
      const bestFromB = bestIndices.filter((i) => PAIR_B_INDEXES.includes(i)).length;
      if (bestFromA > 0 && bestFromB > 0) {
        totalA += 0.5;
        totalB += 0.5;
        if (holeNum === currentHole) {
          bestA = 0.5;
          bestB = 0.5;
        }
      } else if (bestFromA > 0) {
        totalA += 1;
        if (holeNum === currentHole) bestA = 1;
      } else if (bestFromB > 0) {
        totalB += 1;
        if (holeNum === currentHole) bestB = 1;
      }

      const worstFromA = worstIndices.filter((i) => PAIR_A_INDEXES.includes(i)).length;
      const worstFromB = worstIndices.filter((i) => PAIR_B_INDEXES.includes(i)).length;
      if (worstFromA > 0 && worstFromB > 0) {
        totalA += 0.5;
        totalB += 0.5;
        if (holeNum === currentHole) {
          worstA = 0.5;
          worstB = 0.5;
        }
      } else if (worstFromA > 0) {
        totalA += 1;
        if (holeNum === currentHole) worstA = 1;
      } else if (worstFromB > 0) {
        totalB += 1;
        if (holeNum === currentHole) worstB = 1;
      }
    }

    return {
      pointsA: totalA,
      pointsB: totalB,
      currentHolePoints: { bestA, bestB, worstA, worstB },
    };
  }, [playersWithInfo, scores, currentHole]);

  const pairANames = [playersWithInfo[0]?.name, playersWithInfo[1]?.name].filter(Boolean).join(" + ");
  const pairBNames = [playersWithInfo[2]?.name, playersWithInfo[3]?.name].filter(Boolean).join(" + ");

  const leadingPair = pointsA >= pointsB ? "A" : "B";

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-2 pb-8 sm:space-y-6 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-100 sm:text-2xl">
            {tournament.name} · En vivo
          </h1>
          <p className="text-sm text-slate-500">Estado en React (no se guarda)</p>
        </div>
        <Link
          href={`/tournaments/${tournament.id}`}
          className="shrink-0 text-sm font-medium text-slate-400 hover:text-slate-200"
        >
          ← Volver al torneo
        </Link>
      </div>

      {/* Indicador de hoyo actual: strip 1-18 */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 sm:p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          Hoyo actual
        </p>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:gap-1.5">
          {Array.from({ length: 18 }, (_, i) => i + 1).map((h) => {
            const isCurrent = h === currentHole;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setCurrentHole(h)}
                className={`flex min-w-[2.25rem] shrink-0 flex-col items-center rounded-lg py-2 px-1 text-center transition sm:min-w-[2.5rem] sm:py-2.5 ${
                  isCurrent
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-800"
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
                aria-label={isCurrent ? `Hoyo ${h} (actual)` : `Ir al hoyo ${h}`}
                aria-current={isCurrent ? "true" : undefined}
              >
                <span className="text-sm font-bold tabular-nums">{h}</span>
                {isCurrent && (
                  <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider opacity-90">
                    Actual
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
          <span>Par {par}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentHole((x) => Math.max(1, x - 1))}
              disabled={currentHole <= 1}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-40 sm:px-4"
              aria-label="Hoyo anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => setCurrentHole((x) => Math.min(18, x + 1))}
              disabled={currentHole >= 18}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-40 sm:px-4"
              aria-label="Hoyo siguiente"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <Leaderboard
        players={playersWithInfo}
        scores={scores}
        pointsA={pointsA}
        pointsB={pointsB}
        parTotal={mockCourse.parTotal}
      />

      {/* Parejas y puntos + indicador ganador parcial */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Parejas · +1 mejor / +1 peor por hoyo
          </p>
          {pointsA !== pointsB && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
              Líder: Pareja {leadingPair}
            </span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className={`rounded-lg border p-3 transition sm:p-4 ${
              leadingPair === "A" && pointsA !== pointsB
                ? "border-amber-500/50 bg-amber-950/20 ring-1 ring-amber-500/30"
                : "border-emerald-800/50 bg-slate-900/30"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">Pareja A (1-2)</p>
              {leadingPair === "A" && pointsA !== pointsB && (
                <span className="text-xs font-medium text-amber-400">★ Líder</span>
              )}
            </div>
            <p className="truncate text-sm text-slate-300">{pairANames || "—"}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-emerald-400 sm:text-2xl">
              {pointsA} puntos
            </p>
            {currentHolePoints.bestA > 0 || currentHolePoints.worstA > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                Hoyo {currentHole}:{" "}
                {currentHolePoints.bestA > 0 && `+${currentHolePoints.bestA} mejor `}
                {currentHolePoints.worstA > 0 && `+${currentHolePoints.worstA} peor`}
              </p>
            ) : null}
          </div>
          <div
            className={`rounded-lg border p-3 transition sm:p-4 ${
              leadingPair === "B" && pointsA !== pointsB
                ? "border-amber-500/50 bg-amber-950/20 ring-1 ring-amber-500/30"
                : "border-sky-800/50 bg-slate-900/30"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">Pareja B (3-4)</p>
              {leadingPair === "B" && pointsA !== pointsB && (
                <span className="text-xs font-medium text-amber-400">★ Líder</span>
              )}
            </div>
            <p className="truncate text-sm text-slate-300">{pairBNames || "—"}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-sky-400 sm:text-2xl">
              {pointsB} puntos
            </p>
            {currentHolePoints.bestB > 0 || currentHolePoints.worstB > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                Hoyo {currentHole}:{" "}
                {currentHolePoints.bestB > 0 && `+${currentHolePoints.bestB} mejor `}
                {currentHolePoints.worstB > 0 && `+${currentHolePoints.worstB} peor`}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Inputs golpes (gross) por jugador */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 sm:p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
          Golpes (gross) · Hoyo {currentHole}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3">
          {playersWithInfo.map((p) => (
            <div
              key={p.playerId}
              className="flex flex-col gap-1 rounded-lg border border-slate-700/50 bg-slate-900/30 p-2 sm:p-3"
            >
              <label className="truncate text-xs font-medium text-slate-300 sm:text-sm">
                {p.name}
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
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-2.5 text-base tabular-nums text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 sm:px-3 sm:text-lg"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Tabla en vivo: verde bajo par, rojo sobre par */}
      <section className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
        <h2 className="border-b border-slate-700/50 bg-slate-900/50 px-3 py-2.5 text-sm font-semibold text-slate-200 sm:px-4 sm:py-3">
          Hoyo {currentHole} · Gross | Neto 85 | Neto 100 (vs par {par})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[260px] text-sm sm:text-base">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/30">
                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-slate-500 sm:px-4 sm:py-2.5">
                  Jugador
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium uppercase text-slate-500 sm:px-3">
                  Gross
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium uppercase text-slate-500 sm:px-3">
                  Neto 85
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium uppercase text-slate-500 sm:px-3">
                  Neto 100
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {tableRows.map((row) => {
                const toPar85 = row.gross > 0 ? row.net85 - par : null;
                const toPar100 = row.gross > 0 ? row.net100 - par : null;
                const cellClass = (toPar: number | null) => {
                  if (toPar === null) return "text-slate-500";
                  if (toPar < 0) return "text-emerald-400 font-medium";
                  if (toPar > 0) return "text-rose-400 font-medium";
                  return "text-slate-300";
                };
                const formatToPar = (v: number | null) => {
                  if (v === null) return "—";
                  if (v === 0) return "E";
                  return v > 0 ? `+${v}` : String(v);
                };
                return (
                  <tr key={row.playerId} className="bg-slate-800/30">
                    <td className="px-3 py-2.5 font-medium text-slate-100 sm:px-4 sm:py-3">
                      {row.name}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-slate-300 sm:px-3">
                      {row.gross || "—"}
                    </td>
                    <td className={`px-2 py-2.5 text-right tabular-nums sm:px-3 ${cellClass(toPar85)}`}>
                      {row.gross > 0 ? `${row.net85} (${formatToPar(toPar85)})` : "—"}
                    </td>
                    <td className={`px-2 py-2.5 text-right tabular-nums sm:px-3 ${cellClass(toPar100)}`}>
                      {row.gross > 0 ? `${row.net100} (${formatToPar(toPar100)})` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
