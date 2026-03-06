"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useTournaments } from "@/lib/use-tournaments";
import { useCourses } from "@/lib/use-courses";
import { TournamentDetailView } from "@/features/tournaments/components/TournamentDetailView";

export default function TournamentDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { tournaments } = useTournaments();
  const { courses } = useCourses();
  const tournament = tournaments.find((t) => t.id === id);
  const course = tournament
    ? courses.find((c) => c.id === tournament.courseId)
    : null;

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-slate-500">ID de torneo no válido.</p>
        <Link href="/tournaments" className="text-sm text-slate-400 hover:text-slate-200">
          ← Volver a torneos
        </Link>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="space-y-4">
        <p className="text-slate-500">Torneo no encontrado.</p>
        <Link href="/tournaments" className="text-sm text-slate-400 hover:text-slate-200">
          ← Volver a torneos
        </Link>
      </div>
    );
  }

  return (
    <TournamentDetailView
      tournamentId={tournament.id}
      tournamentName={tournament.name}
      tournamentDate={tournament.date}
      courseId={tournament.courseId}
      courseName={course?.name ?? "—"}
      status={tournament.status}
      playerCount={tournament.players.length}
    />
  );
}
