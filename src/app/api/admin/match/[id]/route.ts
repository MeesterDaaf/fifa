import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMatchPoints } from "@/lib/scoring";

// Admin: vul uitslag en minuten in + bereken punten
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { homeScore, awayScore, firstYellowCardMinute, firstGoalMinute, status } = body;

  const match = await prisma.match.update({
    where: { id },
    data: {
      ...(homeScore !== undefined && { homeScore: parseInt(homeScore) }),
      ...(awayScore !== undefined && { awayScore: parseInt(awayScore) }),
      ...(firstYellowCardMinute !== undefined && {
        firstYellowCardMinute: firstYellowCardMinute ? parseInt(firstYellowCardMinute) : null,
      }),
      ...(firstGoalMinute !== undefined && {
        firstGoalMinute: firstGoalMinute ? parseInt(firstGoalMinute) : null,
      }),
      ...(status && { status }),
    },
  });

  // Bereken punten als wedstrijd afgelopen
  if (match.status === "FINISHED" && match.homeScore !== null && match.awayScore !== null) {
    await calculateMatchPoints(id);
  }

  return NextResponse.json(match);
}
