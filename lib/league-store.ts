import type { League } from "@/types/league";
import { mockCourse } from "@/mocks/mockCourse";

const STORAGE_KEY = "golf-saas-leagues";
const ACTIVE_LEAGUE_KEY = "golf-saas-active-league-id";

const DEFAULT_LEAGUE: League = {
  id: "league-default",
  name: "Liga CCM",
  courseId: mockCourse.id,
  rules: {
    use85Percent: true,
    use100Percent: true,
    useMatchInternal: true,
  },
};

function getStored(): League[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [DEFAULT_LEAGUE];
    const parsed = JSON.parse(raw) as League[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_LEAGUE];
  } catch {
    return [DEFAULT_LEAGUE];
  }
}

function persist(leagues: League[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leagues));
}

export function getAllLeagues(): League[] {
  const stored = getStored();
  const hasDefault = stored.some((l) => l.id === DEFAULT_LEAGUE.id);
  return hasDefault ? stored : [DEFAULT_LEAGUE, ...stored];
}

export function getActiveLeagueId(): string | null {
  if (typeof window === "undefined") return DEFAULT_LEAGUE.id;
  const id = window.localStorage.getItem(ACTIVE_LEAGUE_KEY);
  return id || DEFAULT_LEAGUE.id;
}

export function setActiveLeagueId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_LEAGUE_KEY, id);
}

export function getActiveLeague(): League {
  const leagues = getAllLeagues();
  const activeId = getActiveLeagueId();
  return leagues.find((l) => l.id === activeId) ?? leagues[0] ?? DEFAULT_LEAGUE;
}

export interface CreateLeagueInput {
  name: string;
  courseId: string;
  rules: League["rules"];
}

export function createLeague(input: CreateLeagueInput): League {
  const leagues = getAllLeagues();
  const id = `league-${Date.now()}`;
  const league: League = {
    id,
    name: input.name.trim() || "Liga",
    courseId: input.courseId,
    rules: input.rules,
  };
  leagues.push(league);
  persist(leagues);
  setActiveLeagueId(id);
  return league;
}

/** Iniciar liga nueva: crea una liga y la marca como activa (fechas en blanco) */
export function startNewLeague(input: CreateLeagueInput): League {
  return createLeague(input);
}
