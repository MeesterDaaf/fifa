import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeaderboard } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";

export default async function RanglijstPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const leaderboard = await getLeaderboard();
  const totalMatches = await prisma.match.count({ where: { status: "FINISHED" } });

  const myPos = leaderboard.findIndex((e) => e.id === session.user.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">📊 Ranglijst</h1>
      <p className="text-gray-500 text-sm mb-6">
        {totalMatches} wedstrijd{totalMatches !== 1 ? "en" : ""} afgespeeld
      </p>

      {/* Jouw positie */}
      {myPos >= 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-700">
            Jij staat <strong>#{myPos + 1}</strong> van de {leaderboard.length} deelnemers
            met <strong>{leaderboard[myPos].totalPoints} punten</strong>
          </p>
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-gray-500">Nog geen deelnemers of punten</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="w-7">#</span>
            <span className="flex-1">Naam</span>
            <span className="w-16 text-right">Wedstr.</span>
            <span className="w-16 text-right">Toern.</span>
            <span className="w-16 text-right font-bold text-gray-700">Totaal</span>
          </div>

          {leaderboard.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 transition-colors ${
                entry.id === session.user.id ? "bg-green-50" : "hover:bg-gray-50"
              }`}
            >
              {/* Positie */}
              <div className="w-7 flex-shrink-0">
                {i < 3 ? (
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? "bg-yellow-400 text-yellow-900" :
                    i === 1 ? "bg-gray-300 text-gray-700" :
                    "bg-orange-300 text-orange-900"
                  }`}>
                    {i + 1}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500 font-medium pl-1">{i + 1}</span>
                )}
              </div>

              {/* Naam */}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-800 text-sm truncate block">
                  {entry.name}
                  {entry.id === session.user.id && (
                    <span className="text-green-600 text-xs ml-1">(jij)</span>
                  )}
                </span>
                <span className="text-xs text-gray-400">
                  {entry.predictionsCount} voorspelling{entry.predictionsCount !== 1 ? "en" : ""}
                </span>
              </div>

              {/* Match punten */}
              <span className="w-16 text-right text-sm text-gray-600">
                {entry.matchPoints}pt
              </span>

              {/* Toernooi punten */}
              <span className="w-16 text-right text-sm text-gray-600">
                {entry.tournamentPoints}pt
              </span>

              {/* Totaal */}
              <span className={`w-16 text-right font-bold text-base ${
                i === 0 ? "text-yellow-600" : "text-green-700"
              }`}>
                {entry.totalPoints}pt
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Puntensysteem legenda */}
      <div className="mt-8 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm">📋 Puntensysteem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-base">⚽</span>
            <div>
              <p className="font-medium">Exacte uitslag</p>
              <p className="text-gray-400">5 punten</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-base">✅</span>
            <div>
              <p className="font-medium">Juiste winnaar/gelijkspel</p>
              <p className="text-gray-400">2 punten</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-base">🕐</span>
            <div>
              <p className="font-medium">Dichtstbijzijnde 1e doelpunt</p>
              <p className="text-gray-400">+3 bonuspunten</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-base">🟨</span>
            <div>
              <p className="font-medium">Dichtstbijzijnde 1e gele kaart</p>
              <p className="text-gray-400">+3 bonuspunten</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-base">🥇</span>
            <div>
              <p className="font-medium">Juiste topscorer WK</p>
              <p className="text-gray-400">10 punten</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
