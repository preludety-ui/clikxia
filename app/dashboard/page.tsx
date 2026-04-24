import Link from "next/link";
import { getTop5 } from "@/lib/api";
import { detectLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import SiteHeader from "@/app/components/SiteHeader";
import Disclaimer from "@/app/components/Disclaimer";
import TrackPageView from "@/app/components/TrackPageView";

export const revalidate = 300;

export default async function DashboardPage() {
  const [top5Data, lang] = await Promise.all([
    getTop5().catch(() => null),
    detectLang(),
  ]);

  const top5 = top5Data?.top5 || [];
  const regime = top5Data?.regime || "NEUTRAL";
  const scanDate = top5Data?.scan_date || "";

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", color: "#1a1917" }}>
      <SiteHeader compact />
      <TrackPageView event="dashboard_viewed" properties={{ lang }} />

      <div className="dashboard-container">
        <style>{`
          .dashboard-container {
            max-width: 560px;
            margin: 0 auto;
            padding: 0 20px 40px;
          }
          @media (min-width: 768px) {
            .dashboard-container {
              max-width: 720px;
              padding: 0 32px 48px;
            }
          }
          @media (min-width: 1024px) {
            .dashboard-container {
              max-width: 900px;
              padding: 0 40px 56px;
            }
          }

          .dashboard-intro {
            text-align: center;
            margin-bottom: 28px;
            padding-top: 8px;
          }
          .dashboard-title {
            font-family: var(--font-serif, "Fraunces", serif);
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.02em;
            line-height: 1.2;
            color: #1a1917;
            margin-bottom: 6px;
          }
          @media (min-width: 768px) {
            .dashboard-title { font-size: 36px; }
          }
          .dashboard-sub {
            font-size: 13px;
            color: #6b6861;
            font-family: var(--font-mono, monospace);
          }

          .regime-banner {
            background: #ffffff;
            border: 1px solid #e8e6e1;
            border-radius: 10px;
            padding: 14px 18px;
            margin-bottom: 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .regime-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #6b6861;
            font-family: var(--font-mono, monospace);
          }
          .regime-value {
            font-family: var(--font-mono, monospace);
            font-size: 14px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 4px;
            background: #e8e6e1;
            color: #1a1917;
          }
          .regime-value.bull { background: #e8f3ea; color: #2d7a3e; }
          .regime-value.bear, .regime-value.panic { background: #f5e4e4; color: #b93b3b; }

          .top5-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
          }
          @media (min-width: 768px) {
            .top5-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 14px;
            }
          }
          @media (min-width: 1024px) {
            .top5-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          .stock-card {
            background: #ffffff;
            border: 1px solid #e8e6e1;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.15s;
            text-decoration: none;
            color: inherit;
            display: block;
          }
          .stock-card:hover {
            border-color: #1a1917;
            transform: translateY(-2px);
          }

          .stock-rank {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.12em;
            color: #6b6861;
            font-family: var(--font-mono, monospace);
            margin-bottom: 8px;
          }

          .stock-symbol {
            font-family: var(--font-serif, "Fraunces", serif);
            font-size: 30px;
            font-weight: 600;
            color: #1a1917;
            line-height: 1;
            letter-spacing: -0.02em;
            margin-bottom: 12px;
          }

          .stock-reco-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
          }
          .stock-reco {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.06em;
            padding: 4px 10px;
            border-radius: 4px;
            font-family: var(--font-mono, monospace);
            background: #e8f3ea;
            color: #2d7a3e;
          }
          .stock-reco.hold { background: #f5ecd9; color: #9a7628; }
          .stock-reco.sell { background: #f5e4e4; color: #b93b3b; }
          .stock-score {
            font-family: var(--font-mono, monospace);
            font-size: 16px;
            font-weight: 600;
            color: #1a1917;
          }

          .stock-signals {
            padding-top: 14px;
            border-top: 1px solid #e8e6e1;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .signal-mini { text-align: center; }
          .signal-mini-label {
            font-size: 9px;
            color: #6b6861;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 4px;
            font-family: var(--font-mono, monospace);
          }
          .signal-mini-value {
            font-family: var(--font-mono, monospace);
            font-size: 13px;
            font-weight: 600;
            color: #1a1917;
          }
        `}</style>

        <div className="dashboard-intro">
          <h1 className="dashboard-title">{t(lang, "dashboard_title")}</h1>
          <div className="dashboard-sub">{scanDate || t(lang, "today")}</div>
        </div>

        <div className="regime-banner">
          <span className="regime-label">{t(lang, "regime_market")}</span>
          <span className={`regime-value ${regime.toLowerCase()}`}>{regime}</span>
        </div>

        <div className="top5-grid">
          {top5.map((stock) => {
            const recoClass = (stock.recommendation === "HOLD" ? "hold" :
                              (stock.recommendation === "SELL" || stock.recommendation === "STRONG_SELL") ? "sell" : "");
            return (
              <Link key={stock.symbol} href={`/dashboard/${stock.symbol}`} className="stock-card">
                <div className="stock-rank">{t(lang, "rank")} {stock.rank}</div>
                <div className="stock-symbol">{stock.symbol}</div>
                <div className="stock-reco-row">
                  <span className={`stock-reco ${recoClass}`}>{stock.recommendation.replace("_", " ")}</span>
                  <span className="stock-score">{stock.composite_score.toFixed(1)} / 100</span>
                </div>
                <div className="stock-signals">
                  <div className="signal-mini">
                    <div className="signal-mini-label">{t(lang, "signal_momentum")}</div>
                    <div className="signal-mini-value">{Math.round(stock.signals.momentum_12_1.percentile)}</div>
                  </div>
                  <div className="signal-mini">
                    <div className="signal-mini-label">52W</div>
                    <div className="signal-mini-value">{Math.round(stock.signals.proximity_52w_high.percentile)}</div>
                  </div>
                  <div className="signal-mini">
                    <div className="signal-mini-label">{t(lang, "signal_volume")}</div>
                    <div className="signal-mini-value">{Math.round(stock.signals.volume_abnormal.percentile)}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}
