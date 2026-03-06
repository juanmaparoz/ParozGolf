export interface LeagueRules {
  use85Percent: boolean;
  use100Percent: boolean;
  useMatchInternal: boolean;
}

export interface League {
  id: string;
  name: string;
  courseId: string;
  rules: LeagueRules;
}
