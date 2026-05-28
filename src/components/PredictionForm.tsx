"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Existing {
  homeScore: number;
  awayScore: number;
  firstYellowCardMinute: number | null;
  firstGoalMinute: number | null;
}

interface Props {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  existing: Existing | null;
}

export default function PredictionForm({ matchId, homeTeam, awayTeam, existing }: Props) {
  const router = useRouter();
  const [homeScore, setHomeScore] = useState(existing?.homeScore?.toString() ?? "0");
  const [awayScore, setAwayScore] = useState(existing?.awayScore?.toString() ?? "0");
  const [firstGoalMinute, setFirstGoalMinute] = useState(
    existing?.firstGoalMinute?.toString() ?? ""
  );
  const [firstYellowMinute, setFirstYellowMinute] = useState(
    existing?.firstYellowCardMinute?.toString() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        firstGoalMinute: firstGoalMinute ? parseInt(firstGoalMinute) : null,
        firstYellowCardMinute: firstYellowMinute ? parseInt(firstYellowMinute) : null,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Er ging iets mis");
    } else {
      setSuccess(true);
      router.refresh();
    }
  }

  function ScoreInput({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
  }) {
    return (
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-600 mb-2">{label}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, parseInt(value || "0") - 1).toString())}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg transition-colors"
          >
            −
          </button>
          <input
            type="number"
            min="0"
            max="20"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-14 h-14 text-center text-2xl font-black border-2 border-gray-200 focus:border-green-500 rounded-xl focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onChange((parseInt(value || "0") + 1).toString())}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg transition-colors"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
      <h2 className="text-lg font-bold text-gray-800 mb-5">
        {existing ? "✏️ Voorspelling aanpassen" : "✏️ Jouw voorspelling"}
      </h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm font-medium">
          ✅ Voorspelling opgeslagen!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Score */}
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Eindstand</p>
          <div className="flex items-center justify-center gap-6">
            <ScoreInput value={homeScore} onChange={setHomeScore} label={homeTeam} />
            <div className="text-3xl font-black text-gray-300 mb-2">-</div>
            <ScoreInput value={awayScore} onChange={setAwayScore} label={awayTeam} />
          </div>
        </div>

        {/* Bonus voorspellingen */}
        <div className="border-t pt-5 space-y-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Bonus voorspellingen (optioneel)
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ⚽ Minuut eerste doelpunt
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={firstGoalMinute}
                onChange={(e) => setFirstGoalMinute(e.target.value)}
                className="w-28 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-lg font-bold"
                placeholder="45"
              />
              <span className="text-gray-500 text-sm">&apos; (1-120)</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Dichtstbijzijnde krijgt 3 bonuspunten</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              🟨 Minuut eerste gele kaart
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={firstYellowMinute}
                onChange={(e) => setFirstYellowMinute(e.target.value)}
                className="w-28 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-lg font-bold"
                placeholder="30"
              />
              <span className="text-gray-500 text-sm">&apos; (1-120)</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Dichtstbijzijnde krijgt 3 bonuspunten</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3.5 rounded-xl transition-colors text-base"
        >
          {loading ? "Opslaan..." : existing ? "Voorspelling bijwerken" : "Voorspelling opslaan"}
        </button>
      </form>
    </div>
  );
}
