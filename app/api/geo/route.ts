import { NextRequest, NextResponse } from "next/server";

const countryNames: Record<string, string> = {
  CA: "Canada", US: "United States", FR: "France", BE: "Belgium",
  CH: "Switzerland", GB: "United Kingdom", DE: "Germany", IT: "Italy",
  ES: "Spain", NL: "Netherlands", PT: "Portugal", AU: "Australia",
  JP: "Japan", CN: "China", BR: "Brazil", MX: "Mexico",
  SN: "Sénégal", CI: "Côte d'Ivoire", CM: "Cameroun", MG: "Madagascar",
  HT: "Haïti", MA: "Maroc", TN: "Tunisie", DZ: "Algérie",
};

const currencyMap: Record<string, string> = {
  CA: "CAD", US: "USD", FR: "EUR", BE: "EUR", CH: "CHF",
  GB: "GBP", DE: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
  JP: "JPY", AU: "AUD", BR: "BRL", MX: "MXN",
};

export async function GET(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country") || "CA";
  
  return NextResponse.json({
    country,
    country_name: countryNames[country] || country,
    currency: currencyMap[country] || "USD",
    languages: ["FR", "CA", "BE", "CH", "SN", "CI", "CM", "MG", "HT", "MA", "TN", "DZ"].includes(country) ? "fr" : "en",
  });
}