import { MarketRegime } from "@/lib/api";

interface Props {
  regime: MarketRegime;
  description: string;
}

const REGIME_COLORS: Record<MarketRegime, {
  bg: string;
  border: string;
  icon: string;
  text: string;
  label: string;
}> = {
  BULL: {
    bg: "var(--success-50)",
    border: "rgba(56, 161, 105, 0.25)",
    icon: "var(--success-500)",
    text: "var(--success-700)",
    label: "Marché haussier",
  },
  NEUTRAL: {
    bg: "var(--warning-50)",
    border: "rgba(214, 158, 46, 0.2)",
    icon: "var(--warning-500)",
    text: "var(--warning-700)",
    label: "Marché NEUTRAL",
  },
  BEAR: {
    bg: "var(--danger-50)",
    border: "rgba(229, 62, 62, 0.25)",
    icon: "var(--danger-500)",
    text: "var(--danger-700)",
    label: "Marché baissier",
  },
  PANIC: {
    bg: "var(--danger-500)",
    border: "rgba(155, 44, 44, 0.4)",
    icon: "var(--danger-700)",
    text: "white",
    label: "Marché en panique",
  },
  UNKNOWN: {
    bg: "var(--ink-50)",
    border: "var(--ink-300)",
    icon: "var(--ink-500)",
    text: "var(--ink-700)",
    label: "Régime inconnu",
  },
};

export default function RegimeBanner({ regime, description }: Props) {
  const c = REGIME_COLORS[regime];

  return (
    <div
      style={{
        margin: "16px 20px 0",
        padding: "14px 16px",
        borderRadius: "var(--r-md)",
        background: c.bg,
        border: `1px solid ${c.border}`,
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "var(--r-pill)",
          background: c.icon,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "12px",
          fontWeight: 700,
          marginTop: "2px",
        }}
      >
        !
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: c.text, marginBottom: "2px" }}>
          {c.label}
        </div>
        <div style={{ fontSize: "12px", color: "var(--ink-700)", lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    </div>
  );
}
