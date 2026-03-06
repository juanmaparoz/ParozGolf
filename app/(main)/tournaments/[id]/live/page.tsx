"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useTournaments } from "@/lib/use-tournaments";
import { TournamentLiveView } from "@/features/tournaments/components/TournamentLiveView";

export default function TournamentLivePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { tournaments } = useTournaments();
  const tournament = tournaments.find((t) => t.id === id);

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

  if (tournament.players.length < 4) {
    return (
      <div className="space-y-4">
        <p className="text-slate-500">
          Este torneo necesita al menos 4 jugadores para la vista en vivo.
        </p>
        <Link
          href={`/tournaments/${id}/players`}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Gestionar jugadores
        </Link>
      </div>
    );
  }

  return <TournamentLiveView tournament={tournament} />;
}
