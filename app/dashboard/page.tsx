"use client";
import { useState, useEffect } from "react";

interface Signal {
  ticker: string;
  price: number;
  change: number;
  changePct: string;
  decision: string;
  confidence: number;
  score: number;
  signal_quality: string;
  timing: string;
  entry_low: number;
  entry_high: number;
  target_low: number;
  target_high: number;
  stop_loss: number;
  horizon: string;
  scenario_up: number;
  scenario_down: number;
  scenario_flat: number;
  reasons: string[];
  score_technique: number;
  score_news: number;
  score_psychologie: number;
  score_devises: number;
}

export default function Dashboard() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("CA");
  const [updated, setUpdated] = useState("");
  const [selected, setSelected] = useState<Signal | null>(null);

  useEffect(() => {
    fetch("/api/geo")
      .then(res => res.json())
      .then(data => {
        setCountry(data.country);
        loadSignals(data.country);
      })
      .catch(() => loadSignals("CA"));
  }, []);

  const loadSignals = async (c: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/signals?country=${c}`);
      const data = await res.json();
      setSignals(data.signals || []);
      setUpdated(new Date().toLocaleTimeString());
    } catch {
      console.error("Error loading signals");
    } finally {
      setLoading(false);
    }
  };

  const decisionColor = (d: string) => d === "BUY" ? "#00E5A0" : d === "SELL" ? "#FF4560" : "#F59E0B";
  const decisionBorder = (d: string) => d === "BUY" ? "4px solid #00E5A0" : d === "SELL" ? "4px solid #FF4560" : "4px solid #F59E0B";

  return (
    <div style={{ background: "#0A0F1E", minHeight: "100vh", padding: "16px", fontFamily: "-apple-system, sans-serif", color: "white" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-1px" }}>
          CLIK<span style={{ color: "#00E5A0" }}>XIA</span>
        </div>
        <button
          onClick={() => loadSignals(country)}
          style={{ background: "rgba(0,229,160,0.1)", color: "#00E5A0", border: "1px solid rgba(0,229,160,0.3)", borderRadius: "20px", padding: "6px 14px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
        >
          {loading ? "Chargement..." : `Actualisé ${updated}`}
        </button>
      </div>

      {/* Title */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "16px", fontWeight: 800, marginBottom: "4px" }}>
          Les 5 meilleures opportunités boursières du jour, prêtes à trader
        </div>
        <div style={{ fontSize: "11px", color: "#888" }}>
          Mis à jour en temps réel · Basé sur 4 couches IA · {new Date().toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Score Legend */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 12px", marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>SCORE CLIKXIA / 100 — BASÉ SUR 4 COUCHES IA</div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            ["Technique (RSI, momentum, volume)", "#00E5A0"],
            ["News & Événements", "#60A5FA"],
            ["Psychologie marché (NLP)", "#C084FC"],
            ["Devises", "#F59E0B"],
          ].map(([label, color]) => (
            <span key={label} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: `${color}22`, color, border: `1px solid ${color}44` }}>{label}</span>
          ))}
        </div>
      </div>

      {/* Signals */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <div>Analyse en cours — 4 couches IA...</div>
        </div>
      ) : signals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          <div>Aucun signal disponible — réessayez dans quelques instants</div>
        </div>
      ) : (
        signals.map((s, i) => (
          <div
            key={s.ticker}
            onClick={() => setSelected(selected?.ticker === s.ticker ? null : s)}
            style={{ background: "#111827", borderRadius: "16px", padding: "14px", marginBottom: "10px", border: `0.5px solid rgba(255,255,255,0.08)`, borderLeft: decisionBorder(s.decision), cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#888" }}>#{i+1}</div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 800 }}>{s.ticker}</div>
                  <div style={{ fontSize: "10px", color: "#888" }}>{s.price?.toFixed(2)}$ · {s.changePct}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: `${decisionColor(s.decision)}22`, color: decisionColor(s.decision), border: `1px solid ${decisionColor(s.decision)}` }}>{s.score} / 100</div>
                <div style={{ fontSize: "9px", color: "#555", marginTop: "3px", maxWidth: "140px", textAlign: "right" }}>{s.reasons?.[0]}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: decisionColor(s.decision) }}>{s.decision}</div>
              <div style={{ fontSize: "11px", color: "#888" }}>Confiance {s.confidence}%</div>
              <div style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", marginLeft: "auto", background: `${decisionColor(s.decision)}22`, color: decisionColor(s.decision) }}>Signal {s.signal_quality}</div>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", borderRadius: "20px", padding: "3px 10px", fontSize: "10px", fontWeight: 600, background: `${decisionColor(s.decision)}11`, color: decisionColor(s.decision), border: `1px solid ${decisionColor(s.decision)}33`, marginBottom: "8px" }}>
              {s.timing}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "7px" }}>
                <div style={{ fontSize: "9px", color: "#555", marginBottom: "1px" }}>ENTRÉE</div>
                <div style={{ fontSize: "12px", fontWeight: 600 }}>{s.entry_low}-{s.entry_high}$</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "7px" }}>
                <div style={{ fontSize: "9px", color: "#555", marginBottom: "1px" }}>OBJECTIF</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#00E5A0" }}>{s.target_low}-{s.target_high}$</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "7px" }}>
                <div style={{ fontSize: "9px", color: "#555", marginBottom: "1px" }}>STOP-LOSS</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#FF4560" }}>{s.stop_loss}$</div>
              </div>
            </div>

            {/* Detail expanded */}
            {selected?.ticker === s.ticker && (
              <div style={{ marginTop: "12px", borderTop: "0.5px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
                
                {/* Scenarios */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>SIMULATION SCÉNARIOS</div>
                  {[
                    [`Hausse ${s.target_low}-${s.target_high}$`, s.scenario_up, "#00E5A0"],
                    [`Chute ${s.stop_loss}$`, s.scenario_down, "#FF4560"],
                    [`Flat`, s.scenario_flat, "#888"],
                  ].map(([label, pct, color]) => (
                    <div key={label as string} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <div style={{ fontSize: "10px", color: "#aaa", width: "100px" }}>{label as string}</div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "4px", height: "5px" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color as string, borderRadius: "4px" }} />
                      </div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: color as string, width: "28px" }}>{pct}%</div>
                    </div>
                  ))}
                </div>

                {/* 4 layers */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>ANALYSE 4 COUCHES</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {[
                      [`Technique ${s.score_technique}/100`, "#00E5A0"],
                      [`News ${s.score_news}/100`, "#60A5FA"],
                      [`Psychologie ${s.score_psychologie}/100`, "#C084FC"],
                      [`Devises ${s.score_devises}/100`, "#F59E0B"],
                    ].map(([label, color]) => (
                      <span key={label as string} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", background: `${color}22`, color: color as string, border: `1px solid ${color}44` }}>{label as string}</span>
                    ))}
                  </div>
                </div>

                {/* Reasons */}
                <div>
                  <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "6px" }}>POURQUOI CE SIGNAL</div>
                  {s.reasons?.map((r, j) => (
                    <div key={j} style={{ fontSize: "11px", color: "#aaa", display: "flex", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ color: decisionColor(s.decision) }}>+</span>{r}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      <div style={{ textAlign: "center", fontSize: "10px", color: "#333", marginTop: "16px" }}>
        CLIKXIA est un outil d'aide à la décision. Tout investissement comporte des risques.
      </div>
    </div>
  );
}