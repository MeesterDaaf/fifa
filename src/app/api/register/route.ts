import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateInviteCode } from "@/lib/invite";

export async function POST(req: Request) {
  try {
    const { name, email, password, inviteCode } = await req.json();

    // Valideer invite code
    const valid = await validateInviteCode(inviteCode);
    if (!valid) {
      return NextResponse.json(
        { error: "Ongeldige uitnodigingslink. Vraag de admin om een nieuwe link." },
        { status: 403 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Alle velden zijn verplicht" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Wachtwoord moet minimaal 6 tekens zijn" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Dit e-mailadres is al in gebruik" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}
