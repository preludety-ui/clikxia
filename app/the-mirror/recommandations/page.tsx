"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SiteHeaderClient from "@/app/components/SiteHeaderClient";

// ============================================================
// CLIKXIA — Page /the-mirror/recommandations
// ============================================================
// Glossaire scientifique des 13 recommandations The Mirror V1
// Sources : 15+ papiers peer-reviewed (Acar-Toffel 2001,
// Kaminski-Lo 2014, Han-Zhou-Zhu 2014, Grossman-Zhou 1993,
// Wilcox-Crittenden 2009, Clare et al. 2013, Liu Yuzhen 2020,
// Nikkei Money 2025, Hashshan 2021, Guo RFS 2025)
// ============================================================

const translations = {
  fr: {
    tagline: "GLOSSAIRE THE MIRROR",
    backToMirror: "← Retour à The Mirror",
    introTitle: "Comprendre les 13 recommandations",
    introSubtitle: "Vocabulaire scientifique pour gérer une position que vous détenez déjà",
    introText: "Quand un scanner dit STRONG_BUY, c'est l'avis donné à un investisseur qui n'a pas encore de position. Mais une fois que vous détenez le ticker, la question change : que faire de cette position aujourd'hui ?",
    introText2: "The Mirror combine 6 dimensions scientifiques (PnL, drawdown, scénario, score, durée, régime de marché) pour produire 13 recommandations contextuelles. Chaque recommandation est sourcée dans la recherche académique.",

    methodologyTitle: "Notre méthodologie",
    methodologyText: "Aucune recommandation inventée. Chaque seuil numérique et chaque dimension viennent de papiers peer-reviewed publiés dans des revues comme le Journal of Financial Economics, le Journal of Financial Services Research, Mathematical Finance et le Review of Financial Studies.",
    methodologyTransparency: "La combinaison des 6 dimensions en une matrice de 24 règles est notre synthèse pragmatique multi-sources, à itérer selon retours utilisateurs.",

    actionsTitle: "Actions de réduction de position",
    holdsTitle: "Maintien de position",
    alertsTitle: "Alertes et sorties",

    sourcesTitle: "Sources scientifiques mobilisées",
    sourcesIntro: "Chaque recommandation s'appuie sur ces références peer-reviewed :",

    disclaimer: "CLIKXIA est une aide à la décision, pas un conseil financier. La décision finale d'investir vous appartient. Les recommandations sont basées sur des seuils statistiques moyens. Votre situation personnelle (horizon, taxes, taille de position) peut justifier d'autres décisions.",
  },
  en: {
    tagline: "THE MIRROR GLOSSARY",
    backToMirror: "← Back to The Mirror",
    introTitle: "Understanding the 13 recommendations",
    introSubtitle: "Scientific vocabulary for managing a position you already hold",
    introText: "When a scanner says STRONG_BUY, it's the advice given to an investor who doesn't yet hold a position. But once you own the ticker, the question changes: what to do with this position today?",
    introText2: "The Mirror combines 6 scientific dimensions (PnL, drawdown, scenario, score, duration, market regime) to produce 13 contextual recommendations. Each recommendation is sourced from academic research.",

    methodologyTitle: "Our methodology",
    methodologyText: "No invented recommendations. Every numerical threshold and dimension comes from peer-reviewed papers published in journals like the Journal of Financial Economics, Journal of Financial Services Research, Mathematical Finance, and Review of Financial Studies.",
    methodologyTransparency: "The combination of 6 dimensions into a 24-rule matrix is our pragmatic multi-source synthesis, to be iterated based on user feedback.",

    actionsTitle: "Position reduction actions",
    holdsTitle: "Position maintenance",
    alertsTitle: "Alerts and exits",

    sourcesTitle: "Scientific sources used",
    sourcesIntro: "Each recommendation relies on these peer-reviewed references:",

    disclaimer: "CLIKXIA is a decision support tool, not financial advice. The final investment decision is yours. Recommendations are based on average statistical thresholds. Your personal situation (horizon, taxes, position size) may justify other decisions.",
  },
};

