import type { Fecha, FechaPlayer, FechaPair } from "@/types/fecha";

const STORAGE_KEY_PREFIX = "golf-saas-fechas-";

function getKey(leagueId: string): string {
  return STORAGE_KEY_PREFIX + leagueId;
}

function getStored(leagueId: string): Fecha[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getKey(leagueId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Fecha[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(leagueId: string, fechas: Fecha[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getKey(leagueId), JSON.stringify(fechas));
}

export function getFechas(leagueId: string): Fecha[] {
  return getStored(leagueId).sort((a, b) => a.date.localeCompare(b.date));
}

export interface CreateFechaInput {
  leagueId: string;
  date: string;
  label?: string;
  players: FechaPlayer[];
  pairs?: FechaPair[];
  /** @deprecated usar pairs[] */
  pairA?: FechaPair;
  /** @deprecated usar pairs[] */
  pairB?: FechaPair;
}

export function addFecha(input: CreateFechaInput): Fecha {
  const fechas = getStored(input.leagueId);
  const id = `fecha-${Date.now()}`;
  const fecha: Fecha = {
    id,
    leagueId: input.leagueId,
    date: input.date,
    label: input.label,
    players: [...input.players],
    pairs: input.pairs,
    pairA: input.pairA,
    pairB: input.pairB,
  };
  fechas.push(fecha);
  persist(input.leagueId, fechas);
  return fecha;
}

/** Duplicar última fecha: misma lista de jugadores, sin scores. Opcionalmente agregar más jugadores después. */
export function duplicateLastFecha(leagueId: string, newDate: string, newLabel?: string): Fecha | null {
  const fechas = getStored(leagueId);
  const last = fechas[fechas.length - 1];
  if (!last) return null;
  return addFecha({
    leagueId,
    date: newDate,
    label: newLabel,
    players: last.players.map((p) => ({
      playerId: p.playerId,
      adjustedHandicap85: p.adjustedHandicap85,
      adjustedHandicap100: p.adjustedHandicap100,
    })),
  });
}

export function getFecha(leagueId: string, fechaId: string): Fecha | null {
  return getStored(leagueId).find((f) => f.id === fechaId) ?? null;
}

export function updateFechaPlayers(leagueId: string, fechaId: string, players: FechaPlayer[]): boolean {
  const fechas = getStored(leagueId);
  const index = fechas.findIndex((f) => f.id === fechaId);
  if (index === -1) return false;
  fechas[index] = { ...fechas[index], players: [...players] };
  persist(leagueId, fechas);
  return true;
}
