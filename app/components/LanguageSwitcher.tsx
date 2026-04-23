"use client";

import { useState, useEffect } from "react";
import type { Lang } from "@/lib/i18n";

interface Props {
  initialLang: Lang;
}

export default function LanguageSwitcher({ initialLang }: Props) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [switching, setSwitching] = useState(false);

  // Synchronise avec le cookie au chargement (au cas ou le SSR et le client divergent)
  useEffect(() => {
    const match = document.cookie.match(/clikxia_lang=(\w+)/);
    if (match && (match[1] === "fr" || match[1] === "en") && match[1] !== lang) {
      setLang(match[1] as Lang);
    }
  }, [lang]);

  async function switchLang(newLang: Lang) {
    if (newLang === lang || switching) return;
    setSwitching(true);
    try {
      await fetch("/api/lang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: newLang }),
      });
      // Recharge la page pour que le SSR reprenne avec la nouvelle langue
      window.location.reload();
    } catch {
      setSwitching(false);
    }
  }

  return (
    <div className="lang-switcher">
      <style>{`
        .lang-switcher {
          display: flex;
          gap: 4px;
          background: #ffffff;
          border: 1px solid #e8e6e1;
          border-radius: 6px;
          padding: 3px;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
        }
        .lang-btn {
          padding: 5px 10px;
          border: none;
          background: transparent;
          color: #6b6861;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
        }
        .lang-btn.active {
          background: #1a1917;
          color: #faf9f7;
        }
        .lang-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      <button
        type="button"
        onClick={() => switchLang("fr")}
        disabled={switching}
        className={`lang-btn ${lang === "fr" ? "active" : ""}`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => switchLang("en")}
        disabled={switching}
        className={`lang-btn ${lang === "en" ? "active" : ""}`}
      >
        EN
      </button>
    </div>
  );
}
