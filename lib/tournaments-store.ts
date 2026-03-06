import type { Tournament } from "@/types/tournament";
import { mockTournaments } from "@/mocks/mockTournament";

const STORAGE_KEY = "golf-saas-tournaments";

function getStored(): Tournament[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Tournament[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Torneos mock + torneos guardados en localStorage */
export function getAllTournaments(): Tournament[] {
  return [...mockTournaments, ...getStored()];
}

export type CreateTournamentInput = Omit<Tournament, "id">;

export function saveTournament(input: CreateTournamentInput): Tournament {
  const stored = getStored();
  const id = `t-${Date.now()}`;
  const tournament: Tournament = { ...input, id };
  stored.push(tournament);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }
  return tournament;
}

export type TournamentStatus = Tournament["status"];

export function updateTournamentStatus(
  id: string,
  status: TournamentStatus
): boolean {
  const stored = getStored();
  const index = stored.findIndex((t) => t.id === id);
  if (index === -1) return false;
  stored[index] = { ...stored[index], status };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }
  return true;
}
