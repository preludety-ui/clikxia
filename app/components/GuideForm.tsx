"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

interface GuideFormProps {
  lang: Lang;
}

export default function GuideForm({ lang }: GuideFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation basique
    if (!email || !email.includes("@") || email.length < 5) {
      setError(t(lang, "guide_form_error_email"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/guide-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });

      if (!res.ok) {
        setError(t(lang, "guide_form_error_server"));
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Succes : declencher le telechargement
      setSuccess(true);

      if (data.downloadUrl) {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = "CLIKXIA-Guide.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error(err);
      setError(t(lang, "guide_form_error_server"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e8e6e1",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
      }}
    >
      {success ? (
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontSize: "11px",
              color: "#0A8B5C",
              letterSpacing: "0.14em",
              fontWeight: 700,
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            {"\u2713"} {lang === "fr" ? "Succ\u00e8s" : "Success"}
          </div>
          <p
            style={{
              fontSize: "15px",
              color: "#1a1917",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            {t(lang, "guide_form_success")}
          </p>
          <a
            href="/guide.pdf"
            download="CLIKXIA-Guide.pdf"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#0A8B5C",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {t(lang, "guide_download_direct")}
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontSize: "11px",
              color: "#6b6861",
              letterSpacing: "0.14em",
              fontWeight: 600,
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            {t(lang, "guide_form_label")}
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t(lang, "guide_form_placeholder")}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "15px",
              border: "1px solid #e8e6e1",
              borderRadius: "10px",
              outline: "none",
              marginBottom: "12px",
              background: loading ? "#faf9f7" : "#ffffff",
              color: "#1a1917",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div
              style={{
                color: "#b93b3b",
                fontSize: "13px",
                padding: "8px 12px",
                background: "#f5e4e4",
                borderRadius: "8px",
                marginBottom: "12px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#ffffff",
              background: loading || !email ? "#6b6861" : "#1a1917",
              border: "none",
              borderRadius: "10px",
              cursor: loading || !email ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? t(lang, "guide_form_loading") : t(lang, "guide_form_button")}
          </button>

          <p
            style={{
              fontSize: "12px",
              color: "#6b6861",
              marginTop: "14px",
              textAlign: "center",
              margin: "14px 0 0",
            }}
          >
            {t(lang, "guide_form_note")}
          </p>
        </form>
      )}
    </div>
  );
}
