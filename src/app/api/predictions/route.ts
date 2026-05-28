import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");

  const where = matchId
    ? { userId: session.user.id, matchId }
    : { userId: session.user.id };

  const predictions = await prisma.prediction.findMany({ where });
  return NextResponse.json(predictions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await req.json();
  const { matchId, homeScore, awayScore, firstYellowCardMinute, firstGoalMinute } = body;

  if (!matchId || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ error: "Ontbrekende velden" }, { status: 400 });
  }

  // Controleer of wedstrijd al begonnen is
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: "Wedstrijd niet gevonden" }, { status: 404 });

  if (match.status !== "SCHEDULED") {
    return NextResponse.json(
      { error: "Voorspelling is gesloten (wedstrijd al gestart)" },
      { status: 400 }
    );
  }

  const now = new Date();
  const matchTime = new Date(match.scheduledAt);
  if (now >= matchTime) {
    return NextResponse.json(
      { error: "Voorspelling is gesloten (wedstrijd al begonnen)" },
      { status: 400 }
    );
  }

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    create: {
      userId: session.user.id,
      matchId,
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
      firstYellowCardMinute: firstYellowCardMinute ? parseInt(firstYellowCardMinute) : null,
      firstGoalMinute: firstGoalMinute ? parseInt(firstGoalMinute) : null,
    },
    update: {
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
      firstYellowCardMinute: firstYellowCardMinute ? parseInt(firstYellowCardMinute) : null,
      firstGoalMinute: firstGoalMinute ? parseInt(firstGoalMinute) : null,
    },
  });

  return NextResponse.json(prediction);
}
