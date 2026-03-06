"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTournaments } from "@/lib/use-tournaments";
import { mockCourses } from "@/mocks/mockCourse";
import type { TournamentStatus } from "@/types/tournament";

const statusLabel: Record<TournamentStatus, string> = {
  draft: "Borrador",
  ready: "Listo",
  in_progress: "En curso",
  finished: "Finalizado",
};

export function TournamentDetailView({
  tournamentId,
  tournamentName,
  tournamentDate,
  courseId,
  courseName,
  status,
  playerCount,
}: {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  courseId: string;
  courseName: string;
  status: TournamentStatus;
  playerCount: number;
}) {
  const router = useRouter();
  const { setTournamentStatus } = useTournaments();

  const canStart = status === "draft" || status === "ready";

  const handleStart = () => {
    setTournamentStatus(tournamentId, "in_progress");
    router.push(`/tournaments/${tournamentId}/live`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            {tournamentName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {tournamentDate} · {courseName}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                status === "in_progress"
                  ? "bg-emerald-900/50 text-emerald-300"
                  : status === "finished"
                    ? "bg-slate-700 text-slate-400"
                    : status === "ready"
                      ? "bg-sky-900/50 text-sky-300"
                      : "bg-amber-900/50 text-amber-300"
              }`}
            >
              {statusLabel[status]}
            </span>
            <span className="text-sm text-slate-500">
              {playerCount} jugadores
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tournaments"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            ← Torneos
          </Link>
          <Link
            href={`/tournaments/${tournamentId}/players`}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Jugadores
          </Link>
          {canStart && (
            <button
              type="button"
              onClick={handleStart}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Iniciar torneo
            </button>
          )}
          {status === "in_progress" && (
            <Link
              href={`/tournaments/${tournamentId}/live`}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Ver en vivo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
