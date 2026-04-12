"use client";
import { useState, useEffect } from "react";

interface Signal {
  ticker: string;
  name?: string;
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
  fear_greed?: number;
  momentum7d?: string;
}

interface MarketStatus {
  mode: string;
  isWeekend: boolean;
  isPreMarket: boolean;
  isMarketOpen: boolean;
  nextOpen: string;
}

interface FearGreed {
  value: number;
  label: string;
}

export default function Dashboard() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("CA");
  const [updated, setUpdated] = useState("");
  const [selected, setSelected] = useState<Signal | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [fearGreed, setFearGreed] = useState<FearGreed | null>(null);

  useEffect(() => {
    fetch("/api/market-status")
      .then(res => res.json())
      .then(status => {
        setMarketStatus(status);
        fetch("/api/geo")
          .then(res => res.json())
          .then(geo => {
            setCountry(geo.country);
            if (status.isWeekend || status.mode === "afterhours") {
              loadWeekendSignals();
            } else {
              loadSignals(geo.country);
            }
          })
          .catch(() => loadSignals("CA"));
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

  const loadWeekendSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/signals-weekend");
      const data = await res.json();
      setSignals(data.signals || []);
      setFearGreed(data.fearGreed);
      setUpdated(new Date().toLocaleTimeString());
    } catch {
      console.error("Error loading weekend signals");
    } finally {
      setLoading(false);
    }
  };

  const decisionColor = (d: string) => d === "BUY" ? "#00E5A0" : d === "SELL" ? "#FF4560" : "#F59E0B";
  const decisionBorder = (d: string) => d === "BUY" ? "4px solid #00E5A0" : d === "SELL" ? "4px solid #FF4560" : "4px solid #F59E0B";

  const isWeekendMode = marketStatus?.isWeekend || marketStatus?.mode === "afterhours";

  return (
    <div style={{ background: "#0A0F1E", minHeight: "100vh", padding: "16px", fontFamily: "-apple-system, sans-serif", color: "white" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-1px" }}>
          CLIK<span style={{ color: "#00E5A0" }}>XIA</span>
        </div>
        <button
          onClick={() => isWeekendMode ? loadWeekendSignals() : loadSignals(country)}
          style={{ background: "rgba(0,229,160,0.1)", color: "#00E5A0", border: "1px solid rgba(0,229,160,0.3)", borderRadius: "20px", padding: "6px 14px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
        >
          {loading ? "Chargement..." : `Actualisé ${updated}`}
        </button>
      </div>

      {/* Mode Banner */}
      {isWeekendMode ? (
        <div style={{ background: "rgba(123,94,167,0.15)", border: "1px solid rgba(123,94,167,0.4)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#C084FC" }}>MODE PRÉ-OUVERTURE</div>
            <div style={{ fontSize: "10px", color: "#888" }}>Marchés actions fermés</div>
          </div>
          <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "8px" }}>
            Préparation de l'ouverture de lundi · Crypto live + analyse des gaps potentiels
          </div>
          {fearGreed && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "10px", color: "#888" }}>Fear & Greed Index :</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: fearGreed.value < 30 ? "#FF4560" : fearGreed.value > 70 ? "#00E5A0" : "#F59E0B" }}>
                {fearGreed.value} — {fearGreed.label}
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "4px", height: "5px", overflow: "hidden" }}>
                <div style={{ width: `${fearGreed.value}%`, height: "100%", background: fearGreed.value < 30 ? "#FF4560" : fearGreed.value > 70 ? "#00E5A0" : "#F59E0B", borderRadius: "4px" }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "12px", padding: "10px 16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "12px", color: "#00E5A0", fontWeight: 600 }}>Marchés ouverts</div>
          <div style={{ fontSize: "10px", color: "#888" }}>TSX · NYSE · NASDAQ</div>
        </div>
      )}

      {/* Title */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "16px", fontWeight: 800, marginBottom: "4px" }}>
          {isWeekendMode
            ? "Top 3 Crypto — Live ce weekend + Watchlist lundi"
            : "Les 5 meilleures opportunités boursières du jour, prêtes à trader"}
        </div>
        <div style={{ fontSize: "11px", color: "#888" }}>
          {isWeekendMode
            ? "Crypto 24h/24 · Fear & Greed · Momentum 7 jours · Préparation semaine"
            : "Mis à jour en temps réel · Basé sur 4 couches IA · " + new Date().toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Score Legend */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 12px", marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", color: "#888", letterSpacing: "1px", marginBottom: "8px" }}>
          {isWeekendMode ? "SCORE CLIKXIA WEEKEND — CRYPTO + FEAR & GREED + MOMENTUM" : "SCORE CLIKXIA / 100 — BASÉ SUR 4 COUCHES IA"}
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {isWeekendMode ? [
            ["Technique 7 jours", "#00E5A0"],
            ["Fear & Greed", "#C084FC"],
            ["News crypto", "#60A5FA"],
            ["Momentum", "#F59E0B"],
          ].map(([label, color]) => (
            <span key={label} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: `${color}22`, color, border: `1px solid ${color}44` }}>{label}</span>
          )) : [
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
          <div>{isWeekendMode ? "Analyse crypto en cours..." : "Analyse en cours — 4 couches IA..."}</div>
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
                  <div style={{ fontSize: "10px", color: "#888" }}>
                    {s.price?.toFixed(s.price > 1000 ? 0 : 2)}$ · {s.changePct}
                    {s.momentum7d && <span style={{ marginLeft: "6px", color: parseFloat(s.momentum7d) > 0 ? "#00E5A0" : "#FF4560" }}>7j: {s.momentum7d}%</span>}
                  </div>
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
                <div style={{ fontSize: "12px", fontWeight: 600 }}>{s.entry_low?.toLocaleString()}-{s.entry_high?.toLocaleString()}$</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "7px" }}>
                <div style={{ fontSize: "9px", color: "#555", marginBottom: "1px" }}>OBJECTIF</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#00E5A0" }}>{s.target_low?.toLocaleString()}-{s.target_high?.toLocaleString()}$</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "7px" }}>
                <div style={{ fontSize: "9px", color: "#555", marginBottom: "1px" }}>STOP-LOSS</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#FF4560" }}>{s.stop_loss?.toLocaleString()}$</div>
              </div>
            </div>

            {selected?.ticker === s.ticker && (
              <div style={{ marginTop: "12px", borderTop: "0.5px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>SIMULATION SCÉNARIOS</div>
                  {[
                    [`Hausse ${s.target_low?.toLocaleString()}-${s.target_high?.toLocaleString()}$`, s.scenario_up, "#00E5A0"],
                    [`Chute ${s.stop_loss?.toLocaleString()}$`, s.scenario_down, "#FF4560"],
                    [`Flat`, s.scenario_flat, "#888"],
                  ].map(([label, pct, color]) => (
                    <div key={label as string} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <div style={{ fontSize: "10px", color: "#aaa", width: "120px" }}>{label as string}</div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "4px", height: "5px" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color as string, borderRadius: "4px" }} />
                      </div>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: color as string, width: "28px" }}>{pct}%</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>ANALYSE COUCHES</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {[
                      [`Technique ${s.score_technique}/100`, "#00E5A0"],
                      [`News ${s.score_news}/100`, "#60A5FA"],
                      [`Psychologie ${s.score_psychologie}/100`, "#C084FC"],
                      [isWeekendMode ? `Fear&Greed ${s.fear_greed}/100` : `Devises ${s.score_devises}/100`, "#F59E0B"],
                    ].map(([label, color]) => (
                      <span key={label as string} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", background: `${color}22`, color: color as string, border: `1px solid ${color}44` }}>{label as string}</span>
                    ))}
                  </div>
                </div>

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