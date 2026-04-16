import { NextRequest, NextResponse } from "next/server";

const ENGINE_URL = process.env.CLIKXIA_ENGINE_URL || "https://clikxia-engine-production.up.railway.app";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "CA";

  const tickers = country === "CA"
    ? ["SHOP", "CNR", "RY", "TD", "ENB"]
    : country === "FR" || country === "BE" || country === "CH"
    ? ["ASML", "SAP", "SIE", "NESN", "OR"]
    : ["AAPL", "NVDA", "MSFT", "AMZN", "GOOGL"];

  try {
    const signals = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const res = await fetch(`${ENGINE_URL}/analyze/${ticker}`, {
            next: { revalidate: 900 }
          });
          if (!res.ok) return null;
          const data = await res.json();
          if (data.error) return null;
          return data;
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      signals: signals.filter(Boolean),
      updated: new Date().toISOString(),
      source: "clikxia-engine-v2"
    });

  } catch {
    return NextResponse.json(
      { error: "Engine unavailable" },
      { status: 500 }
    );
  }
}