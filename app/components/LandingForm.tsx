"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
}

export default function LandingForm({ lang }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !email.includes("@") || email.length < 5) {
      setError(t(lang, "error_email_invalid"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing", first_page: "/" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.already_registered) {
          setInfo(t(lang, "already_registered"));
        }
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 600);
      } else {
        setError(data.error || t(lang, "error_generic"));
        setSubmitting(false);
      }
    } catch {
      setError(t(lang, "error_connection"));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="landing-form">
      <style>{`
        .landing-form {
          max-width: 420px;
          margin: 0 auto;
        }
        .landing-form-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        @media (min-width: 640px) {
          .landing-form-row {
            flex-direction: row;
            gap: 8px;
          }
        }
        .landing-input {
          flex: 1;
          padding: 14px 16px;
          border: 1px solid #d4d1ca;
          border-radius: 8px;
          font-size: 15px;
          font-family: var(--font-mono, monospace);
          background: #ffffff;
          color: #1a1917;
          outline: none;
          transition: border-color 0.15s;
        }
        .landing-input:focus { border-color: #1a1917; }
        .landing-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .landing-button {
          padding: 14px 20px;
          background: #1a1917;
          color: #faf9f7;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 0.15s;
          font-family: var(--font-mono, monospace);
          white-space: nowrap;
        }
        .landing-button:hover:not(:disabled) { opacity: 0.9; }
        .landing-button:disabled { opacity: 0.5; cursor: not-allowed; }
        .landing-error {
          margin-top: 12px;
          padding: 10px 12px;
          background: #f5e4e4;
          color: #b93b3b;
          border-radius: 6px;
          font-size: 13px;
          text-align: center;
        }
        .landing-info {
          margin-top: 12px;
          padding: 10px 12px;
          background: #e8f3ea;
          color: #2d7a3e;
          border-radius: 6px;
          font-size: 13px;
          text-align: center;
        }
        .landing-note {
          margin-top: 12px;
          font-size: 11px;
          color: #6b6861;
          text-align: center;
          line-height: 1.5;
        }
      `}</style>

      <div className="landing-form-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t(lang, "email_placeholder")}
          required
          disabled={submitting}
          className="landing-input"
        />
        <button type="submit" disabled={submitting} className="landing-button">
          {submitting ? t(lang, "cta_access_loading") : t(lang, "cta_access")}
        </button>
      </div>

      {error && <div className="landing-error">{error}</div>}
      {info && <div className="landing-info">{info}</div>}

      <div className="landing-note">
        {t(lang, "note_signup")}
      </div>
    </form>
  );
}
