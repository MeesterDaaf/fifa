"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Current {
  homeScore: number | null;
  awayScore: number | null;
  firstYellowCardMinute: number | null;
  firstGoalMinute: number | null;
  status: string;
}

export default function AdminMatchForm({
  matchId,
  current,
}: {
  matchId: string;
  current: Current;
}) {
  const router = useRouter();
  const [homeScore, setHomeScore] = useState(current.homeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(current.awayScore?.toString() ?? "");
  const [firstGoalMinute, setFirstGoalMinute] = useState(current.firstGoalMinute?.toString() ?? "");
  const [firstYellowMinute, setFirstYellowMinute] = useState(current.firstYellowCardMinute?.toString() ?? "");
  const [status, setStatus] = useState(current.status);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    setError("");

    const res = await fetch(`/api/admin/match/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeScore: homeScore !== "" ? homeScore : undefined,
        awayScore: awayScore !== "" ? awayScore : undefined,
        firstGoalMinute: firstGoalMinute || null,
        firstYellowCardMinute: firstYellowMinute || null,
        status,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Fout bij opslaan");
    }
  }

  const inputClass =
    "w-20 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-sm";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Thuis score</label>
          <input
            type="number"
            min="0"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Uit score</label>
          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">1e doelpunt (min)</label>
          <input
            type="number"
            min="1"
            max="120"
            value={firstGoalMinute}
            onChange={(e) => setFirstGoalMinute(e.target.value)}
            className={inputClass}
            placeholder="45"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">1e gele kaart (min)</label>
          <input
            type="number"
            min="1"
            max="120"
            value={firstYellowMinute}
            onChange={(e) => setFirstYellowMinute(e.target.value)}
            className={inputClass}
            placeholder="30"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value="SCHEDULED">Gepland</option>
            <option value="IN_PLAY">Live</option>
            <option value="FINISHED">Afgelopen</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? "Opslaan..." : "💾 Opslaan & punten berekenen"}
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">✅ Opgeslagen!</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>

      <p className="text-xs text-gray-400">
        Bij status &quot;Afgelopen&quot; worden punten automatisch berekend.
      </p>
    </div>
  );
}
