import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, getFlag } from "@/lib/utils";
import PredictionForm from "@/components/PredictionForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WedstrijdPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) notFound();

  const myPrediction = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId: session.user.id, matchId: id } },
  });

  // Alle voorspellingen van anderen als wedstrijd voorbij is
  const allPredictions =
    match.status === "FINISHED"
      ? await prisma.prediction.findMany({
          where: { matchId: id },
          include: { user: { select: { name: true } } },
          orderBy: { totalPoints: "desc" },
        })
      : [];

  const now = new Date();
  const isOpen = match.status === "SCHEDULED" && now < new Date(match.scheduledAt);
  const isFinished = match.status === "FINISHED";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Wedstrijd header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white mb-6">
        <div className="text-sm text-green-200 mb-3">{formatDate(match.scheduledAt)}</div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="text-4xl mb-1">{getFlag(match.homeTeamCode)}</div>
            <div className="font-bold text-lg">{match.homeTeamCode}</div>
            <div className="text-green-200 text-xs">{match.homeTeam}</div>
          </div>

          {isFinished ? (
            <div className="text-center">
              <div className="text-4xl font-black">
                {match.homeScore} - {match.awayScore}
              </div>
              <div className="text-green-300 text-xs mt-1">Eindstand</div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-green-300">VS</div>
          )}

          <div className="flex-1 text-center">
            <div className="text-4xl mb-1">{getFlag(match.awayTeamCode)}</div>
            <div className="font-bold text-lg">{match.awayTeamCode}</div>
            <div className="text-green-200 text-xs">{match.awayTeam}</div>
          </div>
        </div>

        {match.matchGroup && (
          <div className="text-center text-green-300 text-xs mt-3">Groep {match.matchGroup}</div>
        )}

        {isFinished && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
            {match.firstGoalMinute !== null && (
              <div className="bg-white/10 rounded-lg py-2">
                <div className="text-white font-bold">{match.firstGoalMinute}&apos;</div>
                <div className="text-green-300 text-xs">1e doelpunt</div>
              </div>
            )}
            {match.firstYellowCardMinute !== null && (
              <div className="bg-white/10 rounded-lg py-2">
                <div className="text-yellow-300 font-bold">{match.firstYellowCardMinute}&apos;</div>
                <div className="text-green-300 text-xs">1e gele kaart 🟨</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Puntensysteem uitleg */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-semibold mb-1">🎯 Puntensysteem</p>
        <ul className="space-y-0.5 text-xs text-blue-700">
          <li>⚽ Exacte uitslag: <strong>5 punten</strong></li>
          <li>✅ Juiste winnaar/gelijkspel: <strong>2 punten</strong></li>
          <li>🕐 Dichtstbijzijnde 1e doelpuntminuut: <strong>+3 bonuspunten</strong></li>
          <li>🟨 Dichtstbijzijnde 1e gele kaart minuut: <strong>+3 bonuspunten</strong></li>
        </ul>
      </div>

      {/* Voorspelformulier */}
      {isOpen && (
        <PredictionForm
          matchId={id}
          homeTeam={match.homeTeamCode}
          awayTeam={match.awayTeamCode}
          existing={
            myPrediction
              ? {
                  homeScore: myPrediction.homeScore,
                  awayScore: myPrediction.awayScore,
                  firstYellowCardMinute: myPrediction.firstYellowCardMinute,
                  firstGoalMinute: myPrediction.firstGoalMinute,
                }
              : null
          }
        />
      )}

      {!isOpen && !isFinished && (
        <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-500 text-sm">
          ⏸️ Voorspelling gesloten — wedstrijd is gestart
        </div>
      )}

      {myPrediction && !isOpen && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-semibold text-gray-700 mb-3">Jouw voorspelling</h3>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-bold text-gray-800">{match.homeTeamCode}</span>
              <span className="mx-2 text-xl font-black text-green-700">
                {myPrediction.homeScore} - {myPrediction.awayScore}
              </span>
              <span className="font-bold text-gray-800">{match.awayTeamCode}</span>
            </div>
            {isFinished && (
              <span className="text-green-700 font-bold text-lg">
                {myPrediction.totalPoints} pt
              </span>
            )}
          </div>
          {myPrediction.firstGoalMinute !== null && (
            <p className="text-xs text-gray-500 mt-1">
              1e doelpunt: minuut {myPrediction.firstGoalMinute}
            </p>
          )}
          {myPrediction.firstYellowCardMinute !== null && (
            <p className="text-xs text-gray-500">
              1e gele kaart: minuut {myPrediction.firstYellowCardMinute}
            </p>
          )}
          {isFinished && myPrediction.totalPoints > 0 && (
            <div className="mt-2 text-xs text-gray-500 space-y-0.5">
              <p>Score punten: {myPrediction.pointsScore}pt</p>
              {myPrediction.pointsYellow > 0 && <p>🟨 Bonus gele kaart: +{myPrediction.pointsYellow}pt</p>}
              {myPrediction.pointsGoalMinute > 0 && <p>⚽ Bonus doelpuntminuut: +{myPrediction.pointsGoalMinute}pt</p>}
            </div>
          )}
        </div>
      )}

      {/* Alle voorspellingen na afloop */}
      {isFinished && allPredictions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-700">
            📋 Alle voorspellingen
          </div>
          {allPredictions.map((pred, i) => (
            <div
              key={pred.id}
              className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${
                pred.userId === session.user.id ? "bg-green-50" : ""
              }`}
            >
              <span className="text-sm text-gray-400 w-5">{i + 1}</span>
              <span className="flex-1 text-sm font-medium text-gray-800">
                {pred.user.name}
                {pred.userId === session.user.id && (
                  <span className="text-green-600 text-xs ml-1">(jij)</span>
                )}
              </span>
              <span className="text-sm font-mono text-gray-700">
                {pred.homeScore}-{pred.awayScore}
              </span>
              {pred.firstGoalMinute !== null && (
                <span className="text-xs text-gray-500">⚽{pred.firstGoalMinute}&apos;</span>
              )}
              {pred.firstYellowCardMinute !== null && (
                <span className="text-xs text-gray-500">🟨{pred.firstYellowCardMinute}&apos;</span>
              )}
              <span className="font-bold text-green-700 w-12 text-right">{pred.totalPoints}pt</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
