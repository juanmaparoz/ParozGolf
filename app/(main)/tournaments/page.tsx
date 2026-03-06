import { TournamentList } from "@/features/tournaments/components/TournamentList";

export default function TournamentsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-100">Torneos</h1>
      <TournamentList />
    </div>
  );
}
