import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, getFlag } from "@/lib/utils";

export default async function VoorspellingenPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const matches = await prisma.match.findMany({
    orderBy: { scheduledAt: "asc" },
  });

  const myPredictions = await prisma.prediction.findMany({
    where: { userId: session.user.id },
    select: { matchId: true, homeScore: true, awayScore: true },
  });

  const predMap = new Map(myPredictions.map((p) => [p.matchId, p]));
  const now = new Date();

  // Groepeer op stage
  const byStage: Record<string, typeof matches> = {};
  for (const match of matches) {
    const key = match.stage;
    if (!byStage[key]) byStage[key] = [];
    byStage[key].push(match);
  }

  function stageLabel(stage: string): string {
    const labels: Record<string, string> = {
      GROUP_STAGE: "Groepsfase",
      LAST_16: "Achtste finale",
      QUARTER_FINALS: "Kwartfinale",
      SEMI_FINALS: "Halve finale",
      THIRD_PLACE: "Derde plaats",
      FINAL: "Finale",
    };
    return labels[stage] ?? stage;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">⚽ Wedstrijden &amp; Voorspellingen</h1>

      {matches.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">Nog geen wedstrijden geladen.</p>
          <p className="text-gray-400 text-sm mt-1">Vraag de admin om wedstrijden te synchroniseren.</p>
        </div>
      )}

      {Object.entries(byStage).map(([stage, stageMatches]) => (
        <section key={stage} className="mb-8">
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {stageLabel(stage)}
          </h2>
          <div className="space-y-2">
            {stageMatches.map((match) => {
              const pred = predMap.get(match.id);
              const isOpen = match.status === "SCHEDULED" && now < new Date(match.scheduledAt);
              const isPast = match.status === "FINISHED";

              return (
                <Link
                  key={match.id}
                  href={`/voorspellingen/${match.id}`}
                  className={`block bg-white rounded-xl px-4 py-3 shadow-sm border transition-all ${
                    isOpen
                      ? "border-gray-100 hover:border-green-300 hover:shadow-md"
                      : "border-gray-100 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Teams en score */}
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800 min-w-[60px]">
                        {getFlag(match.homeTeamCode)} {match.homeTeamCode}
                      </span>

                      {isPast ? (
                        <span className="bg-gray-800 text-white text-sm font-bold px-3 py-1 rounded-lg">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-lg">
                          vs
                        </span>
                      )}

                      <span className="text-sm font-semibold text-gray-800 min-w-[60px] text-right">
                        {match.awayTeamCode} {getFlag(match.awayTeamCode)}
                      </span>
                    </div>

                    {/* Status / voorspelling */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-400">{formatDate(match.scheduledAt)}</div>
                      {pred ? (
                        <span className="text-xs text-green-600 font-medium">
                          ✅ {pred.homeScore}-{pred.awayScore}
                        </span>
                      ) : isOpen ? (
                        <span className="text-xs text-orange-500 font-medium">⏳ Voorspel</span>
                      ) : (
                        <span className="text-xs text-gray-400">Gesloten</span>
                      )}
                    </div>
                  </div>

                  {match.matchGroup && (
                    <div className="mt-1 text-xs text-gray-400">Groep {match.matchGroup}</div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
