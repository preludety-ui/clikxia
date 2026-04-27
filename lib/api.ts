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

// === Hidden Gem v2.0 (Loh-Stulz 2011 + EFMA 2014) ===
export type PersistenceStatus =
  | "STRONG_BUY_INFLUENTIAL"   // z>1.96 sur 2 jours consecutifs
  | "STRONG_BUY_PRELIMINARY"   // z>1.96 jour J seulement
  | "BUY_NEUTRAL"              // 0 < z <= 1.96
  | "WATCH_SIGNAL_DECAY"       // -1.96 <= z <= 0
  | "SELL_REVERSAL"            // z < -1.96 sur 2 jours consecutifs
  | "INSUFFICIENT_HISTORY";    // donnees manquantes

export type Methodology = "hidden_gem_v2" | "composite_score_v1";

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
  company_name?: string | null;
  market_cap?: number | null;
  shares_outstanding?: number | null;
  composite_score: number;
  recommendation: Recommendation;
  scanner_version: string;
  // === Hidden Gem v2.0 (optionnels - peuvent etre null en mode fallback v1) ===
  z_score?: number | null;
  z_score_yesterday?: number | null;
  persistence_status?: PersistenceStatus | null;
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
  // === Hidden Gem v2.0 (optionnels - presents si methodology = hidden_gem_v2) ===
  methodology?: Methodology;
  influential_count?: number;
  preliminary_count?: number;
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
  company_name?: string | null;
  market_cap?: number | null;
  shares_outstanding?: number | null;
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


// ============================================================
// THE MIRROR (Phase 3) - Portfolio simule + biais comportementaux
// ============================================================
// Endpoints : /v2/mirror/{summary,positions,behavioral,cost,context,search,snapshots-history}
//
// Sources academiques :
// - Loh-Stulz (2011) RFS 24(2):593-627 (persistence Hidden Gem)
// - Odean (1998) J.Finance 53(5):1775-1798 (Disposition Effect)
// - Barber-Odean (2000) J.Finance 55(2):773-806 (Action Bias)
// - Lee et al. (2025) ICAIF DOI 10.1145/3768292.3770375 (Sector/Size Bias)
// - Sharpe (1994), Goodwin (1998), Sortino-Price (1994) (Ratios)
// - Arisoy-Bali-Tang (2024) MS 70(11):7537-7558 (Counterfactual)
// - Daiwa AM (2025) - cout cache 24% sur 42 ans
// ============================================================

export type Cluster = "active" | "watch" | "post_sell";
export type CounterfactualVerdict =
  | "better_decision"
  | "worse_decision"
  | "neutral"
  | null;

// === /v2/mirror/summary ===
export interface MirrorSummary {
  snapshot_date: string;
  since_date: string;
  positions: {
    active: number;
    watch: number;
    post_sell: number;
    total: number;
  };
  performance: {
    global_pnl_pct: number | null;
    active_avg_pnl: number | null;
    watch_avg_pnl: number | null;
    realized_avg_pnl: number | null;
  };
  benchmarks: {
    spy_pnl_pct: number | null;
    xeqt_pnl_pct: number | null;
    tsx60_pnl_pct: number | null;
  };
  capital: {
    deployed: number | null;
    current_value: number | null;
  };
  error?: string;
}

// === /v2/mirror/positions ===
export interface MirrorPosition {
  symbol: string;
  company_name: string | null;
  market_cap: number | null;
  cluster: Cluster;
  entry: {
    date: string | null;
    price: number | null;
    score: number | null;
    signal: string | null;
  };
  current: {
    price: number | null;
    score: number | null;
    signal: string | null;
    pnl_pct: number | null;
  };
  exit: {
    date: string | null;
    price: number | null;
    signal: string | null;
    reason: string | null;
    realized_pnl_pct: number | null;
  } | null;
  loh_stulz: {
    z_score: number | null;
    z_score_yesterday: number | null;
    persistence_status: PersistenceStatus | null;
    hidden_gem_qualified: boolean;
    hidden_gem_rank: number | null;
  };
  counterfactual: {
    current_pnl: number | null;
    verdict: CounterfactualVerdict;
    last_check: string | null;
  };
  days_held: number | null;
  position_size: number | null;
}

export interface MirrorPositionsResponse {
  cluster: Cluster | "all";
  scan_date: string;
  count: number;
  positions: MirrorPosition[];
  error?: string;
}

// === /v2/mirror/behavioral ===
export interface BiasMonitored {
  id: string;
  name: string;
  name_fr: string;
  description: string;
  academic_source: string;
  current_value: number | null;
}

export interface BehavioralDetection {
  date: string;
  bias_type: string;
  severity: string;
  measured_value: number | null;
  threshold_value: number | null;
  affected_symbols: string[];
  description: string;
  academic_source: string;
}

export interface MirrorBehavioralResponse {
  snapshot_date: string | null;
  biases_monitored: BiasMonitored[];
  recent_detections: BehavioralDetection[];
  error?: string;
}

