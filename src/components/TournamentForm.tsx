"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TournamentForm({ existing }: { existing: string | null }) {
  const router = useRouter();
  const [topScorer, setTopScorer] = useState(existing ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topScorer }),
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {existing ? "✏️ Voorspelling aanpassen" : "✏️ Maak jouw voorspelling"}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            🥇 Topscorer WK 2026
          </label>
          <input
            type="text"
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            required
            placeholder="bijv. Kylian Mbappé"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
          />
          <p className="text-xs text-gray-400 mt-1">Volledige naam van de speler</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3.5 rounded-xl transition-colors"
        >
          {loading ? "Opslaan..." : existing ? "Bijwerken" : "Opslaan"}
        </button>
      </form>
    </div>
  );
}
