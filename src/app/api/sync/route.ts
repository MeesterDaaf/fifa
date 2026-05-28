import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMatches, mapStatus } from "@/lib/football-api";

// Sync wedstrijddata vanuit football-data.org naar de database
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const apiMatches = await getMatches();
    let synced = 0;

    for (const m of apiMatches) {
      // Sla wedstrijden over waarbij teams nog niet bekend zijn (knock-out fase placeholders)
      if (!m.homeTeam?.name || !m.awayTeam?.name) continue;

      const homeTeamCode = m.homeTeam.tla || m.homeTeam.name.slice(0, 3).toUpperCase();
      const awayTeamCode = m.awayTeam.tla || m.awayTeam.name.slice(0, 3).toUpperCase();

      await prisma.match.upsert({
        where: { externalId: m.id },
        create: {
          externalId: m.id,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          homeTeamCode,
          awayTeamCode,
          scheduledAt: new Date(m.utcDate),
          stage: m.stage,
          matchGroup: m.group,
          status: mapStatus(m.status),
          homeScore: m.score.fullTime.home,
          awayScore: m.score.fullTime.away,
        },
        update: {
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          homeTeamCode,
          awayTeamCode,
          scheduledAt: new Date(m.utcDate),
          stage: m.stage,
          matchGroup: m.group,
          status: mapStatus(m.status),
          homeScore: m.score.fullTime.home,
          awayScore: m.score.fullTime.away,
        },
      });
      synced++;
    }

    return NextResponse.json({ synced, message: `${synced} wedstrijden gesynchroniseerd` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
