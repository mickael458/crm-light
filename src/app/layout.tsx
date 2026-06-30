import type { Metadata } from "next";
import { Inter, Syne, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const appSans = Inter({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const appDisplay = Syne({
  variable: "--font-app-display",
  weight: ["700", "800"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "crm-light — ne ratez plus une relance",
  description:
    "L'outil de relance des indépendants français : sachez chaque jour qui relancer, sans jamais passer pour un commercial lourd.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${appSans.variable} ${appDisplay.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-950">
        <SiteHeader />
        <div className="flex min-h-[calc(100vh-65px)] flex-col">{children}</div>
      </body>
    </html>
  );
}
