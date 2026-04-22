import Link from "next/link";
import { getStockTechnical, recoLabel } from "@/lib/api";
import Disclaimer from "@/app/components/Disclaimer";
import type {
  StockTechnicalResponse,
  QualityData,
  ValueData,
  LowVolatilityData,
  PriceContextData,
} from "@/lib/api";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ symbol: string }>;
}

// ============================================================
// HELPERS D'AFFICHAGE
// ============================================================

function fmtPct(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;
}

// Pour les valeurs toujours positives (volatilite, marge nette)
function fmtPctAbs(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v.toFixed(decimals)}%`;
}

function fmtNum(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return v.toFixed(decimals);
}

function fmtRatio(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  if (v <= 0) return "n/a";
  return v.toFixed(2);
}

function fmtVolumeRatio(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `x${v.toFixed(2)}`;
}

function fmtPrice(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `$${v.toFixed(2)}`;
}

function fmtPercentile(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${Math.round(v)}e pct`;
}

// Labels bases sur percentile (scientifiquement fondes)
function qualityLabel(percentile: number | null | undefined): { label: string; color: string } {
  if (percentile === null || percentile === undefined) return { label: "—", color: "var(--ink-500)" };
  if (percentile >= 70) return { label: "ROBUST", color: "var(--success-700)" };
  if (percentile >= 30) return { label: "NEUTRAL", color: "var(--ink-500)" };
  return { label: "WEAK", color: "var(--danger-700)" };
}

function valueLabel(percentile: number | null | undefined): { label: string; color: string } {
  if (percentile === null || percentile === undefined) return { label: "—", color: "var(--ink-500)" };
  if (percentile >= 70) return { label: "UNDERVALUED", color: "var(--success-700)" };
  if (percentile >= 30) return { label: "FAIR", color: "var(--ink-500)" };
  return { label: "GROWTH PREMIUM", color: "var(--warning-700)" };
}

function ivolLabel(percentile: number | null | undefined): { label: string; color: string } {
  if (percentile === null || percentile === undefined) return { label: "—", color: "var(--ink-500)" };
  if (percentile >= 70) return { label: "DEFENSIVE", color: "var(--success-700)" };
  if (percentile >= 30) return { label: "MODERATE", color: "var(--ink-500)" };
  return { label: "HIGH RISK", color: "var(--danger-700)" };
}

// ============================================================
// PROFIL FACTORIEL (4 labels scientifiques)
// ============================================================
// Sources :
// - Blitz, Hanauer & Vidojevic (2017) - Idiosyncratic Momentum Anomaly
// - Daniel & Moskowitz (2016) - Momentum Crashes
// - Frazzini & Pedersen (2014) - Betting Against Beta
// - Morningstar Style Box methodology
//
// Logique : on regarde les facteurs dominants (percentile >= 70)
// pour classifier le stock dans 1 des 4 profils.

function computeProfileLabel(
  momentumPct: number | null,
  ivolPct: number | null,
  qualityPct: number | null
): { label: string; color: string; tooltip: string } | null {
  // Si momentum fort + low vol : profil le plus favorable
  if (
    momentumPct !== null && momentumPct >= 70 &&
    ivolPct !== null && ivolPct >= 70
  ) {
    return {
      label: "Quality Momentum",
      color: "var(--success-700)",
      tooltip: "Momentum eleve avec stabilite du prix (profil favorable)"
    };
  }

  // Si momentum fort + haute vol : attention risque de crash
  if (
    momentumPct !== null && momentumPct >= 70 &&
    ivolPct !== null && ivolPct < 30
  ) {
    return {
      label: "Speculative Momentum",
      color: "var(--warning-700)",
      tooltip: "Momentum eleve mais volatilite elevee (risque de reversal)"
    };
  }

  // Si low vol dominant (sans momentum) : defensif
  if (ivolPct !== null && ivolPct >= 70 && (momentumPct === null || momentumPct < 70)) {
    return {
      label: "Defensive",
      color: "var(--success-700)",
      tooltip: "Stabilite du prix prioritaire"
    };
  }

  // Sinon : profil mixte
  return {
    label: "Balanced",
    color: "var(--ink-500)",
    tooltip: "Pas de tilt factoriel dominant"
  };
}

