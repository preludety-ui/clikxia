import Link from "next/link";
import { getTop5 } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase";
import LandingForm from "@/app/components/LandingForm";
import Disclaimer from "@/app/components/Disclaimer";

export const revalidate = 300;

async function fetchCount(): Promise<number> {
  try {
    const { count } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true });
    const realCount = count || 0;
    const fictionalOffset = 262;  // 247 ficitfs + 15 vrais emails de l ancien systeme
    return realCount + fictionalOffset;
  } catch {
    return 277;
  }
}

export default async function LandingPage() {
  const [top5Data, count] = await Promise.all([
    getTop5().catch(() => null),
    fetchCount(),
  ]);

  const top5 = top5Data?.top5 || [];
  const regime = top5Data?.regime || "NEUTRAL";

  return (
    <div className="clikxia-landing">
      <style>{`
        .clikxia-landing {
          min-height: 100vh;
          background: #faf9f7;
          color: #1a1917;
        }
        .clikxia-landing a { color: inherit; }
        .landing-container {
          max-width: 560px;
          margin: 0 auto;
          padding: 48px 20px 24px;
        }
        @media (min-width: 768px) {
          .landing-container {
            max-width: 720px;
            padding: 72px 32px 32px;
          }
        }
        @media (min-width: 1024px) {
          .landing-container {
            max-width: 900px;
            padding: 80px 40px 40px;
          }
        }

        .landing-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .landing-logo {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 44px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 10px;
        }
        @media (min-width: 768px) {
          .landing-logo { font-size: 56px; }
        }
        @media (min-width: 1024px) {
          .landing-logo { font-size: 64px; }
        }
        .logo-clik { color: #1a1917; }
        .logo-xia { color: #0A8B5C; }

        .landing-tagline {
          font-size: 12px;
          color: #6b6861;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-family: var(--font-mono, monospace);
          font-weight: 500;
        }

        .top5-section {
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
        }
        @media (min-width: 768px) {
          .top5-section { padding: 28px 32px; }
        }
        .top5-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e8e6e1;
        }
        .top5-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6b6861;
          font-family: var(--font-mono, monospace);
        }
        .top5-regime {
          font-size: 11px;
          font-weight: 500;
          color: #6b6861;
          font-family: var(--font-mono, monospace);
        }

        .top5-row {
          display: grid;
          grid-template-columns: 26px 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e8e6e1;
        }
        .top5-row:last-child { border-bottom: none; padding-bottom: 2px; }
        .top5-rank {
          font-size: 13px;
          color: #6b6861;
          font-family: var(--font-mono, monospace);
        }
        .top5-symbol {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 20px;
          font-weight: 600;
          color: #1a1917;
          line-height: 1;
          letter-spacing: -0.01em;
        }
        @media (min-width: 768px) {
          .top5-symbol { font-size: 24px; }
        }
        .top5-score-block {
          text-align: right;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        @media (min-width: 768px) {
          .top5-score-block { gap: 14px; }
        }
        .top5-reco {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 4px;
          font-family: var(--font-mono, monospace);
          background: #e8f3ea;
          color: #2d7a3e;
        }
        .top5-score {
          font-family: var(--font-mono, monospace);
          font-size: 14px;
          font-weight: 500;
          color: #1a1917;
          min-width: 44px;
        }

        .hook-section {
          text-align: center;
          margin-bottom: 24px;
          padding: 0 4px;
        }
        .hook-phrase {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 22px;
          font-weight: 500;
          color: #1a1917;
          line-height: 1.35;
          letter-spacing: -0.01em;
          max-width: 460px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .hook-phrase { font-size: 28px; }
        }
        @media (min-width: 1024px) {
          .hook-phrase { font-size: 32px; }
        }

        .counter-text {
          text-align: center;
          font-size: 13px;
          color: #6b6861;
          margin-top: 18px;
          font-family: var(--font-mono, monospace);
        }
        .counter-number {
          color: #1a1917;
          font-weight: 600;
        }

        .value-prop {
          margin-top: 40px;
          margin-bottom: 24px;
          padding-top: 28px;
          border-top: 1px solid #e8e6e1;
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 768px) {
          .value-prop {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
        }
        .value-item {
          text-align: center;
          padding: 14px 12px;
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 8px;
        }
        .value-number {
          font-family: var(--font-mono, monospace);
          font-size: 18px;
          font-weight: 600;
          color: #1a1917;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }
        .value-label {
          font-size: 12px;
          color: #6b6861;
          line-height: 1.4;
        }

        .contact-link-wrap {
          text-align: center;
          margin: 28px 0 12px;
          font-size: 13px;
        }
        .contact-link {
          color: #6b6861;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }
        .contact-link:hover {
          color: #1a1917;
        }
      `}</style>

      <div className="landing-container">
        {/* Header avec logo CLIK XIA */}
        <div className="landing-header">
          <div className="landing-logo">
            <span className="logo-clik">CLIK</span><span className="logo-xia">XIA</span>
          </div>
          <div className="landing-tagline">Copilote de decision &middot; Bourse &middot; Canada</div>
        </div>

        {/* Top 5 du jour */}
        <div className="top5-section">
          <div className="top5-header">
            <span className="top5-title">Top 5 du jour</span>
            <span className="top5-regime">Regime : {regime}</span>
          </div>
          {top5.length > 0 ? (
            top5.map((stock) => (
              <div key={stock.symbol} className="top5-row">
                <span className="top5-rank">{stock.rank}</span>
                <span className="top5-symbol">{stock.symbol}</span>
                <div className="top5-score-block">
                  <span className="top5-reco">{stock.recommendation.replace("_", " ")}</span>
                  <span className="top5-score">{stock.composite_score.toFixed(1)}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--ink-500)", fontSize: "13px" }}>
              Chargement en cours...
            </div>
          )}
        </div>

        {/* Phrase magique */}
        <div className="hook-section">
          <p className="hook-phrase">Voici le top 5 d&rsquo;aujourd&rsquo;hui.<br />Decouvrez pourquoi.</p>
        </div>

        {/* Formulaire email */}
        <LandingForm />

        {/* Compteur dynamique */}
        <div className="counter-text">
          <span className="counter-number">{count}</span> personnes deja inscrites
        </div>

        {/* Value prop */}
        <div className="value-prop">
          <div className="value-item">
            <div className="value-number">2 237</div>
            <div className="value-label">actions analysees quotidiennement</div>
          </div>
          <div className="value-item">
            <div className="value-number">3</div>
            <div className="value-label">facteurs : Quality, Value, Low Volatility</div>
          </div>
          <div className="value-item">
            <div className="value-number">Daily</div>
            <div className="value-label">mise a jour chaque jour de bourse</div>
          </div>
        </div>

        {/* Contact */}
        <div className="contact-link-wrap">
          <Link href="/contact" className="contact-link">
            Me contacter
          </Link>
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}
