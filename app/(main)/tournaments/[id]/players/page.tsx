import { TournamentPlayersView } from "@/features/tournaments/components/TournamentPlayersView";
import { getAllTournaments } from "@/lib/tournaments-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentPlayersPage({ params }: PageProps) {
  const { id } = await params;
  const tournaments = getAllTournaments();
  const tournament = tournaments.find((t) => t.id === id);

  return (
    <TournamentPlayersView
      tournamentId={id}
      tournamentName={tournament?.name}
    />
  );
}
