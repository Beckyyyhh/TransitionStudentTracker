import type { Metadata } from "next";
import { Nunito, Open_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "sonner";
import { NavTabs } from "@/components/NavTabs";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Canley Vale HS — Careers Hub",
  description: "Careers adviser tracking for Canley Vale High School",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${openSans.variable} antialiased bg-gray-50 min-h-screen`} style={{ fontFamily: "var(--font-open-sans), sans-serif" }}>
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-24">
            <Link href="/students" className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="Canley Vale HS Careers Hub"
                style={{ height: 96, width: "auto", objectFit: "contain" }}
              />
              <span className="text-xl font-extrabold leading-tight hidden sm:block" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
                Canley Vale HS<br />
                <span className="text-base font-semibold" style={{ color: "#534ab7" }}>Careers Hub</span>
              </span>
            </Link>
          </div>
          <NavTabs />
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
