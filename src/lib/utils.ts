import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMatchResult(home: number, away: number): "W" | "G" | "V" {
  if (home > away) return "W";
  if (home < away) return "V";
  return "G";
}

export const FLAG_EMOJI: Record<string, string> = {
  NED: "🇳🇱", BEL: "🇧🇪", GER: "🇩🇪", FRA: "🇫🇷", ESP: "🇪🇸",
  POR: "🇵🇹", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ITA: "🇮🇹", ARG: "🇦🇷", BRA: "🇧🇷",
  USA: "🇺🇸", MEX: "🇲🇽", CAN: "🇨🇦", MAR: "🇲🇦", SEN: "🇸🇳",
  GHA: "🇬🇭", NGA: "🇳🇬", JPN: "🇯🇵", KOR: "🇰🇷", AUS: "🇦🇺",
  URU: "🇺🇾", COL: "🇨🇴", CHI: "🇨🇱", ECU: "🇪🇨", PER: "🇵🇪",
  SUI: "🇨🇭", DEN: "🇩🇰", SWE: "🇸🇪", NOR: "🇳🇴", POL: "🇵🇱",
  CRO: "🇭🇷", SRB: "🇷🇸", TUR: "🇹🇷", GRE: "🇬🇷", UKR: "🇺🇦",
  IRN: "🇮🇷", SAU: "🇸🇦", QAT: "🇶🇦", EGY: "🇪🇬", TUN: "🇹🇳",
};

export function getFlag(code: string): string {
  return FLAG_EMOJI[code] ?? "🏳️";
}
