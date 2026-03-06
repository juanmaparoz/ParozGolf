export interface MatchResult {
  player1Id: string;
  player2Id: string;
  player1HolesWon: number;
  player2HolesWon: number;
  /** null si empate */
  winnerId: string | null;
}
