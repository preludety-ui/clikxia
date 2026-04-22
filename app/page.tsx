"use client";
import { useState, useEffect } from "react";
import Link from "next/link";  // ← AJOUTER CETTE LIGNE
const translations = {
    fr: {
        tagline: "COPILOTE DE DÉCISION · BOURSE",
        headline1: "Les marchés évoluent selon les données",
        headline2: "ET le comportement humain.",
        headline3: "La plupart des outils n'analysent qu'un seul de ces facteurs. CLIKXIA analyse les deux.",
        subheadline: "Le résultat ? Un signal clair :",
        output: "BUY / SELL / WAIT — votre décision. Toujours.",
        counter_text: "personnes déjà inscrites",
        cta: "Accès prioritaire à l'ouverture — gratuit",
        btn: "Je veux accès en priorité →",
        success_title: "Vous êtes sur la liste !",
        success_text: "Vous serez parmi les premiers à accéder à CLIKXIA.",
        another: "Inscrire une autre personne →",
        placeholder: "votre@email.com",
    },
    en: {
        tagline: "DECISION COPILOT · MARKETS",
        headline1: "Markets are driven by data",
        headline2: "AND human behavior.",
        headline3: "Most tools only analyze one. CLIKXIA analyzes both.",
        subheadline: "The result? One clear signal :",
        output: "BUY / SELL / WAIT — your decision. Always.",
        counter_text: "people already registered",
        cta: "Priority access at launch — free",
        btn: "I want priority access →",
        success_title: "You're on the list!",
        success_text: "You'll be among the first to access CLIKXIA.",
        another: "Register another person →",
        placeholder: "your@email.com",
    }

};
export default function Home() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [count, setCount] = useState(247);
    const BASE_COUNT = 247;
    const [geo, setGeo] = useState({ country: "CA", country_name: "Canada", currency: "CAD", languages: "fr" });
    const [lang, setLang] = useState<"fr" | "en">("fr");
    const t = translations[lang];

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

    useEffect(() => {
        fetch("/api/geo")
            .then(res => res.json())
            .then(data => setGeo(data))
            .catch(() => { });
    }, []);

    useEffect(() => {
        fetch("/api/geo")
            .then(res => res.json())
            .then(data => {
                setGeo(data);
                const frCountries = ["FR", "CA", "BE", "CH", "LU", "SN", "CI", "CM", "MG", "ML", "BF", "NE", "TD", "GN", "BJ", "TG", "RW", "BI", "DJ", "KM", "SC", "MU", "GA", "CG", "CD", "CF", "GQ", "HT"];
                setLang(frCountries.includes(data.country) ? "fr" : "en");
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
                    {t.tagline} · {geo.country_name.toUpperCase()}

                </div>

                {/* Headline */}
                <div style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1.3, marginBottom: "12px", color: "white" }}>
                    {t.headline1}<br />
                    <span style={{ color: "#00E5A0" }}>{t.headline2}</span><br />
                    {t.headline3}
                </div>
                <div style={{ fontSize: "14px", color: "#888", lineHeight: 1.7, marginBottom: "24px" }}>
                    {t.subheadline}<br />
                    <strong style={{ color: "white" }}>{t.output}</strong>
                </div>
                {/* Counter */}
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "8px 20px", display: "inline-block", marginBottom: "24px", fontSize: "13px", color: "#888" }}>
                    <span style={{ color: "#00E5A0", fontWeight: 700 }}>{count}</span> {t.counter_text}
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
                        <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>{t.cta}</div>
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
                            {loading ? (lang === "fr" ? "Inscription..." : "Registering...") : t.btn}
                        </button>
                    </div>
                ) : (
                    <div style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎯</div>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#00E5A0", marginBottom: "4px" }}>{t.success_title}</div>
                        <div style={{ fontSize: "13px", color: "#888" }}>{t.success_text} On vous contacte dès l'ouverture.</div>
                        <button
                            onClick={() => { setSubmitted(false); setEmail(""); setError(""); }}
                            style={{ marginTop: "12px", background: "none", border: "1px solid rgba(0,229,160,0.3)", color: "#00E5A0", borderRadius: "20px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        >
                            {t.another}
                        </button>
                    </div>
                )}

                <div style={{ fontSize: "10px", color: "#333", marginTop: "16px" }}>
                    CLIKXIA est un outil d'aide à la décision. Tout investissement comporte des risques.<br />
                    <Link href="/methode" style={{ color: "#00E5A0", textDecoration: "none", fontWeight: 600 }}>
                        {lang === "fr" ? "Notre méthode" : "Our method"}
                    </Link>
                    {" · "}
                    © 2026 CLIKXIA · clikxia.com · clikxia.ca
                </div>

            </div>
        </div>
    );
}