import { NextRequest, NextResponse } from "next/server";

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

async function getStockData(ticker: string) {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await res.json();
    const quote = data["Global Quote"];
    if (!quote) return null;
    return {
      ticker,
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePct: quote["10. change percent"],
      volume: parseInt(quote["06. volume"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
    };
  } catch {
    return null;
  }
}

async function getNews(ticker: string) {
  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${ticker}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
    );
    const data = await res.json();
    return data.articles?.map((a: { title: string; description: string; publishedAt: string }) => ({
      title: a.title,
      description: a.description,
      publishedAt: a.publishedAt,
    })) || [];
  } catch {
    return [];
  }
}

async function generateSignal(stockData: Record<string, unknown>, news: Record<string, unknown>[]) {
  const prompt = `Tu es CLIKXIA, un copilote de décision boursière.

Analyse ces données et génère un signal de trading. Retourne UNIQUEMENT ce JSON valide :

Données techniques :
${JSON.stringify(stockData)}

Actualités récentes :
${JSON.stringify(news.slice(0, 3))}

{
  "decision": "BUY ou SELL ou WAIT",
  "confidence": 75,
  "score": 78,
  "signal_quality": "FORT ou MODÉRÉ ou FAIBLE",
  "timing": "Entrer maintenant ou Attendre pullback ou Surveiller ou Sortir maintenant",
  "entry_low": 88,
  "entry_high": 90,
  "target_low": 96,
  "target_high": 100,
  "stop_loss": 85,
  "horizon": "5-10 jours",
  "scenario_up": 60,
  "scenario_down": 25,
  "scenario_flat": 15,
  "reasons": ["raison 1", "raison 2", "raison 3"],
  "score_technique": 80,
  "score_news": 75,
  "score_psychologie": 70,
  "score_devises": 65
}

RÈGLES :
- decision basée sur toutes les données
- confidence entre 50 et 90
- scenario_up + scenario_down + scenario_flat = 100
- reasons en français, courtes et précises`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return JSON.parse(match[0]);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "CA";

  const tickers = country === "CA" 
    ? ["SHOP", "CNR", "RY", "TD", "ENB"]
    : country === "FR" || country === "BE" || country === "CH"
    ? ["ASML", "LVMH.PA", "SAP", "NESN.SW", "SIE.DE"]
    : ["AAPL", "NVDA", "MSFT", "AMZN", "GOOGL"];

  const signals = await Promise.all(
    tickers.map(async (ticker) => {
      const stockData = await getStockData(ticker);
      if (!stockData) return null;
      const news = await getNews(ticker);
      const signal = await generateSignal(stockData as Record<string, unknown>, news);
      if (!signal) return null;
      return { ...stockData, ...signal };
    })
  );

  return NextResponse.json({
    signals: signals.filter(Boolean),
    updated: new Date().toISOString(),
  });
}