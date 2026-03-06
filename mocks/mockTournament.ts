import type { Tournament } from "@/types/tournament";
import { mockPlayers } from "./mockPlayers";
import { mockCourse } from "./mockCourse";

function adjustedHandicap85(handicap: number): number {
  return Math.round(handicap * 0.85);
}

function adjustedHandicap100(handicap: number): number {
  return handicap;
}

export const mockTournament: Tournament = {
  id: "t-ccm-2025",
  name: "Torneo CCM Primavera 2025",
  date: "2025-04-12",
  courseId: mockCourse.id,
  status: "draft",
  players: mockPlayers.map((p) => ({
    playerId: p.id,
    adjustedHandicap85: adjustedHandicap85(p.handicap),
    adjustedHandicap100: adjustedHandicap100(p.handicap),
  })),
  rules: {
    use85Percent: true,
    use100Percent: true,
    useMatchInternal: true,
  },
};

/** Lista de torneos para listados */
export const mockTournaments: Tournament[] = [mockTournament];
