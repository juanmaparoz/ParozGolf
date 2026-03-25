"use client";

import { useMemo } from "react";
import Link from "next/link";
import { mockPlayers } from "@/mocks/mockPlayers";
import { mockCourse } from "@/mocks/mockCourse";
import type { Course } from "@/types/course";
import type { Fecha } from "@/types/fecha";
import { useLeague } from "@/lib/use-league";
import { useFechas } from "@/lib/use-fechas";
import { useCourses } from "@/lib/use-courses";
import { getScores } from "@/lib/scores-store";
import { computeAllGroupPoints, type GroupPointsResult } from "@/lib/tournament-points";
import { formatDateDDMMYYYY } from "@/lib/date-utils";

function strokesOnHole(adjustedHandicap: number, holeHandicapIndex: number): number {
  return (
    Math.floor(adjustedHandicap / 18) +
    (adjustedHandicap % 18 >= holeHandicapIndex ? 1 : 0)
  );
}

function netTotalForPlayer(
  playerId: string,
  adjustedHandicap: number,
  scores: Record<number, Record<string, number>>,
  course: Course
): number {
  let total = 0;
  for (let holeNum = 1; holeNum <= 18; holeNum++) {
    const holeData = course.holes.find((h) => h.number === holeNum);
    const hcpIndex = holeData?.handicapIndex ?? 1;
    const gross = (scores[holeNum] ?? {})[playerId] ?? 0;
    if (gross <= 0) continue;
    const strokes = strokesOnHole(adjustedHandicap, hcpIndex);
    total += Math.max(0, gross - strokes);
  }
  return total;
}

