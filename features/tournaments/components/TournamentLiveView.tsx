"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { mockPlayers } from "@/mocks/mockPlayers";
import { mockCourse } from "@/mocks/mockCourse";
import type { Tournament, TournamentPlayer } from "@/types/tournament";
import { Leaderboard } from "./Leaderboard";
import { useTournamentScores } from "@/lib/use-tournament-scores";
import { LiveScorecardGrid } from "@/components/LiveScorecardGrid";

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

  const setGrossHole = (hole: number, playerId: string, value: number) => {
    const v = value < 0 || Number.isNaN(value) ? 0 : value;
    setScores((prev) => ({
      ...prev,
      [hole]: {
        ...(prev[hole] ?? {}),
        [playerId]: v,
      },
    }));
  };

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
    <div className="mx-auto max-w-6xl space-y-4 px-2 pb-8 sm:space-y-6 sm:px-0">
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

      <LiveScorecardGrid
        course={mockCourse}
        players={playersWithInfo}
        scores={scores}
        currentHole={currentHole}
        onCurrentHoleChange={setCurrentHole}
        onSetGross={setGrossHole}
        netBasis="100"
        modeLabel="100%"
      />

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

    </div>
  );
}
