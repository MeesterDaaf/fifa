"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/sync", { method: "POST" });
    const data = await res.json();

    setLoading(false);
    setResult(data);

    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
      >
        {loading ? "⏳ Synchroniseren..." : "🔄 Sync wedstrijden"}
      </button>

      {result && (
        <p className={`text-sm ${result.error ? "text-red-600" : "text-green-600"} font-medium`}>
          {result.error ? `❌ ${result.error}` : `✅ ${result.message}`}
        </p>
      )}
    </div>
  );
}
