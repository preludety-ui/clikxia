"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getMirrorUniverse, type MirrorUniverseTicker } from "@/lib/api";
import { type Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
  placeholder: string;
  helpText: string;
  universeSizeText: string;
}

export default function UniverseSearchBar({ lang, placeholder, helpText, universeSizeText }: Props) {
  const [universe, setUniverse] = useState<MirrorUniverseTicker[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Charge l'univers au mount (depuis Supabase via backend, jamais yfinance)
  useEffect(() => {
    getMirrorUniverse()
      .then((res) => setUniverse(res.tickers || []))
      .catch(() => setUniverse([]));
  }, []);

  // Ferme le dropdown si clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrage simple : on recherche dans symbol + company_name
  const queryUpper = query.toUpperCase().trim();
  const matches = queryUpper.length >= 1
    ? universe
        .filter((t) => {
          const symMatch = t.symbol.toUpperCase().startsWith(queryUpper);
          const nameMatch = t.company_name?.toUpperCase().includes(queryUpper) || false;
          return symMatch || nameMatch;
        })
        .slice(0, 10)
    : [];

  function navigateToTicker(symbol: string) {
    router.push(`/dashboard/${symbol.toUpperCase()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && matches[highlightedIndex]) {
        navigateToTicker(matches[highlightedIndex].symbol);
      } else if (queryUpper.length >= 1) {
        navigateToTicker(queryUpper);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="universe-search-wrapper">
      <style>{`
        .universe-search-wrapper {
          position: relative;
          margin-bottom: 28px;
        }
        .universe-search-input-wrap {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 10px;
          padding: 14px 18px;
          gap: 12px;
          transition: border-color 0.15s;
        }
        .universe-search-input-wrap:focus-within {
          border-color: #0A8B5C;
        }
        .universe-search-input {
          flex: 1;
          font-size: 15px;
          color: #1a1917;
          font-family: inherit;
          background: transparent;
          border: none;
          outline: none;
        }
        .universe-search-input::placeholder {
          color: #8a8680;
        }
        .universe-search-icon {
          color: #6b6861;
          flex-shrink: 0;
        }
        .universe-search-help {
          margin-top: 8px;
          font-size: 11px;
          color: #8a8680;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.04em;
          padding-left: 4px;
        }
        .universe-search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(15, 23, 36, 0.06);
          overflow: hidden;
          z-index: 50;
          max-height: 360px;
          overflow-y: auto;
        }
        .universe-search-item {
          padding: 12px 18px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          cursor: pointer;
          border-bottom: 1px solid #f1efe9;
          transition: background 0.1s;
        }
        .universe-search-item:last-child { border-bottom: none; }
        .universe-search-item:hover,
        .universe-search-item-highlight {
          background: #f9f7f1;
        }
        .universe-search-item-symbol {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 16px;
          font-weight: 600;
          color: #1a1917;
          letter-spacing: -0.01em;
        }
        .universe-search-item-name {
          font-size: 12px;
          color: #6b6861;
          margin-left: 14px;
          text-align: right;
          max-width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .universe-search-empty {
          padding: 20px;
          text-align: center;
          font-size: 13px;
          color: #8a8680;
        }
      `}</style>

      <div className="universe-search-input-wrap">
        <svg
          className="universe-search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className="universe-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="universe-search-help">
        {universe.length > 0 ? universeSizeText : helpText}
      </div>

      {isOpen && queryUpper.length >= 1 && (
        <div className="universe-search-dropdown">
          {matches.length > 0 ? (
            matches.map((ticker, idx) => (
              <div
                key={ticker.symbol}
                className={`universe-search-item ${idx === highlightedIndex ? "universe-search-item-highlight" : ""}`}
                onMouseDown={() => navigateToTicker(ticker.symbol)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <span className="universe-search-item-symbol">{ticker.symbol}</span>
                {ticker.company_name && (
                  <span className="universe-search-item-name">{ticker.company_name}</span>
                )}
              </div>
            ))
          ) : (
            <div className="universe-search-empty">{helpText}</div>
          )}
        </div>
      )}
    </div>
  );
}