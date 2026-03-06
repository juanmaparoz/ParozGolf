import type { Score } from "./score";

export interface Round {
  id: string;
  tournamentId: string;
  playerId: string;
  roundNumber: number;
  scores: Score[];
}
