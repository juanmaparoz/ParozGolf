"use client";

import { useState, useCallback, useEffect } from "react";
import type { Tournament, TournamentStatus } from "@/types/tournament";
import {
  getAllTournaments,
  saveTournament as persistTournament,
  updateTournamentStatus as persistStatus,
  type CreateTournamentInput,
} from "./tournaments-store";

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, TournamentStatus>>({});

  const refresh = useCallback(() => {
    const list = getAllTournaments();
    setTournaments(
      list.map((t) => ({ ...t, status: statusOverrides[t.id] ?? t.status }))
    );
  }, [statusOverrides]);

  useEffect(() => {
    const list = getAllTournaments();
    setTournaments(
      list.map((t) => ({ ...t, status: statusOverrides[t.id] ?? t.status }))
    );
  }, [statusOverrides]);

  const saveTournament = useCallback((input: CreateTournamentInput) => {
    const created = persistTournament(input);
    const list = getAllTournaments();
    setTournaments(
      list.map((t) => ({ ...t, status: statusOverrides[t.id] ?? t.status }))
    );
    return created;
  }, [statusOverrides]);

  const setTournamentStatus = useCallback((id: string, status: TournamentStatus) => {
    persistStatus(id, status);
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
  }, []);

  return { tournaments, saveTournament, setTournamentStatus, refresh };
}
