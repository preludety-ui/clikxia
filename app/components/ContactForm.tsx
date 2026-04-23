"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Email invalide");
      return;
    }
    if (!message || message.trim().length < 5) {
      setError("Message trop court");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch {
      setError("Erreur de connexion");
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div style={{
        padding: "32px 20px",
        textAlign: "center",
        background: "var(--success-100)",
        borderRadius: "12px",
        border: "1px solid var(--success-200, var(--success-100))",
      }}>
        <div style={{
          fontFamily: "var(--font-serif, serif)",
          fontSize: "22px",
          fontWeight: 600,
          color: "var(--success-700)",
          marginBottom: "8px",
        }}>
          Message envoye
        </div>
        <p style={{ color: "var(--ink-500)", fontSize: "14px", margin: 0 }}>
          Je vous reponds dans les plus brefs delais.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <style>{`
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .contact-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--ink-500);
          font-family: var(--font-mono, monospace);
          margin-bottom: 6px;
          display: block;
        }
        .contact-input,
        .contact-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid var(--ink-200);
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          background: var(--surface);
          color: var(--ink-900);
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .contact-input:focus,
        .contact-textarea:focus {
          border-color: var(--ink-900);
        }
        .contact-textarea {
          min-height: 140px;
          resize: vertical;
          font-family: var(--font-mono, monospace);
          font-size: 14px;
          line-height: 1.5;
        }
        .contact-submit {
          padding: 14px 24px;
          background: var(--ink-900);
          color: var(--bg);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 0.15s;
          font-family: var(--font-mono, monospace);
          margin-top: 8px;
        }
        .contact-submit:hover:not(:disabled) { opacity: 0.9; }
        .contact-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .contact-error {
          padding: 10px 12px;
          background: var(--danger-100);
          color: var(--danger-700);
          border-radius: 6px;
          font-size: 13px;
          text-align: center;
        }
      `}</style>

      <div>
        <label className="contact-label">Nom (facultatif)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre nom"
          disabled={submitting}
          className="contact-input"
          maxLength={120}
        />
      </div>

      <div>
        <label className="contact-label">Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
          disabled={submitting}
          className="contact-input"
        />
      </div>

      <div>
        <label className="contact-label">Message *</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message..."
          required
          disabled={submitting}
          className="contact-textarea"
          maxLength={5000}
        />
      </div>

      {error && <div className="contact-error">{error}</div>}

      <button type="submit" disabled={submitting} className="contact-submit">
        {submitting ? "Envoi..." : "Envoyer le message"}
      </button>
    </form>
  );
}
