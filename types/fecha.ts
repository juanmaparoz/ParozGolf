/** Jugador en una fecha (handicaps de ese día) */
export interface FechaPlayer {
  playerId: string;
  adjustedHandicap85: number;
  adjustedHandicap100: number;
}

export interface Fecha {
  id: string;
  leagueId: string;
  /** Fecha del partido YYYY-MM-DD */
  date: string;
  /** Etiqueta opcional, ej. "Sábado 15 Mar" */
  label?: string;
  players: FechaPlayer[];
}
