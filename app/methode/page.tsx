"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ============================================================
// CLIKXIA — Page /methode
// ============================================================
// Explication utilisateur de la méthode scientifique CLIKXIA
// Conformité WCAG : contrastes améliorés vs landing page
// Bilingue FR/EN (détection via /api/geo comme page.tsx)
// ============================================================

const translations = {
    fr: {
        tagline: "NOTRE MÉTHODE",
        backHome: "← Retour à l'accueil",
        introTitle: "Comment on évalue nos prédictions",
        introSubtitle: "La vérité sur les chiffres qu'on vous montre",
        introText: "Quand une plateforme vous dit \"notre algo prédit le marché à 85%\", ça ne veut rien dire. Prédire quoi ? Mesuré comment ? Sur combien de tests ?",
        introText2: "Chez CLIKXIA, on fait les choses différemment. Cette page vous explique exactement les métriques qu'on utilise, en s'appuyant sur la recherche académique reconnue.",
        commitmentTitle: "Notre engagement",
        commitmentText: "Aucune métrique inventée. Chaque chiffre qu'on vous montre est basé sur des publications académiques peer-reviewed, que vous pouvez vérifier vous-même.",

        dsrTitle: "La métrique principale : le Deflated Sharpe Ratio",
        dsrWhat: "C'est quoi ?",
        dsrWhatText: "Le DSR est la métrique la plus honnête pour évaluer un système de prédiction financière. Il a été créé en 2014 par deux chercheurs reconnus : David Bailey (Berkeley Lab) et Marcos López de Prado (Cornell, ancien chief of AI chez BlackRock et AQR).",
        dsrPaper: "Publication : Journal of Portfolio Management, vol. 40 (5), 2014.",
        dsrMeasure: "Ce qu'il mesure",
        dsrMeasureText: "Le DSR vous donne une probabilité entre 0 et 1 que notre système génère de vrais gains sur le long terme, plutôt que des résultats dus à la chance.",
        dsrInterpret: "Comment l'interpréter",
        dsrTable: [
            ["> 0.95", "Statistiquement prouvé", "✅ Validé"],
            ["0.80 à 0.95", "Edge probable mais pas certain à 95%", "⚠️ Probable"],
            ["0.50 à 0.80", "Incertain, données insuffisantes", "⚠️ Incertain"],
            ["< 0.50", "Aucun edge détectable", "❌ Non validé"],
        ] as const,
        dsrWhy: "Pourquoi c'est supérieur aux autres métriques",
        dsrTrap1Title: "Le selection bias",
        dsrTrap1Text: "Quand on teste 100 versions d'un modèle et qu'on garde le meilleur, il est statistiquement normal d'obtenir un bon résultat par hasard. Le DSR pénalise ce biais.",
        dsrTrap2Title: "La non-normalité des returns",
        dsrTrap2Text: "Les returns boursiers ont des \"fat tails\" (événements extrêmes plus fréquents que la normale). Les Sharpe classiques surestiment la performance. Le DSR corrige avec les moments supérieurs (skew, kurtosis).",
        dsrTrap3Title: "La taille de l'échantillon",
        dsrTrap3Text: "Un excellent Sharpe sur 100 jours peut être du bruit. Un Sharpe médiocre sur 10 000 jours est probablement réel. Le DSR tient compte de la taille de l'échantillon.",

        metricsTitle: "Les autres métriques qu'on affiche",
        sharpeTitle: "Sharpe Ratio",
        sharpeWhat: "Le rendement moyen divisé par le risque (volatilité).",
        sharpeInventor: "Inventé par William Sharpe, prix Nobel d'économie 1990.",
        sharpeInterpret: "Sharpe > 1.0 : bon — Sharpe > 2.0 : très bon — Sharpe > 3.0 : excellent (rare).",
        sharpeWarning: "Beaucoup de plateformes gonflent leur Sharpe. Le DSR corrige pour ça.",

        hitrateTitle: "Hit Rate (taux de réussite)",
        hitrateWhat: "Le pourcentage de prédictions correctes.",
        hitrateInterpret: "50% : hasard — 55-60% : significatif en finance — >65% : exceptionnel (souvent suspect).",
        hitrateWarning: "Un hit rate élevé ne garantit pas des gains. Si vos 40% d'erreurs sont des grosses pertes et vos 60% de succès des petits gains, vous perdez quand même.",

        mddTitle: "Max Drawdown (perte maximale)",
        mddWhat: "La plus grosse perte cumulée entre un pic et un creux.",
        mddExample: "Si votre portefeuille passe de 10 000$ à 15 000$ puis redescend à 9 000$, le max drawdown est de -40% (de 15 000$ à 9 000$).",
        mddSource: "Source : Magdon-Ismail & Atiya (2004), Journal of Applied Probability.",

        cvarTitle: "CVaR à 5% (Conditional Value at Risk)",
        cvarWhat: "La perte moyenne dans les 5% pires scénarios.",
        cvarExample: "Un CVaR 5% de -3% signifie que dans les 5% pires jours, vous perdez en moyenne 3%.",
        cvarSource: "Source : Rockafellar & Uryasev (2000), Journal of Risk.",

        coverageTitle: "Coverage (couverture)",
        coverageWhat: "Le pourcentage du temps où le système donne un signal (BUY ou SELL) vs ne rien dire (WAIT).",
        coverageInterpret: "L'idéal se situe entre 30% et 70%. Trop haut = système force les signaux. Trop bas = trop prudent.",

        buyPrecTitle: "BUY Precision",
        buyPrecWhat: "Parmi toutes les prédictions \"BUY\", combien étaient correctes ?",
        buyPrecExample: "Si le système prédit BUY 100 fois et que 42 étaient rentables, la BUY precision est de 42%.",
        buyPrecBaseline: "Avec 3 classes (SELL/WAIT/BUY), la baseline aléatoire est 33%. Une BUY precision > 40% suggère un vrai signal.",

        wfTitle: "Comment on teste : le Walk-Forward Backtest",
        wfWhat: "C'est quoi ?",
        wfWhatText: "Le walk-forward backtest est la méthode la plus rigoureuse pour évaluer un système de prédiction.",
        wfPrincipe: "Principe :",
        wfSteps: [
            "On entraîne le modèle sur une période passée (ex: 2 ans de données)",
            "On teste sur la période suivante que le modèle n'a jamais vue (ex: 1 mois)",
            "On fait glisser les fenêtres dans le temps",
            "On répète 200+ fois",
        ] as const,
        wfWhy: "Cette méthode simule ce qui se serait passé en conditions réelles, mois après mois. Si un système semble bon uniquement dans le passé (overfitting), le walk-forward le révèle.",
        wfSetup: "Notre setup",
        wfSetupText: [
            ["Fenêtre d'entraînement", "504 jours (~2 ans)"],
            ["Fenêtre de validation", "63 jours"],
            ["Fenêtre de test", "21 jours out-of-sample"],
            ["Tickers testés", "18 (AAPL, MSFT, NVDA, AMZN, GOOGL, etc.)"],
        ] as const,

        regimesTitle: "Les régimes de marché",
        regimesText: "On utilise un Hidden Markov Model (Hamilton 1989) pour identifier 3 régimes de marché :",
        regimesBull: "Bull : marché haussier",
        regimesNeutral: "Neutral : marché latéral",
        regimesBear: "Bear : marché baissier",
        regimesWhy: "On affiche les performances séparément par régime parce que beaucoup de systèmes marchent bien en bull et catastrophiquement en bear. On veut être transparents sur où notre système performe.",

        notDoingTitle: "Ce qu'on NE fait PAS",
        notDoing: [
            ["Cherry picking", "Sélectionner seulement les meilleures périodes. Nous montrons toutes les fenêtres, même les mauvaises."],
            ["Backtests in-sample", "Tester sur les mêmes données utilisées pour entraîner. Ça donne toujours de beaux chiffres mais qui ne tiennent pas en réalité."],
            ["Métriques inventées", "Créer un \"score propriétaire\" sans justification. Toutes nos métriques sont sourcées académiquement."],
            ["Garanties de performance", "Aucun système ne peut garantir des gains futurs. Nous présentons des probabilités, pas des certitudes."],
        ] as const,

        limitsTitle: "Nos limites (qu'on assume)",
        limitsIntro: "Nous préférons vous montrer les limites plutôt que de les cacher. C'est la base de la confiance.",
        limits: [
            ["Pas d'avenir garanti", "Même un DSR de 0.95 ne garantit pas que le système continuera à marcher. Les marchés évoluent."],
            ["Coûts de transaction", "Nos backtests incluent des coûts réalistes (Interactive Brokers, spread standard). Votre situation peut différer (taxes, taille des ordres)."],
            ["Event risk", "Le système ne prédit pas les événements extrêmes (crashs, tweets, grèves, guerres). Aucun système ne peut ça avec fiabilité."],
            ["Position sizing", "Notre backtest mesure la performance sans position sizing. En pratique, vous devez adapter la taille de vos positions à votre tolérance au risque."],
            ["Small caps", "On teste sur des large caps. Les small caps ont des dynamiques différentes et notre système n'est pas calibré pour elles."],
        ] as const,

        furtherTitle: "Pour aller plus loin",
        furtherBooks: "Livres de référence",
        furtherPapers: "Papers académiques (tous consultables gratuitement)",

        ctaTitle: "Rejoindre CLIKXIA",
        ctaText: "Accès prioritaire à l'ouverture. Gratuit.",
        ctaButton: "Je veux accès en priorité →",

        disclaimer: "CLIKXIA est un outil d'aide à la décision, pas un conseil financier. Les performances passées ne garantissent pas les résultats futurs. Investir en bourse comporte des risques de perte en capital.",
    },
    en: {
        tagline: "OUR METHOD",
        backHome: "← Back to home",
        introTitle: "How we evaluate our predictions",
        introSubtitle: "The truth about the numbers we show you",
        introText: "When a platform tells you \"our algo predicts the market with 85% accuracy\", it means nothing. Predicts what? Measured how? Over how many tests?",
        introText2: "At CLIKXIA, we do things differently. This page explains exactly the metrics we use, based on recognized academic research.",
        commitmentTitle: "Our commitment",
        commitmentText: "No invented metric. Every number we show you is based on peer-reviewed academic publications that you can verify yourself.",

        dsrTitle: "The main metric: the Deflated Sharpe Ratio",
        dsrWhat: "What is it?",
        dsrWhatText: "The DSR is the most honest metric to evaluate a financial prediction system. It was created in 2014 by two renowned researchers: David Bailey (Berkeley Lab) and Marcos López de Prado (Cornell, former chief of AI at BlackRock and AQR).",
        dsrPaper: "Publication: Journal of Portfolio Management, vol. 40 (5), 2014.",
        dsrMeasure: "What it measures",
        dsrMeasureText: "The DSR gives you a probability between 0 and 1 that our system generates real long-term gains, rather than results due to luck.",
        dsrInterpret: "How to interpret it",
        dsrTable: [
            ["> 0.95", "Statistically proven", "✅ Validated"],
            ["0.80 to 0.95", "Likely edge but not certain at 95%", "⚠️ Likely"],
            ["0.50 to 0.80", "Uncertain, insufficient data", "⚠️ Uncertain"],
            ["< 0.50", "No detectable edge", "❌ Not validated"],
        ] as const,
        dsrWhy: "Why it's superior to other metrics",
        dsrTrap1Title: "Selection bias",
        dsrTrap1Text: "When you test 100 versions of a model and keep the best, it's statistically normal to get a good result by chance. DSR penalizes this bias.",
        dsrTrap2Title: "Non-normality of returns",
        dsrTrap2Text: "Stock returns have \"fat tails\" (extreme events more frequent than normal). Classic Sharpe overestimates performance. DSR corrects with higher moments (skew, kurtosis).",
        dsrTrap3Title: "Sample size",
        dsrTrap3Text: "An excellent Sharpe over 100 days can be noise. A mediocre Sharpe over 10,000 days is probably real. DSR accounts for sample size.",

        metricsTitle: "Other metrics we display",
        sharpeTitle: "Sharpe Ratio",
        sharpeWhat: "Average return divided by risk (volatility).",
        sharpeInventor: "Invented by William Sharpe, Nobel Prize in Economics 1990.",
        sharpeInterpret: "Sharpe > 1.0: good — Sharpe > 2.0: very good — Sharpe > 3.0: excellent (rare).",
        sharpeWarning: "Many platforms inflate their Sharpe. DSR corrects for this.",

        hitrateTitle: "Hit Rate",
        hitrateWhat: "Percentage of correct predictions.",
        hitrateInterpret: "50%: random — 55-60%: significant in finance — >65%: exceptional (often suspicious).",
        hitrateWarning: "A high hit rate doesn't guarantee gains. If your 40% errors are big losses and 60% successes small gains, you still lose.",

        mddTitle: "Max Drawdown",
        mddWhat: "The largest cumulative loss from peak to trough.",
        mddExample: "If your portfolio goes from $10,000 to $15,000 then back down to $9,000, the max drawdown is -40% (from $15,000 to $9,000).",
        mddSource: "Source: Magdon-Ismail & Atiya (2004), Journal of Applied Probability.",

        cvarTitle: "CVaR at 5%",
        cvarWhat: "Average loss in the 5% worst scenarios.",
        cvarExample: "A CVaR 5% of -3% means that in the 5% worst days, you lose on average 3%.",
        cvarSource: "Source: Rockafellar & Uryasev (2000), Journal of Risk.",

        coverageTitle: "Coverage",
        coverageWhat: "Percentage of time the system gives a signal (BUY or SELL) vs saying nothing (WAIT).",
        coverageInterpret: "Ideal between 30% and 70%. Too high = forcing signals. Too low = too cautious.",

        buyPrecTitle: "BUY Precision",
        buyPrecWhat: "Among all \"BUY\" predictions, how many were correct?",
        buyPrecExample: "If the system predicts BUY 100 times and 42 were profitable, BUY precision is 42%.",
        buyPrecBaseline: "With 3 classes (SELL/WAIT/BUY), random baseline is 33%. BUY precision > 40% suggests a real signal.",

        wfTitle: "How we test: Walk-Forward Backtest",
        wfWhat: "What is it?",
        wfWhatText: "Walk-forward backtest is the most rigorous method to evaluate a prediction system.",
        wfPrincipe: "Principle:",
        wfSteps: [
            "Train the model on a past period (e.g., 2 years of data)",
            "Test on the following period the model has never seen (e.g., 1 month)",
            "Slide the windows through time",
            "Repeat 200+ times",
        ] as const,
        wfWhy: "This method simulates what would have happened in real conditions, month after month. If a system only seems good in the past (overfitting), walk-forward reveals it.",
        wfSetup: "Our setup",
        wfSetupText: [
            ["Training window", "504 days (~2 years)"],
            ["Validation window", "63 days"],
            ["Test window", "21 days out-of-sample"],
            ["Tickers tested", "18 (AAPL, MSFT, NVDA, AMZN, GOOGL, etc.)"],
        ] as const,

        regimesTitle: "Market regimes",
        regimesText: "We use a Hidden Markov Model (Hamilton 1989) to identify 3 market regimes:",
        regimesBull: "Bull: rising market",
        regimesNeutral: "Neutral: sideways market",
        regimesBear: "Bear: falling market",
        regimesWhy: "We display performance separately by regime because many systems work well in bull and catastrophically in bear. We want to be transparent about where our system performs.",

        notDoingTitle: "What we DON'T do",
        notDoing: [
            ["Cherry picking", "Selecting only the best periods. We show all windows, even bad ones."],
            ["In-sample backtests", "Testing on same data used for training. Always gives nice numbers but fails in reality."],
            ["Invented metrics", "Creating a \"proprietary score\" without justification. All our metrics are academically sourced."],
            ["Performance guarantees", "No system can guarantee future gains. We present probabilities, not certainties."],
        ] as const,

        limitsTitle: "Our limits (that we assume)",
        limitsIntro: "We prefer to show you the limits rather than hide them. That's the foundation of trust.",
        limits: [
            ["No guaranteed future", "Even a DSR of 0.95 doesn't guarantee the system will keep working. Markets evolve."],
            ["Transaction costs", "Our backtests include realistic costs (Interactive Brokers, standard spread). Your situation may differ (taxes, order size)."],
            ["Event risk", "The system doesn't predict extreme events (crashes, tweets, strikes, wars). No system can do that reliably."],
            ["Position sizing", "Our backtest measures performance without position sizing. In practice, you must adapt the size of your positions to your risk tolerance."],
            ["Small caps", "We test on large caps. Small caps have different dynamics and our system isn't calibrated for them."],
        ] as const,

        furtherTitle: "To go further",
        furtherBooks: "Reference books",
        furtherPapers: "Academic papers (all freely available)",

        ctaTitle: "Join CLIKXIA",
        ctaText: "Priority access at launch. Free.",
        ctaButton: "I want priority access →",

        disclaimer: "CLIKXIA is a decision support tool, not financial advice. Past performance does not guarantee future results. Investing in the stock market involves risks of capital loss.",
    },
};

