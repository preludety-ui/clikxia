"use client";

import Link from "next/link";
import { TopStock } from "@/lib/api";
import RecommendationBadge from "./RecommendationBadge";

interface Props {
  stock: TopStock;
  companyName?: string;
  price?: number;
  changePct?: number;
}

export default function StockCard({ stock, companyName = "", price, changePct }: Props) {
  const showChange = price !== undefined && changePct !== undefined;

  return (
    <Link href={`/dashboard/${stock.symbol}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          padding: "16px",
          border: "1px solid var(--ink-100)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "12px",
          alignItems: "center",
          cursor: "pointer",
          transition: "border-color 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--brand-500)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--ink-100)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span
              className="display-md"
              style={{ fontSize: "20px", color: "var(--ink-900)" }}
            >
              {stock.symbol}
            </span>
            {companyName && (
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--ink-500)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {companyName}
              </span>
            )}
          </div>
          {showChange && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "13px",
              }}
            >
              <span style={{ color: "var(--ink-900)", fontWeight: 500 }}>
                ${price.toFixed(2)}
              </span>
              <span className={changePct >= 0 ? "stock-change-pos" : "stock-change-neg"}>
                {changePct >= 0 ? "+" : ""}{changePct.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
          <RecommendationBadge recommendation={stock.recommendation} />
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "11px",
              color: "var(--ink-500)",
            }}
          >
            {stock.composite_score.toFixed(0)} / 100
          </span>
        </div>
      </div>
    </Link>
  );
}
