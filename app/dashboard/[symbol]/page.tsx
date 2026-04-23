import Link from "next/link";
import { getTop5 } from "@/lib/api";
import { detectLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import SiteHeader from "@/app/components/SiteHeader";
import Disclaimer from "@/app/components/Disclaimer";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default async function StockSimplePage({ params }: PageProps) {
  const { symbol } = await params;
  const symbolUpper = symbol.toUpperCase();

  const [top5Data, lang] = await Promise.all([
    getTop5().catch(() => null),
    detectLang(),
  ]);

  const stock = top5Data?.top5.find((s) => s.symbol === symbolUpper);

  if (!stock) {
    return (
      <div style={{ minHeight: "100vh", background: "#faf9f7", color: "#1a1917" }}>
        <SiteHeader compact />
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "20px" }}>
          <Link href="/dashboard" style={{ color: "#6b6861", fontSize: "14px", textDecoration: "none" }}>
            &larr; {t(lang, "back_to_dashboard")}
          </Link>
          <h1 style={{
            fontFamily: "var(--font-serif, serif)",
            fontSize: "28px",
            marginTop: "20px",
            color: "#1a1917",
          }}>
            {t(lang, "symbol_not_found", symbolUpper)}
          </h1>
          <p style={{ color: "#6b6861", fontSize: "14px", marginTop: "8px" }}>
            {t(lang, "stock_not_in_top5")}
          </p>
        </div>
      </div>
    );
  }

  const recoClass =
    stock.recommendation === "HOLD"
      ? "hold"
      : stock.recommendation === "SELL" || stock.recommendation === "STRONG_SELL"
      ? "sell"
      : "buy";

  const momPct = Math.round(stock.signals.momentum_12_1.percentile);
  const proxPct = Math.round(stock.signals.proximity_52w_high.percentile);
  const volPct = Math.round(stock.signals.volume_abnormal.percentile);

  const reasons: string[] = [];
  if (proxPct >= 80) reasons.push(t(lang, "reason_proximity", proxPct));
  if (momPct >= 80) reasons.push(t(lang, "reason_momentum"));
  if (volPct >= 80) reasons.push(t(lang, "reason_volume"));
  const reasonText = reasons.length > 0
    ? (lang === "fr"
        ? `Cette action est ${reasons.join(", ")}. ${t(lang, "reason_conclusion")}`
        : `This stock is ${reasons.join(", ")}. ${t(lang, "reason_conclusion")}`)
    : t(lang, "reason_default");

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", color: "#1a1917" }}>
      <SiteHeader compact />

      <div className="simple-container">
        <style>{`
          .simple-container {
            max-width: 560px;
            margin: 0 auto;
            padding: 0 20px 40px;
          }
          @media (min-width: 768px) {
            .simple-container {
              max-width: 640px;
              padding: 0 32px 48px;
            }
          }

          .back-link {
            display: inline-block;
            color: #6b6861;
            font-size: 14px;
            text-decoration: none;
            margin-bottom: 16px;
          }
          .back-link:hover { color: #1a1917; }

          .hero {
            background: #ffffff;
            border: 1px solid #e8e6e1;
            border-radius: 12px;
            padding: 28px 24px;
            text-align: center;
            margin-bottom: 24px;
          }
          @media (min-width: 768px) {
            .hero { padding: 36px 32px; }
          }

          .hero-rank {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #6b6861;
            font-family: var(--font-mono, monospace);
            margin-bottom: 8px;
          }
          .hero-symbol {
            font-family: var(--font-serif, "Fraunces", serif);
            font-size: 44px;
            font-weight: 600;
            letter-spacing: -0.02em;
            line-height: 1;
            color: #1a1917;
            margin-bottom: 16px;
          }
          @media (min-width: 768px) {
            .hero-symbol { font-size: 56px; }
          }

          .hero-decision-label {
            font-size: 10px;
            color: #6b6861;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-family: var(--font-mono, monospace);
            margin-bottom: 8px;
          }
          .hero-reco {
            display: inline-block;
            padding: 8px 18px;
            border-radius: 6px;
            font-family: var(--font-mono, monospace);
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.06em;
            margin-bottom: 12px;
            background: #e8f3ea;
            color: #2d7a3e;
          }
          .hero-reco.hold { background: #f5ecd9; color: #9a7628; }
          .hero-reco.sell { background: #f5e4e4; color: #b93b3b; }

          .hero-score {
            font-family: var(--font-mono, monospace);
            font-size: 16px;
            color: #1a1917;
            font-weight: 600;
          }

          .section-title {
            font-family: var(--font-serif, "Fraunces", serif);
            font-size: 20px;
            font-weight: 600;
            color: #1a1917;
            margin-bottom: 14px;
            letter-spacing: -0.01em;
          }

          .why-card {
            background: #ffffff;
            border: 1px solid #e8e6e1;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 24px;
            font-size: 15px;
            line-height: 1.5;
            color: #3d3a36;
          }

          .signals-list {
            background: #ffffff;
            border: 1px solid #e8e6e1;
            border-radius: 10px;
            padding: 8px 20px;
            margin-bottom: 24px;
          }
          .signal-row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 16px;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #e8e6e1;
          }
          .signal-row:last-child { border-bottom: none; }
          .signal-main {
            display: flex;
            flex-direction: column;
          }
          .signal-name {
            font-size: 14px;
            font-weight: 600;
            color: #1a1917;
            margin-bottom: 3px;
          }
          .signal-desc {
            font-size: 12px;
            color: #6b6861;
          }
          .signal-value-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .signal-bar-wrap {
            width: 80px;
            height: 4px;
            background: #e8e6e1;
            border-radius: 2px;
            overflow: hidden;
          }
          .signal-bar {
            height: 100%;
            background: #1a1917;
            border-radius: 2px;
          }
          .signal-pct {
            font-family: var(--font-mono, monospace);
            font-size: 14px;
            font-weight: 600;
            color: #1a1917;
            min-width: 36px;
            text-align: right;
          }

          .technical-cta {
            display: block;
            text-align: center;
            padding: 16px 20px;
            background: #1a1917;
            color: #faf9f7;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            font-family: var(--font-mono, monospace);
            letter-spacing: 0.02em;
            transition: opacity 0.15s;
          }
          .technical-cta:hover { opacity: 0.9; }
        `}</style>

        <Link href="/dashboard" className="back-link">
          &larr; {t(lang, "back_to_top5")}
        </Link>

        <div className="hero">
          <div className="hero-rank">{t(lang, "rank_of_day", stock.rank)}</div>
          <div className="hero-symbol">{stock.symbol}</div>
          <div className="hero-decision-label">{t(lang, "decision_of_day")}</div>
          <div className={`hero-reco ${recoClass}`}>{stock.recommendation.replace("_", " ")}</div>
          <div className="hero-score">{stock.composite_score.toFixed(1)} / 100</div>
        </div>

        <h2 className="section-title">{t(lang, "why")}</h2>
        <div className="why-card">
          {reasonText}
        </div>

        <h2 className="section-title">{t(lang, "three_signals")}</h2>
        <div className="signals-list">
          <div className="signal-row">
            <div className="signal-main">
              <div className="signal-name">{t(lang, "signal_momentum")}</div>
              <div className="signal-desc">{t(lang, "signal_momentum_desc")}</div>
            </div>
            <div className="signal-value-wrap">
              <div className="signal-bar-wrap">
                <div className="signal-bar" style={{ width: `${momPct}%` }} />
              </div>
              <div className="signal-pct">{momPct}</div>
            </div>
          </div>
          <div className="signal-row">
            <div className="signal-main">
              <div className="signal-name">{t(lang, "signal_proximity")}</div>
              <div className="signal-desc">{t(lang, "signal_proximity_desc")}</div>
            </div>
            <div className="signal-value-wrap">
              <div className="signal-bar-wrap">
                <div className="signal-bar" style={{ width: `${proxPct}%` }} />
              </div>
              <div className="signal-pct">{proxPct}</div>
            </div>
          </div>
          <div className="signal-row">
            <div className="signal-main">
              <div className="signal-name">{t(lang, "signal_volume")}</div>
              <div className="signal-desc">{t(lang, "signal_volume_desc")}</div>
            </div>
            <div className="signal-value-wrap">
              <div className="signal-bar-wrap">
                <div className="signal-bar" style={{ width: `${volPct}%` }} />
              </div>
              <div className="signal-pct">{volPct}</div>
            </div>
          </div>
        </div>

        <Link href={`/dashboard/${stock.symbol}/technical`} className="technical-cta">
          {t(lang, "view_technical")} &rarr;
        </Link>

        <Disclaimer />
      </div>
    </div>
  );
}
