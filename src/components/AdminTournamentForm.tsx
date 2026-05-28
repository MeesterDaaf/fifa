"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminTournamentForm({ existing }: { existing: string | null }) {
  const router = useRouter();
  const [topScorer, setTopScorer] = useState(existing ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!topScorer.trim()) return;
    setLoading(true);
    setSaved(false);
    setError("");

    const res = await fetch("/api/admin/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topScorer: topScorer.trim() }),
    });

    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Fout");
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs text-gray-500 mb-1">Topscorer WK 2026</label>
        <input
          type="text"
          value={topScorer}
          onChange={(e) => setTopScorer(e.target.value)}
          placeholder="bijv. Kylian Mbappé"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
      >
        {loading ? "Opslaan..." : "💾 Opslaan & punten uitdelen"}
      </button>
      {saved && <span className="text-green-600 text-sm font-medium">✅ Opgeslagen!</span>}
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}
