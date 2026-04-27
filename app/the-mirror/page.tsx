"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getMirrorTop5History,
  type MirrorTop5HistoryResponse,
  type MirrorTop5Ticker,
  type Recommendation,
} from "@/lib/api";
import { translations, type Lang } from "@/lib/i18n";
import RecommendationBadge from "@/app/components/RecommendationBadge";
import MirrorSearchBar from "@/app/components/MirrorSearchBar";
import DisclaimerClient from "@/app/components/DisclaimerClient";
import SiteHeaderClient from "@/app/components/SiteHeaderClient";

// ============================================================
// CLIKXIA - The Mirror V1 (page principale)
//
// Couvre les 3 lacunes identifiees par recherche multi-pays :
//   Lacune 1 - Track record audite (Fonctions 1.1, 1.3)
//   Lacune 2 - Recherche libre par ticker (Fonction 2.1)
//   Lacune 3 - Anti-gamification (Fonctions 3.1, 3.2)
//
// Methodologie scientifique :
//   - DeMiguel-Garlappi-Uppal (RFS 2009) - equiponderee
//   - Bacon, GIPS Standards - benchmark TWR
//   - Chen & Ren (Frontiers in Psychology 2025) - transparency
//   - Godker-Odean-Smeets (BFI Chicago 2025) - anti-overconfidence
// ============================================================

type FilterStatus = "all" | "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
type FilterPerf = "all" | "winners" | "losers";
type SortKey = "date" | "pnl" | "score";

