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
import { pairBestBallVsParTotal } from "@/lib/tournament-points";

function strokesOnHole(adjustedHandicap: number, holeHandicapIndex: number): number {
  return (
    Math.floor(adjustedHandicap / 18) +
    (adjustedHandicap % 18 >= holeHandicapIndex ? 1 : 0)
  );
}

/** Primer nombre solamente (más corto en mobile). */
function firstNameOnly(displayName: string): string {
  const t = displayName.trim();
  if (!t) return displayName;
  return t.split(/\s+/)[0] ?? t;
}

function formatVsPar(n: number): string {
  return n === 0 ? "E" : n > 0 ? `+${n}` : String(n);
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
            name: firstNameOnly(p?.name ?? playerId),
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
          name: firstNameOnly(p?.name ?? playerId),
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
          name: firstNameOnly(p?.name ?? playerId),
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

  // Calcular puntos con nuevo sistema: +2 mejor pelota, +1 peor pelota
  const calculatePointsForHoles = (startHole: number, endHole: number) => {
    if (!myGroup) return { pointsA: 0, pointsB: 0, grossA: 0, grossB: 0 };
    
    const pairAIds = new Set([myGroup.pairA.player1Id, myGroup.pairA.player2Id]);
    const pairBIds = new Set([myGroup.pairB.player1Id, myGroup.pairB.player2Id]);
    
    let totalA = 0;
    let totalB = 0;
    let grossA = 0;
    let grossB = 0;

    for (let holeNum = startHole; holeNum <= endHole; holeNum++) {
      const holeData = course.holes.find((h) => h.number === holeNum);
      const hcpIndex = holeData?.handicapIndex ?? 1;
      const holeScores = scores[holeNum] ?? {};
      
      const playerNets = myGroup.players.map((p) => {
        const gross = holeScores[p.playerId] ?? 0;
        const str = strokesOnHole(p.adjusted85, hcpIndex);
        return { playerId: p.playerId, net: Math.max(0, gross - str), gross };
      });
      
      // Sumar gross por pareja
      playerNets.forEach((p) => {
        if (pairAIds.has(p.playerId)) grossA += p.gross;
        if (pairBIds.has(p.playerId)) grossB += p.gross;
      });
      
      const validPlayers = playerNets.filter((p) => p.gross > 0);
      if (validPlayers.length === 0) continue;

      const validNets = validPlayers.map((p) => p.net);
      const bestNet = Math.min(...validNets);
      const worstNet = Math.max(...validNets);
      
      const bestPlayers = validPlayers.filter((p) => p.net === bestNet);
      const worstPlayers = validPlayers.filter((p) => p.net === worstNet);

      // +2 puntos por mejor pelota (empate entre parejas: no reparte)
      const bestTouchedA = bestPlayers.some((p) => pairAIds.has(p.playerId));
      const bestTouchedB = bestPlayers.some((p) => pairBIds.has(p.playerId));
      if (!bestTouchedA || !bestTouchedB) {
        if (bestTouchedA) totalA += 2;
        else if (bestTouchedB) totalB += 2;
      }

      // +1 punto por peor pelota (empate entre parejas: no reparte)
      const worstTouchedA = worstPlayers.some((p) => pairAIds.has(p.playerId));
      const worstTouchedB = worstPlayers.some((p) => pairBIds.has(p.playerId));
      if (!worstTouchedA || !worstTouchedB) {
        if (worstTouchedA) totalA += 1;
        else if (worstTouchedB) totalB += 1;
      }
    }

    return { pointsA: totalA, pointsB: totalB, grossA, grossB };
  };

  // Puntos totales (18 hoyos)
  const totalPoints = useMemo(() => calculatePointsForHoles(1, 18), [myGroup, scores, course.holes]);
  
  // Parcial ida (hoyos 1-9)
  const idaPoints = useMemo(() => calculatePointsForHoles(1, 9), [myGroup, scores, course.holes]);
  
  // Parcial vuelta (hoyos 10-18)
  const vueltaPoints = useMemo(() => calculatePointsForHoles(10, 18), [myGroup, scores, course.holes]);

  // El Cuarto: 3 mejores pelotas neto vs par
  const elCuarto = useMemo(() => {
    if (!myGroup) return { totalVsPar: 0, byHole: [] as Array<{ hole: number; best3Net: number; par: number; diff: number }> };
    
    let totalVsPar = 0;
    const byHole: Array<{ hole: number; best3Net: number; par: number; diff: number }> = [];

    for (let holeNum = 1; holeNum <= 18; holeNum++) {
      const holeData = course.holes.find((h) => h.number === holeNum);
      const holePar = holeData?.par ?? 4;
      const hcpIndex = holeData?.handicapIndex ?? 1;
      const holeScores = scores[holeNum] ?? {};
      
      const playerNets = myGroup.players
        .map((p) => {
          const gross = holeScores[p.playerId] ?? 0;
          if (gross === 0) return null;
          const str = strokesOnHole(p.adjusted85, hcpIndex);
          return Math.max(0, gross - str);
        })
        .filter((n): n is number => n !== null)
        .sort((a, b) => a - b);

      if (playerNets.length >= 3) {
        const best3 = playerNets.slice(0, 3);
        const best3Sum = best3.reduce((a, b) => a + b, 0);
        const parFor3 = holePar * 3;
        const diff = best3Sum - parFor3;
        totalVsPar += diff;
        byHole.push({ hole: holeNum, best3Net: best3Sum, par: parFor3, diff });
      } else if (playerNets.length > 0) {
        const sum = playerNets.reduce((a, b) => a + b, 0);
        const parForN = holePar * playerNets.length;
        const diff = sum - parForN;
        totalVsPar += diff;
        byHole.push({ hole: holeNum, best3Net: sum, par: parForN, diff });
      }
    }

    return { totalVsPar, byHole };
  }, [myGroup, scores, course.holes]);

  // Resumen de todos los grupos/parejas (orden por mejor pelota vs par, no por puntos del match)
  const allPairsResults = useMemo(() => {
    const results: Array<{
      pairNames: string;
      bestBallVsPar: number;
      gross: number;
      groupIndex: number;
      isMyPair: boolean;
    }> = [];

    for (const group of groups) {
      const pairAIds = new Set([group.pairA.player1Id, group.pairA.player2Id]);
      const pairBIds = new Set([group.pairB.player1Id, group.pairB.player2Id]);

      let grossA = 0;
      let grossB = 0;
      for (let holeNum = 1; holeNum <= 18; holeNum++) {
        const holeScores = scores[holeNum] ?? {};
        group.players.forEach((p) => {
          const g = holeScores[p.playerId] ?? 0;
          if (pairAIds.has(p.playerId)) grossA += g;
          if (pairBIds.has(p.playerId)) grossB += g;
        });
      }

      const groupPlayersPts = group.players.map((p) => ({
        playerId: p.playerId,
        adjusted85: p.adjusted85,
      }));
      const bba = pairBestBallVsParTotal(group.pairA, groupPlayersPts, scores, course, 1, 18);
      const bbb = pairBestBallVsParTotal(group.pairB, groupPlayersPts, scores, course, 1, 18);

      const namesA = [group.pairA.player1Id, group.pairA.player2Id]
        .map((id) => firstNameOnly(mockPlayers.find((p) => p.id === id)?.name ?? id))
        .join(" + ");
      const namesB = [group.pairB.player1Id, group.pairB.player2Id]
        .map((id) => firstNameOnly(mockPlayers.find((p) => p.id === id)?.name ?? id))
        .join(" + ");

      const isMyPairA = currentPlayerId ? pairAIds.has(currentPlayerId) : false;
      const isMyPairB = currentPlayerId ? pairBIds.has(currentPlayerId) : false;

      results.push({
        pairNames: namesA,
        bestBallVsPar: bba,
        gross: grossA,
        groupIndex: group.groupIndex,
        isMyPair: isMyPairA,
      });
      results.push({
        pairNames: namesB,
        bestBallVsPar: bbb,
        gross: grossB,
        groupIndex: group.groupIndex,
        isMyPair: isMyPairB,
      });
    }

    return results.sort((a, b) => a.bestBallVsPar - b.bestBallVsPar);
  }, [groups, scores, course, currentPlayerId]);

  const pairANames = myGroup
    ? [myGroup.pairA.player1Id, myGroup.pairA.player2Id]
        .map((id) => firstNameOnly(mockPlayers.find((p) => p.id === id)?.name ?? id))
        .join(" + ")
    : "";

  const pairBNames = myGroup
    ? [myGroup.pairB.player1Id, myGroup.pairB.player2Id]
        .map((id) => firstNameOnly(mockPlayers.find((p) => p.id === id)?.name ?? id))
        .join(" + ")
    : "";

  const pairBestBallTotal = useMemo(() => {
    if (!myGroup) return { a: 0, b: 0 };
    const pts = myGroup.players.map((p) => ({ playerId: p.playerId, adjusted85: p.adjusted85 }));
    return {
      a: pairBestBallVsParTotal(myGroup.pairA, pts, scores, course, 1, 18),
      b: pairBestBallVsParTotal(myGroup.pairB, pts, scores, course, 1, 18),
    };
  }, [myGroup, scores, course]);

  const pairBestBallIda = useMemo(() => {
    if (!myGroup) return { a: 0, b: 0 };
    const pts = myGroup.players.map((p) => ({ playerId: p.playerId, adjusted85: p.adjusted85 }));
    return {
      a: pairBestBallVsParTotal(myGroup.pairA, pts, scores, course, 1, 9),
      b: pairBestBallVsParTotal(myGroup.pairB, pts, scores, course, 1, 9),
    };
  }, [myGroup, scores, course]);

  const pairBestBallVuelta = useMemo(() => {
    if (!myGroup) return { a: 0, b: 0 };
    const pts = myGroup.players.map((p) => ({ playerId: p.playerId, adjusted85: p.adjusted85 }));
    return {
      a: pairBestBallVsParTotal(myGroup.pairA, pts, scores, course, 10, 18),
      b: pairBestBallVsParTotal(myGroup.pairB, pts, scores, course, 10, 18),
    };
  }, [myGroup, scores, course]);

  const matchMarginLine = useMemo(() => {
    const diff = totalPoints.pointsA - totalPoints.pointsB;
    if (diff === 0) return null;
    const leaderNames = diff > 0 ? pairANames : pairBNames;
    return `Van ${Math.abs(diff)} arriba ${leaderNames}`;
  }, [totalPoints, pairANames, pairBNames]);

  const leadingPairByMatch =
    totalPoints.pointsA > totalPoints.pointsB
      ? "A"
      : totalPoints.pointsB > totalPoints.pointsA
        ? "B"
        : null;

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

      {/* Hoyo actual */}
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
              const isMilestone = h === 9 || h === 18;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setCurrentHole(h)}
                  className={`min-w-[2rem] rounded py-1.5 px-1 text-center text-sm font-semibold transition ${
                    isCurrent
                      ? "bg-emerald-600 text-white"
                      : isMilestone
                      ? "bg-amber-700/50 text-amber-300 hover:bg-amber-600/50"
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

      {/* Cargar golpes */}
      <section className="rounded-xl border border-emerald-800/50 bg-slate-800/50 p-4 shadow-sm ring-1 ring-emerald-900/30">
        <h2 className="mb-3 text-sm font-semibold text-slate-200">
          Hoyo {currentHole} — Cargar golpes (gross)
        </h2>
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
              </label>
              <input
                type="number"
                min={0}
                max={99}
                value={currentScores[p.playerId] ?? ""}
                onChange={(e) => setGross(p.playerId, parseInt(e.target.value, 10) || 0)}
                placeholder="—"
                className="w-full rounded border border-slate-600 bg-slate-800 py-2.5 text-center text-lg font-semibold tabular-nums text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Resumen del hoyo */}
      <section className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/40">
        <div className="border-b border-slate-700/50 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-500">
          Resumen hoyo {currentHole} (Par {par})
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 text-left text-xs text-slate-500">
              <th className="px-3 py-2">Jugador</th>
              <th className="px-2 py-2 text-right">Gross</th>
              <th className="px-2 py-2 text-right">Neto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {tableRows.map((row) => {
              const toPar = row.gross > 0 ? row.net85 - par : null;
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
                    {row.gross > 0 ? `${row.net85} (${fmt(toPar)})` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Parejas - Puntos totales */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Match (mejor +2, peor +1)
          </span>
          {matchMarginLine && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
              {matchMarginLine}
            </span>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div
            className={`rounded-lg border p-3 ${
              leadingPairByMatch === "A"
                ? "border-amber-500/50 bg-amber-950/20"
                : "border-slate-700/50 bg-slate-900/30"
            }`}
          >
            <p className="truncate text-sm text-slate-300">{pairANames || "—"}</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-emerald-400">{totalPoints.pointsA} pts</p>
            <p className="text-xs text-slate-400">
              Vs par (mejor bola):{" "}
              <span className="font-semibold tabular-nums text-slate-200">
                {formatVsPar(pairBestBallTotal.a)}
              </span>
            </p>
            <p className="text-xs text-slate-500">Gross: {totalPoints.grossA}</p>
          </div>
          <div
            className={`rounded-lg border p-3 ${
              leadingPairByMatch === "B"
                ? "border-amber-500/50 bg-amber-950/20"
                : "border-slate-700/50 bg-slate-900/30"
            }`}
          >
            <p className="truncate text-sm text-slate-300">{pairBNames || "—"}</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-sky-400">{totalPoints.pointsB} pts</p>
            <p className="text-xs text-slate-400">
              Vs par (mejor bola):{" "}
              <span className="font-semibold tabular-nums text-slate-200">
                {formatVsPar(pairBestBallTotal.b)}
              </span>
            </p>
            <p className="text-xs text-slate-500">Gross: {totalPoints.grossB}</p>
          </div>
        </div>
      </section>

      {/* Parciales Ida / Vuelta */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 sm:p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
          Parciales
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">Ida (1-9)</p>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400">{pairANames}: {idaPoints.pointsA} pts</span>
              <span className="text-slate-500">Gross: {idaPoints.grossA}</span>
            </div>
            <div className="mb-1 text-xs text-slate-500">
              Vs par: {formatVsPar(pairBestBallIda.a)} · {formatVsPar(pairBestBallIda.b)}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sky-400">{pairBNames}: {idaPoints.pointsB} pts</span>
              <span className="text-slate-500">Gross: {idaPoints.grossB}</span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">Vuelta (10-18)</p>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400">{pairANames}: {vueltaPoints.pointsA} pts</span>
              <span className="text-slate-500">Gross: {vueltaPoints.grossA}</span>
            </div>
            <div className="mb-1 text-xs text-slate-500">
              Vs par: {formatVsPar(pairBestBallVuelta.a)} · {formatVsPar(pairBestBallVuelta.b)}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sky-400">{pairBNames}: {vueltaPoints.pointsB} pts</span>
              <span className="text-slate-500">Gross: {vueltaPoints.grossB}</span>
            </div>
          </div>
        </div>
      </section>

      {/* El Cuarto: 3 mejores pelotas vs par */}
      <section className="rounded-xl border border-purple-800/50 bg-slate-800/40 p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            El Cuarto (3 mejores vs par)
          </span>
          <span className={`text-lg font-bold tabular-nums ${elCuarto.totalVsPar <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatVsPar(elCuarto.totalVsPar)}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Suma de las 3 mejores pelotas neto por hoyo comparado con par×3
        </p>
      </section>

      {/* Resumen de todos los equipos */}
      {groups.length >= 1 && (
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 sm:p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            Ranking de parejas
          </p>
          <div className="space-y-1">
            {allPairsResults.map((pair, idx) => (
              <div
                key={`${pair.groupIndex}-${pair.pairNames}`}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  pair.isMyPair
                    ? "border border-emerald-600/50 bg-emerald-950/20"
                    : "bg-slate-900/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs text-slate-500">{idx + 1}</span>
                  <span className={pair.isMyPair ? "font-medium text-emerald-300" : "text-slate-300"}>
                    {pair.pairNames}
                  </span>
                  {pair.isMyPair && <span className="text-xs text-emerald-500">(Tú)</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">G:{pair.gross}</span>
                  <span className="font-bold tabular-nums text-amber-400">{formatVsPar(pair.bestBallVsPar)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
