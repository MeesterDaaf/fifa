import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateTournamentPoints } from "@/lib/scoring";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { topScorer } = await req.json();
  if (!topScorer) return NextResponse.json({ error: "topScorer verplicht" }, { status: 400 });

  await prisma.tournamentResult.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", topScorer, updatedAt: new Date() },
    update: { topScorer, updatedAt: new Date() },
  });

  await calculateTournamentPoints(topScorer);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const result = await prisma.tournamentResult.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(result);
}
