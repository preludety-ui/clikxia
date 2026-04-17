"use client";
import { useState, useEffect } from "react";

interface Anomaly {
    ticker: string;
    price: number;
    change_pct: number;
    anomaly_detected: boolean;
    anomaly_label: string;
    anomaly_score: number;
    n_signals: number;
    active_signals: string[];
    cluster: string;
    interpretation: string;
    detectors: {
        price: { detected: boolean; label: string; direction?: string };
        volume: { detected: boolean; label: string };
        momentum: { detected: boolean; label: string; direction?: string };
        ml: { detected: boolean; label: string };
        temporal: { detected: boolean; label: string };
        relational: { detected: boolean; label: string; sector?: string; deviation?: number };
    };
    baseline: {
        price_z: number;
        volume_ratio: number;
        momentum_5d: number;
        volatility_20d: number;
        current_price: number;
    };
}

const CLUSTER_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    momentum_shock: { label: "Choc de momentum", color: "#00E5A0", icon: "↑" },
    liquidity_shock: { label: "Choc de liquidité", color: "#60A5FA", icon: "◆" },
    structural_break: { label: "Rupture structurelle", color: "#C084FC", icon: "⚡" },
    emerging_signal: { label: "Signal émergent", color: "#F59E0B", icon: "★" },
    mixed_anomaly: { label: "Anomalie mixte", color: "#888", icon: "~" },
};

const SIGNAL_LABELS: Record<string, string> = {
    price: "Prix",
    volume: "Volume",
    momentum: "Momentum",
    ml: "ML",
    temporal: "Émergent",
    relational: "Sectoriel",
};

