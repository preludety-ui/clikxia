"use client";
import { useState, useEffect } from "react";

const ENGINE = "https://clikxia-engine-production.up.railway.app";

interface Opportunity {
  ticker: string;
  name: string;
  price: number;
  change_pct: number;
  anomaly_label: string;
  anomaly_score: number;
  n_signals: number;
  active_signals: string[];
  cluster: string;
  interpretation: string;
  source: string;
  detectors: {
    price: { detected: boolean; label: string };
    volume: { detected: boolean; label: string };
    momentum: { detected: boolean; label: string };
    ml: { detected: boolean; label: string };
    temporal: { detected: boolean; label: string };
    relational: { detected: boolean; label: string; sector?: string; deviation?: number };
  };
  baseline: {
    price_z: number;
    volume_ratio: number;
    momentum_5d: number;
    current_price: number;
  };
}

const CLUSTER_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  structural_break: { label: "Rupture structurelle", color: "#C084FC", icon: "⚡" },
  emerging_signal: { label: "Signal émergent", color: "#F59E0B", icon: "★" },
  liquidity_shock: { label: "Choc de liquidité", color: "#60A5FA", icon: "◆" },
  momentum_shock: { label: "Choc de momentum", color: "#00E5A0", icon: "↑" },
  price_momentum: { label: "Prix + momentum", color: "#00E5A0", icon: "→" },
  mixed_anomaly: { label: "Anomalie mixte", color: "#888", icon: "~" },
};

const SOURCE_LABELS: Record<string, string> = {
  "biggest-gainers": "Top haussiers",
  "biggest-losers": "Top baissiers",
  "most-actives": "Plus actifs",
  "lead_lag_propagation": "Propagation",
};

const SIGNAL_LABELS: Record<string, string> = {
  price: "Prix",
  volume: "Volume",
  momentum: "Momentum",
  ml: "ML",
  temporal: "Émergent",
  relational: "Sectoriel",
};