export function ClasificacionView() {
  const { league } = useLeague();
  const { fechas } = useFechas(league?.id ?? null);
  const { courses } = useCourses();

  const course = useMemo(
    () => courses.find((c) => c.id === league?.courseId) ?? mockCourse,
    [courses, league?.courseId]
  );

  const { individual85, individual100, gruposPorFecha } = useMemo(() => {
    const acc85: Record<string, number> = {};
    const acc100: Record<string, number> = {};
    const grupos: Array<{ fecha: Fecha; groups: GroupPointsResult[] }> = [];

    if (!league) return { individual85: [], individual100: [], gruposPorFecha: [] };

    for (const fecha of fechas) {
      const scores = getScores(fecha.id);
      const playersWithInfo = fecha.players.map((fp) => ({
        playerId: fp.playerId,
        adjusted85: fp.adjustedHandicap85,
        adjusted100: fp.adjustedHandicap100,
      }));

      for (const p of playersWithInfo) {
        const n85 = netTotalForPlayer(p.playerId, p.adjusted85, scores, course);
        const n100 = netTotalForPlayer(p.playerId, p.adjusted100, scores, course);
        acc85[p.playerId] = (acc85[p.playerId] ?? 0) + n85;
        acc100[p.playerId] = (acc100[p.playerId] ?? 0) + n100;
      }

      const groupResults = computeAllGroupPoints(
        playersWithInfo.map((p) => ({ playerId: p.playerId, adjusted85: p.adjusted85 })),
        scores,
        course,
        { pairs: fecha.pairs, pairA: fecha.pairA, pairB: fecha.pairB }
      );
      grupos.push({ fecha, groups: groupResults });
    }

    const individual85List = Object.entries(acc85)
      .map(([playerId, total]) => ({
        playerId,
        name: mockPlayers.find((p) => p.id === playerId)?.name ?? playerId,
        total,
      }))
      .sort((a, b) => a.total - b.total);

    const individual100List = Object.entries(acc100)
      .map(([playerId, total]) => ({
        playerId,
        name: mockPlayers.find((p) => p.id === playerId)?.name ?? playerId,
        total,
      }))
      .sort((a, b) => a.total - b.total);

    return {
      individual85: individual85List,
      individual100: individual100List,
      gruposPorFecha: grupos,
    };
  }, [league, fechas, course]);

  const pairBestBallAccum = useMemo(() => {
    const accum: Record<string, number> = {};
    for (const { groups } of gruposPorFecha) {
      for (const g of groups) {
        const pairAKey = [g.pairA.player1Id, g.pairA.player2Id].sort().join("+");
        const pairBKey = [g.pairB.player1Id, g.pairB.player2Id].sort().join("+");
        accum[pairAKey] = (accum[pairAKey] ?? 0) + g.bestBallVsParA;
        accum[pairBKey] = (accum[pairBKey] ?? 0) + g.bestBallVsParB;
      }
    }
    return Object.entries(accum)
      .map(([key, bestBallVsPar]) => {
        const [p1, p2] = key.split("+");
        const name1 = mockPlayers.find((p) => p.id === p1)?.name?.split(" ")[0] ?? p1;
        const name2 = mockPlayers.find((p) => p.id === p2)?.name?.split(" ")[0] ?? p2;
        return { key, names: `${name1} + ${name2}`, bestBallVsPar };
      })
      .sort((a, b) => a.bestBallVsPar - b.bestBallVsPar);
  }, [gruposPorFecha]);

  const formatVsPar = (n: number) => (n === 0 ? "E" : n > 0 ? `+${n}` : String(n));

  if (!league) {
    return (
      <div className="p-4">
        <p className="text-slate-500">Cargando liga...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Clasificación · {league.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acumulado de todas las fechas de {league.name}
          </p>
        </div>
        <Link href="/liga" className="text-sm text-slate-400 hover:text-slate-200">
          ← Volver a Liga
        </Link>
      </div>

      {/* Individual 85% */}
      <section className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40">
        <div className="border-b border-slate-700/50 p-4">
          <h2 className="text-base font-semibold text-slate-200">Individual 85%</h2>
          <p className="text-xs text-slate-500">Neto acumulado (handicap 85%)</p>
        </div>
        <div className="overflow-x-auto">
          {individual85.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Sin datos aún</div>
          ) : (
            <table className="w-full min-w-[260px]">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/50">
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">Jugador</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase text-slate-500">Neto 85</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {individual85.map((row, i) => (
                  <tr key={row.playerId} className="bg-slate-800/30">
                    <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-100">{row.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Individual 100% */}
      <section className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40">
        <div className="border-b border-slate-700/50 p-4">
          <h2 className="text-base font-semibold text-slate-200">Individual 100%</h2>
          <p className="text-xs text-slate-500">Neto acumulado (handicap 100%)</p>
        </div>
        <div className="overflow-x-auto">
          {individual100.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Sin datos aún</div>
          ) : (
            <table className="w-full min-w-[260px]">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/50">
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">Jugador</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase text-slate-500">Neto 100</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {individual100.map((row, i) => (
                  <tr key={row.playerId} className="bg-slate-800/30">
                    <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-100">{row.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-300">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Ranking de parejas */}
      <section className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40">
        <div className="border-b border-slate-700/50 p-4">
          <h2 className="text-base font-semibold text-slate-200">Ranking de Parejas</h2>
          <p className="text-xs text-slate-500">Puntos acumulados por pareja</p>
        </div>
        <div className="overflow-x-auto">
          {pairBestBallAccum.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Sin datos aún</div>
          ) : (
            <table className="w-full min-w-[260px]">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/50">
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">Pareja</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase text-slate-500">Vs par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {pairBestBallAccum.map((row, i) => (
                  <tr key={row.key} className="bg-slate-800/30">
                    <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-100">{row.names}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">
                      {formatVsPar(row.bestBallVsPar)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Detalle por fecha */}
      <section className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40">
        <div className="border-b border-slate-700/50 p-4">
          <h2 className="text-base font-semibold text-slate-200">Detalle por fecha</h2>
          <p className="text-xs text-slate-500">Puntos de cada grupo por fecha</p>
        </div>
        <div className="divide-y divide-slate-700/50">
          {gruposPorFecha.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Sin datos aún</div>
          ) : (
            gruposPorFecha.map(({ fecha, groups }) => (
              <div key={fecha.id} className="p-4">
                <p className="mb-2 text-sm font-medium text-slate-200">
                  {fecha.label ?? formatDateDDMMYYYY(fecha.date)}
                </p>
                <div className="space-y-2">
                  {groups.map((g, idx) => {
                    const pANames = [g.pairA.player1Id, g.pairA.player2Id]
                      .map((id) => mockPlayers.find((p) => p.id === id)?.name?.split(" ")[0] ?? id)
                      .join(" + ");
                    const pBNames = [g.pairB.player1Id, g.pairB.player2Id]
                      .map((id) => mockPlayers.find((p) => p.id === id)?.name?.split(" ")[0] ?? id)
                      .join(" + ");
                    return (
                      <div key={idx} className="flex flex-col gap-1 rounded-lg bg-slate-900/30 px-3 py-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                        <span className="text-xs text-slate-500">Grupo {idx + 1}</span>
                        <span className="text-emerald-400">
                          {pANames}: match {g.pointsA} pts · vs par {formatVsPar(g.bestBallVsParA)}
                        </span>
                        <span className="text-slate-600">vs</span>
                        <span className="text-sky-400">
                          {pBNames}: match {g.pointsB} pts · vs par {formatVsPar(g.bestBallVsParB)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
