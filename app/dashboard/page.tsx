"use client";
import { useState, useEffect, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface Opportunity {
  symbol: string;
  name: string;
  price: number;
  change_pct: number;
  expected_value: number;
  net_ev: number;
  p_up: number;
  p_down: number;
  confidence: any;
  uncertainty: number;
  position_profiles: any;
  cluster: string;
  regime: string;
  regime_context: string;
  signal_stable: string;
  signal_freshness: any;
  edge: any;
  why_now: string[];
  why_not_signal: string[];
  is_valid_signal: boolean;
  rejection_reasons: string[];
  pattern_performance: any;
  ranking_factors: any;
  cluster_context: any;
  diversification: any;
  n_signals: number;
  active_signals: string[];
  anomaly_score: number;
  no_trade_threshold: number;
  impact_level?: string;
  trajectory?: any;
}

interface DecisionFeed {
  signals: Opportunity[];
  radar: {
    opportunities: Opportunity[];
    early_feed: Opportunity[];
    clusters: Array<{ type: string; label: string; symbols: string[]; n: number }>;
  };
  meta: {
    regime: string;
    fear_greed: { value: number; label: string };
    last_scan: string;
    global_track_record: { return_30d: number; sharpe_30d: number; hit_rate_30d: number };
    market_volatility: number;
    no_trade_threshold: number;
    market_state: string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SIGNAL_COLORS = {
  BUY: "#00E5A0",
  SELL: "#FF4560",
  WAIT: "#F59E0B",
  WATCH: "#60A5FA",
};

const CLUSTER_ICONS: Record<string, string> = {
  momentum_shock: "↑",
  structural_break: "⚡",
  liquidity_shock: "◆",
  emerging_signal: "★",
  price_momentum: "→",
  mixed_anomaly: "~",
};

const IMPACT_COLORS: Record<string, string> = {
  HIGH: "#FF4560",
  MEDIUM: "#F59E0B",
  LOW: "#888",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function timeAgo(iso: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "maintenant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  return `il y a ${h}h`;
}

function evDisplay(ev: number): string {
  if (ev === undefined || ev === null) return "—";
  const pct = (ev * 100).toFixed(1);
  return ev >= 0 ? `+${pct}%` : `${pct}%`;
}

function signalColor(s: string): string {
  return SIGNAL_COLORS[s as keyof typeof SIGNAL_COLORS] || "#888";
}

function edgeBar(score: number): string {
  const clamped = Math.max(0, Math.min(score, 2));
  const filled = Math.round((clamped / 2) * 4);
  return "▓".repeat(filled) + "░".repeat(4 - filled);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Header({ meta, loading }: { meta: DecisionFeed["meta"] | null; loading: boolean }) {
  const regime = meta?.regime || "neutral";
  const regimeColor = regime === "bull" ? "#00E5A0" : regime === "bear" ? "#FF4560" : "#F59E0B";
  const tr = meta?.global_track_record;

  return (
    <div style={{
      background: "#0D1117",
      borderBottom: "0.5px solid rgba(255,255,255,0.08)",
      padding: "12px 16px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-1px", fontFamily: "monospace" }}>
          CLIK<span style={{ color: "#00E5A0" }}>XIA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: regimeColor }} />
            <span style={{ fontSize: "11px", color: regimeColor, fontWeight: 700, textTransform: "uppercase" }}>
              {regime}
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "#555" }}>
            {loading ? "⟳ scan..." : timeAgo(meta?.last_scan || "")}
          </span>
        </div>
      </div>
      {tr && (
        <div style={{ display: "flex", gap: "16px" }}>
          <span style={{ fontSize: "10px", color: "#00E5A0" }}>
            30j +{(tr.return_30d * 100).toFixed(1)}%
          </span>
          <span style={{ fontSize: "10px", color: "#888" }}>
            Sharpe {tr.sharpe_30d}
          </span>
          <span style={{ fontSize: "10px", color: "#888" }}>
            Hit {(tr.hit_rate_30d * 100).toFixed(0)}%
          </span>
          {meta?.fear_greed && (
            <span style={{ fontSize: "10px", color: "#F59E0B", marginLeft: "auto" }}>
              Fear & Greed {meta.fear_greed.value} — {meta.fear_greed.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function TabNav({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div style={{
      display: "flex",
      gap: "4px",
      padding: "12px 16px 0",
      borderBottom: "0.5px solid rgba(255,255,255,0.06)",
    }}>
      {["signals", "radar"].map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: "8px 20px",
            borderRadius: "8px 8px 0 0",
            border: "none",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            background: active === tab ? "rgba(0,229,160,0.1)" : "transparent",
            color: active === tab ? "#00E5A0" : "#555",
            borderBottom: active === tab ? "2px solid #00E5A0" : "2px solid transparent",
            transition: "all 0.2s",
          }}
        >
          {tab === "signals" ? "⚡ Signaux" : "🌍 Radar"}
        </button>
      ))}
    </div>
  );
}

function DegradedMode({ meta }: { meta: DecisionFeed["meta"] }) {
  return (
    <div style={{
      margin: "16px",
      background: "rgba(255,255,255,0.03)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "24px", marginBottom: "12px" }}>⚪</div>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#888", marginBottom: "8px" }}>
        Marché neutre — aucune opportunité forte détectée
      </div>
      <div style={{ fontSize: "12px", color: "#555", marginBottom: "16px", lineHeight: "1.6" }}>
        Seuil actuel : {(meta.no_trade_threshold * 100).toFixed(1)}%
        (volatilité marché {(meta.market_volatility * 100).toFixed(1)}%)
      </div>
      <div style={{ fontSize: "11px", color: "#444", lineHeight: "1.8" }}>
        Recommandation CLIKXIA :
        <br />→ Réduire exposition au marché
        <br />→ Attendre confirmation de régime
        <br />→ Surveiller Radar pour émergence
      </div>
    </div>
  );
}

function HeroSignalCard({ opp, onExpand }: { opp: Opportunity; onExpand: () => void }) {
  const sc = signalColor(opp.signal_stable);
  const conf = typeof opp.confidence === "object" ? opp.confidence : { global: opp.confidence };
  const globalConf = Math.round((conf.global || 0) * 100 / 5) * 5;
  const freshness = opp.signal_freshness || {};
  const edge = opp.edge || {};
  const positions = opp.position_profiles || {};

  return (
    <div style={{
      margin: "12px 16px 8px",
      background: "#111827",
      borderRadius: "20px",
      border: `0.5px solid rgba(255,255,255,0.08)`,
      borderLeft: `4px solid ${sc}`,
      overflow: "hidden",
    }}>
      {/* ZONE 1 — DÉCISION */}
      <div style={{ padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px", fontFamily: "monospace" }}>
              {opp.symbol}
            </div>
            <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>{opp.name}</div>
          </div>
          <div style={{
            padding: "6px 14px",
            borderRadius: "20px",
            background: `${sc}22`,
            border: `1px solid ${sc}`,
            fontSize: "14px",
            fontWeight: 900,
            color: sc,
            letterSpacing: "1px",
          }}>
            {opp.signal_stable}
          </div>
        </div>

        <div style={{ fontSize: "28px", fontWeight: 900, color: sc, marginBottom: "2px", fontFamily: "monospace" }}>
          {evDisplay(opp.expected_value)}
          <span style={{ fontSize: "13px", color: "#555", fontWeight: 400, marginLeft: "6px" }}>
            (5j) ±{(opp.uncertainty * 100).toFixed(0)}%
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "9px", color: "#555", marginBottom: "2px" }}>CONFIDENCE</div>
            <div style={{ fontSize: "13px", fontWeight: 700 }}>{globalConf}%</div>
            <div style={{ fontSize: "9px", color: "#666" }}>
              {conf.label_hero || `Model: ${conf.model?.label || "—"} · Stats: ${conf.stat?.label || "—"}`}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "9px", color: "#555", marginBottom: "2px" }}>SIGNAL</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: freshness.strength_label === "HIGH" ? "#00E5A0" : "#F59E0B" }}>
              {freshness.strength_label || "—"}
            </div>
            <div style={{ fontSize: "9px", color: "#666" }}>Decay: {freshness.decay_label || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "9px", color: "#555", marginBottom: "2px" }}>POSITION</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>
              🟢 {((positions.conservative || 0) * 100).toFixed(0)}% ·
              🟡 {((positions.standard || 0) * 100).toFixed(0)}% ·
              🔴 {((positions.aggressive || 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 2 — VALIDATION */}
      <div style={{
        padding: "10px 16px",
        background: "rgba(255,255,255,0.02)",
        borderTop: "0.5px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#00E5A0", fontWeight: 700, marginBottom: "3px" }}>
              ✅ VALID SIGNAL
            </div>
            <div style={{ fontSize: "10px", color: "#666" }}>
              Edge: {edgeBar(edge.score || 0)} {edge.label || "—"}
              {" · "}EV {evDisplay(opp.expected_value)} &gt; seuil {evDisplay(opp.no_trade_threshold)}
            </div>
          </div>
          {opp.diversification?.warning && (
            <div style={{ fontSize: "10px", color: "#F59E0B" }}>
              ⚠️ {opp.diversification.sector} {((opp.diversification.sector_weight_before || 0) * 100).toFixed(0)}% → {((opp.diversification.sector_weight_after || 0) * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </div>

      {/* ZONE 3 — CONTEXTE */}
      <div style={{ padding: "10px 16px 14px" }}>
        <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "6px" }}>
          POURQUOI MAINTENANT ?
        </div>
        {(opp.why_now || []).map((r, i) => (
          <div key={i} style={{ fontSize: "11px", color: "#aaa", marginBottom: "3px" }}>
            <span style={{ color: sc }}>→</span> {r}
          </div>
        ))}
        {opp.pattern_performance?.sample_size > 5 && (
          <div style={{ fontSize: "10px", color: "#555", marginTop: "8px" }}>
            Signaux similaires (n={opp.pattern_performance.sample_size}) :
            <span style={{ color: "#00E5A0" }}> {(opp.pattern_performance.win_rate * 100).toFixed(0)}% win</span>
            <span style={{ color: "#888" }}> · +{(opp.pattern_performance.avg_return * 100).toFixed(1)}% avg (5j)</span>
          </div>
        )}
        <button
          onClick={onExpand}
          style={{
            marginTop: "10px",
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "10px",
            color: "#888",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Voir détails complets →
        </button>
      </div>
    </div>
  );
}

function SignalCard({ opp, onExpand }: { opp: Opportunity; onExpand: () => void }) {
  const sc = signalColor(opp.signal_stable);
  const edge = opp.edge || {};

  return (
    <div
      onClick={onExpand}
      style={{
        margin: "0 16px 8px",
        background: "#111827",
        borderRadius: "14px",
        padding: "12px 14px",
        border: "0.5px solid rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${sc}`,
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "monospace" }}>{opp.symbol}</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: sc }}>{opp.signal_stable}</span>
        </div>
        <div style={{ fontSize: "10px", color: "#555" }}>
          Edge: {edge.label || "—"} · {opp.n_signals} signaux
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "18px", fontWeight: 900, color: sc, fontFamily: "monospace" }}>
          {evDisplay(opp.expected_value)}
        </div>
        <div style={{ fontSize: "9px", color: "#555" }}>5j</div>
      </div>
    </div>
  );
}

function SignalDrawer({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  const sc = signalColor(opp.signal_stable);
  const conf = typeof opp.confidence === "object" ? opp.confidence : { global: opp.confidence };
  const rf = opp.ranking_factors || {};

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      zIndex: 200,
      display: "flex",
      alignItems: "flex-end",
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#111827",
          borderRadius: "20px 20px 0 0",
          padding: "20px 16px 32px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          border: "0.5px solid rgba(255,255,255,0.1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace" }}>
            {opp.symbol} <span style={{ color: sc }}>{opp.signal_stable}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: "20px", cursor: "pointer" }}>×</button>
        </div>

        {/* Probabilité & EV */}
        <Section title="PROBABILITÉ & EV">
          <Row label="P(hausse)" value={`${(opp.p_up * 100).toFixed(0)}%`} color="#00E5A0" />
          <Row label="P(baisse)" value={`${(opp.p_down * 100).toFixed(0)}%`} color="#FF4560" />
          <Row label={`EV brut (5j)`} value={evDisplay(opp.expected_value)} color={sc} />
          <Row label={`EV net (5j)`} value={evDisplay(opp.net_ev)} color={sc} />
          <Row label="Incertitude" value={`±${(opp.uncertainty * 100).toFixed(0)}%`} />
        </Section>

        {/* Confidence */}
        <Section title="CONFIDENCE">
          <Row label="Model" value={`${((conf.model?.score || 0) * 100).toFixed(0)}%`} sub={conf.model?.label} />
          <Row label="Stats" value={`${((conf.stat?.score || 0) * 100).toFixed(0)}%`} sub={conf.stat?.label} />
          <Row label="Facteur limitant" value={conf.limiting_factor || "—"} color="#F59E0B" />
          {(conf.drivers || []).map((d: any, i: number) => (
            <div key={i} style={{ fontSize: "10px", color: d.positive ? "#00E5A0" : "#FF4560", marginBottom: "2px" }}>
              {d.positive ? "✅" : "⚠️"} {d.label}
            </div>
          ))}
        </Section>

        {/* Ranking */}
        <Section title="RANKING DRIVEN BY">
          <Row label="EV net" value={evDisplay(rf.net_ev || 0)} />
          <Row label="Confidence" value={`${((rf.confidence || 0) * 100).toFixed(0)}%`} />
          <Row label="Diversification" value={`${((rf.diversification || 0) * 100).toFixed(0)}%`} />
          <Row label="Cluster penalty" value={`${((rf.cluster_penalty || 1) * 100).toFixed(0)}%`} />
          <Row label="Final rank" value={`${(rf.final_rank || 0).toFixed(3)}`} color={sc} />
        </Section>

        {/* Alternatives */}
        <Section title="ALTERNATIVES">
          <Row label="BUY" value={evDisplay(opp.expected_value)} color="#00E5A0" />
          <Row label="WAIT" value="+0.4%" color="#F59E0B" />
          <Row label="Seuil no-trade" value={evDisplay(opp.no_trade_threshold)} color="#555" />
        </Section>

        {/* Régime */}
        <Section title="RÉGIME & CONTEXTE">
          <Row label="Régime HMM" value={opp.regime} />
          <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>{opp.regime_context}</div>
        </Section>

        {/* Track record */}
        {opp.pattern_performance?.sample_size > 5 && (
          <Section title="TRACK RECORD SIMILAIRE">
            <Row label="Cluster" value={opp.pattern_performance.cluster} />
            <Row label="Win rate" value={`${(opp.pattern_performance.win_rate * 100).toFixed(0)}%`} color="#00E5A0" />
            <Row label="Gain moyen (5j)" value={`+${(opp.pattern_performance.avg_return * 100).toFixed(1)}%`} color="#00E5A0" />
            <Row label="Perte moyenne" value={`-${(opp.pattern_performance.avg_loss * 100).toFixed(1)}%`} color="#FF4560" />
            <Row label="Échantillon" value={`n=${opp.pattern_performance.sample_size}`} />
            <div style={{ fontSize: "9px", color: "#444", marginTop: "4px" }}>⚠️ proxy — Phase 2 : walk-forward réel</div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "9px", color: "#444", letterSpacing: "1px", marginBottom: "8px" }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
      <span style={{ fontSize: "11px", color: "#666" }}>{label}{sub ? ` (${sub})` : ""}</span>
      <span style={{ fontSize: "12px", fontWeight: 600, color: color || "#ccc" }}>{value}</span>
    </div>
  );
}

function RadarCard({ opp }: { opp: Opportunity }) {
  const cluster = opp.cluster || "mixed_anomaly";
  const icon = CLUSTER_ICONS[cluster] || "~";
  const clusterColors: Record<string, string> = {
    momentum_shock: "#00E5A0",
    structural_break: "#C084FC",
    liquidity_shock: "#60A5FA",
    emerging_signal: "#F59E0B",
    price_momentum: "#00E5A0",
    mixed_anomaly: "#888",
  };
  const cc = clusterColors[cluster] || "#888";

  return (
    <div style={{
      margin: "0 16px 8px",
      background: "#111827",
      borderRadius: "14px",
      padding: "12px 14px",
      border: "0.5px solid rgba(255,255,255,0.06)",
      borderLeft: `3px solid ${cc}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
        <div>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "monospace", marginRight: "8px" }}>{opp.symbol}</span>
          <span style={{ fontSize: "10px", color: cc }}>{icon} {cluster.replace("_", " ")}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: opp.expected_value >= 0 ? "#00E5A0" : "#FF4560", fontFamily: "monospace" }}>
            {evDisplay(opp.expected_value)}
          </div>
          <div style={{ fontSize: "9px", color: "#555" }}>5j</div>
        </div>
      </div>
      <div style={{ fontSize: "10px", color: "#555", marginBottom: "6px" }}>
        {opp.n_signals} signaux · P(up) {(opp.p_up * 100).toFixed(0)}% · score {opp.anomaly_score?.toFixed(2)}
      </div>
      {(opp.why_now || opp.why_not_signal || []).slice(0, 2).map((r, i) => (
        <div key={i} style={{ fontSize: "10px", color: "#666", marginBottom: "2px" }}>→ {r}</div>
      ))}
    </div>
  );
}

function EarlyFeedItem({ opp }: { opp: Opportunity }) {
  const impact = opp.impact_level || "LOW";
  const ic = IMPACT_COLORS[impact] || "#888";
  const traj = opp.trajectory;
  const freshness = opp.signal_freshness || {};

  return (
    <div style={{
      margin: "0 16px 8px",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "12px",
      padding: "10px 12px",
      border: "0.5px solid rgba(255,255,255,0.05)",
      borderLeft: `3px solid ${ic}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: ic }}>
            {impact === "HIGH" ? "🔥" : impact === "MEDIUM" ? "⚠️" : "ℹ️"} {impact}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "monospace" }}>{opp.symbol}</span>
        </div>
        <span style={{ fontSize: "10px", color: "#555" }}>
          Freshness: {freshness.strength_label || "—"}
        </span>
      </div>

      {traj && traj.ev?.length > 1 && (
        <div style={{ fontSize: "10px", color: traj.trend === "rising" ? "#00E5A0" : traj.trend === "falling" ? "#FF4560" : "#888", marginBottom: "4px" }}>
          {traj.trend === "rising" ? "📈" : traj.trend === "falling" ? "📉" : "➡️"} EV: {traj.ev.map((v: number) => `${(v * 100).toFixed(1)}%`).join(" → ")} ({traj.trend})
        </div>
      )}

      {(opp.why_not_signal || []).slice(0, 2).map((r, i) => (
        <div key={i} style={{ fontSize: "9px", color: "#555" }}>→ {r}</div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Dashboard() {
  const [data, setData] = useState<DecisionFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("signals");
  const [drawer, setDrawer] = useState<Opportunity | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/decision-feed");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const signals = data?.signals || [];
  const radar = data?.radar?.opportunities || [];
  const earlyFeed = data?.radar?.early_feed || [];
  const clusters = data?.radar?.clusters || [];
  const meta = data?.meta || null;

  return (
    <div style={{
      background: "#0A0F1E",
      minHeight: "100vh",
      color: "white",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: "32px",
    }}>
      <Header meta={meta} loading={loading} />
      <TabNav active={tab} onChange={setTab} />

      {loading ? (
        <div style={{ padding: "40px 16px", textAlign: "center", color: "#555" }}>
          <div style={{ fontSize: "12px", marginBottom: "8px" }}>Analyse en cours...</div>
          <div style={{ fontSize: "10px", color: "#333" }}>Moteur v9 · Decision Intelligence</div>
        </div>
      ) : tab === "signals" ? (
        <div style={{ paddingTop: "12px" }}>
          {signals.length === 0 && radar.length === 0 ? (
    meta && <DegradedMode meta={meta} />
) : signals.length === 0 ? (
    <>
        <DegradedMode meta={meta!} />
        <div style={{ padding: "0 16px 8px", fontSize: "9px", color: "#444", letterSpacing: "1px", marginTop: "16px" }}>
            EN SURVEILLANCE — PAS ENCORE ACTIONNABLES
        </div>
        {radar.slice(0, 3).map(o => (
            <SignalCard key={o.symbol} opp={{...o, signal_stable: "WATCH"}} onExpand={() => setDrawer(o)} />
        ))}
    </>
) : (
            <>
              <HeroSignalCard opp={signals[0]} onExpand={() => setDrawer(signals[0])} />
              {signals.slice(1).map(s => (
                <SignalCard key={s.symbol} opp={s} onExpand={() => setDrawer(s)} />
              ))}
            </>
          )}
        </div>
      ) : (
        <div style={{ paddingTop: "12px" }}>
          {/* Early Signal Feed */}
          {earlyFeed.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ padding: "0 16px 8px", fontSize: "9px", color: "#444", letterSpacing: "1px" }}>
                EARLY SIGNAL FEED
              </div>
              {earlyFeed.slice(0, 5).map(o => (
                <EarlyFeedItem key={o.symbol} opp={o} />
              ))}
            </div>
          )}

          {/* Top Opportunities */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ padding: "0 16px 8px", fontSize: "9px", color: "#444", letterSpacing: "1px" }}>
              TOP OPPORTUNITÉS
            </div>
            {radar.map(o => (
              <RadarCard key={o.symbol} opp={o} />
            ))}
          </div>

          {/* Cluster Panel */}
          {clusters.length > 0 && (
            <div style={{ margin: "0 16px" }}>
              <div style={{ fontSize: "9px", color: "#444", letterSpacing: "1px", marginBottom: "10px" }}>
                CLUSTERS DÉTECTÉS
              </div>
              {clusters.map(c => (
                <div key={c.type} style={{
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  marginBottom: "6px",
                  border: "0.5px solid rgba(255,255,255,0.05)",
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, marginBottom: "4px" }}>{c.label}</div>
                  <div style={{ fontSize: "10px", color: "#666" }}>
                    {c.symbols.join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {drawer && <SignalDrawer opp={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}