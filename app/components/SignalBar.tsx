interface Props {
  name: string;
  description: string;
  percentile: number;
}

export default function SignalBar({ name, description, percentile }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "8px",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid var(--ink-100)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink-900)" }}>
          {name}
        </span>
        <span style={{ fontSize: "11px", color: "var(--ink-500)", lineHeight: 1.3 }}>
          {description}
        </span>
      </div>
      <div
        style={{
          width: "100px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-end",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--ink-900)",
          }}
        >
          {percentile.toFixed(0)}%
        </span>
        <div
          style={{
            width: "100%",
            height: "4px",
            background: "var(--ink-100)",
            borderRadius: "var(--r-pill)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percentile}%`,
              background: "linear-gradient(90deg, var(--brand-500), var(--success-500))",
              borderRadius: "var(--r-pill)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