// === /v2/mirror/cost ===
export interface MirrorCostResponse {
  snapshot_date: string;
  portfolio_pnl: number | null;
  benchmarks: {
    spy: number | null;
    xeqt: number | null;
    tsx60: number | null;
  };
  vs_spy_gap_pct: number;
  counterfactual: {
    avg_real_pnl_pct: number;
    avg_counterfactual_pnl_pct: number;
    behavioral_gap_pct: number;
    verdicts: {
      better_decision: number;
      worse_decision: number;
      neutral: number;
      unknown: number;
    };
    positions_analyzed: number;
  };
  academic_reference: {
    source: string;
    finding: string;
    url?: string;
  };
  error?: string;
}

// === /v2/mirror/context ===
export interface MirrorContextResponse {
  scan_date: string;
  market_regime: {
    regime: MarketRegime;
    score: number | null;
  };
  portfolio_size_distribution: {
    large_cap: number;
    mid_cap: number;
    small_cap: number;
    unknown: number;
    total: number;
  };
  behavioral_noise_risk: "LOW" | "MEDIUM" | "HIGH";
  academic_reference: {
    source: string;
    finding: string;
  };
  error?: string;
}

// === /v2/mirror/search/{symbol} ===
export interface MirrorSearchResponse {
  symbol: string;
  found: boolean;
  message?: string;
  scan_date?: string;
  company_name?: string | null;
  market_cap?: number | null;
  clikxia_decision?: {
    recommendation: Recommendation;
    composite_score: number;
    rank_in_universe: number;
    total_universe: number;
    market_regime: MarketRegime;
  };
  loh_stulz?: {
    z_score: number | null;
    z_score_yesterday: number | null;
    persistence_status: PersistenceStatus | null;
    hidden_gem_qualified: boolean;
    hidden_gem_rank: number | null;
  };
  signals?: {
    momentum_12_1: SignalValue;
    proximity_52w_high: SignalValue;
    volume_abnormal: SignalValue;
  };
  in_portfolio?: {
    is_held: boolean;
    cluster: Cluster | null;
    entry_date: string | null;
    entry_price: number | null;
    current_pnl_pct: number | null;
  };
  error?: string;
}

// === /v2/mirror/snapshots-history ===
export interface SnapshotHistory {
  snapshot_date: string;
  global_pnl_pct: number | null;
  spy_pnl_pct: number | null;
  xeqt_pnl_pct: number | null;
  tsx60_pnl_pct: number | null;
  total_value_now: number | null;
  total_capital_deployed: number | null;
}

export interface MirrorSnapshotsHistoryResponse {
  count: number;
  snapshots: SnapshotHistory[];
  error?: string;
}


// ============================================================
// MIRROR FETCH FUNCTIONS
// ============================================================

export async function getMirrorSummary(): Promise<MirrorSummary> {
  return fetchJson<MirrorSummary>("/v2/mirror/summary");
}

export async function getMirrorPositions(
  cluster: Cluster | "all" = "all"
): Promise<MirrorPositionsResponse> {
  return fetchJson<MirrorPositionsResponse>(`/v2/mirror/positions?cluster=${cluster}`);
}

export async function getMirrorBehavioral(): Promise<MirrorBehavioralResponse> {
  return fetchJson<MirrorBehavioralResponse>("/v2/mirror/behavioral");
}

export async function getMirrorCost(): Promise<MirrorCostResponse> {
  return fetchJson<MirrorCostResponse>("/v2/mirror/cost");
}

export async function getMirrorContext(): Promise<MirrorContextResponse> {
  return fetchJson<MirrorContextResponse>("/v2/mirror/context");
}

export async function getMirrorSearch(symbol: string): Promise<MirrorSearchResponse> {
  return fetchJson<MirrorSearchResponse>(`/v2/mirror/search/${symbol.toUpperCase()}`);
}

export async function getMirrorSnapshotsHistory(
  limit: number = 90
): Promise<MirrorSnapshotsHistoryResponse> {
  return fetchJson<MirrorSnapshotsHistoryResponse>(`/v2/mirror/snapshots-history?limit=${limit}`);
}


// ============================================================
// MIRROR HELPERS UTILISATEUR
// ============================================================

/**
 * Retourne le label francais d'un cluster.
 */
export function clusterLabel(cluster: Cluster, lang: "fr" | "en" = "en"): string {
  const labels: Record<Cluster, { fr: string; en: string }> = {
    active: { fr: "Actives", en: "Active" },
    watch: { fr: "En surveillance", en: "Watch" },
    post_sell: { fr: "Cloturees", en: "Post-sell" },
  };
  return labels[cluster][lang];
}

/**
 * Retourne le code couleur cluster (hex).
 */
export function clusterColor(cluster: Cluster): string {
  const colors: Record<Cluster, string> = {
    active: "#22c55e",     // vert
    watch: "#f59e0b",      // orange
    post_sell: "#ef4444",  // rouge
  };
  return colors[cluster];
}

/**
 * Formate un pourcentage avec signe.
 * Ex: 0.6207 -> "+0.62%", -4.2525 -> "-4.25%", null -> "N/A"
 */