export default function Opportunities() {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [loading, setLoading] = useState(true);
    const [country, setCountry] = useState("CA");
    const [updated, setUpdated] = useState("");
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/geo")
            .then(res => res.json())
            .then(geo => {
                setCountry(geo.country || "CA");
                loadAnomalies(geo.country || "CA");
            })
            .catch(() => loadAnomalies("CA"));
    }, []);

    const loadAnomalies = async (c: string) => {
        setLoading(true);
        try {
            const ENGINE = "https://clikxia-engine-production.up.railway.app";
            const res = await fetch(`${ENGINE}/scan`);
            const data = await res.json();
            setAnomalies(data.anomalies || []);
            setUpdated(new Date().toLocaleTimeString());
        } catch {
            console.error("Error loading anomalies");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#0A0F1E", minHeight: "100vh", padding: "16px", fontFamily: "-apple-system, sans-serif", color: "white" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-1px" }}>
                    CLIK<span style={{ color: "#00E5A0" }}>XIA</span>
                </div>
                <button
                    onClick={() => loadAnomalies(country)}
                    style={{ background: "rgba(0,229,160,0.1)", color: "#00E5A0", border: "1px solid rgba(0,229,160,0.3)", borderRadius: "20px", padding: "6px 14px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                    {loading ? "Analyse..." : `Actualisé ${updated}`}
                </button>
            </div>

            {/* Nav */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <a href="/dashboard" style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", color: "#888", border: "0.5px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>
                    Signaux
                </a>
                <div style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "20px", background: "rgba(0,229,160,0.1)", color: "#00E5A0", border: "1px solid rgba(0,229,160,0.3)" }}>
                    Opportunités du jour
                </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "16px", fontWeight: 800, marginBottom: "4px" }}>
                    Ce qui devient intéressant aujourd'hui
                </div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                    Détection statistique d'anomalies · Z-score · Isolation Forest · Momentum · Divergence sectorielle
                </div>
            </div>

            {/* Legend */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 12px", marginBottom: "16px" }}>
                <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>TYPES D'ANOMALIES DÉTECTÉES</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {Object.entries(CLUSTER_LABELS).map(([key, { label, color }]) => (
                        <span key={key} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: `${color}22`, color, border: `1px solid ${color}44` }}>
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    <div style={{ fontSize: "14px", marginBottom: "8px" }}>Détection d'anomalies en cours...</div>
                    <div style={{ fontSize: "11px", color: "#555" }}>Z-score · Isolation Forest · Momentum · Secteur</div>
                </div>
            ) : anomalies.length === 0 ? (
                <div style={{ background: "#111827", borderRadius: "16px", padding: "32px", textAlign: "center", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "24px", marginBottom: "12px", color: "#00E5A0" }}>✓</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Aucune anomalie détectée aujourd'hui</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>
                        Les marchés se comportent normalement — pas de signal inhabituel détecté sur les 5 tickers surveillés.
                    </div>
                    <div style={{ fontSize: "10px", color: "#555", marginTop: "12px" }}>
                        Mis à jour à {updated}
                    </div>
                </div>
            ) : (
                anomalies.map((a) => {
                    const cluster = CLUSTER_LABELS[a.cluster] || { label: a.cluster, color: "#888", icon: "~" };
                    const isExpanded = selected === a.ticker;
                    const scoreColor = a.anomaly_score > 0.7 ? "#00E5A0" : a.anomaly_score > 0.5 ? "#F59E0B" : "#888";

                    return (
                        <div
                            key={a.ticker}
                            onClick={() => setSelected(isExpanded ? null : a.ticker)}
                            style={{ background: "#111827", borderRadius: "16px", padding: "14px", marginBottom: "10px", border: `0.5px solid rgba(255,255,255,0.08)`, borderLeft: `4px solid ${cluster.color}`, cursor: "pointer" }}
                        >
                            {/* Top row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                <div>
                                    <div style={{ fontSize: "18px", fontWeight: 800 }}>{a.ticker}</div>
                                    <div style={{ fontSize: "11px", color: "#888" }}>
                                        {a.price.toFixed(2)}$ · {a.change_pct > 0 ? "+" : ""}{a.change_pct.toFixed(2)}%
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "20px", fontWeight: 800, color: scoreColor }}>
                                        {Math.round(a.anomaly_score * 100)}
                                    </div>
                                    <div style={{ fontSize: "9px", color: "#555" }}>SCORE ANOMALIE</div>
                                </div>
                            </div>

                            {/* Cluster badge */}
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${cluster.color}15`, border: `1px solid ${cluster.color}44`, borderRadius: "20px", padding: "4px 12px", marginBottom: "10px" }}>
                                <span style={{ color: cluster.color, fontSize: "12px" }}>{cluster.icon}</span>
                                <span style={{ fontSize: "11px", fontWeight: 600, color: cluster.color }}>{cluster.label}</span>
                                <span style={{ fontSize: "10px", color: "#888" }}>· {a.n_signals} signaux</span>
                            </div>

                            {/* Interpretation */}
                            <div style={{ fontSize: "12px", color: "#ccc", marginBottom: "10px", lineHeight: "1.5" }}>
                                {a.interpretation}
                            </div>

                            {/* Active signals */}
                            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                {a.active_signals.map(sig => (
                                    <span key={sig} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "rgba(255,255,255,0.06)", color: "#aaa", border: "0.5px solid rgba(255,255,255,0.1)" }}>
                                        {SIGNAL_LABELS[sig] || sig}
                                    </span>
                                ))}
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                                <div style={{ marginTop: "12px", borderTop: "0.5px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>

                                    {/* Baseline */}
                                    <div style={{ marginBottom: "12px" }}>
                                        <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>MÉTRIQUES STATISTIQUES</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                                            {[
                                                ["Z-SCORE PRIX", a.baseline.price_z.toFixed(2), Math.abs(a.baseline.price_z) > 2 ? "#00E5A0" : "#888"],
                                                ["VOLUME RATIO", `${a.baseline.volume_ratio.toFixed(1)}x`, a.baseline.volume_ratio > 2 ? "#00E5A0" : "#888"],
                                                ["MOMENTUM 5J", `${(a.baseline.momentum_5d * 100).toFixed(1)}%`, a.baseline.momentum_5d > 0 ? "#00E5A0" : "#FF4560"],
                                            ].map(([label, value, color]) => (
                                                <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px" }}>
                                                    <div style={{ fontSize: "9px", color: "#555", marginBottom: "2px" }}>{label}</div>
                                                    <div style={{ fontSize: "14px", fontWeight: 700, color: color as string }}>{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Detectors */}
                                    <div>
                                        <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "8px" }}>DÉTAIL DES DÉTECTEURS</div>
                                        {Object.entries(a.detectors).map(([key, det]) => (
                                            <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "5px" }}>
                                                <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: det.detected ? "rgba(0,229,160,0.2)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: det.detected ? "#00E5A0" : "#555", flexShrink: 0, marginTop: "1px" }}>
                                                    {det.detected ? "✓" : "·"}
                                                </div>
                                                <div style={{ fontSize: "11px", color: det.detected ? "#ccc" : "#555" }}>
                                                    {det.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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