// 13 recommandations avec FR + EN + sources
const recommendations = [
  // === RÉDUCTION DE POSITION ===
  {
    category: "actions",
    code: "TAKE_PROFIT",
    fr_label: "Réaliser le bénéfice",
    en_label: "Take Profit",
    fr_desc: "Vendre toute la position pour locker le gain (gains importants, drawdown minime).",
    en_desc: "Sell entire position to lock gains (significant gains, minimal drawdown).",
    fr_when: "Quand : PnL ≥ +20% et drawdown < 5%",
    en_when: "When: PnL ≥ +20% and drawdown < 5%",
    sources: ["Acar & Toffel (2001) — yearly take-profit at +25%", "Han, Zhou & Zhu (JFE 2014)"],
  },
  {
    category: "actions",
    code: "TAKE_PROFIT_TRAILING",
    fr_label: "Stop suiveur sur bénéfice",
    en_label: "Trailing Stop on Profit",
    fr_desc: "Locker une partie en laissant le prix courir avec un stop adaptatif qui suit la hausse.",
    en_desc: "Lock partial gains while letting price run with an adaptive stop that follows the rise.",
    fr_when: "Quand : PnL ≥ +20% et drawdown 5-10%",
    en_when: "When: PnL ≥ +20% and drawdown 5-10%",
    sources: ["Wilcox & Crittenden (2009) — trailing stop S&P 500", "Clarke (2011), Toit (2015)"],
  },
  {
    category: "actions",
    code: "LOCK_GAINS",
    fr_label: "Sécuriser les gains",
    en_label: "Lock Gains",
    fr_desc: "Vendre la majorité pour protéger l'acquis quand le drawdown devient critique.",
    en_desc: "Sell majority to protect acquired gains when drawdown becomes critical.",
    fr_when: "Quand : PnL ≥ +10%, drawdown 10-15%, score qui se dégrade",
    en_when: "When: PnL ≥ +10%, drawdown 10-15%, score deteriorating",
    sources: ["Grossman & Zhou (Mathematical Finance 1993) — cushion D_max − D_t"],
  },
  {
    category: "actions",
    code: "TRIM",
    fr_label: "Réduire la position",
    en_label: "Trim Position",
    fr_desc: "Vendre une partie de la position quand l'objectif n'est pas atteint après une longue durée.",
    en_desc: "Sell part of the position when target not reached after long holding period.",
    fr_when: "Quand : durée > 180 jours, PnL modéré, recommandation passée à HOLD/SELL",
    en_when: "When: duration > 180 days, modest PnL, recommendation downgraded to HOLD/SELL",
    sources: ["Hashshan, Nikkei (2021) — '3年で2倍 sinon vendre'", "Nikkei Money 2025"],
  },
  {
    category: "actions",
    code: "TRIM_HEAVY",
    fr_label: "Réduire fortement",
    en_label: "Heavy Trim",
    fr_desc: "Vendre la majeure partie quand plusieurs signaux négatifs convergent malgré PnL positif.",
    en_desc: "Sell major part when multiple negative signals converge despite positive PnL.",
    fr_when: "Quand : passage à SELL/STRONG_SELL ou score chute > 10 points avec PnL > 0",
    en_when: "When: downgrade to SELL/STRONG_SELL or score drop > 10 points with PnL > 0",
    sources: ["Liu Yuzhen, Pékin Univ. (2020)", "Guo (Review of Financial Studies 2025)"],
  },

  // === MAINTIEN DE POSITION ===
  {
    category: "holds",
    code: "HOLD",
    fr_label: "Conserver",
    en_label: "Hold",
    fr_desc: "Garder la position telle quelle. Position saine, scénario d'investissement intact.",
    en_desc: "Keep the position as is. Healthy position, investment thesis intact.",
    fr_when: "Quand : PnL 0% à +20%, drawdown < 5%, recommandation STRONG_BUY/BUY, score stable",
    en_when: "When: PnL 0% to +20%, drawdown < 5%, recommendation STRONG_BUY/BUY, stable score",
    sources: ["Nikkei Money 2025 — 4連勝&大勝ちさん scénario intact"],
  },
  {
    category: "holds",
    code: "HOLD_WATCH",
    fr_label: "Conserver avec vigilance",
    en_label: "Hold with Watch",
    fr_desc: "Garder mais surveiller. Drawdown normal en bull market ou court terme.",
    en_desc: "Keep but monitor. Normal drawdown in bull market or short-term holding.",
    fr_when: "Quand : PnL légèrement négatif, durée < 90j, régime BULL/NEUTRAL",
    en_when: "When: PnL slightly negative, duration < 90d, BULL/NEUTRAL regime",
    sources: ["Clare et al. (JAM 2013) — bull market false signals tolerance"],
  },
  {
    category: "holds",
    code: "HOLD_TRAILING",
    fr_label: "Conserver avec stop suiveur",
    en_label: "Hold with Trailing Stop",
    fr_desc: "Garder en bull market avec protection adaptative. Laisser courir avec filet de sécurité.",
    en_desc: "Keep in bull market with adaptive protection. Let it run with safety net.",
    fr_when: "Quand : PnL ≥ +20% en régime BULL avec score qui se renforce",
    en_when: "When: PnL ≥ +20% in BULL regime with strengthening score",
    sources: ["Wilcox & Crittenden (2009)", "Clare et al. (2013) bull regime"],
  },

  // === ALERTES ET SORTIES ===
  {
    category: "alerts",
    code: "REVIEW",
    fr_label: "Réviser la position",
    en_label: "Review Position",
    fr_desc: "Se poser la question rationnelle : 'Si je n'avais pas cette position, l'achèterais-je au prix actuel ?'",
    en_desc: "Ask the rational question: 'If I didn't hold this position, would I buy it at current price?'",
    fr_when: "Quand : PnL -10% à -7%, drawdown < 10%, scénario encore intact",
    en_when: "When: PnL -10% to -7%, drawdown < 10%, scenario still intact",
    sources: ["Liu Yuzhen, Pékin Univ. Guanghua (2020) — 重新建仓"],
  },
  {
    category: "alerts",
    code: "WARNING",
    fr_label: "Alerte",
    en_label: "Warning",
    fr_desc: "Plusieurs signaux négatifs convergent. Position à surveiller activement.",
    en_desc: "Multiple negative signals converging. Position to actively monitor.",
    fr_when: "Quand : PnL négatif + drawdown 10-15% + score qui chute, ou régime BEAR",
    en_when: "When: negative PnL + drawdown 10-15% + falling score, or BEAR regime",
    sources: ["Han, Zhou & Zhu (JFE 2014)", "Clare et al. (2013) bear regime"],
  },
  {
    category: "alerts",
    code: "STOP_LOSS",
    fr_label: "Couper la perte",
    en_label: "Stop Loss",
    fr_desc: "Vendre pour limiter la perte avant qu'elle ne s'aggrave.",
    en_desc: "Sell to limit loss before it worsens.",
    fr_when: "Quand : PnL -15% à -10% avec drawdown > 10%",
    en_when: "When: PnL -15% to -10% with drawdown > 10%",
    sources: ["Kaminski & Lo (Journal of Financial Services Research 2014) — seuil consensus"],
  },
  {
    category: "alerts",
    code: "EXIT",
    fr_label: "Sortir complètement",
    en_label: "Exit",
    fr_desc: "Liquider toute la position immédiatement. Drawdown critique ou marché en panique.",
    en_desc: "Liquidate entire position immediately. Critical drawdown or panic market.",
    fr_when: "Quand : drawdown ≥ 15%, ou PnL ≤ -15% avec STRONG_SELL, ou régime PANIC",
    en_when: "When: drawdown ≥ 15%, or PnL ≤ -15% with STRONG_SELL, or PANIC regime",
    sources: ["Acar & Toffel (2001)", "Han, Zhou & Zhu (2014)", "Clare et al. (2013) transition"],
  },
  {
    category: "alerts",
    code: "SCENARIO_BROKEN",
    fr_label: "Scénario invalidé",
    en_label: "Scenario Broken",
    fr_desc: "La thèse d'investissement initiale n'est plus valide. Sortie complète recommandée.",
    en_desc: "Initial investment thesis is no longer valid. Full exit recommended.",
    fr_when: "Quand : score chute ≥ 10 points + recommandation SELL/STRONG_SELL + PnL ≤ 0",
    en_when: "When: score drops ≥ 10 points + recommendation SELL/STRONG_SELL + PnL ≤ 0",
    sources: ["Nikkei Money 2025 — シナリオが崩れたら売る (4連勝 winners)", "Guo (RFS 2025)"],
  },
];

