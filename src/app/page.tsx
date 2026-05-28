import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLeaderboard } from "@/lib/scoring";
import Link from "next/link";
import { formatDateShort, getFlag } from "@/lib/utils";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const now = new Date();

  const upcoming = await prisma.match.findMany({
    where: { scheduledAt: { gte: now }, status: "SCHEDULED" },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  const recent = await prisma.match.findMany({
    where: { status: "FINISHED" },
    orderBy: { scheduledAt: "desc" },
    take: 5,
  });

  const myPredIds = new Set(
    (
      await prisma.prediction.findMany({
        where: {
          userId: session.user.id,
          matchId: { in: upcoming.map((m) => m.id) },
        },
        select: { matchId: true },
      })
    ).map((p) => p.matchId)
  );

  const leaderboard = (await getLeaderboard()).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welkom, {session.user.name}! 👋</h1>
        <p className="text-green-200 mt-1">FIFA Wereldkampioenschap 2026</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/voorspellingen"
            className="bg-white text-green-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-sm"
          >
            ⚽ Maak voorspelling
          </Link>
          <Link
            href="/toernooi"
            className="bg-green-600 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-500 transition-colors text-sm"
          >
            🏆 Toernooi voorspelling
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Aankomende wedstrijden */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">📅 Aankomende wedstrijden</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm bg-white rounded-xl p-4 shadow-sm">
              Geen geplande wedstrijden. Sync eerst wedstrijden via admin.
            </p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((match) => (
                <Link
                  key={match.id}
                  href={`/voorspellingen/${match.id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-semibold text-gray-800">
                        {getFlag(match.homeTeamCode)} {match.homeTeamCode}
                      </span>
                      <span className="text-gray-400 text-xs font-bold">vs</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {match.awayTeamCode} {getFlag(match.awayTeamCode)}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-500">{formatDateShort(match.scheduledAt)}</div>
                      {myPredIds.has(match.id) ? (
                        <span className="text-xs text-green-600 font-medium">✅ Voorspeld</span>
                      ) : (
                        <span className="text-xs text-orange-500 font-medium">⏳ Voorspel nog</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/voorspellingen" className="block text-center text-sm text-green-600 hover:underline py-1">
                Alle wedstrijden →
              </Link>
            </div>
          )}
        </section>

        {/* Ranglijst top 5 */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">🏆 Top 5 Ranglijst</h2>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-sm bg-white rounded-xl p-4 shadow-sm">Nog geen punten gescoord</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${
                    entry.id === session.user.id ? "bg-green-50" : ""
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i === 0 ? "bg-yellow-400 text-yellow-900" :
                    i === 1 ? "bg-gray-300 text-gray-700" :
                    i === 2 ? "bg-orange-300 text-orange-900" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium text-sm text-gray-800 truncate">
                    {entry.name}
                    {entry.id === session.user.id && (
                      <span className="text-green-600 text-xs ml-1">(jij)</span>
                    )}
                  </span>
                  <span className="font-bold text-green-700 flex-shrink-0">{entry.totalPoints}pt</span>
                </div>
              ))}
              <Link href="/ranglijst" className="block text-center text-sm text-green-600 hover:underline py-3">
                Volledige ranglijst →
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Recente uitslagen */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">🎯 Recente uitslagen</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.map((match) => (
              <div key={match.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-xs text-gray-400 mb-2">{formatDateShort(match.scheduledAt)}</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {getFlag(match.homeTeamCode)} {match.homeTeamCode}
                  </span>
                  <span className="text-lg font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                    {match.homeScore ?? "?"} - {match.awayScore ?? "?"}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {match.awayTeamCode} {getFlag(match.awayTeamCode)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
