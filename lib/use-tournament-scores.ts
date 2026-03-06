"use client";

import { useState, useCallback, useEffect } from "react";
import { getScores, setScores as persistScores, type ScoresMap } from "./scores-store";

export function useTournamentScores(tournamentId: string) {
  const [scores, setScoresState] = useState<ScoresMap>({});

  useEffect(() => {
    setScoresState(getScores(tournamentId));
  }, [tournamentId]);

  const setScores = useCallback(
    (updater: ScoresMap | ((prev: ScoresMap) => ScoresMap)) => {
      setScoresState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persistScores(tournamentId, next);
        return next;
      });
    },
    [tournamentId]
  );
  return [scores, setScores] as const;
}
