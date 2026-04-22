/**
 * CLIKXIA API Client v2
 * Endpoints Railway : /v2/regime, /v2/top5, /v2/candidates
 */

const API_BASE = "https://clikxia-engine-production.up.railway.app";

// ============================================================
// TYPES
// ============================================================

export type Recommendation =
  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL";

export type MarketRegime = "BULL" | "NEUTRAL" | "BEAR" | "PANIC" | "UNKNOWN";

export interface RegimeResponse {
  scan_date: string;
  regime: MarketRegime;
  score: number;
  description: string;
}

export interface SignalValue {
  value: number;
  percentile: number;
}

export interface TopStock {
  rank: number;
  symbol: string;
  composite_score: number;
  recommendation: Recommendation;
  scanner_version: string;
  signals: {
    momentum_12_1: SignalValue;
    proximity_52w_high: SignalValue;
    volume_abnormal: SignalValue;
  };
}

export interface Top5Response {
  scan_date: string;
  regime: MarketRegime;
  top5: TopStock[];
}

export interface Candidate {
  rank: number;
  symbol: string;
  composite_score: number;
  recommendation: Recommendation;
  momentum_rank: number;
  proximity_rank: number;
  volume_rank: number;
  selected_for_deep: boolean;
}

export interface CandidatesResponse {
  scan_date: string;
  regime: MarketRegime;
  total_returned: number;
  candidates: Candidate[];
}


// ============================================================
// TECHNICAL PAGE (v2) - Fiches scientifiques #1-4
// ============================================================

export interface QualityData {
  prof: number | null;
  roe: number | null;
  net_margin: number | null;
  fiscal_date: string | null;
}

export interface ValueData {
  pe_ratio: number | null;
  pb_ratio: number | null;
  ps_ratio: number | null;
  ev_ebitda: number | null;
}

export interface LowVolatilityData {
  ivol_252: number | null;
  ivol_percentile: number | null;
  vol_60: number | null;
  vol_252: number | null;
  beta_spy: number | null;
}

export interface PriceContextData {
  current: number | null;
  change_1d: number | null;
  change_5d: number | null;
  change_30d: number | null;
  high_52w: number | null;
  low_52w: number | null;
  range_position_52w: number | null;
  sma_50: number | null;
  sma_200: number | null;
  price_vs_sma50: number | null;
  price_vs_sma200: number | null;
  volume_current: number | null;
  volume_avg_50d: number | null;
  volume_ratio: number | null;
}

export interface StockTechnicalResponse {
  symbol: string;
  scan_date: string;
  recommendation: Recommendation | null;
  market_regime: MarketRegime | null;
  scanner_version: string | null;
  rank_position: number | null;
  composite_score: number | null;
  signals: {
    momentum_12_1: SignalValue;
    proximity_52w_high: SignalValue;
    volume_abnormal: SignalValue;
  };
  quality: QualityData | null;
  value: ValueData | null;
  low_volatility: LowVolatilityData | null;
  price_context: PriceContextData | null;
  error?: string;
}

// ============================================================
// HELPERS
// ============================================================

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 300 }, // cache 5 min côté Next
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json();
}

// ============================================================
// ENDPOINTS
// ============================================================

export async function getRegime(): Promise<RegimeResponse> {
  return fetchJson<RegimeResponse>("/v2/regime");
}

export async function getTop5(): Promise<Top5Response> {
  return fetchJson<Top5Response>("/v2/top5");
}

export async function getCandidates(
  limit: number = 50,
  selectedOnly: boolean = false
): Promise<CandidatesResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (selectedOnly) params.set("selected_only", "true");
  return fetchJson<CandidatesResponse>(`/v2/candidates?${params.toString()}`);
}


export async function getStockTechnical(symbol: string): Promise<StockTechnicalResponse> {
  return fetchJson<StockTechnicalResponse>(`/v2/stock/${symbol.toUpperCase()}/technical`);
}

// ============================================================
// HELPERS UTILISATEUR
// ============================================================

/**
 * Retourne le label français d'une recommendation.
 */
export function recoLabel(reco: Recommendation): string {
  const labels: Record<Recommendation, string> = {
    STRONG_BUY: "STRONG BUY",
    BUY: "BUY",
    HOLD: "HOLD",
    SELL: "SELL",
    STRONG_SELL: "STRONG SELL",
  };
  return labels[reco];
}

/**
 * Retourne la classe CSS associée à une recommendation.
 */
export function recoClass(reco: Recommendation): string {
  const classes: Record<Recommendation, string> = {
    STRONG_BUY: "reco-strong-buy",
    BUY: "reco-buy",
    HOLD: "reco-hold",
    SELL: "reco-sell",
    STRONG_SELL: "reco-strong-sell",
  };
  return classes[reco];
}

/**
 * Retourne le label utilisateur d'un régime de marché.
 */
export function regimeLabel(regime: MarketRegime): string {
  const labels: Record<MarketRegime, string> = {
    BULL: "Marché haussier",
    NEUTRAL: "Marché NEUTRAL",
    BEAR: "Marché baissier",
    PANIC: "Marché en panique",
    UNKNOWN: "Régime inconnu",
  };
  return labels[regime];
}
