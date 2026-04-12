"use client";
import { useState, useEffect } from "react";

export default function Home() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [count, setCount] = useState(247);
    const BASE_COUNT = 247;

    useEffect(() => {
        fetch("/api/waitlist")
            .then(res => res.json())
            .then(data => {
                if (data.count !== undefined) {
                    setCount(BASE_COUNT + data.count);
                }
            })
            .catch(() => { });
    }, []);

    const handleSubmit = async () => {
        if (!email || !email.includes("@")) {
            setError("Email invalide");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                setCount(c => c + 1);
            } else {
                setError(data.error || "Erreur — réessayez");
            }
        } catch {
            setError("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#0A0F1E", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "-apple-system, sans-serif" }}>
            <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>


                {/* Logo */}
                <div style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-2px", marginBottom: "4px", color: "white" }}>
                    CLIK<span style={{ color: "#00E5A0" }}>XIA</span>
                </div>
                <div style={{ fontSize: "11px", color: "#00E5A0", letterSpacing: "2px", fontWeight: 600, marginBottom: "32px" }}>
                    COPILOTE DE DÉCISION · BOURSE
                </div>

                {/* Headline */}
                <div style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1.3, marginBottom: "12px", color: "white" }}>
                    L'IA qui transforme<br />
                    <span style={{ color: "#00E5A0" }}>l'incertitude des marchés</span><br />
                    en décision claire.
                </div>
                <div style={{ fontSize: "14px", color: "#888", lineHeight: 1.7, marginBottom: "24px" }}>
                    Plus de paralysie. Plus de confusion.<br />
                    Un seul output : <strong style={{ color: "white" }}>BUY / SELL / WAIT</strong> — avec pourquoi.
                </div>

                {/* Counter */}
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "8px 20px", display: "inline-block", marginBottom: "24px", fontSize: "13px", color: "#888" }}>
                    <span style={{ color: "#00E5A0", fontWeight: 700 }}>{count}</span> personnes déjà inscrites
                </div>

                {/* Demo Signal */}
                <div style={{ background: "#111827", borderRadius: "16px", padding: "16px", marginBottom: "28px", border: "1px solid rgba(0,229,160,0.2)", textAlign: "left" }}>
                    <div style={{ fontSize: "10px", color: "#555", letterSpacing: "1px", marginBottom: "10px" }}>APERÇU — SIGNAL EN TEMPS RÉEL</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div>
                            <div style={{ fontSize: "18px", fontWeight: 800, color: "white" }}>SHOP.TO</div>
                            <div style={{ fontSize: "10px", color: "#888" }}>Shopify · TSX · 89.40$</div>
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", background: "rgba(0,229,160,0.15)", color: "#00E5A0", border: "1px solid #00E5A0" }}>82 / 100</div>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#00E5A0", marginBottom: "4px" }}>BUY — Confiance 78%</div>
                    <div style={{ fontSize: "11px", color: "#888", marginBottom: "12px" }}>Momentum fort + news positives + sentiment haussier + CAD favorable</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "10px" }}>
                        {[["ENTRÉE", "88-90$", "white"], ["OBJECTIF", "96-100$", "#00E5A0"], ["STOP-LOSS", "84-85$", "#FF4560"]].map(([label, val, color]) => (
                            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "7px" }}>
                                <div style={{ fontSize: "9px", color: "#555", marginBottom: "1px" }}>{label}</div>
                                <div style={{ fontSize: "12px", fontWeight: 600, color: color as string }}>{val}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
                        <div style={{ fontSize: "9px", color: "#555", letterSpacing: "1px", marginBottom: "6px" }}>SIMULATION SCÉNARIOS</div>
                        {[["Hausse 96-100$", 60, "#00E5A0"], ["Chute 84$", 25, "#FF4560"], ["Flat 85-92$", 15, "#888"]].map(([label, pct, color]) => (
                            <div key={label as string} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <div style={{ fontSize: "10px", color: "#aaa", width: "90px" }}>{label as string}</div>
                                <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "4px", height: "5px" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", background: color as string, borderRadius: "4px" }} />
                                </div>
                                <div style={{ fontSize: "10px", fontWeight: 600, color: color as string, width: "28px" }}>{pct}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "28px", textAlign: "left" }}>
                    {[
                        ["Top 5 du jour", "Mis à jour en temps réel"],
                        ["4 couches IA", "Technique + News + Psychologie + Devises"],
                        ["Gestion du risque", "Stop-loss + taille position"],
                        ["TSX + NYSE", "Marché canadien inclus"],
                    ].map(([title, desc]) => (
                        <div key={title} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "12px", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "white", marginBottom: "3px" }}>{title}</div>
                            <div style={{ fontSize: "11px", color: "#555" }}>{desc}</div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                {!submitted ? (
                    <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>Accès prioritaire à l'ouverture — gratuit</div>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            placeholder="votre@email.com"
                            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "#FF4560" : "rgba(255,255,255,0.15)"}`, borderRadius: "12px", padding: "14px 16px", color: "white", fontSize: "15px", marginBottom: "10px", outline: "none", boxSizing: "border-box" }}
                        />
                        {error && <div style={{ fontSize: "12px", color: "#FF4560", marginBottom: "8px" }}>{error}</div>}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ width: "100%", background: "#00E5A0", color: "#0A0F1E", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 800, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? "Inscription..." : "Je veux accès en priorité →"}
                        </button>
                    </div>
                ) : (
                    <div style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎯</div>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#00E5A0", marginBottom: "4px" }}>Vous êtes sur la liste !</div>
                        <div style={{ fontSize: "13px", color: "#888" }}>Vous serez parmi les premiers à accéder à CLIKXIA. On vous contacte dès l'ouverture.</div>
                        <button
                            onClick={() => { setSubmitted(false); setEmail(""); setError(""); }}
                            style={{ marginTop: "12px", background: "none", border: "1px solid rgba(0,229,160,0.3)", color: "#00E5A0", borderRadius: "20px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        >
                            Inscrire une autre personne →
                        </button>
                    </div>
                )}

                <div style={{ fontSize: "10px", color: "#333", marginTop: "16px" }}>
                    CLIKXIA est un outil d'aide à la décision. Tout investissement comporte des risques.<br />
                    © 2026 CLIKXIA · clikxia.com · clikxia.ca
                </div>

            </div>
        </div>
    );
}