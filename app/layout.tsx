import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { detectLang } from "@/lib/lang";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://clikxia.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CLIKXIA \u2014 Copilote de d\u00e9cision bourse Canada",
    template: "%s | CLIKXIA",
  },
  description: "CLIKXIA analyse quotidiennement 2237 actions et vous livre le top 5 du jour avec Momentum, Proximit\u00e9 52 semaines et Volume anormal. Gratuit.",
  keywords: [
    "bourse Canada", "analyse actions", "momentum", "investissement",
    "top 5 actions", "scoring composite", "quality value low volatility",
    "Canadian stocks", "stock analysis", "momentum trading",
    "CLIKXIA", "decision support", "copilot markets",
  ],
  authors: [{ name: "CLIKXIA" }],
  creator: "CLIKXIA",
  publisher: "CLIKXIA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "fr-CA": BASE_URL,
      "fr-FR": BASE_URL,
      "en-US": BASE_URL,
      "en-CA": BASE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    alternateLocale: ["en_US"],
    url: BASE_URL,
    siteName: "CLIKXIA",
    title: "CLIKXIA \u2014 Copilote de d\u00e9cision bourse Canada",
    description: "Top 5 d\u2019actions chaque jour, analyses rigoureuses, gratuit.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLIKXIA \u2014 Copilote de d\u00e9cision bourse Canada",
    description: "Top 5 d\u2019actions chaque jour, analyses rigoureuses, gratuit.",
    creator: "@clikxia",
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "CZAzGwkkdUrtaQdCY6nV8pdELkhl_7yEB5bmIr4w-40",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await detectLang();

  // Schema.org Organization (pour Google Rich Results)
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CLIKXIA",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.ico`,
    description: lang === "fr"
      ? "Copilote de d\u00e9cision pour investisseurs. Analyse quotidienne de 2237 actions."
      : "Decision copilot for investors. Daily analysis of 2237 stocks.",
    sameAs: [],
  };

  return (
    <html
      lang={lang === "fr" ? "fr-CA" : "en-US"}
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body>{children}<Analytics /></body>
    </html>
  );
}
