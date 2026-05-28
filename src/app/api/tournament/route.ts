import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const pred = await prisma.tournamentPrediction.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json(pred);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { topScorer } = await req.json();

  if (!topScorer?.trim()) {
    return NextResponse.json({ error: "Topscorer is verplicht" }, { status: 400 });
  }

  const pred = await prisma.tournamentPrediction.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, topScorer: topScorer.trim() },
    update: { topScorer: topScorer.trim() },
  });

  return NextResponse.json(pred);
}
