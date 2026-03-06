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
import { computePairPoints } from "@/lib/tournament-points";
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

  const { individual85, individual100, duplasPorFecha, totalPuntosA, totalPuntosB } = useMemo(() => {
    const acc85: Record<string, number> = {};
    const acc100: Record<string, number> = {};
    const duplas: Array<{ fecha: Fecha; pointsA: number; pointsB: number }> = [];
    let sumA = 0;
    let sumB = 0;

    if (!league) return { individual85: [], individual100: [], duplasPorFecha: [], totalPuntosA: 0, totalPuntosB: 0 };

    for (const fecha of fechas) {
      const scores = getScores(fecha.id);
      const group = fecha.players.slice(0, 4);
      const playersWithInfo = group.map((fp) => ({
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

      const { pointsA, pointsB } = computePairPoints(
        playersWithInfo.map((p) => ({ playerId: p.playerId, adjusted85: p.adjusted85 })),
        scores,
        course
      );
      duplas.push({ fecha, pointsA, pointsB });
      sumA += pointsA;
      sumB += pointsB;
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
      duplasPorFecha: duplas,
      totalPuntosA: sumA,
      totalPuntosB: sumB,
    };
  }, [league, fechas, course]);

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

      {/* Duplas (puntos por fecha + totales) */}
      <section className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40">
        <div className="border-b border-slate-700/50 p-4">
          <h2 className="text-base font-semibold text-slate-200">Duplas (match interno)</h2>
          <p className="text-xs text-slate-500">Puntos por fecha (Pareja A vs B) y total acumulado</p>
        </div>
        <div className="overflow-x-auto">
          {duplasPorFecha.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Sin datos aún</div>
          ) : (
            <>
              <table className="w-full min-w-[280px]">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-900/50">
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">Fecha</th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase text-slate-500">Pareja A</th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase text-slate-500">Pareja B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {duplasPorFecha.map(({ fecha, pointsA, pointsB }) => (
                    <tr key={fecha.id} className="bg-slate-800/30">
                      <td className="px-4 py-2.5 text-slate-200">
                        {fecha.label ?? formatDateDDMMYYYY(fecha.date)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">{pointsA}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-sky-400">{pointsB}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-600 bg-slate-900/50 font-semibold">
                    <td className="px-4 py-3 text-slate-200">Total</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-400">{totalPuntosA}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-sky-400">{totalPuntosB}</td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