export function formatPct(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return "N/A";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Formate une valeur USD.
 * Ex: 12447.17 -> "$12,447"
 */
export function formatUSD(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/**
 * Retourne la classe CSS associee a un PnL (vert, rouge, neutre).
 */
export function pnlClass(value: number | null | undefined): string {
  if (value === null || value === undefined) return "pnl-neutral";
  if (value > 0) return "pnl-positive";
  if (value < 0) return "pnl-negative";
  return "pnl-neutral";
}
// =====================================================================
// THE MIRROR V1 - 3 endpoints (universe, top5-history, search enrichi)
// Methodologie : equiponderee (DeMiguel 2009, Plyakha 2014)
// Benchmark TWR vs SPY (Bacon, GIPS Standards)
// =====================================================================

// --- /v2/mirror/universe ---
export interface MirrorUniverseTicker {
  symbol: string;
  company_name: string | null;
}

export interface MirrorUniverseResponse {
  count: number;
  tickers: MirrorUniverseTicker[];
}

export async function getMirrorUniverse(): Promise<MirrorUniverseResponse> {
  return fetchJson<MirrorUniverseResponse>("/v2/mirror/universe");
}

// --- /v2/mirror/top5-history ---
export interface MirrorPriceSeriesPoint {
  date: string;
  close: number;
}

export interface MirrorPnlSeriesPoint {
  date: string;
  pnl_pct: number;
}

export interface MirrorScoreBreakdown {
  momentum_12_1: number | null;
  proximity_52w_high: number | null;
  volume_abnormal: number | null;
}

export interface MirrorTop5Ticker {
  symbol: string;
  company_name: string | null;
  sector: string | null;
  first_appearance_date: string;
  first_appearance_rank: number | null;
  n_appearances: number;
  entry_price: number;
  entry_score: number | null;
  current_price: number;
  current_score: number | null;
  score_delta: number | null;
  pnl_pct: number;
  spy_pnl_pct_same_window: number | null;
  current_recommendation: Recommendation | null;
  z_score: number | null;
  persistence_status: PersistenceStatus | null;
  score_breakdown: MirrorScoreBreakdown;
  price_series: MirrorPriceSeriesPoint[];
  pnl_series: MirrorPnlSeriesPoint[];
}

export interface MirrorTop5Aggregate {
  total_tickers: number;
  global_pnl_pct: number;
  spy_pnl_pct: number;
  gap_vs_spy: number;
  hit_rate_pct: number;
  n_winners: number;
  n_losers: number;
  weighting_method: string;
  benchmark_method: string;
}

export interface MirrorDataFreshness {
  last_scan_date: string;
  days_since_last_scan: number;
  is_stale: boolean;
}

export interface MirrorTop5HistoryResponse {
  since_date: string;
  current_date: string | null;
  data_freshness: MirrorDataFreshness;
  aggregate: MirrorTop5Aggregate;
  tickers: MirrorTop5Ticker[];
  message?: string;
}

export async function getMirrorTop5History(): Promise<MirrorTop5HistoryResponse> {
  return fetchJson<MirrorTop5HistoryResponse>("/v2/mirror/top5-history");
}

// --- /v2/mirror/search/{symbol} (deja existant, enrichi) ---
export interface MirrorTickerTop5History {
  in_top5_since: string;
  first_appearance_rank: number | null;
  first_appearance_score: number | null;
  n_appearances: number;
  entry_price: number | null;
  pnl_pct_since_entry: number | null;
}

export interface MirrorTickerClikxiaDecision {
  recommendation: Recommendation | null;
  composite_score: number | null;
  rank_in_universe: number | null;
  total_universe: number;
  market_regime: MarketRegime | null;
}

export interface MirrorTickerLohStulz {
  z_score: number | null;
  z_score_yesterday: number | null;
  persistence_status: PersistenceStatus | null;
  hidden_gem_qualified: boolean;
  hidden_gem_rank: number | null;
}

export interface MirrorTickerSignals {
  momentum_12_1: { value: number | null; percentile: number | null };
  proximity_52w_high: { value: number | null; percentile: number | null };
  volume_abnormal: { value: number | null; percentile: number | null };
}

export interface MirrorTickerInPortfolio {
  is_held: boolean;
  cluster: string | null;
  entry_date: string | null;
  entry_price: number | null;
  current_pnl_pct: number | null;
}

export interface MirrorTickerResponse {
  symbol: string;
  found: boolean;
  in_universe?: boolean;
  universe_size?: number;
  message?: string;
  scan_date?: string;
  data_freshness?: MirrorDataFreshness;
  company_name?: string | null;
  sector?: string | null;
  industry?: string | null;
  market_cap?: number | null;
  current_price?: number | null;
  day_change_pct?: number | null;
  top5_history?: MirrorTickerTop5History | null;
  clikxia_decision?: MirrorTickerClikxiaDecision;
  loh_stulz?: MirrorTickerLohStulz;
  signals?: MirrorTickerSignals;
  in_portfolio?: MirrorTickerInPortfolio;
}

export async function getMirrorTicker(symbol: string): Promise<MirrorTickerResponse> {
  const cleanSymbol = symbol.toUpperCase().trim();
  return fetchJson<MirrorTickerResponse>(`/v2/mirror/search/${cleanSymbol}`);
}