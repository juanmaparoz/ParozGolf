"use client";

import { useState, useCallback, useEffect } from "react";
import type { League } from "@/types/league";
import {
  getAllLeagues,
  getActiveLeague,
  getActiveLeagueId,
  setActiveLeagueId as persistActiveId,
  createLeague as persistLeague,
  startNewLeague as persistStartNew,
  type CreateLeagueInput,
} from "./league-store";

export function useLeague() {
  const [league, setLeague] = useState<League | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);

  const refresh = useCallback(() => {
    setLeagues(getAllLeagues());
    setLeague(getActiveLeague());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setActiveLeagueId = useCallback((id: string) => {
    persistActiveId(id);
    setLeague(getActiveLeague());
    setLeagues(getAllLeagues());
  }, []);

  const createLeague = useCallback((input: CreateLeagueInput) => {
    const created = persistLeague(input);
    refresh();
    return created;
  }, [refresh]);

  const startNewLeague = useCallback((input: CreateLeagueInput) => {
    const created = persistStartNew(input);
    refresh();
    return created;
  }, [refresh]);

  const activeLeagueId = getActiveLeagueId();

  return {
    league,
    leagues,
    activeLeagueId,
    setActiveLeagueId,
    createLeague,
    startNewLeague,
    refresh,
  };
}
