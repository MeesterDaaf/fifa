import { prisma } from "./prisma";

// Simpele unieke ID generator (geen extra dependency nodig)
export function createId(): string {
  return Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10);
}

export async function validateInviteCode(code: string): Promise<boolean> {
  if (!code) return false;
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  return settings?.inviteCode === code;
}
