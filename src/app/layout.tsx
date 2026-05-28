import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FIFA 2026 Pool",
  description: "Voorspel wedstrijden bij het WK 2026 met vrienden",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#166534",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="h-full">
      <body className={`${geist.className} min-h-full bg-gray-50`}>
        <SessionProvider>
          <Navbar />
          <main className="pb-20 md:pb-0">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
