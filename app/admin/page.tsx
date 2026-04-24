"use client";

import { useState, useEffect } from "react";

// ============================================================
// Types
// ============================================================
type DayCount = { date: string; count: number };
type SourceCount = { source: string; count: number };
type CountryCount = { country: string; count: number };

type RecentSignup = {
  email: string;
  signup_date: string;
  source: string | null;
  country: string | null;
};

type RecentMessage = {
  id: number;
  name: string | null;
  email: string;
  message: string;
  created_at: string;
  replied: boolean;
};

type MetricsData = {
  signups: {
    total_real: number;
    total_displayed: number;
    today: number;
    last_7_days: number;
    last_30_days: number;
  };
  evolution_30d: DayCount[];
  sources: SourceCount[];
  countries: CountryCount[];
  messages: {
    total: number;
    last_7_days: number;
    unreplied: number;
  };
  recent_signups: RecentSignup[];
  recent_messages: RecentMessage[];
  generated_at: string;
};

// ============================================================
// Formatters
// ============================================================
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDayShort = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

// ============================================================
// Composant principal
// ============================================================
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState("");

  // Au chargement, essayer de fetcher les metriques (cookie deja pose ?)
  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    setMetricsLoading(true);
    setMetricsError("");
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.status === 401) {
        setAuthenticated(false);
        setMetricsLoading(false);
        return;
      }
      if (!res.ok) {
        throw new Error("Erreur API");
      }
      const data = await res.json();
      setMetrics(data);
      setAuthenticated(true);
    } catch (err) {
      console.error(err);
      setMetricsError("Impossible de charger les metriques");
    } finally {
      setMetricsLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.error || "Erreur de connexion");
        setLoginLoading(false);
        return;
      }
      setPassword("");
      await fetchMetrics();
    } catch (err) {
      console.error(err);
      setLoginError("Erreur reseau");
    } finally {
      setLoginLoading(false);
    }
  }

  // ============================================================
  // RENDU : ECRAN DE LOGIN
  // ============================================================
  if (!authenticated) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#faf9f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "var(--font-inter), -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            width: "100%",
            background: "#ffffff",
            border: "1px solid #e8e6e1",
            borderRadius: "16px",
            padding: "3rem 2.5rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: "#1a1917" }}>CLIK</span>
            <span style={{ color: "#0A8B5C" }}>XIA</span>
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "11px",
              color: "#6b6861",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}
          >
            Admin Dashboard
          </div>

          <form onSubmit={handleLogin}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#1a1917",
                marginBottom: "8px",
              }}
            >
              Mot de passe administrateur
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="votre mot de passe"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "14px",
                border: "1px solid #e8e6e1",
                borderRadius: "8px",
                outline: "none",
                marginBottom: "1rem",
                background: "#ffffff",
                color: "#1a1917",
              }}
            />

            {loginError && (
              <div
                style={{
                  color: "#b93b3b",
                  fontSize: "13px",
                  padding: "8px 12px",
                  background: "#f5e4e4",
                  borderRadius: "6px",
                  marginBottom: "1rem",
                }}
              >
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || !password}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                background: loginLoading || !password ? "#6b6861" : "#1a1917",
                border: "none",
                borderRadius: "8px",
                cursor: loginLoading || !password ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {loginLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ============================================================
  // RENDU : DASHBOARD
  // ============================================================
  if (metricsLoading && !metrics) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#faf9f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-inter), sans-serif",
          color: "#6b6861",
        }}
      >
        Chargement des metriques...
      </main>
    );
  }

  if (metricsError) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#faf9f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#b93b3b",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {metricsError}
      </main>
    );
  }

  if (!metrics) return null;

  // Max value pour normaliser le graphique
  const maxDayCount = Math.max(...metrics.evolution_30d.map((d) => d.count), 1);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#faf9f7",
        padding: "2rem 1.5rem",
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
        color: "#1a1917",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2.5rem",
            paddingBottom: "1.5rem",
            borderBottom: "1px solid #e8e6e1",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: "4px",
              }}
            >
              <span style={{ color: "#1a1917" }}>CLIK</span>
              <span style={{ color: "#0A8B5C" }}>XIA</span>
              <span
                style={{ color: "#6b6861", fontWeight: 400, marginLeft: "12px" }}
              >
                Admin
              </span>
            </div>
            <div
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "11px",
                color: "#6b6861",
                letterSpacing: "0.1em",
              }}
            >
              Derniere mise a jour : {formatDate(metrics.generated_at)}
            </div>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={metricsLoading}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#1a1917",
              background: "#ffffff",
              border: "1px solid #e8e6e1",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {metricsLoading ? "..." : "Rafraichir"}
          </button>
        </div>

        {/* ==== SECTION 1 : Cartes KPI principales ==== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <KpiCard
            label="Inscrits (total reel)"
            value={metrics.signups.total_real}
            sub={`Affiche : ${metrics.signups.total_displayed} (avec +247 fictif)`}
            accent="#0A8B5C"
          />
          <KpiCard
            label="Nouveaux aujourd hui"
            value={metrics.signups.today}
            sub="Depuis 00h00"
          />
          <KpiCard
            label="7 derniers jours"
            value={metrics.signups.last_7_days}
            sub="Inscrits"
          />
          <KpiCard
            label="30 derniers jours"
            value={metrics.signups.last_30_days}
            sub="Inscrits"
          />
          <KpiCard
            label="Messages contact"
            value={metrics.messages.total}
            sub={`${metrics.messages.unreplied} non repondus`}
            accent={metrics.messages.unreplied > 0 ? "#9a7628" : undefined}
          />
        </div>

        {/* ==== SECTION 2 : Graphique 30 jours ==== */}
        <Section title="Evolution inscriptions - 30 derniers jours">
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "4px",
              height: "160px",
              padding: "1rem 0",
            }}
          >
            {metrics.evolution_30d.map((day) => {
              const heightPct = (day.count / maxDayCount) * 100;
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count}`}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    minWidth: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#6b6861",
                      fontWeight: 600,
                      minHeight: "14px",
                    }}
                  >
                    {day.count > 0 ? day.count : ""}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      minHeight: "2px",
                      height: `${Math.max(heightPct, 2)}%`,
                      background: day.count > 0 ? "#0A8B5C" : "#e8e6e1",
                      borderRadius: "2px",
                      transition: "height 0.3s",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              color: "#6b6861",
              fontFamily: "ui-monospace, monospace",
              paddingTop: "0.5rem",
              borderTop: "1px solid #e8e6e1",
            }}
          >
            <span>{formatDayShort(metrics.evolution_30d[0]?.date || "")}</span>
            <span>
              {formatDayShort(
                metrics.evolution_30d[metrics.evolution_30d.length - 1]?.date ||
                  ""
              )}
            </span>
          </div>
        </Section>

        {/* ==== SECTION 3 : Sources + Pays (cote a cote) ==== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <Section title="Sources de trafic (top 10)">
            {metrics.sources.length === 0 ? (
              <div style={{ color: "#6b6861", fontSize: "13px" }}>
                Aucune donnee encore.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {metrics.sources.map((s) => (
                  <div
                    key={s.source}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "#faf9f7",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#1a1917" }}>{s.source}</span>
                    <span
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontWeight: 600,
                        color: "#0A8B5C",
                      }}
                    >
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Repartition par pays">
            {metrics.countries.length === 0 ? (
              <div style={{ color: "#6b6861", fontSize: "13px" }}>
                Aucune donnee encore.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {metrics.countries.map((c) => (
                  <div
                    key={c.country}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "#faf9f7",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#1a1917" }}>{c.country}</span>
                    <span
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontWeight: 600,
                        color: "#0A8B5C",
                      }}
                    >
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ==== SECTION 4 : Inscrits recents ==== */}
        <Section title={`Inscrits recents (${metrics.recent_signups.length})`}>
          {metrics.recent_signups.length === 0 ? (
            <div style={{ color: "#6b6861", fontSize: "13px" }}>
              Aucun inscrit encore.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  fontSize: "13px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#1a1917",
                      color: "#faf9f7",
                    }}
                  >
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Source</th>
                    <th style={thStyle}>Pays</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recent_signups.map((row, i) => (
                    <tr
                      key={row.email + i}
                      style={{ borderBottom: "1px solid #e8e6e1" }}
                    >
                      <td style={tdStyle}>{row.email}</td>
                      <td style={{ ...tdStyle, fontFamily: "ui-monospace, monospace", color: "#6b6861" }}>
                        {formatDate(row.signup_date)}
                      </td>
                      <td style={{ ...tdStyle, color: "#6b6861" }}>
                        {row.source || "-"}
                      </td>
                      <td style={{ ...tdStyle, color: "#6b6861" }}>
                        {row.country || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* ==== SECTION 5 : Messages recents ==== */}
        <Section title={`Messages de contact recents (${metrics.recent_messages.length})`}>
          {metrics.recent_messages.length === 0 ? (
            <div style={{ color: "#6b6861", fontSize: "13px" }}>
              Aucun message recu.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {metrics.recent_messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    padding: "12px 16px",
                    background: msg.replied ? "#faf9f7" : "#fffbf0",
                    border: msg.replied
                      ? "1px solid #e8e6e1"
                      : "1px solid #f5ecd9",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "6px",
                    }}
                  >
                    <div>
                      <span
                        style={{ fontWeight: 600, color: "#1a1917", fontSize: "14px" }}
                      >
                        {msg.name || "Anonyme"}
                      </span>
                      <span
                        style={{ color: "#6b6861", fontSize: "13px", marginLeft: "8px" }}
                      >
                        {msg.email}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: "11px",
                        color: msg.replied ? "#6b6861" : "#9a7628",
                        fontWeight: 600,
                      }}
                    >
                      {msg.replied ? "repondu" : "en attente"}{" - "}
                      {formatDate(msg.created_at)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#3d3a36",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.message.slice(0, 300)}
                    {msg.message.length > 300 ? "..." : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}

// ============================================================
// Sub-components
// ============================================================
function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e8e6e1",
        borderRadius: "12px",
        padding: "1.25rem",
      }}
    >
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: "11px",
          color: "#6b6861",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: "32px",
          fontWeight: 700,
          color: accent || "#1a1917",
          lineHeight: 1,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "11px", color: "#6b6861" }}>{sub}</div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e8e6e1",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: "11px",
          color: "#6b6861",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontWeight: 600,
          marginBottom: "1rem",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontFamily: "ui-monospace, monospace",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "#1a1917",
};
