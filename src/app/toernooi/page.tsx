import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TournamentForm from "@/components/TournamentForm";

export default async function ToernooiPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const myPrediction = await prisma.tournamentPrediction.findUnique({
    where: { userId: session.user.id },
  });

  const tournamentResult = await prisma.tournamentResult.findUnique({
    where: { id: "singleton" },
  });

  // Top scorers van alle deelnemers voor inspiratie
  const allPredictions = await prisma.tournamentPrediction.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { topScorer: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">🏆 Toernooi Voorspelling</h1>
      <p className="text-gray-500 text-sm mb-6">Voorspel de topscorer van het WK 2026. Juiste naam = 10 punten!</p>

      {/* Puntensysteem */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="font-semibold text-blue-800 text-sm mb-2">🎯 Toernooi punten</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>🥇 Juiste topscorer: <strong>10 punten</strong></li>
        </ul>
      </div>

      {/* Officiële topscorer (als bekend) */}
      {tournamentResult?.topScorer && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-yellow-800">
            🥇 Officiële topscorer: <span className="text-yellow-900">{tournamentResult.topScorer}</span>
          </p>
          {myPrediction && (
            <p className="text-xs text-yellow-700 mt-1">
              Jouw voorspelling: {myPrediction.topScorer} —{" "}
              <strong>{myPrediction.points > 0 ? `+${myPrediction.points} punten! 🎉` : "Helaas, geen punten"}</strong>
            </p>
          )}
        </div>
      )}

      {/* Formulier */}
      <TournamentForm existing={myPrediction?.topScorer ?? null} />

      {/* Overzicht alle voorspellingen */}
      {allPredictions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            👥 Voorspellingen van iedereen
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {allPredictions.map((pred) => (
              <div
                key={pred.id}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${
                  pred.userId === session.user.id ? "bg-green-50" : ""
                }`}
              >
                <span className="flex-1 text-sm font-medium text-gray-800">
                  {pred.user.name}
                  {pred.userId === session.user.id && (
                    <span className="text-green-600 text-xs ml-1">(jij)</span>
                  )}
                </span>
                <span className="text-sm text-gray-600">{pred.topScorer}</span>
                {tournamentResult?.topScorer && (
                  <span className={`text-xs font-bold ${pred.points > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {pred.points > 0 ? `+${pred.points}pt 🎉` : "0pt"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
