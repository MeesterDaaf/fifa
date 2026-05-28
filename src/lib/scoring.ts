import { prisma } from "./prisma";

// Puntensysteem:
// Exacte uitslag: 5 punten
// Juiste winnaar/verliezer/gelijkspel: 2 punten
// Dichtstbijzijnde gele kaart minuut: 3 bonuspunten (alleen 1 winnaar)
// Dichtstbijzijnde doelpunt minuut: 3 bonuspunten (alleen 1 winnaar)

function getResult(home: number, away: number): "HOME" | "DRAW" | "AWAY" {
  if (home > away) return "HOME";
  if (home < away) return "AWAY";
  return "DRAW";
}

export async function calculateMatchPoints(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { predictions: true },
  });

  if (!match || match.homeScore === null || match.awayScore === null) return;

  const actualResult = getResult(match.homeScore, match.awayScore);

  // Bereken score- en resultaatpunten per voorspelling
  const predictions = match.predictions.map((pred) => {
    let pointsScore = 0;

    if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) {
      pointsScore = 5; // Exacte uitslag
    } else if (getResult(pred.homeScore, pred.awayScore) === actualResult) {
      pointsScore = 2; // Juiste uitkomst
    }

    return { ...pred, pointsScore };
  });

  // Bereken bonuspunten gele kaart (dichtstbijzijnde)
  const yellowPreds = predictions.filter(
    (p) => p.firstYellowCardMinute !== null
  );
  let yellowBonusWinner: string | null = null;

  if (match.firstYellowCardMinute !== null && yellowPreds.length > 0) {
    let minDiff = Infinity;
    for (const p of yellowPreds) {
      const diff = Math.abs((p.firstYellowCardMinute ?? 0) - match.firstYellowCardMinute);
      if (diff < minDiff) minDiff = diff;
    }
    const winners = yellowPreds.filter(
      (p) =>
        Math.abs((p.firstYellowCardMinute ?? 0) - match.firstYellowCardMinute!) === minDiff
    );
    if (winners.length === 1) yellowBonusWinner = winners[0].id;
  }

  // Bereken bonuspunten eerste doelpunt (dichtstbijzijnde)
  const goalPreds = predictions.filter((p) => p.firstGoalMinute !== null);
  let goalBonusWinner: string | null = null;

  if (match.firstGoalMinute !== null && goalPreds.length > 0) {
    let minDiff = Infinity;
    for (const p of goalPreds) {
      const diff = Math.abs((p.firstGoalMinute ?? 0) - match.firstGoalMinute);
      if (diff < minDiff) minDiff = diff;
    }
    const winners = goalPreds.filter(
      (p) =>
        Math.abs((p.firstGoalMinute ?? 0) - match.firstGoalMinute!) === minDiff
    );
    if (winners.length === 1) goalBonusWinner = winners[0].id;
  }

  // Sla punten op
  const now = new Date();
  for (const pred of predictions) {
    const pointsYellow = pred.id === yellowBonusWinner ? 3 : 0;
    const pointsGoalMinute = pred.id === goalBonusWinner ? 3 : 0;
    const totalPoints = pred.pointsScore + pointsYellow + pointsGoalMinute;

    await prisma.prediction.update({
      where: { id: pred.id },
      data: {
        pointsScore: pred.pointsScore,
        pointsYellow,
        pointsGoalMinute,
        totalPoints,
        calculatedAt: now,
      },
    });
  }
}

export async function calculateTournamentPoints(actualTopScorer: string) {
  const preds = await prisma.tournamentPrediction.findMany();

  for (const pred of preds) {
    const points =
      pred.topScorer.toLowerCase().trim() === actualTopScorer.toLowerCase().trim()
        ? 10
        : 0;
    await prisma.tournamentPrediction.update({
      where: { id: pred.id },
      data: { points },
    });
  }
}

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    select: {
      id: true,
      name: true,
      predictions: {
        select: { totalPoints: true },
      },
      tournamentPrediction: {
        select: { points: true },
      },
    },
  });

  return users
    .map((user) => {
      const matchPoints = user.predictions.reduce((sum, p) => sum + p.totalPoints, 0);
      const tournamentPoints = user.tournamentPrediction?.points ?? 0;
      return {
        id: user.id,
        name: user.name,
        matchPoints,
        tournamentPoints,
        totalPoints: matchPoints + tournamentPoints,
        predictionsCount: user.predictions.length,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);
}
