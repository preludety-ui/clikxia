import Link from "next/link";
import { getTop5, TopStock, Recommendation, recoLabel } from "@/lib/api";
import SignalBar from "@/app/components/SignalBar";
import Disclaimer from "@/app/components/Disclaimer";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ symbol: string }>;
}

const DECISION_COLORS: Record<Recommendation, { bg: string; label: string }> = {
  STRONG_BUY:  { bg: "linear-gradient(135deg, var(--success-500) 0%, #2F855A 100%)", label: "Décision du jour" },
  BUY:         { bg: "linear-gradient(135deg, var(--success-500) 0%, #38A169 100%)", label: "Décision du jour" },
  HOLD:        { bg: "linear-gradient(135deg, var(--warning-500) 0%, #B7791F 100%)", label: "Décision du jour" },
  SELL:        { bg: "linear-gradient(135deg, var(--danger-500) 0%, #C53030 100%)", label: "Décision du jour" },
  STRONG_SELL: { bg: "linear-gradient(135deg, var(--danger-500) 0%, #9B2C2C 100%)", label: "Décision du jour" },
};

function buildExplanation(stock: TopStock): string {
  const mom = stock.signals.momentum_12_1.percentile;
  const prox = stock.signals.proximity_52w_high.percentile;
  const vol = stock.signals.volume_abnormal.percentile;

  const parts: string[] = [];

  if (prox >= 90) parts.push(`proche de son plus haut annuel (${prox.toFixed(0)}%)`);
  else if (prox >= 70) parts.push(`en bonne position par rapport à son plus haut annuel (${prox.toFixed(0)}%)`);

  if (mom >= 90) parts.push("un momentum très fort");
  else if (mom >= 70) parts.push("un momentum solide");
  else if (mom < 30) parts.push("un momentum faible");

  if (vol >= 90) parts.push("un volume d'échanges exceptionnel");
  else if (vol >= 70) parts.push("un volume d'échanges supérieur à la moyenne");

  if (parts.length === 0) {
    return "Les signaux actuels sont mitigés pour cette action.";
  }

  return `Cette action est ${parts.join(", avec ")}. Les trois signaux convergent vers cette analyse.`;
}

export default async function StockDetailPage({ params }: PageProps) {
  const { symbol } = await params;
  const symbolUpper = symbol.toUpperCase();

  const top5Data = await getTop5();
  const stock = top5Data.top5.find((s) => s.symbol === symbolUpper);

  if (!stock) {
    return (
      <div className="clikxia-app">
        <div style={{ maxWidth: "440px", margin: "0 auto", padding: "60px 20px" }}>
          <Link href="/dashboard" style={{ color: "var(--ink-500)", fontSize: "14px" }}>
            ← Retour
          </Link>
          <h1 className="display-lg" style={{ marginTop: "24px" }}>
            Action non trouvée
          </h1>
          <p className="body-md text-ink-700" style={{ marginTop: "12px" }}>
            L'action <strong>{symbolUpper}</strong> n'est pas dans le Top 5 du jour.
            Les données détaillées par action seront bientôt disponibles.
          </p>
        </div>
      </div>
    );
  }

  const colors = DECISION_COLORS[stock.recommendation];

  return (
    <div className="clikxia-app">
      <div style={{ maxWidth: "440px", margin: "0 auto", minHeight: "100vh" }}>

        <div style={{ padding: "48px 20px 8px", background: "var(--surface)" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--ink-500)",
              fontSize: "14px",
            }}
          >
            ← Retour
          </Link>
        </div>

        <div style={{ padding: "8px 20px 20px", background: "var(--surface)" }}>
          <div
            className="display-xl"
            style={{
              fontSize: "36px",
              color: "var(--ink-900)",
              lineHeight: 1,
              marginBottom: "4px",
            }}
          >
            {stock.symbol}
          </div>
          <div style={{ fontSize: "14px", color: "var(--ink-500)", marginBottom: "16px" }}>
            Rang #{stock.rank} du jour
          </div>
        </div>

        <div
          style={{
            margin: "0 20px",
            padding: "28px 24px",
            background: colors.bg,
            borderRadius: "var(--r-lg)",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              opacity: 0.85,
              marginBottom: "8px",
            }}
          >
            {colors.label}
          </div>
          <div
            className="display-xl"
            style={{
              fontSize: "42px",
              color: "white",
              lineHeight: 1,
              marginBottom: "16px",
            }}
          >
            {recoLabel(stock.recommendation)}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              {stock.composite_score.toFixed(0)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "13px",
                opacity: 0.75,
              }}
            >
              / 100
            </span>
          </div>
        </div>

        <div style={{ padding: "24px 20px 20px" }}>
          <div
            className="display-md"
            style={{ fontSize: "18px", marginBottom: "10px" }}
          >
            Pourquoi ?
          </div>
          <div style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--ink-700)" }}>
            {buildExplanation(stock)}
          </div>
        </div>

        <div
          style={{
            padding: "16px 20px 20px",
            background: "var(--surface)",
            borderTop: "1px solid var(--ink-100)",
          }}
        >
          <div
            className="display-md"
            style={{ fontSize: "16px", marginBottom: "16px" }}
          >
            Les 3 signaux
          </div>

          <SignalBar
            name="Momentum"
            description="Force de la tendance sur 12 mois"
            percentile={stock.signals.momentum_12_1.percentile}
          />
          <SignalBar
            name="Proximité 52 semaines"
            description="Distance au plus haut annuel"
            percentile={stock.signals.proximity_52w_high.percentile}
          />
          <SignalBar
            name="Volume anormal"
            description="Attention nouvelle du marché"
            percentile={stock.signals.volume_abnormal.percentile}
          />
        </div>

        <div style={{ margin: "0 20px 24px" }}>
          <Link
            href={`/dashboard/${stock.symbol}/technical`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "var(--brand-50)",
              borderRadius: "var(--r-md)",
              color: "var(--brand-700)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <span>Voir l'analyse technique détaillée</span>
            <span>→</span>
          </Link>
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}
