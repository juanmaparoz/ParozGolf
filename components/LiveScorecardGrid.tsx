"use client";

import type { Course } from "@/types/course";

function strokesOnHole(adjustedHandicap: number, holeHandicapIndex: number): number {
  return (
    Math.floor(adjustedHandicap / 18) +
    (adjustedHandicap % 18 >= holeHandicapIndex ? 1 : 0)
  );
}

export interface LiveScorecardPlayer {
  playerId: string;
  name: string;
  adjusted85: number;
  adjusted100: number;
  highlight?: boolean;
}

export interface LiveScorecardGridProps {
  course: Course;
  players: LiveScorecardPlayer[];
  scores: Record<number, Record<string, number>>;
  currentHole: number;
  onCurrentHoleChange: (hole: number) => void;
  onSetGross: (hole: number, playerId: string, gross: number) => void;
  netBasis: "85" | "100";
  modeLabel?: string;
}

function parSum(course: Course, from: number, to: number): number {
  let s = 0;
  for (let n = from; n <= to; n++) {
    s += course.holes.find((h) => h.number === n)?.par ?? 0;
  }
  return s;
}

function grossSumForPlayer(
  scores: Record<number, Record<string, number>>,
  playerId: string,
  from: number,
  to: number
): number {
  let s = 0;
  for (let n = from; n <= to; n++) {
    const g = (scores[n] ?? {})[playerId] ?? 0;
    if (g > 0) s += g;
  }
  return s;
}

function netAccumulated(
  course: Course,
  scores: Record<number, Record<string, number>>,
  playerId: string,
  adjusted: number
): number {
  let sum = 0;
  for (let holeNum = 1; holeNum <= 18; holeNum++) {
    const holeData = course.holes.find((h) => h.number === holeNum);
    const hcpIndex = holeData?.handicapIndex ?? 1;
    const gross = (scores[holeNum] ?? {})[playerId] ?? 0;
    if (gross <= 0) continue;
    const strokes = strokesOnHole(adjusted, hcpIndex);
    sum += Math.max(0, gross - strokes);
  }
  return sum;
}

function cellToneClass(
  gross: number,
  par: number,
  adjusted: number,
  holeHcpIndex: number
): string {
  if (gross <= 0) return "bg-slate-800/50 text-slate-500";
  const net = Math.max(0, gross - strokesOnHole(adjusted, holeHcpIndex));
  const toPar = net - par;
  if (toPar < 0) return "bg-emerald-950/45 text-emerald-300";
  if (toPar > 0) return "bg-rose-950/30 text-rose-300";
  return "bg-slate-700/35 text-slate-200";
}

function ScoreInput({
  gross,
  par,
  adjusted,
  holeHcpIndex,
  isCurrent,
  onChange,
  ariaLabel,
}: {
  gross: number;
  par: number;
  adjusted: number;
  holeHcpIndex: number;
  isCurrent: boolean;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const tone = cellToneClass(gross, par, adjusted, holeHcpIndex);
  const ring = isCurrent ? "ring-2 ring-emerald-500 ring-inset" : "";
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={99}
      placeholder="—"
      value={gross > 0 ? gross : ""}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(0);
          return;
        }
        const n = parseInt(raw, 10);
        onChange(Number.isNaN(n) || n < 0 ? 0 : Math.min(99, n));
      }}
      className={`h-9 w-full min-w-0 appearance-none rounded-md border border-slate-600/60 px-0.5 text-center text-xs font-semibold tabular-nums placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:h-10 sm:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${tone} ${ring}`}
      aria-label={ariaLabel}
    />
  );
}

interface NineBlockProps {
  title: string;
  subtitle: string;
  holeRange: readonly number[];
  course: Course;
  players: LiveScorecardPlayer[];
  scores: Record<number, Record<string, number>>;
  currentHole: number;
  onSetGross: (hole: number, playerId: string, gross: number) => void;
  adjustedKey: "adjusted85" | "adjusted100";
  parStretchSum: number;
}