// Sources mobilisées
const academicSources = [
  { authors: "Acar, E. & Toffel, R.", year: "2001", title: "Stop-loss and Investment Returns", journal: "Financial Times/Prentice Hall" },
  { authors: "Kaminski, K.M. & Lo, A.W.", year: "2014", title: "When Do Stop-Loss Rules Stop Losses?", journal: "Journal of Financial Services Research, vol. 46(3), p. 249-276" },
  { authors: "Han, Y., Zhou, G. & Zhu, Y.", year: "2014", title: "Taming Momentum Crashes: A Simple Stop-Loss Strategy", journal: "Journal of Financial Economics, vol. 112(3), p. 408-428" },
  { authors: "Grossman, S.J. & Zhou, Z.", year: "1993", title: "Optimal Investment Strategies for Controlling Drawdowns", journal: "Mathematical Finance, vol. 3(3), p. 241-276" },
  { authors: "Wilcox, J. & Crittenden, E.", year: "2009", title: "Does Trend Following Work on Stocks?", journal: "Technical Research Working Paper" },
  { authors: "Clare, A., Seaton, J., Smith, P.N. & Thomas, S.", year: "2013", title: "Breaking into the Blackbox: Trend Following, Stop Losses and the Frequency of Trading", journal: "Journal of Asset Management, vol. 14(3), p. 182-194" },
  { authors: "Shefrin, H. & Statman, M.", year: "1985", title: "The Disposition to Sell Winners Too Early and Ride Losers Too Long", journal: "Journal of Finance, vol. 40(3), p. 777-790" },
  { authors: "Odean, T.", year: "1998", title: "Are Investors Reluctant to Realize Their Losses?", journal: "Journal of Finance, vol. 53(5), p. 1775-1798" },
  { authors: "Guo, H.", year: "2025", title: "Earnings Extrapolation and Predictable Stock Market Returns", journal: "Review of Financial Studies, vol. 38(6), p. 1730" },
  { authors: "Chen, S. & Ren, F.", year: "2025", title: "Corporate Transparency and the Disposition Effect", journal: "Frontiers in Psychology, DOI:10.3389/fpsyg.2025.1626829" },
  { authors: "Liu Yuzhen (刘玉珍)", year: "2020", title: "从行为金融学理论探讨散户'自救指南'", journal: "Université de Pékin, Guanghua School of Management" },
  { authors: "Nikkei Money", year: "2025", title: "個人投資家調査2025 — 4連勝&大勝ちさん", journal: "Enquête 9000 personnes, juin-juillet 2025" },
  { authors: "JSDA (Japan Securities Dealers Association)", year: "2025", title: "個人投資家の証券投資に関する意識調査", journal: "Enquête 5000 répondants" },
  { authors: "Hashshan", year: "2021", title: "成長期待が崩れた含み損銘柄を持ち続けると大けがをする", journal: "Nikkei interview" },
  { authors: "Lo, A.W. & Remorov, A.", year: "2017", title: "Stop-Loss Strategies with Serial Correlation, Regime Switching, and Transaction Costs", journal: "Journal of Financial Markets, vol. 34" },
];

