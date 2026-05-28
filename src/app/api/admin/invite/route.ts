import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createId } from "@/lib/invite";

// Haal huidige invite code op (of maak aan)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", inviteCode: createId(), updatedAt: new Date() },
    update: {},
  });

  return NextResponse.json({ inviteCode: settings.inviteCode });
}

// Genereer nieuwe invite code (maakt oude links ongeldig)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", inviteCode: createId(), updatedAt: new Date() },
    update: { inviteCode: createId(), updatedAt: new Date() },
  });

  return NextResponse.json({ inviteCode: settings.inviteCode });
}
