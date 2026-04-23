"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
}

export default function ContactForm({ lang }: Props) {
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
      setError(t(lang, "error_email_short"));
      return;
    }
    if (!message || message.trim().length < 5) {
      setError(t(lang, "error_message_short"));
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
        setError(data.error || t(lang, "error_generic"));
      }
    } catch {
      setError(t(lang, "error_connection"));
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div style={{
        padding: "32px 20px",
        textAlign: "center",
        background: "#e8f3ea",
        borderRadius: "12px",
        border: "1px solid #c8e5cf",
      }}>
        <div style={{
          fontFamily: "var(--font-serif, serif)",
          fontSize: "22px",
          fontWeight: 600,
          color: "#2d7a3e",
          marginBottom: "8px",
        }}>
          {t(lang, "contact_success_title")}
        </div>
        <p style={{ color: "#6b6861", fontSize: "14px", margin: 0 }}>
          {t(lang, "contact_success_text")}
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
          color: #6b6861;
          font-family: var(--font-mono, monospace);
          margin-bottom: 6px;
          display: block;
        }
        .contact-input,
        .contact-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #d4d1ca;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          background: #ffffff;
          color: #1a1917;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .contact-input:focus,
        .contact-textarea:focus { border-color: #1a1917; }
        .contact-textarea {
          min-height: 140px;
          resize: vertical;
          font-family: var(--font-mono, monospace);
          font-size: 14px;
          line-height: 1.5;
        }
        .contact-submit {
          padding: 14px 24px;
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
          margin-top: 8px;
        }
        .contact-submit:hover:not(:disabled) { opacity: 0.9; }
        .contact-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .contact-error {
          padding: 10px 12px;
          background: #f5e4e4;
          color: #b93b3b;
          border-radius: 6px;
          font-size: 13px;
          text-align: center;
        }
      `}</style>

      <div>
        <label className="contact-label">{t(lang, "contact_name_label")}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(lang, "contact_name_placeholder")}
          disabled={submitting}
          className="contact-input"
          maxLength={120}
        />
      </div>

      <div>
        <label className="contact-label">{t(lang, "contact_email_label")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t(lang, "email_placeholder")}
          required
          disabled={submitting}
          className="contact-input"
        />
      </div>

      <div>
        <label className="contact-label">{t(lang, "contact_message_label")}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t(lang, "contact_message_placeholder")}
          required
          disabled={submitting}
          className="contact-textarea"
          maxLength={5000}
        />
      </div>

      {error && <div className="contact-error">{error}</div>}

      <button type="submit" disabled={submitting} className="contact-submit">
        {submitting ? t(lang, "contact_submit_loading") : t(lang, "contact_submit")}
      </button>
    </form>
  );
}