export default function MethodPage() {
    const [lang, setLang] = useState<"fr" | "en">("fr");

    useEffect(() => {
        fetch("/api/geo")
            .then(res => res.json())
            .then(data => {
                const frCountries = ["FR", "CA", "BE", "CH", "LU", "SN", "CI", "CM", "MG", "ML", "BF", "NE", "TD", "GN", "BJ", "TG", "RW", "BI", "DJ", "KM", "SC", "MU", "GA", "CG", "CD", "CF", "GQ", "HT"];
                setLang(frCountries.includes(data.country) ? "fr" : "en");
            })
            .catch(() => { });
    }, []);

    const t = translations[lang];

    // Palette couleurs avec contrastes WCAG AA/AAA
    const colors = {
        bg: "#0A0F1E",
        bgCard: "#141B2E",
        accent: "#00E5A0",
        accentDim: "rgba(0,229,160,0.15)",
        red: "#FF6B85",
        textPrimary: "#FFFFFF",
        textSecondary: "#E2E8F0",   // Contraste ~15:1
        textTertiary: "#A8B0C0",    // Contraste ~8:1
        border: "rgba(255,255,255,0.12)",
        borderAccent: "rgba(0,229,160,0.3)",
    };

    const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    return (
        <div style={{
            background: colors.bg,
            minHeight: "100vh",
            padding: "24px 16px 48px",
            fontFamily,
            color: colors.textPrimary,
        }}>
            <div style={{ maxWidth: "720px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ marginBottom: "48px" }}>
                    <Link
                        href="/"
                        style={{
                            display: "inline-block",
                            color: colors.accent,
                            fontSize: "13px",
                            textDecoration: "none",
                            marginBottom: "32px",
                            fontWeight: 600,
                        }}
                    >
                        {t.backHome}
                    </Link>

                    <div style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        letterSpacing: "-1px",
                        marginBottom: "4px",
                    }}>
                        CLIK<span style={{ color: colors.accent }}>XIA</span>
                    </div>
                    <div style={{
                        fontSize: "11px",
                        color: colors.accent,
                        letterSpacing: "2px",
                        fontWeight: 600,
                    }}>
                        {t.tagline}
                    </div>
                </div>

                {/* Intro */}
                <h1 style={{
                    fontSize: "36px",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: "12px",
                    letterSpacing: "-1px",
                }}>
                    {t.introTitle}
                </h1>
                <div style={{
                    fontSize: "18px",
                    color: colors.textSecondary,
                    marginBottom: "32px",
                    lineHeight: 1.5,
                }}>
                    {t.introSubtitle}
                </div>
                <p style={{
                    fontSize: "16px",
                    color: colors.textSecondary,
                    lineHeight: 1.7,
                    marginBottom: "16px",
                }}>
                    {t.introText}
                </p>
                <p style={{
                    fontSize: "16px",
                    color: colors.textSecondary,
                    lineHeight: 1.7,
                    marginBottom: "32px",
                }}>
                    {t.introText2}
                </p>

                {/* Engagement */}
                <div style={{
                    background: colors.accentDim,
                    border: `1px solid ${colors.borderAccent}`,
                    borderRadius: "12px",
                    padding: "20px 24px",
                    marginBottom: "64px",
                }}>
                    <div style={{
                        fontSize: "12px",
                        color: colors.accent,
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        marginBottom: "8px",
                    }}>
                        {t.commitmentTitle.toUpperCase()}
                    </div>
                    <div style={{
                        fontSize: "15px",
                        color: colors.textPrimary,
                        lineHeight: 1.6,
                    }}>
                        {t.commitmentText}
                    </div>
                </div>

                {/* ========== DSR ========== */}
                <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "24px", letterSpacing: "-0.5px" }}>
                    {t.dsrTitle}
                </h2>

                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: colors.accent }}>
                    {t.dsrWhat}
                </h3>
                <p style={{ fontSize: "15px", color: colors.textSecondary, lineHeight: 1.7, marginBottom: "12px" }}>
                    {t.dsrWhatText}
                </p>
                <p style={{ fontSize: "13px", color: colors.textTertiary, fontStyle: "italic", marginBottom: "24px" }}>
                    {t.dsrPaper}
                </p>

                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: colors.accent }}>
                    {t.dsrMeasure}
                </h3>
                <p style={{ fontSize: "15px", color: colors.textSecondary, lineHeight: 1.7, marginBottom: "32px" }}>
                    {t.dsrMeasureText}
                </p>

                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: colors.accent }}>
                    {t.dsrInterpret}
                </h3>
                <div style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                    marginBottom: "32px",
                }}>
                    {t.dsrTable.map(([dsr, interpretation, verdict], idx) => (
                        <div
                            key={idx}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "100px 1fr 120px",
                                gap: "12px",
                                padding: "14px 20px",
                                borderBottom: idx < t.dsrTable.length - 1 ? `1px solid ${colors.border}` : "none",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ fontSize: "14px", fontWeight: 700, color: colors.accent, fontFamily: "monospace" }}>
                                {dsr}
                            </div>
                            <div style={{ fontSize: "14px", color: colors.textSecondary }}>
                                {interpretation}
                            </div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textPrimary, textAlign: "right" }}>
                                {verdict}
                            </div>
                        </div>
                    ))}
                </div>

                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>
                    {t.dsrWhy}
                </h3>

                {[
                    { title: t.dsrTrap1Title, text: t.dsrTrap1Text, n: 1 },
                    { title: t.dsrTrap2Title, text: t.dsrTrap2Text, n: 2 },
                    { title: t.dsrTrap3Title, text: t.dsrTrap3Text, n: 3 },
                ].map((trap) => (
                    <div
                        key={trap.n}
                        style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: "12px",
                            padding: "20px 24px",
                            marginBottom: "16px",
                        }}
                    >
                        <div style={{ fontSize: "11px", color: colors.accent, fontWeight: 700, marginBottom: "8px", letterSpacing: "1.5px" }}>
                            {lang === "fr" ? `PIÈGE #${trap.n}` : `TRAP #${trap.n}`}
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: colors.textPrimary }}>
                            {trap.title}
                        </div>
                        <div style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: 1.6 }}>
                            {trap.text}
                        </div>
                    </div>
                ))}

                {/* ========== AUTRES MÉTRIQUES ========== */}
                <h2 style={{ fontSize: "28px", fontWeight: 800, marginTop: "64px", marginBottom: "24px", letterSpacing: "-0.5px" }}>
                    {t.metricsTitle}
                </h2>

                {[
                    { title: t.sharpeTitle, what: t.sharpeWhat, inventor: t.sharpeInventor, interpret: t.sharpeInterpret, warning: t.sharpeWarning },
                    { title: t.hitrateTitle, what: t.hitrateWhat, interpret: t.hitrateInterpret, warning: t.hitrateWarning },
                    { title: t.mddTitle, what: t.mddWhat, example: t.mddExample, source: t.mddSource },
                    { title: t.cvarTitle, what: t.cvarWhat, example: t.cvarExample, source: t.cvarSource },
                    { title: t.coverageTitle, what: t.coverageWhat, interpret: t.coverageInterpret },
                    { title: t.buyPrecTitle, what: t.buyPrecWhat, example: t.buyPrecExample, interpret: t.buyPrecBaseline },
                ].map((metric, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: "12px",
                            padding: "24px",
                            marginBottom: "16px",
                        }}
                    >
                        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: colors.accent }}>
                            {metric.title}
                        </h3>
                        <p style={{ fontSize: "15px", color: colors.textPrimary, marginBottom: "12px", lineHeight: 1.6 }}>
                            {metric.what}
                        </p>
                        {metric.inventor && (
                            <p style={{ fontSize: "13px", color: colors.textTertiary, fontStyle: "italic", marginBottom: "12px" }}>
                                {metric.inventor}
                            </p>
                        )}
                        {metric.example && (
                            <p style={{ fontSize: "14px", color: colors.textSecondary, marginBottom: "12px", lineHeight: 1.6 }}>
                                <strong style={{ color: colors.textPrimary }}>{lang === "fr" ? "Exemple : " : "Example: "}</strong>
                                {metric.example}
                            </p>
                        )}
                        {metric.interpret && (
                            <p style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: 1.6, marginBottom: metric.warning ? "12px" : 0 }}>
                                {metric.interpret}
                            </p>
                        )}
                        {metric.warning && (
                            <div style={{
                                background: "rgba(255,107,133,0.08)",
                                border: `1px solid rgba(255,107,133,0.25)`,
                                borderRadius: "8px",
                                padding: "12px 16px",
                                marginTop: "12px",
                            }}>
                                <div style={{ fontSize: "11px", color: colors.red, fontWeight: 700, marginBottom: "4px", letterSpacing: "1px" }}>
                                    {lang === "fr" ? "ATTENTION" : "WARNING"}
                                </div>
                                <div style={{ fontSize: "13px", color: colors.textSecondary, lineHeight: 1.5 }}>
                                    {metric.warning}
                                </div>
                            </div>
                        )}
                        {metric.source && (
                            <div style={{ fontSize: "12px", color: colors.textTertiary, marginTop: "12px", fontStyle: "italic" }}>
                                {metric.source}
                            </div>
                        )}
                    </div>
                ))}

                {/* ========== WALK-FORWARD ========== */}
                <h2 style={{ fontSize: "28px", fontWeight: 800, marginTop: "64px", marginBottom: "24px", letterSpacing: "-0.5px" }}>
                    {t.wfTitle}
                </h2>

                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: colors.accent }}>
                    {t.wfWhat}
                </h3>
                <p style={{ fontSize: "15px", color: colors.textSecondary, lineHeight: 1.7, marginBottom: "16px" }}>
                    {t.wfWhatText}
                </p>

                <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: colors.textPrimary }}>
                    {t.wfPrincipe}
                </div>
                <ol style={{ paddingLeft: "24px", marginBottom: "24px" }}>
                    {t.wfSteps.map((step, idx) => (
                        <li key={idx} style={{ fontSize: "15px", color: colors.textSecondary, lineHeight: 1.8, marginBottom: "6px" }}>
                            {step}
                        </li>
                    ))}
                </ol>

                <p style={{ fontSize: "15px", color: colors.textSecondary, lineHeight: 1.7, marginBottom: "32px", fontStyle: "italic" }}>
                    {t.wfWhy}
                </p>

                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: colors.accent }}>
                    {t.wfSetup}
                </h3>
                <div style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                    marginBottom: "32px",
                }}>
                    {t.wfSetupText.map(([label, value], idx) => (
                        <div
                            key={idx}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "40% 60%",
                                gap: "12px",
                                padding: "14px 20px",
                                borderBottom: idx < t.wfSetupText.length - 1 ? `1px solid ${colors.border}` : "none",
                            }}
                        >
                            <div style={{ fontSize: "14px", color: colors.textTertiary }}>{label}</div>
                            <div style={{ fontSize: "14px", color: colors.textPrimary, fontWeight: 600 }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* Régimes */}
                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>
                    {t.regimesTitle}
                </h3>
                <p style={{ fontSize: "15px", color: colors.textSecondary, lineHeight: 1.7, marginBottom: "16px" }}>
                    {t.regimesText}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    {[
                        { label: t.regimesBull, color: colors.accent, icon: "📈" },
                        { label: t.regimesNeutral, color: colors.textSecondary, icon: "➡️" },
                        { label: t.regimesBear, color: colors.red, icon: "📉" },
                    ].map((regime, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: "10px",
                                padding: "16px 12px",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: "24px", marginBottom: "6px" }}>{regime.icon}</div>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: regime.color, lineHeight: 1.4 }}>
                                {regime.label}
                            </div>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: 1.7, marginBottom: "64px", fontStyle: "italic" }}>
                    {t.regimesWhy}
                </p>

                {/* ========== CE QU'ON NE FAIT PAS ========== */}
                <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "24px", letterSpacing: "-0.5px" }}>
                    {t.notDoingTitle}
                </h2>

                {t.notDoing.map(([title, text], idx) => (
                    <div
                        key={idx}
                        style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: "12px",
                            padding: "20px 24px",
                            marginBottom: "12px",
                            display: "flex",
                            gap: "16px",
                            alignItems: "flex-start",
                        }}
                    >
                        <div style={{ fontSize: "22px", flexShrink: 0 }}>❌</div>
                        <div>
                            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: colors.textPrimary }}>
                                {title}
                            </div>
                            <div style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: 1.6 }}>
                                {text}
                            </div>
                        </div>
                    </div>
                ))}

                {/* ========== LIMITES ========== */}
                <h2 style={{ fontSize: "28px", fontWeight: 800, marginTop: "64px", marginBottom: "16px", letterSpacing: "-0.5px" }}>
                    {t.limitsTitle}
                </h2>
                <p style={{ fontSize: "15px", color: colors.textSecondary, lineHeight: 1.7, marginBottom: "24px" }}>
                    {t.limitsIntro}
                </p>

                {t.limits.map(([title, text], idx) => (
                    <div
                        key={idx}
                        style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: "12px",
                            padding: "20px 24px",
                            marginBottom: "12px",
                        }}
                    >
                        <div style={{ fontSize: "11px", color: colors.accent, fontWeight: 700, marginBottom: "8px", letterSpacing: "1.5px" }}>
                            {lang === "fr" ? `LIMITE #${idx + 1}` : `LIMIT #${idx + 1}`}
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: colors.textPrimary }}>
                            {title}
                        </div>
                        <div style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: 1.6 }}>
                            {text}
                        </div>
                    </div>
                ))}

                {/* ========== POUR ALLER PLUS LOIN ========== */}
                <h2 style={{ fontSize: "28px", fontWeight: 800, marginTop: "64px", marginBottom: "24px", letterSpacing: "-0.5px" }}>
                    {t.furtherTitle}
                </h2>

                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: colors.accent }}>
                    {t.furtherBooks}
                </h3>
                <ul style={{ paddingLeft: "24px", marginBottom: "24px" }}>
                    <li style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: 1.7, marginBottom: "8px" }}>
                        <strong style={{ color: colors.textPrimary }}>López de Prado, M. (2018).</strong> Advances in Financial Machine Learning. Wiley.
                    </li>
                    <li style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: 1.7 }}>
                        <strong style={{ color: colors.textPrimary }}>Hull, J.C. (2018).</strong> Options, Futures, and Other Derivatives. Pearson.
                    </li>
                </ul>

                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: colors.accent }}>
                    {t.furtherPapers}
                </h3>
                <ul style={{ paddingLeft: "24px", marginBottom: "48px" }}>
                    {[
                        ["Bailey & López de Prado (2014)", "\"The Deflated Sharpe Ratio.\" Journal of Portfolio Management 40(5)."],
                        ["Sharpe (1994)", "\"The Sharpe Ratio.\" Journal of Portfolio Management 21(1)."],
                        ["Magdon-Ismail & Atiya (2004)", "\"Maximum Drawdown.\" Risk Magazine."],
                        ["Rockafellar & Uryasev (2000)", "\"Optimization of Conditional Value-at-Risk.\" Journal of Risk 2(3)."],
                        ["Hamilton (1989)", "\"A New Approach to the Economic Analysis of Nonstationary Time Series.\" Econometrica 57."],
                    ].map(([authors, paper], idx) => (
                        <li key={idx} style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: 1.7, marginBottom: "8px" }}>
                            <strong style={{ color: colors.textPrimary }}>{authors}.</strong> {paper}
                        </li>
                    ))}
                </ul>

                {/* ========== CTA ========== */}
                <div style={{
                    background: colors.accentDim,
                    border: `1px solid ${colors.borderAccent}`,
                    borderRadius: "16px",
                    padding: "28px 24px",
                    marginBottom: "48px",
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, marginBottom: "6px" }}>
                        {t.ctaTitle}
                    </div>
                    <div style={{ fontSize: "14px", color: colors.textSecondary, marginBottom: "20px" }}>
                        {t.ctaText}
                    </div>
                    <Link
                        href="/"
                        style={{
                            display: "inline-block",
                            background: colors.accent,
                            color: colors.bg,
                            padding: "14px 28px",
                            borderRadius: "12px",
                            fontSize: "15px",
                            fontWeight: 800,
                            textDecoration: "none",
                        }}
                    >
                        {t.ctaButton}
                    </Link>
                </div>

                {/* Disclaimer */}
                <div style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    padding: "20px 24px",
                    marginBottom: "32px",
                }}>
                    <div style={{ fontSize: "12px", color: colors.textTertiary, lineHeight: 1.6, fontStyle: "italic" }}>
                        {t.disclaimer}
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: "center",
                    paddingTop: "32px",
                    borderTop: `1px solid ${colors.border}`,
                    fontSize: "12px",
                    color: colors.textTertiary,
                }}>
                    © 2026 CLIKXIA · clikxia.com · clikxia.ca
                </div>

            </div>
        </div>
    );
}
