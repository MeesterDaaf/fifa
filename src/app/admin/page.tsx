import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateShort, getFlag } from "@/lib/utils";
import AdminSyncButton from "@/components/AdminSyncButton";
import AdminMatchForm from "@/components/AdminMatchForm";
import AdminTournamentForm from "@/components/AdminTournamentForm";
import AdminInvitePanel from "@/components/AdminInvitePanel";
import { headers } from "next/headers";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.isAdmin) redirect("/");

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${proto}://${host}`;

  const matches = await prisma.match.findMany({
    orderBy: { scheduledAt: "asc" },
    include: {
      _count: { select: { predictions: true } },
    },
  });

  const tournamentResult = await prisma.tournamentResult.findUnique({
    where: { id: "singleton" },
  });

  const totalUsers = await prisma.user.count({ where: { isAdmin: false } });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">⚙️ Admin Panel</h1>
      <p className="text-gray-500 text-sm mb-6">{totalUsers} deelnemers geregistreerd</p>

      {/* Vrienden uitnodigen */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">👥 Vrienden uitnodigen</h2>
        <AdminInvitePanel baseUrl={baseUrl} />
      </section>

      {/* Sync sectie */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">🔄 Wedstrijden synchroniseren</h2>
        <p className="text-gray-500 text-sm mb-4">
          Haal de laatste wedstrijden op van football-data.org. Vereist een geldige API key in .env.
        </p>
        <AdminSyncButton />
      </section>

      {/* Toernooi resultaat */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🥇 Toernooi resultaat</h2>
        <AdminTournamentForm existing={tournamentResult?.topScorer ?? null} />
      </section>

      {/* Wedstrijden beheren */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          ⚽ Wedstrijden ({matches.length})
        </h2>
        <div className="space-y-3">
          {matches.length === 0 && (
            <p className="text-gray-500 text-sm">Nog geen wedstrijden. Synchroniseer eerst.</p>
          )}
          {matches.map((match) => (
            <details key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-xl">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {getFlag(match.homeTeamCode)} {match.homeTeamCode}
                  </span>
                  {match.status === "FINISHED" ? (
                    <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {match.homeScore}-{match.awayScore}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">vs</span>
                  )}
                  <span className="text-sm font-semibold text-gray-800">
                    {match.awayTeamCode} {getFlag(match.awayTeamCode)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">{formatDateShort(match.scheduledAt)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    match.status === "FINISHED" ? "bg-gray-100 text-gray-600" :
                    match.status === "IN_PLAY" ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {match.status === "FINISHED" ? "Afgelopen" :
                     match.status === "IN_PLAY" ? "Live" : "Gepland"}
                  </span>
                  <span className="text-xs text-gray-400">👥 {match._count.predictions}</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                <AdminMatchForm
                  matchId={match.id}
                  current={{
                    homeScore: match.homeScore,
                    awayScore: match.awayScore,
                    firstYellowCardMinute: match.firstYellowCardMinute,
                    firstGoalMinute: match.firstGoalMinute,
                    status: match.status,
                  }}
                />
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