// Mini-sparkline en pur SVG (anti-bibliothèque, anti-bloat)
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <span style={{ color: "#8a8680", fontSize: "11px" }}>—</span>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 22;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function TheMirrorPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const [data, setData] = useState<MirrorTop5HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPerf, setFilterPerf] = useState<FilterPerf>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  // Lecture langue depuis localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clikxia_lang");
      if (stored === "fr" || stored === "en") setLang(stored);
    }
  }, []);

  const t = translations[lang];

  // Fetch top5-history
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMirrorTop5History()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Unknown error");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filtrage + tri (Fonction 1.2 - frontend uniquement)
  const filteredTickers = useMemo(() => {
    if (!data) return [];
    let result = [...data.tickers];

    if (filterStatus !== "all") {
      result = result.filter((tk) => tk.current_recommendation === filterStatus);
    }
    if (filterPerf === "winners") {
      result = result.filter((tk) => tk.pnl_pct > 0);
    } else if (filterPerf === "losers") {
      result = result.filter((tk) => tk.pnl_pct <= 0);
    }

    if (sortKey === "date") {
      result.sort((a, b) => a.first_appearance_date.localeCompare(b.first_appearance_date));
    } else if (sortKey === "pnl") {
      result.sort((a, b) => b.pnl_pct - a.pnl_pct);
    } else if (sortKey === "score") {
      result.sort((a, b) => (b.current_score || 0) - (a.current_score || 0));
    }

    return result;
  }, [data, filterStatus, filterPerf, sortKey]);

  return (
    <div className="the-mirror-page">
      <style>{`
        .the-mirror-page {
          min-height: 100vh;
          background: #faf9f7;
          color: #1a1917;
        }
        .the-mirror-page a { color: inherit; }

        .mirror-container {
          max-width: 560px;
          margin: 0 auto;
          padding: 0 20px 24px;
        }
        @media (min-width: 768px) {
          .mirror-container { max-width: 720px; padding: 0 32px 32px; }
        }
        @media (min-width: 1024px) {
          .mirror-container { max-width: 1080px; padding: 0 40px 40px; }
        }

        .mirror-page-title {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: #1a1917;
          margin-bottom: 8px;
        }
        @media (min-width: 768px) { .mirror-page-title { font-size: 40px; } }
        @media (min-width: 1024px) { .mirror-page-title { font-size: 48px; } }

        .mirror-page-subtitle {
          font-size: 14px;
          color: #6b6861;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.02em;
          margin-bottom: 28px;
        }
        @media (min-width: 768px) { .mirror-page-subtitle { font-size: 15px; } }

        /* Bandeau freshness */
        .freshness-banner {
          background: #fdf6e3;
          border: 1px solid #e8d99e;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 12px;
          color: #6b5a16;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.02em;
        }

        /* Bandeau agregats */
        .aggregate-section {
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
        }
        @media (min-width: 768px) {
          .aggregate-section { padding: 24px 28px; }
        }
        .aggregate-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }
        @media (min-width: 768px) {
          .aggregate-grid { grid-template-columns: repeat(5, 1fr); gap: 20px; }
        }
        .aggregate-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .aggregate-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6b6861;
          font-family: var(--font-mono, monospace);
        }
        .aggregate-value {
          font-family: var(--font-mono, monospace);
          font-size: 22px;
          font-weight: 500;
          color: #1a1917;
          letter-spacing: -0.01em;
          line-height: 1;
        }
        .aggregate-sub {
          font-size: 11px;
          color: #8a8680;
          font-family: var(--font-mono, monospace);
        }
        .aggregate-pos { color: #276749; }
        .aggregate-neg { color: #9B2C2C; }

        .aggregate-methodology {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px dashed #e8e6e1;
          font-size: 10px;
          color: #8a8680;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.04em;
          text-align: center;
        }
        .aggregate-methodology a {
          color: #6b6861;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .aggregate-methodology a:hover { color: #1a1917; }

        /* Section title */
        .section-title {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 22px;
          font-weight: 600;
          color: #1a1917;
          letter-spacing: -0.01em;
          margin-bottom: 14px;
        }

        /* Filtres */
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
          align-items: center;
        }
        .filter-group {
          display: flex;
          gap: 4px;
          background: #f1efe9;
          border-radius: 6px;
          padding: 3px;
        }
        .filter-btn {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 600;
          color: #6b6861;
          background: transparent;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: background 0.1s, color 0.1s;
        }
        .filter-btn-active {
          background: #ffffff;
          color: #1a1917;
        }
        .filter-label {
          font-size: 10px;
          color: #8a8680;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-right: 4px;
        }

        /* Tableau */
        .table-wrap {
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 32px;
        }
        .mirror-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .mirror-table thead th {
          background: #f9f7f1;
          padding: 12px 14px;
          text-align: left;
          font-size: 10px;
          font-weight: 600;
          color: #6b6861;
          font-family: var(--font-mono, monospace);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid #e8e6e1;
        }
        .mirror-table tbody tr {
          border-bottom: 1px solid #f1efe9;
          transition: background 0.1s;
        }
        .mirror-table tbody tr:last-child { border-bottom: none; }
        .mirror-table tbody tr:hover { background: #fcfaf5; }
        .mirror-table td {
          padding: 14px;
          vertical-align: middle;
        }
        .cell-symbol {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cell-symbol-ticker {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 17px;
          font-weight: 600;
          color: #1a1917;
          letter-spacing: -0.01em;
        }
        .cell-symbol-name {
          font-size: 11px;
          color: #6b6861;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cell-mono {
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          color: #1a1917;
        }
        .cell-mono-sub {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: #8a8680;
        }
        .cell-pnl-pos { color: #276749; }
        .cell-pnl-neg { color: #9B2C2C; }
        .cell-score-delta {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          margin-left: 4px;
        }
        .cell-score-delta-pos { color: #276749; }
        .cell-score-delta-neg { color: #9B2C2C; }

        .row-link {
          color: inherit;
          text-decoration: none;
          display: contents;
        }

        /* Loading & Error */
        .state-msg {
          text-align: center;
          padding: 60px 20px;
          color: #6b6861;
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          letter-spacing: 0.04em;
        }
        .state-error { color: #9B2C2C; }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #8a8680;
          font-size: 13px;
          font-family: var(--font-mono, monospace);
        }

        /* Mobile : tableau en cards */
        @media (max-width: 767px) {
          .mirror-table thead { display: none; }
          .mirror-table, .mirror-table tbody, .mirror-table tr, .mirror-table td {
            display: block;
            width: 100%;
          }
          .mirror-table tbody tr {
            padding: 14px;
            border: 1px solid #e8e6e1;
            border-radius: 10px;
            margin-bottom: 12px;
          }
          .table-wrap { background: transparent; border: none; padding: 0; }
          .mirror-table td {
            padding: 6px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: none;
          }
          .mirror-table td::before {
            content: attr(data-label);
            font-size: 10px;
            font-weight: 600;
            color: #8a8680;
            font-family: var(--font-mono, monospace);
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
        }
      `}</style>

      {/* Header CLIKXIA standard */}
      <SiteHeaderClient lang={lang} />

      <div className="mirror-container">
        <h1 className="mirror-page-title">{t.mirror_page_title}</h1>
        <p className="mirror-page-subtitle">{t.mirror_page_subtitle}</p>

        {/* States */}
        {loading && <div className="state-msg">{t.mirror_loading}</div>}
        {error && !loading && (
          <div className="state-msg state-error">{t.mirror_error}</div>
        )}

        {!loading && !error && data && (
          <>
            {/* Bandeau freshness */}
            {data.data_freshness?.is_stale && (
              <div className="freshness-banner">
                {t.mirror_freshness_stale
                  .replace("{0}", data.data_freshness.last_scan_date)
                  .replace("{1}", String(data.data_freshness.days_since_last_scan))}
              </div>
            )}

            {/* Bandeau agrégats - Fonction 1.3 */}
            <div className="aggregate-section">
              <div className="aggregate-grid">
                <div className="aggregate-item">
                  <span className="aggregate-label">{t.mirror_aggregate_total_tickers}</span>
                  <span className="aggregate-value">{data.aggregate.total_tickers}</span>
                </div>
                <div className="aggregate-item">
                  <span className="aggregate-label">{t.mirror_aggregate_global_pnl}</span>
                  <span
                    className={`aggregate-value ${
                      data.aggregate.global_pnl_pct >= 0 ? "aggregate-pos" : "aggregate-neg"
                    }`}
                  >
                    {data.aggregate.global_pnl_pct >= 0 ? "+" : ""}
                    {data.aggregate.global_pnl_pct.toFixed(2)}%
                  </span>
                </div>
                <div className="aggregate-item">
                  <span className="aggregate-label">{t.mirror_aggregate_spy_pnl}</span>
                  <span
                    className={`aggregate-value ${
                      data.aggregate.spy_pnl_pct >= 0 ? "aggregate-pos" : "aggregate-neg"
                    }`}
                  >
                    {data.aggregate.spy_pnl_pct >= 0 ? "+" : ""}
                    {data.aggregate.spy_pnl_pct.toFixed(2)}%
                  </span>
                </div>
                <div className="aggregate-item">
                  <span className="aggregate-label">{t.mirror_aggregate_gap_vs_spy}</span>
                  <span
                    className={`aggregate-value ${
                      data.aggregate.gap_vs_spy >= 0 ? "aggregate-pos" : "aggregate-neg"
                    }`}
                  >
                    {data.aggregate.gap_vs_spy >= 0 ? "+" : ""}
                    {data.aggregate.gap_vs_spy.toFixed(2)}%
                  </span>
                </div>
                <div className="aggregate-item">
                  <span className="aggregate-label">{t.mirror_aggregate_hit_rate}</span>
                  <span className="aggregate-value">{data.aggregate.hit_rate_pct.toFixed(0)}%</span>
                  <span className="aggregate-sub">
                    {data.aggregate.n_winners} {t.mirror_aggregate_winners} · {data.aggregate.n_losers}{" "}
                    {t.mirror_aggregate_losers}
                  </span>
                </div>
              </div>
              <div className="aggregate-methodology">
                {t.mirror_aggregate_methodology} ·{" "}
                <Link href="/methode">{t.mirror_aggregate_methodology_link}</Link>
              </div>
            </div>

            {/* Search bar - Fonction 2.1 */}
            <MirrorSearchBar
              lang={lang}
              placeholder={t.mirror_search_placeholder}
              helpText={t.mirror_search_help}
              universeSizeText={t.mirror_search_universe_size}
            />

            {/* Tableau top 5 - Fonction 1.1 + 1.2 */}
            <h2 className="section-title">{t.mirror_page_title} · {data.tickers.length}</h2>

            <div className="filter-bar">
              <span className="filter-label">{lang === "fr" ? "Statut" : "Status"}</span>
              <div className="filter-group">
                {(["all", "STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"] as FilterStatus[]).map((s) => (
                  <button
                    key={s}
                    className={`filter-btn ${filterStatus === s ? "filter-btn-active" : ""}`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s === "all" ? t.mirror_table_filter_all : s.replace("_", " ")}
                  </button>
                ))}
              </div>

              <span className="filter-label" style={{ marginLeft: "8px" }}>
                {lang === "fr" ? "Perf" : "Perf"}
              </span>
              <div className="filter-group">
                {(["all", "winners", "losers"] as FilterPerf[]).map((p) => (
                  <button
                    key={p}
                    className={`filter-btn ${filterPerf === p ? "filter-btn-active" : ""}`}
                    onClick={() => setFilterPerf(p)}
                  >
                    {p === "all"
                      ? t.mirror_table_filter_all
                      : p === "winners"
                      ? t.mirror_table_filter_winners
                      : t.mirror_table_filter_losers}
                  </button>
                ))}
              </div>

              <span className="filter-label" style={{ marginLeft: "8px" }}>
                {lang === "fr" ? "Tri" : "Sort"}
              </span>
              <div className="filter-group">
                {(["date", "pnl", "score"] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    className={`filter-btn ${sortKey === k ? "filter-btn-active" : ""}`}
                    onClick={() => setSortKey(k)}
                  >
                    {k === "date"
                      ? t.mirror_table_sort_date
                      : k === "pnl"
                      ? t.mirror_table_sort_pnl
                      : t.mirror_table_sort_score}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              {filteredTickers.length === 0 ? (
                <div className="empty-state">
                  {lang === "fr" ? "Aucun ticker ne correspond aux filtres." : "No tickers match the filters."}
                </div>
              ) : (
                <table className="mirror-table">
                  <thead>
                    <tr>
                      <th>{t.mirror_table_col_symbol}</th>
                      <th>{t.mirror_table_col_first_appearance}</th>
                      <th>{t.mirror_table_col_entry_price}</th>
                      <th>{t.mirror_table_col_current_price}</th>
                      <th>{t.mirror_table_col_price_chart}</th>
                      <th>{t.mirror_table_col_pnl}</th>
                      <th>{t.mirror_table_col_recommendation}</th>
                      <th>{t.mirror_table_col_score}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickers.map((tk) => (
                      <TickerRow key={tk.symbol} ticker={tk} t={t} lang={lang} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Lien glossaire 13 recommandations */}
        <div
          style={{
            textAlign: "center",
            margin: "24px 0 8px",
            fontSize: "12px",
            color: "#6b6861",
            fontFamily: "var(--font-mono, monospace)",
            letterSpacing: "0.04em",
          }}
        >
          <Link
            href="/the-mirror/recommandations"
            style={{
              color: "#6b6861",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {lang === "fr" ? "Comprendre les 13 recommandations" : "Understanding the 13 recommendations"}
          </Link>
        </div>

        <DisclaimerClient lang={lang} />
      </div>
    </div>
  );
}

// ============================================================
// Sous-composant : ligne de ticker (avec sparklines)
// ============================================================
function TickerRow({
  ticker,
  t,
  lang,
}: {
  ticker: MirrorTop5Ticker;
  t: (typeof translations)[Lang];
  lang: Lang;
}) {
  const pnlPos = ticker.pnl_pct >= 0;
  const priceColor = pnlPos ? "#276749" : "#9B2C2C";
  const priceValues = ticker.price_series.map((p) => p.close);
  const pnlValues = ticker.pnl_series.map((p) => p.pnl_pct);

  const scoreDelta = ticker.score_delta;
  const scoreDeltaSign = scoreDelta !== null && scoreDelta >= 0 ? "+" : "";

  return (
    <tr style={{ cursor: "pointer" }} onClick={() => (window.location.href = `/the-mirror/${ticker.symbol}`)}>
      <td data-label={t.mirror_table_col_symbol}>
        <div className="cell-symbol">
          <span className="cell-symbol-ticker">{ticker.symbol}</span>
          {ticker.company_name && <span className="cell-symbol-name">{ticker.company_name}</span>}
        </div>
      </td>
      <td data-label={t.mirror_table_col_first_appearance}>
        <span className="cell-mono">{ticker.first_appearance_date}</span>
        <div className="cell-mono-sub">
          {ticker.n_appearances} {t.mirror_ticker_n_appearances.replace("{0}", "").trim().split(" ").slice(-2).join(" ")}
        </div>
      </td>
      <td data-label={t.mirror_table_col_entry_price}>
        <span className="cell-mono">${ticker.entry_price.toFixed(2)}</span>
      </td>
      <td data-label={t.mirror_table_col_current_price}>
        <span className="cell-mono">${ticker.current_price.toFixed(2)}</span>
      </td>
      <td data-label={t.mirror_table_col_price_chart}>
        <Sparkline values={priceValues} color={priceColor} />
      </td>
      <td data-label={t.mirror_table_col_pnl}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span className={`cell-mono ${pnlPos ? "cell-pnl-pos" : "cell-pnl-neg"}`} style={{ fontWeight: 600 }}>
            {pnlPos ? "+" : ""}
            {ticker.pnl_pct.toFixed(2)}%
          </span>
          <Sparkline values={pnlValues} color={priceColor} />
        </div>
      </td>
      <td data-label={t.mirror_table_col_recommendation}>
        {ticker.current_recommendation && (
          <RecommendationBadge recommendation={ticker.current_recommendation} />
        )}
      </td>
      <td data-label={t.mirror_table_col_score}>
        <span className="cell-mono">{ticker.current_score?.toFixed(1) ?? "—"}</span>
        {scoreDelta !== null && (
          <span
            className={`cell-score-delta ${scoreDelta >= 0 ? "cell-score-delta-pos" : "cell-score-delta-neg"}`}
          >
            ({scoreDeltaSign}
            {scoreDelta.toFixed(1)})
          </span>
        )}
      </td>
    </tr>
  );
}

