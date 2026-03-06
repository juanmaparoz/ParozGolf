"use client";

import { useState, useCallback, useEffect } from "react";
import { getScores, setScores as persistScores, type ScoresMap } from "./scores-store";

/** Scores por fecha (mismo store que antes, key = fechaId) */
export function useFechaScores(fechaId: string) {
  const [scores, setScoresState] = useState<ScoresMap>({});

  useEffect(() => {
    setScoresState(getScores(fechaId));
  }, [fechaId]);

  const setScores = useCallback(
    (updater: ScoresMap | ((prev: ScoresMap) => ScoresMap)) => {
      setScoresState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persistScores(fechaId, next);
        return next;
      });
    },
    [fechaId]
  );
  return [scores, setScores] as const;
}