function NineHolesBlock({
  title,
  subtitle,
  holeRange,
  course,
  players,
  scores,
  currentHole,
  onSetGross,
  adjustedKey,
  parStretchSum,
}: NineBlockProps) {
  const playerColPct = (100 - 26) / Math.max(players.length, 1);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/25">
      <div className="border-b border-slate-700/50 bg-slate-900/50 px-3 py-2 sm:px-4">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="w-full">
        <table className="w-full table-fixed border-collapse text-center text-[10px] sm:text-xs md:text-sm">
          <colgroup>
            <col style={{ width: "9%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "9%" }} />
            {players.map((p) => (
              <col key={p.playerId} style={{ width: `${playerColPct}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/60 text-slate-400">
              <th className="px-0.5 py-2 font-medium sm:px-1">#</th>
              <th className="px-0.5 py-2 font-medium sm:px-1">Par</th>
              <th className="px-0.5 py-2 font-medium sm:px-1">Ind.</th>
              {players.map((p) => (
                <th
                  key={p.playerId}
                  className={`px-0.5 py-2 font-medium sm:px-1 ${
                    p.highlight ? "text-emerald-400" : "text-slate-300"
                  }`}
                >
                  <span className="line-clamp-2 break-words leading-tight">{p.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {holeRange.map((h) => {
              const holeData = course.holes.find((x) => x.number === h);
              const par = holeData?.par ?? 0;
              const hix = holeData?.handicapIndex ?? 1;
              const isCurrent = h === currentHole;
              return (
                <tr
                  key={h}
                  className={isCurrent ? "bg-emerald-950/20" : "bg-slate-800/20"}
                >
                  <td className="px-0.5 py-1.5 font-semibold tabular-nums text-slate-300 sm:px-1">
                    {h}
                  </td>
                  <td className="tabular-nums text-slate-400">{par}</td>
                  <td className="tabular-nums text-slate-500">{hix}</td>
                  {players.map((p) => {
                    const adjusted = p[adjustedKey];
                    const gross = (scores[h] ?? {})[p.playerId] ?? 0;
                    return (
                      <td key={p.playerId} className="p-0.5 sm:p-1">
                        <ScoreInput
                          gross={gross}
                          par={par}
                          adjusted={adjusted}
                          holeHcpIndex={hix}
                          isCurrent={isCurrent}
                          onChange={(v) => onSetGross(h, p.playerId, v)}
                          ariaLabel={`Golpes hoyo ${h}, ${p.name}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="border-t border-slate-600/60 bg-slate-800/50">
              <td
                colSpan={3}
                className="px-1 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs"
              >
                Bruto tramo
              </td>
              {players.map((p) => {
                const from = holeRange[0] ?? 1;
                const to = holeRange[holeRange.length - 1] ?? 9;
                const sum = grossSumForPlayer(scores, p.playerId, from, to);
                return (
                  <td
                    key={p.playerId}
                    className="px-0.5 py-2 text-xs font-bold tabular-nums text-slate-100 sm:text-sm"
                  >
                    {sum > 0 ? sum : "—"}
                  </td>
                );
              })}
            </tr>
            <tr className="bg-slate-900/40 text-[10px] text-slate-500 sm:text-xs">
              <td colSpan={3} className="px-1 py-1.5 text-left sm:px-2">
                Par tramo {parStretchSum}
              </td>
              {players.map((p) => (
                <td key={p.playerId} className="px-0.5 py-1.5" />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LiveScorecardGrid({
  course,
  players,
  scores,
  currentHole,
  onCurrentHoleChange,
  onSetGross,
  netBasis,
  modeLabel = "Tarjeta",
}: LiveScorecardGridProps) {
  const adjustedKey = netBasis === "100" ? "adjusted100" : "adjusted85";
  const parIda = parSum(course, 1, 9);
  const parVuelta = parSum(course, 10, 18);
  const holes1to9 = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
  const holes10to18 = [10, 11, 12, 13, 14, 15, 16, 17, 18] as const;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 bg-slate-900/50 px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
            {modeLabel}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Salida
          </span>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <span className="text-slate-500">Hoyo</span>
            <select
              value={currentHole}
              onChange={(e) => onCurrentHoleChange(Number(e.target.value))}
              className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm font-semibold text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              aria-label="Seleccionar hoyo actual"
            >
              {Array.from({ length: 18 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onCurrentHoleChange(Math.max(1, currentHole - 1))}
            disabled={currentHole <= 1}
            className="rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40 sm:px-3"
          >
            ← Anterior
          </button>
          <button
            type="button"
            onClick={() => onCurrentHoleChange(Math.min(18, currentHole + 1))}
            disabled={currentHole >= 18}
            className="rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40 sm:px-3"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <div className="space-y-4 p-3 sm:space-y-5 sm:p-4">
        <NineHolesBlock
          title="Ida · hoyos 1 a 9"
          subtitle={`Par ida ${parIda}`}
          holeRange={holes1to9}
          course={course}
          players={players}
          scores={scores}
          currentHole={currentHole}
          onSetGross={onSetGross}
          adjustedKey={adjustedKey}
          parStretchSum={parIda}
        />

        <NineHolesBlock
          title="Vuelta · hoyos 10 a 18"
          subtitle={`Par vuelta ${parVuelta}`}
          holeRange={holes10to18}
          course={course}
          players={players}
          scores={scores}
          currentHole={currentHole}
          onSetGross={onSetGross}
          adjustedKey={adjustedKey}
          parStretchSum={parVuelta}
        />

        <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/30">
          <div className="border-b border-slate-700/50 px-3 py-2 sm:px-4">
            <h3 className="text-sm font-semibold text-slate-200">Totales tarjeta</h3>
            <p className="text-xs text-slate-500">Gross 18 hoyos, hándicap de juego y neto acumulado</p>
          </div>
          <div className="w-full">
            <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 text-left text-slate-500">
                  <th className="px-3 py-2 font-medium">Jugador</th>
                  <th className="px-2 py-2 text-right font-medium">Total</th>
                  <th className="px-2 py-2 text-right font-medium">Hcp</th>
                  <th className="px-2 py-2 text-right font-medium">Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {players.map((p) => {
                  const adjusted = p[adjustedKey];
                  const totalGross = grossSumForPlayer(scores, p.playerId, 1, 18);
                  const netTotal = netAccumulated(course, scores, p.playerId, adjusted);
                  return (
                    <tr
                      key={p.playerId}
                      className={
                        p.highlight ? "bg-emerald-950/25" : "bg-slate-800/25"
                      }
                    >
                      <td
                        className={`px-3 py-2.5 font-medium ${
                          p.highlight ? "text-emerald-300" : "text-slate-200"
                        }`}
                      >
                        {p.name}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-slate-200">
                        {totalGross > 0 ? totalGross : "—"}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-slate-400">
                        {adjusted}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-emerald-400/95">
                        {netTotal > 0 ? netTotal : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="border-t border-slate-700/50 bg-slate-900/40 px-3 py-2 text-[10px] text-slate-500 sm:text-xs">
        Ida y vuelta en bloques verticales. El hoyo de salida se resalta en la tabla.
        {netBasis === "100"
          ? " Neto con hándicap de juego al 100%."
          : " Neto con hándicap de juego al 85%."}
      </p>
    </section>
  );
}
