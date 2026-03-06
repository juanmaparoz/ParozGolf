/** Número de hoyo: 1 a 18 */
export type HoleNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;

/** Índice de handicap del hoyo: 1 (más difícil) a 18 (más fácil) */
export type HandicapIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;

export interface Hole {
  number: HoleNumber;
  par: number;
  handicapIndex: HandicapIndex;
}
