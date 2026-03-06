const STORAGE_KEY_PREFIX = "golf-saas-scores-";

export type ScoresMap = Record<number, Record<string, number>>;

export function getScores(tournamentId: string): ScoresMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + tournamentId);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ScoresMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function setScores(tournamentId: string, scores: ScoresMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY_PREFIX + tournamentId, JSON.stringify(scores));
}
