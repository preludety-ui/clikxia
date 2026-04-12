import { NextResponse } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

async function getCryptoData(coinId: string) {
    try {

       const res = await fetch(
  `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=daily`
);

const data = await res.json();


        if (!data?.prices || data.prices.length === 0) return null;

        const prices = data.prices.map((p: number[]) => p[1]);
        const volumes = data.total_volumes.map((v: number[]) => v[1]);
        const lastIndex = prices.length - 1;
        const price = prices[lastIndex];
        const prevPrice = prices[lastIndex - 1];
        const change = price - prevPrice;
        const changePct = ((change / prevPrice) * 100).toFixed(2);
        const volume = volumes[lastIndex];
        const avgVolume = volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length;
        const volumeRatio = (volume / avgVolume).toFixed(2);
        const high7d = Math.max(...prices);
        const low7d = Math.min(...prices);
        const momentum7d = ((price - prices[0]) / prices[0] * 100).toFixed(2);

        return {
            price,
            change,
            changePct: `${changePct}%`,
            volume,
            volumeRatio,
            high: high7d,
            low: low7d,
            high7d,
            low7d,
            momentum7d,
        };
    } catch {
        return null;
    }
}

async function getFearGreed() {
    try {
        const res = await fetch("https://api.alternative.me/fng/?limit=1");
        const data = await res.json();
        return {
            value: parseInt(data.data[0].value),
            label: data.data[0].value_classification,
        };
    } catch {
        return { value: 50, label: "Neutral" };
    }
}

async function generateCryptoSignal(
    cryptoData: Record<string, unknown>,
    fearGreed: { value: number; label: string },
    newsData: Record<string, unknown>[]
) {
    const prompt = `Tu es CLIKXIA, un copilote de décision boursière spécialisé en crypto.

Mode : WEEKEND — marchés actions fermés

Analyse ces données crypto et génère un signal. Retourne UNIQUEMENT ce JSON valide :

Données crypto :
${JSON.stringify(cryptoData)}

Fear & Greed Index : ${fearGreed.value}/100 (${fearGreed.label})

News récentes :
${JSON.stringify(newsData.slice(0, 3))}

{
  "decision": "BUY ou SELL ou WAIT",
  "confidence": 75,
  "score": 78,
  "signal_quality": "FORT ou MODERE ou FAIBLE",
  "timing": "Entrer maintenant ou Attendre pullback ou Surveiller ou Sortir maintenant",
  "entry_low": 88000,
  "entry_high": 90000,
  "target_low": 96000,
  "target_high": 100000,
  "stop_loss": 85000,
  "horizon": "24-48h ou 3-5 jours",
  "scenario_up": 60,
  "scenario_down": 25,
  "scenario_flat": 15,
  "reasons": ["raison 1", "raison 2", "raison 3"],
  "score_technique": 80,
  "score_news": 75,
  "score_psychologie": 70,
  "score_devises": 65,
  "fear_greed": ${fearGreed.value},
  "momentum7d": "${cryptoData.momentum7d}"
}

REGLES :
- decision basée sur toutes les données disponibles
- confidence entre 50 et 90
- scenario_up + scenario_down + scenario_flat = 100
- reasons en français, courtes et précises
- tenir compte du Fear & Greed Index
- tenir compte du momentum sur 7 jours`;

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
    if (!match) {
  
  return null;
}
try {
  return JSON.parse(match[0]);
} catch (e) {
  
  return null;
}
}

async function getNews(query: string) {
    try {
        const res = await fetch(
            `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
        );
        const data = await res.json();
        return data.articles?.map((a: { title: string; description: string }) => ({
            title: a.title,
            description: a.description,
        })) || [];
    } catch {
        return [];
    }
}

export async function GET() {
    const cryptoSymbols = [
        { symbol: "bitcoin", name: "Bitcoin", ticker: "BTC" },
        { symbol: "ethereum", name: "Ethereum", ticker: "ETH" },
        { symbol: "solana", name: "Solana", ticker: "SOL" },
    ];

    const fearGreed = await getFearGreed();

    const signals = await Promise.all(
        cryptoSymbols.map(async ({ symbol, name, ticker }) => {
            const cryptoData = await getCryptoData(symbol);
            if (!cryptoData) return null;
            const news = await getNews(`${name} crypto`);
            const signal = await generateCryptoSignal(
                { ...cryptoData, name, ticker } as Record<string, unknown>,
                fearGreed,
                news
            );
            if (!signal) return null;
            return { ...cryptoData, ticker, name, ...signal };
        })
    );

    return NextResponse.json({
        mode: "weekend",
        fearGreed,
        signals: signals.filter(Boolean),
        updated: new Date().toISOString(),
    });
}