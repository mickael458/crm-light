import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Light",
  description: "CRM minimaliste pour consultants et coachs independants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-950">
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <Link href="/" className="text-sm font-semibold text-zinc-950">
              CRM Light
            </Link>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-zinc-600">
              <Link href="/dashboard" className="transition hover:text-zinc-950">
                Dashboard
              </Link>
              <Link href="/dashboard/pipeline" className="transition hover:text-zinc-950">
                Pipeline
              </Link>
              <Link href="/dashboard/contacts" className="transition hover:text-zinc-950">
                Contacts
              </Link>
              <Link href="/pricing" className="transition hover:text-zinc-950">
                Tarifs
              </Link>
            </div>
          </nav>
        </header>
        <div className="flex min-h-[calc(100vh-65px)] flex-col">{children}</div>
      </body>
    </html>
  );
}
