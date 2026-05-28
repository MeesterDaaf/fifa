const BASE_URL = process.env.FOOTBALL_API_BASE || "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_API_KEY || "";
const COMPETITION_ID = process.env.FOOTBALL_COMPETITION_ID || "WC";

async function fetchApi(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "X-Auth-Token": API_KEY },
    next: { revalidate: 300 }, // 5 minuten cache
  });

  if (!res.ok) {
    throw new Error(`Football API fout: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: { id: number; name: string; shortName: string; tla: string };
  awayTeam: { id: number; name: string; shortName: string; tla: string };
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
  };
}

export async function getMatches(): Promise<ApiMatch[]> {
  const data = await fetchApi(`/competitions/${COMPETITION_ID}/matches`);
  return data.matches ?? [];
}

export async function getMatch(matchId: number): Promise<ApiMatch> {
  const data = await fetchApi(`/matches/${matchId}`);
  return data;
}

export async function getScorers() {
  const data = await fetchApi(`/competitions/${COMPETITION_ID}/scorers?limit=20`);
  return data.scorers ?? [];
}

export function mapStatus(apiStatus: string): string {
  switch (apiStatus) {
    case "FINISHED": return "FINISHED";
    case "IN_PLAY":
    case "PAUSED": return "IN_PLAY";
    default: return "SCHEDULED";
  }
}