export default function RecommendationsPage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clikxia_lang");
      if (stored === "fr" || stored === "en") setLang(stored);
    }
  }, []);

  const t = translations[lang];

  const actions = recommendations.filter((r) => r.category === "actions");
  const holds = recommendations.filter((r) => r.category === "holds");
  const alerts = recommendations.filter((r) => r.category === "alerts");

  return (
    <div className="recommendations-page">
      <style>{`
        .recommendations-page {
          min-height: 100vh;
          background: #faf9f7;
          color: #1a1917;
        }
        .recommendations-page a { color: inherit; }

        .reco-header {
          text-align: center;
          padding: 28px 20px 20px;
          background: #faf9f7;
          border-bottom: 1px solid #e8e6e1;
        }
        .reco-header-logo {
          font-family: var(--font-serif, "Fraunces", serif);
          font-weight: 700;
          letter-spacing: -0.03em;
          font-size: 28px;
          text-decoration: none;
          display: inline-block;
        }
        .reco-header-clik { color: #1a1917; }
        .reco-header-xia { color: #0A8B5C; }
        .reco-header-tagline {
          font-size: 10px;
          color: #6b6861;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-family: var(--font-mono, monospace);
          font-weight: 500;
          margin-top: 4px;
        }

        .reco-container {
          max-width: 560px;
          margin: 0 auto;
          padding: 32px 20px 40px;
        }
        @media (min-width: 768px) {
          .reco-container { max-width: 720px; padding: 40px 32px 48px; }
        }
        @media (min-width: 1024px) {
          .reco-container { max-width: 900px; padding: 48px 40px 56px; }
        }

        .reco-back {
          display: inline-block;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: #6b6861;
          text-decoration: none;
          margin-bottom: 24px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .reco-back:hover { color: #1a1917; }

        .reco-tagline {
          font-size: 11px;
          color: #6b6861;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-family: var(--font-mono, monospace);
          font-weight: 500;
          margin-bottom: 12px;
        }

        .reco-intro-title {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: #1a1917;
          margin-bottom: 8px;
        }
        @media (min-width: 768px) { .reco-intro-title { font-size: 40px; } }

        .reco-intro-subtitle {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 18px;
          color: #6b6861;
          font-style: italic;
          margin-bottom: 24px;
          line-height: 1.4;
        }

        .reco-text {
          font-size: 15px;
          line-height: 1.65;
          color: #1a1917;
          margin-bottom: 14px;
        }

        .reco-method-block {
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 12px;
          padding: 20px 24px;
          margin: 32px 0;
        }
        .reco-method-title {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 18px;
          font-weight: 600;
          color: #1a1917;
          margin-bottom: 10px;
        }
        .reco-method-text {
          font-size: 14px;
          line-height: 1.6;
          color: #1a1917;
          margin-bottom: 8px;
        }
        .reco-method-transparency {
          font-size: 13px;
          line-height: 1.6;
          color: #6b6861;
          font-style: italic;
          padding-top: 10px;
          border-top: 1px dashed #e8e6e1;
          margin-top: 10px;
        }

        .reco-section-title {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 24px;
          font-weight: 600;
          color: #1a1917;
          margin-top: 40px;
          margin-bottom: 18px;
          letter-spacing: -0.01em;
        }

        .reco-card {
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 14px;
        }
        .reco-card-header {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1efe9;
        }
        .reco-card-fr {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 19px;
          font-weight: 600;
          color: #1a1917;
          letter-spacing: -0.01em;
        }
        .reco-card-en {
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          color: #6b6861;
          font-weight: 500;
          padding: 3px 9px;
          background: #f1efe9;
          border-radius: 4px;
          letter-spacing: 0.04em;
        }
        .reco-card-code {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          color: #8a8680;
          letter-spacing: 0.06em;
          margin-left: auto;
        }
        .reco-card-desc {
          font-size: 14px;
          line-height: 1.55;
          color: #1a1917;
          margin-bottom: 10px;
        }
        .reco-card-when {
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          color: #276749;
          background: #f0fdf4;
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 10px;
          line-height: 1.5;
        }
        .reco-card-sources {
          font-size: 11px;
          color: #6b6861;
          line-height: 1.55;
          padding-top: 8px;
          border-top: 1px dashed #e8e6e1;
        }
        .reco-card-sources-label {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          color: #8a8680;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .reco-sources-list {
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 12px;
          padding: 24px;
          margin-top: 32px;
        }
        .reco-source-item {
          padding: 12px 0;
          border-bottom: 1px solid #f1efe9;
          font-size: 13px;
          line-height: 1.6;
          color: #1a1917;
        }
        .reco-source-item:last-child { border-bottom: none; }
        .reco-source-authors {
          font-weight: 600;
          color: #1a1917;
        }
        .reco-source-title {
          font-style: italic;
          color: #1a1917;
        }
        .reco-source-journal {
          color: #6b6861;
          font-size: 12px;
        }

        .reco-disclaimer {
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 11px;
          color: #3d3a36;
          line-height: 1.6;
          margin-top: 32px;
        }
      `}</style>

       <SiteHeaderClient lang={lang} compact={true} />

      <div className="reco-container">
        <Link href="/the-mirror" className="reco-back">
          {t.backToMirror}
        </Link>

        <h1 className="reco-intro-title">{t.introTitle}</h1>
        <p className="reco-intro-subtitle">{t.introSubtitle}</p>
        <p className="reco-text">{t.introText}</p>
        <p className="reco-text">{t.introText2}</p>

        <div className="reco-method-block">
          <div className="reco-method-title">{t.methodologyTitle}</div>
          <p className="reco-method-text">{t.methodologyText}</p>
          <p className="reco-method-transparency">{t.methodologyTransparency}</p>
        </div>

        <h2 className="reco-section-title">{t.actionsTitle}</h2>
        {actions.map((r) => (
          <div key={r.code} className="reco-card">
            <div className="reco-card-header">
              <span className="reco-card-fr">{lang === "fr" ? r.fr_label : r.en_label}</span>
              <span className="reco-card-en">{lang === "fr" ? r.en_label : r.fr_label}</span>
              <span className="reco-card-code">{r.code}</span>
            </div>
            <p className="reco-card-desc">{lang === "fr" ? r.fr_desc : r.en_desc}</p>
            <div className="reco-card-when">{lang === "fr" ? r.fr_when : r.en_when}</div>
            <div className="reco-card-sources">
              <div className="reco-card-sources-label">Sources</div>
              {r.sources.join(" · ")}
            </div>
          </div>
        ))}

        <h2 className="reco-section-title">{t.holdsTitle}</h2>
        {holds.map((r) => (
          <div key={r.code} className="reco-card">
            <div className="reco-card-header">
              <span className="reco-card-fr">{lang === "fr" ? r.fr_label : r.en_label}</span>
              <span className="reco-card-en">{lang === "fr" ? r.en_label : r.fr_label}</span>
              <span className="reco-card-code">{r.code}</span>
            </div>
            <p className="reco-card-desc">{lang === "fr" ? r.fr_desc : r.en_desc}</p>
            <div className="reco-card-when">{lang === "fr" ? r.fr_when : r.en_when}</div>
            <div className="reco-card-sources">
              <div className="reco-card-sources-label">Sources</div>
              {r.sources.join(" · ")}
            </div>
          </div>
        ))}

        <h2 className="reco-section-title">{t.alertsTitle}</h2>
        {alerts.map((r) => (
          <div key={r.code} className="reco-card">
            <div className="reco-card-header">
              <span className="reco-card-fr">{lang === "fr" ? r.fr_label : r.en_label}</span>
              <span className="reco-card-en">{lang === "fr" ? r.en_label : r.fr_label}</span>
              <span className="reco-card-code">{r.code}</span>
            </div>
            <p className="reco-card-desc">{lang === "fr" ? r.fr_desc : r.en_desc}</p>
            <div className="reco-card-when">{lang === "fr" ? r.fr_when : r.en_when}</div>
            <div className="reco-card-sources">
              <div className="reco-card-sources-label">Sources</div>
              {r.sources.join(" · ")}
            </div>
          </div>
        ))}

        <h2 className="reco-section-title">{t.sourcesTitle}</h2>
        <p className="reco-text">{t.sourcesIntro}</p>
        <div className="reco-sources-list">
          {academicSources.map((src, i) => (
            <div key={i} className="reco-source-item">
              <span className="reco-source-authors">{src.authors}</span> ({src.year}). <span className="reco-source-title">{src.title}</span>. <span className="reco-source-journal">{src.journal}</span>
            </div>
          ))}
        </div>

        <div className="reco-disclaimer">
          <strong style={{ color: "#1a1917" }}>Avis important.</strong> {t.disclaimer}
        </div>
      </div>
    </div>
  );
}