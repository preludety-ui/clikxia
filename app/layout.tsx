import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLIKXIA — Copilote de décision boursière",
  description: "L'IA qui transforme l'incertitude des marchés en décision claire. BUY / SELL / WAIT.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}