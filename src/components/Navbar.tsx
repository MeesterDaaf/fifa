"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "🏠 Home", icon: "🏠" },
  { href: "/voorspellingen", label: "⚽ Voorspel", icon: "⚽" },
  { href: "/toernooi", label: "🏆 Toernooi", icon: "🏆" },
  { href: "/ranglijst", label: "📊 Ranglijst", icon: "📊" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) return null;

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex bg-green-800 text-white shadow-lg">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            ⚽ <span>FIFA 2026 Pool</span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-white text-green-800"
                    : "hover:bg-green-700 text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            {session.user.isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/admin"
                    ? "bg-yellow-400 text-green-900"
                    : "hover:bg-green-700 text-yellow-300"
                )}
              >
                ⚙️ Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-green-200">👤 {session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <header className="md:hidden bg-green-800 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">⚽ FIFA 2026 Pool</span>

        {/* Account menu knop */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span className="text-sm text-green-100">👤 {session.user.name}</span>
          <span className="text-green-300 text-xs">{menuOpen ? "▲" : "▼"}</span>
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-900 border-b border-green-700 px-4 py-3 flex flex-col gap-2">
          <div className="text-sm text-green-300 pb-1 border-b border-green-700">
            Ingelogd als <span className="text-white font-medium">{session.user.name}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left text-sm text-red-300 hover:text-red-200 py-1.5 font-medium"
          >
            🚪 Uitloggen
          </button>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-green-800 text-white z-50 shadow-lg border-t border-green-700">
        <div className="flex justify-around items-center py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px]",
                pathname === link.href
                  ? "text-white bg-green-600"
                  : "text-green-300"
              )}
            >
              <span className="text-xl leading-none">{link.icon}</span>
              <span className="text-[10px] font-medium">{link.label.split(" ")[1]}</span>
            </Link>
          ))}
          {session.user.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[60px]",
                pathname === "/admin" ? "text-white bg-yellow-600" : "text-yellow-300"
              )}
            >
              <span className="text-xl leading-none">⚙️</span>
              <span className="text-[10px] font-medium">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
