import type { TournamentPlayer } from "./tournament-player";

export type TournamentStatus = "draft" | "ready" | "in_progress" | "finished";

export interface TournamentRules {
  use85Percent: boolean;
  use100Percent: boolean;
  useMatchInternal: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  courseId: string;
  players: TournamentPlayer[];
  status: TournamentStatus;
  rules: TournamentRules;
}
