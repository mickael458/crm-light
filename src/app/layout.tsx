import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/session";

const appSans = Inter({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const appDisplay = Geist({
  variable: "--font-app-display",
  subsets: ["latin"],
});

const siteName = "crm-light";
const siteTitle = "crm-light — ne ratez plus une relance";
const siteDescription =
  "L'outil de relance des indépendants français : sachez chaque jour qui relancer, sans jamais passer pour un commercial lourd.";
const siteUrl = process.env.NEXT_PUBLIC_URL ?? "https://crm-light.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "CRM",
    "relance client",
    "indépendant",
    "freelance",
    "consultant",
    "pipeline commercial",
    "devis",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="fr"
      className={`${appSans.variable} ${appDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-950">
        <SiteHeader isAuthenticated={Boolean(user)} />
        <div className="flex min-h-[calc(100vh-65px)] flex-col">{children}</div>
      </body>
    </html>
  );
}
