"use client";

import { useState } from "react";

interface Props {
  source?: string;
  firstPage?: string;
}

export default function EmailGate({ source, firstPage }: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@") || email.length < 5) {
      setError("Entrez un email valide");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, first_page: firstPage }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Cookie pose cote serveur, on recharge la page pour debloquer le contenu
        window.location.reload();
      } else {
        setError(data.error || "Une erreur est survenue");
        setSubmitting(false);
      }
    } catch {
      setError("Erreur de connexion, reessayez");
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        padding: "32px 20px 48px",
        background: "var(--surface)",
        borderTop: "1px solid var(--ink-100)",
        marginTop: "24px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div
          className="mono"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--ink-500)",
            marginBottom: "10px",
          }}
        >
          Analyse complete reservee
        </div>
        <div
          className="display-lg"
          style={{
            fontSize: "22px",
            color: "var(--ink-900)",
            lineHeight: 1.3,
            marginBottom: "8px",
          }}
        >
          Voir tous les facteurs fondamentaux
        </div>
        <div style={{ fontSize: "13px", color: "var(--ink-500)", marginBottom: "20px", lineHeight: 1.5 }}>
          Accedez aux 2&nbsp;237 analyses techniques quotidiennes de CLIKXIA.
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: "360px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            disabled={submitting}
            style={{
              padding: "14px 16px",
              border: "1px solid var(--ink-200)",
              borderRadius: "8px",
              fontSize: "15px",
              fontFamily: "var(--font-mono), monospace",
              background: "var(--bg)",
              color: "var(--ink-900)",
              outline: "none",
              transition: "border-color 0.2s",
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "14px 16px",
              background: "var(--ink-900)",
              color: "var(--bg)",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {submitting ? "Chargement..." : "Debloquer l analyse"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              background: "var(--danger-100)",
              color: "var(--danger-700)",
              borderRadius: "6px",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: "16px",
            fontSize: "11px",
            color: "var(--ink-500)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Acces immediat apres soumission. Pas de spam, desinscription libre.
        </div>
      </form>
    </div>
  );
}