export default function Radar() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("");
  const [meta, setMeta] = useState<{ total_scanned: number; universe_size: number; fear_greed: { value: number; label: string } } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    loadScan();
  }, []);

  const loadScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ENGINE}/scan`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setMeta({
        total_scanned: data.total_scanned,
        universe_size: data.universe_size,
        fear_greed: data.fear_greed
      });
      setUpdated(new Date().toLocaleTimeString());
    } catch {
      console.error("Error loading scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#0A0F1E", minHeight: "100vh", padding: "16px", fontFamily: "-apple-system, sans-serif", color: "white" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-1px" }}>
          CLIK<span style={{ color: "#00E5A0" }}>XIA</span>
        </div>
        <button
          onClick={loadScan}
          style={{ background: "rgba(0,229,160,0.1)", color: "#00E5A0", border: "1px solid rgba(0,229,160,0.3)", borderRadius: "20px", padding: "6px 14px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
        >
          {loading ? "Scan en cours..." : `Actualisé ${updated}`}
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <a href="/dashboard" style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", color: "#888", border: "0.5px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>Signaux</a>
        <a href="/opportunities" style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", color: "#888", border: "0.5px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>Opportunités</a>
        <div style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "20px", background: "rgba(0,229,160,0.1)", color: "#00E5A0", border: "1px solid rgba(0,229,160,0.3)" }}>Radar marché</div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "16px", fontWeight: 800, marginBottom: "4px" }}>
          Radar — Top 5 anomalies du marché entier
        </div>
        <div style={{ fontSize: "11px", color: "#888" }}>
          Scanner {meta?.total_scanned || "..."} tickers · Propagation sectorielle · Z-score · Isolation Forest · Momentum
        </div>
      </div>

      {meta && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {[
            ["Tickers scannés", meta.total_scanned],
            ["Univers initial", meta.universe_size],
            [`Fear & Greed`, `${meta.fear_greed.value} — ${meta.fear_greed.label}`],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px 12px" }}>
              <div style={{ fontSize: "9px", color: "#555", marginBottom: "4px" }}>{label}</div>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          <div style={{ fontSize: "14px", marginBottom: "8px" }}>Scan du marché en cours...</div>
          <div style={{ fontSize: "11px", color: "#555" }}>Analyse de {meta?.total_scanned || "200+"} tickers · 1-2 minutes</div>
        </div>
      ) : opportunities.length === 0 ? (
        <div style={{ background: "#111827", borderRadius: "16px", padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "#888" }}>Aucune anomalie détectée — marché calme</div>
        </div>
      ) : (
        opportunities.map((opp, i) => {
          const cluster = CLUSTER_LABELS[opp.cluster] || { label: opp.cluster, color: "#888", icon: "~" };
          const isExpanded = selected === opp.ticker;
          const scoreColor = opp.anomaly_score > 0.7 ? "#00E5A0" : opp.anomaly_score > 0.5 ? "#F59E0B" : "#888";
          const changeColor = opp.change_pct > 0 ? "#00E5A0" : "#FF4560";

          return (
            <div
              key={opp.ticker}
              onClick={() => setSelected(isExpanded ? null : opp.ticker)}
              style={{ background: "#111827", borderRadius: "16px", padding: "14px", marginBottom: "10px", border: `0.5px solid rgba(255,255,255,0.08)`, borderLeft: `4px solid ${cluster.color}`, cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#888" }}>#{i+1}</div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 800 }}>{opp.ticker}</div>
                    <div style={{ fontSize: "10px", color: "#888" }}>{opp.name} · {opp.price.toFixed(2)}$ · <span style={{ color: changeColor }}>{opp.change_pct > 0 ? "+" : ""}{opp.change_pct.toFixed(2)}%</span></div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: scoreColor }}>{Math.round(opp.anomaly_score * 100)}</div>
                  <div style={{ fontSize: "9px", color: "#555" }}>SCORE</div>
                </div>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${cluster.color}15`, border: `1px solid ${cluster.color}44`, borderRadius: "20px", padding: "4px 12px", marginBottom: "8px" }}>
                <span style={{ color: cluster.color, fontSize: "12px" }}>{cluster.icon}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: cluster.color }}>{cluster.label}</span>
                <span style={{ fontSize: "10px", color: "#888" }}>· {opp.n_signals} signaux</span>
              </div>

              <div style={{ fontSize: "12px", color: "#ccc", marginBottom: "8px", lineHeight: "1.5" }}>{opp.interpretation}</div>

              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "6px" }}>
                {opp.active_signals.map(sig => (
                  <span key={sig} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", color: "#aaa", border: "0.5px solid rgba(255,255,255,0.1)" }}>
                    {SIGNAL_LABELS[sig] || sig}
                  </span>
                ))}
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", color: "#555", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                  {SOURCE_LABELS[opp.source] || opp.source}
                </span>
              </div>

              {isExpanded && (
                <div style={{ marginTop: "12px", borderTop: "0.5px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "12px" }}>
                    {[
                      ["Z-SCORE PRIX", opp.baseline.price_z.toFixed(2), Math.abs(opp.baseline.price_z) > 2 ? "#00E5A0" : "#888"],
                      ["VOLUME RATIO", `${opp.baseline.volume_ratio.toFixed(1)}x`, opp.baseline.volume_ratio > 2 ? "#00E5A0" : "#888"],
                      ["MOMENTUM 5J", `${(opp.baseline.momentum_5d * 100).toFixed(1)}%`, opp.baseline.momentum_5d > 0 ? "#00E5A0" : "#FF4560"],
                    ].map(([label, value, color]) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px" }}>
                        <div style={{ fontSize: "9px", color: "#555", marginBottom: "2px" }}>{label}</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: color as string }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>DÉTECTEURS</div>
                  {Object.entries(opp.detectors).map(([key, det]) => (
                    <div key={key} style={{ display: "flex", gap: "8px", marginBottom: "4px", alignItems: "flex-start" }}>
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: det.detected ? "rgba(0,229,160,0.2)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: det.detected ? "#00E5A0" : "#555", flexShrink: 0 }}>
                        {det.detected ? "✓" : "·"}
                      </div>
                      <div style={{ fontSize: "11px", color: det.detected ? "#ccc" : "#555" }}>{det.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      <div style={{ textAlign: "center", fontSize: "10px", color: "#333", marginTop: "16px" }}>
        CLIKXIA est un outil d'aide à la décision. Tout investissement comporte des risques.
      </div>
    </div>
  );
}