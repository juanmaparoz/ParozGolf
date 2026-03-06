"use client";

import { useState, useCallback, useEffect } from "react";
import type { Fecha } from "@/types/fecha";
import {
  getFechas,
  addFecha as persistAdd,
  duplicateLastFecha as persistDuplicate,
  getFecha,
  updateFechaPlayers as persistUpdatePlayers,
  type CreateFechaInput,
} from "./fechas-store";
import type { FechaPlayer } from "@/types/fecha";

export function useFechas(leagueId: string | null) {
  const [fechas, setFechas] = useState<Fecha[]>([]);

  const refresh = useCallback(() => {
    if (leagueId) setFechas(getFechas(leagueId));
    else setFechas([]);
  }, [leagueId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addFecha = useCallback(
    (input: CreateFechaInput) => {
      const created = persistAdd(input);
      refresh();
      return created;
    },
    [refresh]
  );

  const duplicateLastFecha = useCallback(
    (newDate: string, newLabel?: string) => {
      if (!leagueId) return null;
      const created = persistDuplicate(leagueId, newDate, newLabel);
      refresh();
      return created;
    },
    [leagueId, refresh]
  );

  const getFechaById = useCallback(
    (fechaId: string): Fecha | null => {
      if (!leagueId) return null;
      return getFecha(leagueId, fechaId);
    },
    [leagueId]
  );

  const updateFechaPlayers = useCallback(
    (fechaId: string, players: FechaPlayer[]) => {
      if (!leagueId) return false;
      const ok = persistUpdatePlayers(leagueId, fechaId, players);
      refresh();
      return ok;
    },
    [leagueId, refresh]
  );

  return {
    fechas,
    addFecha,
    duplicateLastFecha,
    getFechaById,
    updateFechaPlayers,
    refresh,
  };
}
