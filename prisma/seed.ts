import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@fifa2026.nl";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const password = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password,
        isAdmin: true,
      },
    });
    console.log("✅ Admin account aangemaakt:");
    console.log("   Email:      admin@fifa2026.nl");
    console.log("   Wachtwoord: admin123");
    console.log("   ⚠️  Verander het wachtwoord na eerste login!");
  } else {
    console.log("ℹ️  Admin account bestaat al");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
