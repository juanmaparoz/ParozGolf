"use client";

import { mockPlayers } from "@/mocks/mockPlayers";
import { useTournaments } from "@/lib/use-tournaments";
import { useCourses } from "@/lib/use-courses";

export function DashboardStatsCards() {
  const { tournaments } = useTournaments();
  const { courses } = useCourses();
  const totalPlayers = mockPlayers.length;
  const totalTournaments = tournaments.length;
  const totalCourses = courses.length;

  const cards = [
    {
      label: "Total jugadores",
      value: totalPlayers,
      accent: "text-emerald-400",
    },
    {
      label: "Torneos creados",
      value: totalTournaments,
      accent: "text-amber-400",
    },
    {
      label: "Canchas configuradas",
      value: totalCourses,
      accent: "text-sky-400",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 shadow-sm backdrop-blur sm:p-6"
        >
          <p className="text-sm font-medium text-slate-400">{card.label}</p>
          <p className={`mt-1 text-3xl font-bold tabular-nums ${card.accent}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