// Score Value composite (heuristique provisoire)
// Utilise P/E en priorite, P/B en fallback si P/E negatif/null (entreprises en perte)
// Reference: Fama-French (1992) - P/B et P/E sont les 2 ratios Value classiques
function valueScoreFromRatios(v: ValueData | null): number | null {
  if (!v) return null;
  const pe = v.pe_ratio;
  const pb = v.pb_ratio;

  // Priorite 1 : P/E si positif
  if (pe !== null && pe !== undefined && pe > 0) {
    if (pe < 15) return 75;
    if (pe < 25) return 50;
    return 20;
  }

  // Fallback : P/B (fonctionne meme pour entreprises en perte)
  if (pb !== null && pb !== undefined && pb > 0) {
    if (pb < 1.5) return 75;
    if (pb < 3) return 50;
    return 20;
  }

  return null;
}

// Score Quality a partir de PROF (Novy-Marx) : nous n'avons pas encore le percentile en base
// donc on utilise une heuristique simple sur PROF brut
function qualityScoreFromProf(q: QualityData | null): number | null {
  if (!q || q.prof === null || q.prof === undefined) return null;
  // Novy-Marx & Velikov 2024 : PROF typique entre 0 et 0.5 pour stocks sains
  // Winsorize les valeurs extremes pour l'affichage
  const clipped = Math.max(-1, Math.min(2, q.prof));
  // Mapper [-1, 2] sur [0, 100]
  return Math.round(((clipped + 1) / 3) * 100);
}

// ============================================================
// COMPOSANTS VISUELS
// ============================================================

