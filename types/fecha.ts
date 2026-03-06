/** Jugador en una fecha (handicaps de ese día) */
export interface FechaPlayer {
  playerId: string;
  adjustedHandicap85: number;
  adjustedHandicap100: number;
}

/** Pareja de jugadores (2 IDs) */
export interface FechaPair {
  player1Id: string;
  player2Id: string;
}

export interface Fecha {
  id: string;
  leagueId: string;
  /** Fecha del partido YYYY-MM-DD */
  date: string;
  /** Etiqueta opcional, ej. "Sábado 15 Mar" */
  label?: string;
  players: FechaPlayer[];
  /** Lista de parejas (cada 2 parejas forman un grupo de 4 que compite) */
  pairs?: FechaPair[];
  /** @deprecated usar pairs[] en su lugar */
  pairA?: FechaPair;
  /** @deprecated usar pairs[] en su lugar */
  pairB?: FechaPair;
}
