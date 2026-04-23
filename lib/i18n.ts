// Dictionnaire i18n CLIKXIA - FR/EN
// Detection auto via /api/geo + switcher manuel possible via cookie clikxia_lang

export type Lang = "fr" | "en";

export const translations = {
  fr: {
    // Common
    back: "Retour",
    back_to_dashboard: "Retour au dashboard",
    back_to_top5: "Retour au top 5",
    simple_view: "Vue simple",
    tagline: "Copilote de d\u00e9cision \u00b7 Bourse \u00b7 Canada",

    // Landing
    top5_title: "Top 5 du jour",
    regime_label: "R\u00e9gime",
    hook_phrase_part1: "Voici le top 5 d\u2019aujourd\u2019hui.",
    hook_phrase_part2: "D\u00e9couvrez pourquoi.",
    email_placeholder: "votre@email.com",
    cta_access: "Acc\u00e9der gratuitement",
    cta_access_loading: "...",
    counter_suffix: "personnes d\u00e9j\u00e0 inscrites",
    note_signup: "Acc\u00e8s imm\u00e9diat apr\u00e8s soumission. Pas de spam.",
    value_prop_1_number: "2 237",
    value_prop_1_label: "actions analys\u00e9es quotidiennement",
    value_prop_2_number: "3",
    value_prop_2_label: "facteurs : Quality, Value, Low Volatility",
    value_prop_3_number: "Daily",
    value_prop_3_label: "mise \u00e0 jour chaque jour de bourse",
    contact_link: "Me contacter",

    // Dashboard
    dashboard_title: "Top 5 du jour",
    regime_market: "R\u00e9gime march\u00e9",
    rank: "RANG",

    // Stock simple view
    rank_of_day: "Rang #{0} du jour",
    decision_of_day: "D\u00e9cision du jour",
    why: "Pourquoi ?",
    three_signals: "Les 3 signaux",
    signal_momentum: "Momentum",
    signal_momentum_desc: "Force de la tendance sur 12 mois",
    signal_proximity: "Proximit\u00e9 52 semaines",
    signal_proximity_desc: "Distance au plus haut annuel",
    signal_volume: "Volume anormal",
    signal_volume_desc: "Attention nouvelle du march\u00e9",
    view_technical: "Voir l\u2019analyse technique d\u00e9taill\u00e9e",
    reason_proximity: "proche de son plus haut annuel ({0}e percentile)",
    reason_momentum: "avec un momentum fort",
    reason_volume: "avec un volume d\u2019\u00e9changes \u00e9lev\u00e9",
    reason_conclusion: "Les trois signaux convergent vers cette analyse.",
    reason_default: "Les trois signaux de cette action convergent vers cette analyse.",

    // Technical view
    signaux_clikxia: "Signaux CLIKXIA",
    signaux_subtitle: "Les 3 signaux qui composent la recommandation",
    momentum_label: "Momentum 12-1",
    proximity_label: "Proximit\u00e9 52w high",
    volume_label: "Volume anormal",
    factors_title: "Facteurs fondamentaux",
    factors_subtitle: "Quality, Value et Low Volatility",
    quality_title: "Quality",
    quality_desc: "Rentabilit\u00e9 op\u00e9rationnelle",
    value_title: "Value",
    value_desc: "Valorisation vs fondamentaux",
    lowvol_title: "Low Volatility",
    lowvol_desc: "Stabilit\u00e9 du prix",
    roe: "ROE",
    net_margin: "Marge nette",
    pe_ttm: "P/E (TTM)",
    pb: "P/B",
    ps: "P/S",
    ev_ebitda: "EV/EBITDA",
    ivol_252: "IVOL 252j",
    vol_60: "VOL 60j",
    beta_spy: "Beta SPY",
    price_context: "Contexte prix",
    price_context_subtitle: "Range 52 semaines, moyennes mobiles, variations",
    range_52w: "Range 52 semaines",
    position: "Position",
    variations: "Variations",
    day_1: "1 jour",
    days_5: "5 jours",
    days_30: "30 jours",
    sma_volume: "Moyennes mobiles & volume",
    price_vs_sma50: "Prix vs SMA 50",
    price_vs_sma200: "Prix vs SMA 200",
    sma_50: "SMA 50",
    sma_200: "SMA 200",
    volume_vs_avg: "Volume vs moyenne 50j",
    composite_score: "Score composite CLIKXIA",
    rank_selection: "Rang {0} de la s\u00e9lection",
    today: "aujourd\u2019hui",
    data_unavailable: "Donn\u00e9es non disponibles",
    symbol_not_found: "{0} non trouv\u00e9",
    stock_not_in_top5: "Cette action ne fait pas partie du top 5 du jour.",

    // Factor profile labels
    profile_quality_momentum: "Quality Momentum",
    profile_quality_momentum_tooltip: "Momentum \u00e9lev\u00e9 avec stabilit\u00e9 du prix (profil favorable)",
    profile_speculative_momentum: "Speculative Momentum",
    profile_speculative_momentum_tooltip: "Momentum \u00e9lev\u00e9 mais volatilit\u00e9 \u00e9lev\u00e9e (risque de reversal)",
    profile_defensive: "Defensive",
    profile_defensive_tooltip: "Stabilit\u00e9 du prix prioritaire",
    profile_balanced: "Balanced",
    profile_balanced_tooltip: "Pas de tilt factoriel dominant",

    // Quality labels
    quality_robust: "ROBUST",
    quality_neutral: "NEUTRAL",
    quality_weak: "WEAK",

    // Value labels
    value_undervalued: "UNDERVALUED",
    value_fair: "FAIR",
    value_growth_premium: "GROWTH PREMIUM",

    // Volatility labels
    vol_defensive: "DEFENSIVE",
    vol_moderate: "MODERATE",
    vol_high_risk: "HIGH RISK",

    // Contact
    contact_title: "Me contacter",
    contact_subtitle: "Une question, une suggestion, un bug ? Laissez-moi un message, je r\u00e9ponds personnellement.",
    contact_name_label: "Nom (facultatif)",
    contact_name_placeholder: "Votre nom",
    contact_email_label: "Email *",
    contact_message_label: "Message *",
    contact_message_placeholder: "Votre message...",
    contact_submit: "Envoyer le message",
    contact_submit_loading: "Envoi...",
    contact_success_title: "Message envoy\u00e9",
    contact_success_text: "Je vous r\u00e9ponds dans les plus brefs d\u00e9lais.",

    // Errors
    error_email_invalid: "Entrez un email valide",
    error_email_short: "Email invalide",
    error_message_short: "Message trop court",
    error_connection: "Erreur de connexion, r\u00e9essayez",
    error_generic: "Une erreur est survenue",
    already_registered: "Email d\u00e9j\u00e0 inscrit. Redirection...",

    // Disclaimer
    disclaimer_title: "Avis important.",
    disclaimer_body: "CLIKXIA est une aide \u00e0 la d\u00e9cision. La d\u00e9cision finale d\u2019investir appartient \u00e0 l\u2019utilisateur. Investir comporte des risques, y compris la perte totale du capital.",
  },
  en: {
    // Common
    back: "Back",
    back_to_dashboard: "Back to dashboard",
    back_to_top5: "Back to top 5",
    simple_view: "Simple view",
    tagline: "Decision copilot \u00b7 Markets \u00b7 Canada",

    // Landing
    top5_title: "Today\u2019s top 5",
    regime_label: "Regime",
    hook_phrase_part1: "Here\u2019s today\u2019s top 5.",
    hook_phrase_part2: "Find out why.",
    email_placeholder: "your@email.com",
    cta_access: "Get free access",
    cta_access_loading: "...",
    counter_suffix: "people already registered",
    note_signup: "Instant access after submission. No spam.",
    value_prop_1_number: "2,237",
    value_prop_1_label: "stocks analyzed daily",
    value_prop_2_number: "3",
    value_prop_2_label: "factors: Quality, Value, Low Volatility",
    value_prop_3_number: "Daily",
    value_prop_3_label: "updated every market day",
    contact_link: "Contact me",

    // Dashboard
    dashboard_title: "Today\u2019s top 5",
    regime_market: "Market regime",
    rank: "RANK",

    // Stock simple view
    rank_of_day: "Rank #{0} of the day",
    decision_of_day: "Today\u2019s decision",
    why: "Why?",
    three_signals: "The 3 signals",
    signal_momentum: "Momentum",
    signal_momentum_desc: "12-month trend strength",
    signal_proximity: "52-week proximity",
    signal_proximity_desc: "Distance to annual high",
    signal_volume: "Abnormal volume",
    signal_volume_desc: "New market attention",
    view_technical: "View detailed technical analysis",
    reason_proximity: "near its 52-week high ({0}th percentile)",
    reason_momentum: "with strong momentum",
    reason_volume: "with high trading volume",
    reason_conclusion: "All three signals converge toward this analysis.",
    reason_default: "All three signals for this stock converge toward this analysis.",

    // Technical view
    signaux_clikxia: "CLIKXIA Signals",
    signaux_subtitle: "The 3 signals behind the recommendation",
    momentum_label: "Momentum 12-1",
    proximity_label: "52w high proximity",
    volume_label: "Abnormal volume",
    factors_title: "Fundamental factors",
    factors_subtitle: "Quality, Value and Low Volatility",
    quality_title: "Quality",
    quality_desc: "Operational profitability",
    value_title: "Value",
    value_desc: "Valuation vs fundamentals",
    lowvol_title: "Low Volatility",
    lowvol_desc: "Price stability",
    roe: "ROE",
    net_margin: "Net margin",
    pe_ttm: "P/E (TTM)",
    pb: "P/B",
    ps: "P/S",
    ev_ebitda: "EV/EBITDA",
    ivol_252: "IVOL 252d",
    vol_60: "VOL 60d",
    beta_spy: "Beta SPY",
    price_context: "Price context",
    price_context_subtitle: "52-week range, moving averages, changes",
    range_52w: "52-week range",
    position: "Position",
    variations: "Changes",
    day_1: "1 day",
    days_5: "5 days",
    days_30: "30 days",
    sma_volume: "Moving averages & volume",
    price_vs_sma50: "Price vs SMA 50",
    price_vs_sma200: "Price vs SMA 200",
    sma_50: "SMA 50",
    sma_200: "SMA 200",
    volume_vs_avg: "Volume vs 50d avg",
    composite_score: "CLIKXIA composite score",
    rank_selection: "Rank {0} of the selection",
    today: "today",
    data_unavailable: "Data unavailable",
    symbol_not_found: "{0} not found",
    stock_not_in_top5: "This stock is not in today\u2019s top 5.",

    // Factor profile labels
    profile_quality_momentum: "Quality Momentum",
    profile_quality_momentum_tooltip: "High momentum with price stability (favorable profile)",
    profile_speculative_momentum: "Speculative Momentum",
    profile_speculative_momentum_tooltip: "High momentum but high volatility (reversal risk)",
    profile_defensive: "Defensive",
    profile_defensive_tooltip: "Price stability prioritized",
    profile_balanced: "Balanced",
    profile_balanced_tooltip: "No dominant factor tilt",

    // Quality labels
    quality_robust: "ROBUST",
    quality_neutral: "NEUTRAL",
    quality_weak: "WEAK",

    // Value labels
    value_undervalued: "UNDERVALUED",
    value_fair: "FAIR",
    value_growth_premium: "GROWTH PREMIUM",

    // Volatility labels
    vol_defensive: "DEFENSIVE",
    vol_moderate: "MODERATE",
    vol_high_risk: "HIGH RISK",

    // Contact
    contact_title: "Contact me",
    contact_subtitle: "A question, a suggestion, a bug? Leave me a message, I reply personally.",
    contact_name_label: "Name (optional)",
    contact_name_placeholder: "Your name",
    contact_email_label: "Email *",
    contact_message_label: "Message *",
    contact_message_placeholder: "Your message...",
    contact_submit: "Send message",
    contact_submit_loading: "Sending...",
    contact_success_title: "Message sent",
    contact_success_text: "I will reply as soon as possible.",

    // Errors
    error_email_invalid: "Enter a valid email",
    error_email_short: "Invalid email",
    error_message_short: "Message too short",
    error_connection: "Connection error, try again",
    error_generic: "An error occurred",
    already_registered: "Email already registered. Redirecting...",

    // Disclaimer
    disclaimer_title: "Important notice.",
    disclaimer_body: "CLIKXIA is a decision-support tool. The final investment decision belongs to the user. Investing involves risks, including total loss of capital.",
  },
} as const;

export type TranslationKey = keyof typeof translations["fr"];

/**
 * Fonction helper pour traduire avec interpolation {0}, {1}, etc.
 */
export function t(lang: Lang, key: TranslationKey, ...args: (string | number)[]): string {
  const dict = translations[lang];
  let value = dict[key] as string;
  args.forEach((arg, i) => {
    value = value.replace(`{${i}}`, String(arg));
  });
  return value;
}