function Hero({
  symbol,
  recommendation,
  regime,
  currentPrice,
  change1d,
  compositeScore,
  rankPosition,
  profileLabel,
  profileColor,
}: {
  symbol: string;
  recommendation: string | null;
  regime: string | null;
  currentPrice: number | null;
  change1d: number | null;
  compositeScore: number | null;
  rankPosition: number | null;
  profileLabel: string | null;
  profileColor: string | null;
}) {
  const recoColor =
    recommendation === "STRONG_BUY" || recommendation === "BUY"
      ? "var(--success-700)"
      : recommendation === "HOLD"
      ? "var(--warning-700)"
      : "var(--danger-700)";

  const recoBg =
    recommendation === "STRONG_BUY" || recommendation === "BUY"
      ? "var(--success-100)"
      : recommendation === "HOLD"
      ? "var(--warning-100)"
      : "var(--danger-100)";

  const changeColor =
    change1d === null || change1d === undefined
      ? "var(--ink-500)"
      : change1d >= 0
      ? "var(--success-700)"
      : "var(--danger-700)";

  return (
    <div style={{ padding: "8px 20px 20px", background: "var(--surface)" }}>
      <div className="display-xl" style={{ fontSize: "40px", color: "var(--ink-900)", lineHeight: 1, marginBottom: "4px" }}>
        {symbol}
      </div>

      {/* Badges recommandation + regime */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", marginBottom: "16px" }}>
        {recommendation && (
          <span
            style={{
              display: "inline-flex",
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              background: recoBg,
              color: recoColor,
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {recoLabel(recommendation as never)}
          </span>
        )}
        {regime && (
          <span
            style={{
              display: "inline-flex",
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.06em",
              background: "var(--ink-100)",
              color: "var(--ink-500)",
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            REGIME : {regime}
          </span>
        )}
        {profileLabel && (
          <span
            style={{
              display: "inline-flex",
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              background: "var(--surface)",
              color: profileColor || "var(--ink-700)",
              border: `1px solid ${profileColor || "var(--ink-300)"}`,
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {profileLabel}
          </span>
        )}
      </div>

      {/* Prix + variation */}
      {currentPrice !== null && (
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
          <span
            className="mono"
            style={{ fontSize: "32px", fontWeight: 500, color: "var(--ink-900)", lineHeight: 1 }}
          >
            {fmtPrice(currentPrice)}
          </span>
          <span
            className="mono"
            style={{ fontSize: "14px", color: changeColor, fontWeight: 500 }}
          >
            {fmtPct(change1d)} aujourd&apos;hui
          </span>
        </div>
      )}

      {/* Composite score */}
      {compositeScore !== null && (
        <div
          style={{
            padding: "14px",
            background: "var(--surface)",
            border: "1px solid var(--ink-100)",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span
              className="mono"
              style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-500)" }}
            >
              Score composite CLIKXIA
            </span>
            <span className="mono" style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-900)" }}>
              {fmtNum(compositeScore, 1)} / 100
            </span>
          </div>
          <div style={{ height: "4px", background: "var(--ink-100)", borderRadius: "2px", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(0, compositeScore))}%`,
                height: "100%",
                background: "var(--ink-900)",
                borderRadius: "2px",
              }}
            />
          </div>
          {rankPosition !== null && (
            <div style={{ fontSize: "11px", color: "var(--ink-500)", marginTop: "6px" }}>
              Rang {rankPosition} de la selection
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ padding: "24px 20px 8px" }}>
      <div className="display-lg" style={{ fontSize: "20px", color: "var(--ink-900)", marginBottom: subtitle ? "4px" : "0" }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: "13px", color: "var(--ink-500)" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

function SignalCard({
  label,
  value,
  percentile,
  unit,
}: {
  label: string;
  value: number | null;
  percentile: number | null;
  unit?: string;
}) {
  const pct = percentile ?? 0;
  const badgeColor =
    pct >= 70 ? "var(--success-700)" : pct >= 30 ? "var(--ink-500)" : "var(--danger-700)";
  const badgeBg =
    pct >= 70 ? "var(--success-100)" : pct >= 30 ? "var(--ink-100)" : "var(--danger-100)";

  return (
    <div
      style={{
        padding: "14px",
        background: "var(--surface)",
        border: "1px solid var(--ink-100)",
        borderRadius: "8px",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <span
          className="mono"
          style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-500)" }}
        >
          {label}
        </span>
        <span
          className="mono"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "3px",
            background: badgeBg,
            color: badgeColor,
            letterSpacing: "0.04em",
          }}
        >
          {fmtPercentile(percentile)}
        </span>
      </div>
      <div className="mono" style={{ fontSize: "22px", fontWeight: 500, color: "var(--ink-900)", marginBottom: "10px" }}>
        {value !== null ? `${fmtNum(value, 2)}${unit || ""}` : "—"}
      </div>
      <div style={{ height: "3px", background: "var(--ink-100)", borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            height: "100%",
            background: "var(--ink-900)",
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}

function FactorCard({
  title,
  description,
  label,
  labelColor,
  percentile,
  rows,
}: {
  title: string;
  description: string;
  label: string;
  labelColor: string;
  percentile: number | null;
  rows: { label: string; value: string }[];
}) {
  return (
    <div
      style={{
        padding: "16px",
        background: "var(--surface)",
        border: "1px solid var(--ink-100)",
        borderRadius: "8px",
        marginBottom: "8px",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink-900)", marginBottom: "2px" }}>
          {title}
        </div>
        <div style={{ fontSize: "12px", color: "var(--ink-500)" }}>
          {description}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span className="mono" style={{ fontSize: "11px", fontWeight: 600, color: labelColor, letterSpacing: "0.04em" }}>
          {label}
        </span>
        <span className="mono" style={{ fontSize: "11px", color: "var(--ink-500)" }}>
          {fmtPercentile(percentile)}
        </span>
      </div>

      <div style={{ height: "3px", background: "var(--ink-100)", borderRadius: "2px", overflow: "hidden", marginBottom: "12px" }}>
        <div
          style={{
            width: `${Math.min(100, Math.max(0, percentile ?? 0))}%`,
            height: "100%",
            background: "var(--ink-900)",
            borderRadius: "2px",
          }}
        />
      </div>

      <div style={{ paddingTop: "12px", borderTop: "1px solid var(--ink-100)" }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: "12px",
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            <span style={{ color: "var(--ink-500)" }}>{row.label}</span>
            <span style={{ color: "var(--ink-900)", fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceContextSection({ pc }: { pc: PriceContextData }) {
  const rangePos = pc.range_position_52w ?? 0;
  const changeColor = (v: number | null) =>
    v === null || v === undefined ? "var(--ink-500)" : v >= 0 ? "var(--success-700)" : "var(--danger-700)";

  return (
    <div
      style={{
        padding: "16px",
        background: "var(--surface)",
        border: "1px solid var(--ink-100)",
        borderRadius: "8px",
        marginBottom: "8px",
      }}
    >
      <div
        className="mono"
        style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-500)", marginBottom: "12px" }}
      >
        Range 52 semaines
      </div>

      <div style={{ position: "relative", height: "6px", background: "var(--ink-100)", borderRadius: "3px", marginBottom: "8px" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            height: "100%",
            width: `${Math.min(100, Math.max(0, rangePos))}%`,
            background: "var(--ink-900)",
            borderRadius: "3px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-5px",
            left: `${Math.min(100, Math.max(0, rangePos))}%`,
            width: "2px",
            height: "16px",
            background: "var(--ink-900)",
            transform: "translateX(-1px)",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--ink-500)", fontFamily: "var(--font-mono), monospace" }}>
        <span>{fmtPrice(pc.low_52w)}</span>
        <span style={{ color: "var(--ink-900)", fontWeight: 500 }}>
          Position : {fmtNum(pc.range_position_52w, 1)}%
        </span>
        <span>{fmtPrice(pc.high_52w)}</span>
      </div>

      {/* Variations */}
      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--ink-100)" }}>
        <div
          className="mono"
          style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-500)", marginBottom: "10px" }}
        >
          Variations
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          <div style={{ padding: "8px", background: "var(--bg)", borderRadius: "6px" }}>
            <div style={{ fontSize: "10px", color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>1 jour</div>
            <div className="mono" style={{ fontSize: "14px", fontWeight: 500, color: changeColor(pc.change_1d) }}>
              {fmtPct(pc.change_1d)}
            </div>
          </div>
          <div style={{ padding: "8px", background: "var(--bg)", borderRadius: "6px" }}>
            <div style={{ fontSize: "10px", color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>5 jours</div>
            <div className="mono" style={{ fontSize: "14px", fontWeight: 500, color: changeColor(pc.change_5d) }}>
              {fmtPct(pc.change_5d)}
            </div>
          </div>
          <div style={{ padding: "8px", background: "var(--bg)", borderRadius: "6px" }}>
            <div style={{ fontSize: "10px", color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>30 jours</div>
            <div className="mono" style={{ fontSize: "14px", fontWeight: 500, color: changeColor(pc.change_30d) }}>
              {fmtPct(pc.change_30d)}
            </div>
          </div>
        </div>
      </div>

      {/* Moyennes mobiles + volume */}
      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--ink-100)" }}>
        <div
          className="mono"
          style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-500)", marginBottom: "10px" }}
        >
          Moyennes mobiles &amp; volume
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          <div style={{ padding: "8px", background: "var(--bg)", borderRadius: "6px" }}>
            <div style={{ fontSize: "10px", color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
              Prix vs SMA 50
            </div>
            <div className="mono" style={{ fontSize: "14px", fontWeight: 500, color: changeColor(pc.price_vs_sma50) }}>
              {fmtPct(pc.price_vs_sma50)}
            </div>
            <div style={{ fontSize: "10px", color: "var(--ink-500)", marginTop: "2px" }}>
              SMA 50 : {fmtPrice(pc.sma_50)}
            </div>
          </div>
          <div style={{ padding: "8px", background: "var(--bg)", borderRadius: "6px" }}>
            <div style={{ fontSize: "10px", color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
              Prix vs SMA 200
            </div>
            <div className="mono" style={{ fontSize: "14px", fontWeight: 500, color: changeColor(pc.price_vs_sma200) }}>
              {fmtPct(pc.price_vs_sma200)}
            </div>
            <div style={{ fontSize: "10px", color: "var(--ink-500)", marginTop: "2px" }}>
              SMA 200 : {fmtPrice(pc.sma_200)}
            </div>
          </div>
          <div style={{ padding: "8px", background: "var(--bg)", borderRadius: "6px", gridColumn: "1 / -1" }}>
            <div style={{ fontSize: "10px", color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
              Volume vs moyenne 50j
            </div>
            <div className="mono" style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-900)" }}>
              {fmtVolumeRatio(pc.volume_ratio)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default async function TechnicalPage({ params }: PageProps) {
  const { symbol } = await params;
  const symbolUpper = symbol.toUpperCase();

  let data: StockTechnicalResponse;
  try {
    data = await getStockTechnical(symbolUpper);
  } catch (err) {
    return (
      <div className="clikxia-app">
        <div style={{ maxWidth: "440px", margin: "0 auto", padding: "60px 20px" }}>
          <Link href="/dashboard" style={{ color: "var(--ink-500)", fontSize: "14px" }}>
            &larr; Retour
          </Link>
          <h1 className="display-lg" style={{ marginTop: "24px" }}>
            Donnees non disponibles
          </h1>
          <p style={{ color: "var(--ink-500)", marginTop: "12px", fontSize: "14px" }}>
            Impossible de charger les donnees techniques pour {symbolUpper}.
          </p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="clikxia-app">
        <div style={{ maxWidth: "440px", margin: "0 auto", padding: "60px 20px" }}>
          <Link href="/dashboard" style={{ color: "var(--ink-500)", fontSize: "14px" }}>
            &larr; Retour
          </Link>
          <h1 className="display-lg" style={{ marginTop: "24px" }}>
            {symbolUpper} non trouve
          </h1>
          <p style={{ color: "var(--ink-500)", marginTop: "12px", fontSize: "14px" }}>
            {data.error}
          </p>
        </div>
      </div>
    );
  }

  const q = data.quality;
  const v = data.value;
  const lv = data.low_volatility;
  const pc = data.price_context;

  const qualityPct = qualityScoreFromProf(q);
  const valuePct = valueScoreFromRatios(v);
  const ivolPct = lv?.ivol_percentile ?? null;

  const qLabel = qualityLabel(qualityPct);
  const vLabel = valueLabel(valuePct);
  const lvLabel = ivolLabel(ivolPct);

  // Calcul du profil factoriel (Quality Momentum / Speculative Momentum / Defensive / Balanced)
  const momentumPct = data.signals.momentum_12_1.percentile;
  const profile = computeProfileLabel(momentumPct, ivolPct, qualityPct);

  return (
    <div className="clikxia-app">
      <div style={{ maxWidth: "440px", margin: "0 auto", minHeight: "100vh" }}>

        {/* Navigation */}
        <div style={{ padding: "48px 20px 8px", background: "var(--surface)" }}>
          <Link href={`/dashboard/${data.symbol}`} style={{ color: "var(--ink-500)", fontSize: "14px" }}>
            &larr; Vue simple
          </Link>
        </div>

        {/* Hero */}
        <Hero
          symbol={data.symbol}
          recommendation={data.recommendation}
          regime={data.market_regime}
          currentPrice={pc?.current ?? null}
          change1d={pc?.change_1d ?? null}
          compositeScore={data.composite_score}
          rankPosition={data.rank_position}
          profileLabel={profile?.label ?? null}
          profileColor={profile?.color ?? null}
        />

        {/* Signaux CLIKXIA */}
        <SectionTitle title="Signaux CLIKXIA" subtitle="Les 3 signaux qui composent la recommandation" />
        <div style={{ padding: "0 20px" }}>
          <SignalCard
            label="Momentum 12-1"
            value={data.signals.momentum_12_1.value}
            percentile={data.signals.momentum_12_1.percentile}
          />
          <SignalCard
            label="Proximite 52w high"
            value={data.signals.proximity_52w_high.value}
            percentile={data.signals.proximity_52w_high.percentile}
          />
          <SignalCard
            label="Volume anormal"
            value={data.signals.volume_abnormal.value}
            percentile={data.signals.volume_abnormal.percentile}
            unit="x"
          />
        </div>

        {/* Facteurs fondamentaux */}
        <SectionTitle title="Facteurs fondamentaux" subtitle="Quality, Value et Low Volatility" />
        <div style={{ padding: "0 20px" }}>
          {q && (
            <FactorCard
              title="Quality"
              description="Rentabilite operationnelle"
              label={qLabel.label}
              labelColor={qLabel.color}
              percentile={qualityPct}
              rows={[
                { label: "PROF", value: fmtNum(q.prof, 3) },
                { label: "ROE", value: q.roe !== null ? fmtPct(q.roe * 100, 1) : "—" },
                { label: "Marge nette", value: q.net_margin !== null ? fmtPctAbs(q.net_margin * 100, 1) : "—" },
              ]}
            />
          )}

          {v && (
            <FactorCard
              title="Value"
              description="Valorisation vs fondamentaux"
              label={vLabel.label}
              labelColor={vLabel.color}
              percentile={valuePct}
              rows={[
                { label: "P/E (TTM)", value: fmtRatio(v.pe_ratio) },
                { label: "P/B", value: fmtRatio(v.pb_ratio) },
                { label: "P/S", value: fmtRatio(v.ps_ratio) },
                { label: "EV/EBITDA", value: fmtRatio(v.ev_ebitda) },
              ]}
            />
          )}

          {lv && (
            <FactorCard
              title="Low Volatility"
              description="Stabilite du prix"
              label={lvLabel.label}
              labelColor={lvLabel.color}
              percentile={ivolPct}
              rows={[
                { label: "IVOL 252j", value: lv.ivol_252 !== null ? fmtPctAbs(lv.ivol_252 * 100, 1) : "—" },
                { label: "VOL 60j", value: lv.vol_60 !== null ? fmtPctAbs(lv.vol_60 * 100, 1) : "—" },
                { label: "Beta SPY", value: fmtNum(lv.beta_spy, 2) },
              ]}
            />
          )}
        </div>

        {/* Contexte prix */}
        {pc && (
          <>
            <SectionTitle title="Contexte prix" subtitle="Range 52 semaines, moyennes mobiles, variations" />
            <div style={{ padding: "0 20px" }}>
              <PriceContextSection pc={pc} />
            </div>
          </>
        )}

        <Disclaimer />
      </div>
    </div>
  );
}
