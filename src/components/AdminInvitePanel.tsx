"use client";

import { useState, useEffect } from "react";

export default function AdminInvitePanel({ baseUrl }: { baseUrl: string }) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/invite")
      .then((r) => r.json())
      .then((d) => setInviteCode(d.inviteCode));
  }, []);

  const inviteLink = inviteCode ? `${baseUrl}/register?code=${inviteCode}` : "";

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function regenerate() {
    if (!confirm("Weet je het zeker? De oude uitnodigingslink werkt daarna niet meer.")) return;
    setLoading(true);
    const res = await fetch("/api/admin/invite", { method: "POST" });
    const data = await res.json();
    setInviteCode(data.inviteCode);
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Deel deze link met vrienden. Alleen wie de link heeft kan registreren.
      </p>

      {inviteLink ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono break-all">
          {inviteLink}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400">Laden...</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={copyLink}
          disabled={!inviteLink}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {copied ? "✅ Gekopieerd!" : "📋 Link kopiëren"}
        </button>

        {/* WhatsApp deelknop */}
        {inviteLink && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Doe mee met onze FIFA 2026 pool! Registreer via: ${inviteLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20b858] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            💬 Delen via WhatsApp
          </a>
        )}

        <button
          onClick={regenerate}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? "Bezig..." : "🔄 Nieuwe link"}
        </button>
      </div>
    </div>
  );
}
