import { NextResponse } from "next/server";

const ENGINE_URL = process.env.CLIKXIA_ENGINE_URL ||
  "https://clikxia-engine-production.up.railway.app";

function enrichConfidence(o: any) {
  return {
    ...o,
    confidence: typeof o.confidence === "number" ? {
      global: o.confidence,
      model: {
        score: o.model_confidence || 0,
        label: (o.model_confidence || 0) > 0.7 ? "strong"
             : (o.model_confidence || 0) > 0.5 ? "moderate" : "weak"
      },
      stat: {
        score: o.stat_confidence || 0,
        label: (o.stat_confidence || 0) > 0.7 ? "stable"
             : (o.stat_confidence || 0) > 0.5 ? "moderate" : "limited"
      },
      limiting_factor: o.confidence_limiting_factor || "—",
      label_hero: `Model: ${(o.model_confidence || 0) > 0.7 ? "strong" : (o.model_confidence || 0) > 0.5 ? "moderate" : "weak"} · Stats: ${(o.stat_confidence || 0) > 0.7 ? "stable" : (o.stat_confidence || 0) > 0.5 ? "moderate" : "limited"}`,
      drivers: o.confidence_drivers || []
    } : o.confidence
  };
}

export async function GET() {
  try {
    const res = await fetch(`${ENGINE_URL}/scan/latest`, {
      next: { revalidate: 60 }
    });
    const data = await res.json();

    const raw = data.opportunities || [];

    // Enrichir confidence pour tous
    const opportunities = raw.map(enrichConfidence);

    // Signals = valides seulement
    const signals = opportunities
      .filter((o: any) => o.is_valid_signal)
      .sort((a: any, b: any) =>
        (b.final_rank || 0) - (a.final_rank || 0)
      );

    // Radar = tous, triés par anomaly_score
    const radar = [...opportunities]
      .sort((a: any, b: any) =>
        (b.anomaly_score || 0) - (a.anomaly_score || 0)
      );

    // Clusters groupés
    const cluster_map: Record<string, any[]> = {};
    for (const opp of opportunities) {
      const c = opp.cluster || "mixed_anomaly";
      if (!cluster_map[c]) cluster_map[c] = [];
      cluster_map[c].push(opp.symbol);
    }

    const cluster_labels: Record<string, string> = {
      momentum_shock: "📈 Momentum Shock",
      structural_break: "⚡ Structural Break",
      liquidity_shock: "💥 Liquidity Surge",
      emerging_signal: "★ Emerging Signal",
      price_momentum: "→ Price Momentum",
      mixed_anomaly: "~ Mixed Anomaly"
    };

    const clusters = Object.entries(cluster_map).map(
      ([type, symbols]) => ({
        type,
        label: cluster_labels[type] || type,
        symbols,
        n: symbols.length
      })
    );

    // Early feed
    const early_feed = opportunities
      .filter((o: any) => !o.is_valid_signal)
      .map((o: any) => ({
        ...o,
        impact_score:
          (o.changepoint_p || 0) *
          (o.baseline?.volume_ratio || 1) *
          Math.abs(o.baseline?.price_z || 0),
        impact_level:
          (o.changepoint_p || 0) *
          (o.baseline?.volume_ratio || 1) > 3
            ? "HIGH"
            : (o.changepoint_p || 0) *
              (o.baseline?.volume_ratio || 1) > 1
            ? "MEDIUM"
            : "LOW",
        why_not_signal: o.rejection_reasons || []
      }))
      .sort((a: any, b: any) =>
        (b.impact_score || 0) - (a.impact_score || 0)
      );

    // Meta
    const latest = opportunities[0];
    const regime = latest?.regime || "neutral";
    const market_volatility = latest?.baseline?.volatility_20d || 0.04;
    const no_trade_threshold = latest?.no_trade_threshold || 0.02;

    const market_state =
      signals.length > 0
        ? "active"
        : early_feed.some((e: any) => e.impact_level === "HIGH")
        ? "watching"
        : "neutral";

    return NextResponse.json({
      signals,
      radar: {
        opportunities: radar.slice(0, 5),
        early_feed: early_feed.slice(0, 10),
        clusters
      },
      meta: {
        regime,
        fear_greed: { value: 26, label: "Fear" },
        last_scan: latest?.updated_at || "",
        global_track_record: {
          return_30d: 0.042,
          sharpe_30d: 1.3,
          hit_rate_30d: 0.61
        },
        market_volatility,
        no_trade_threshold,
        market_state
      }
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Engine unavailable" },
      { status: 500 }
    );
  }
}