import { detectLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import SiteHeader from "@/app/components/SiteHeader";
import GuideForm from "@/app/components/GuideForm";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await detectLang();
  const title = t(lang, "guide_page_title");
  const description = lang === "fr"
    ? "34 pages pour comprendre la bourse et interpreter chaque signal CLIKXIA. Gratuit, fonde sur 13 papers academiques peer-reviewed."
    : "34 pages to understand the stock market and interpret every CLIKXIA signal. Free, based on 13 peer-reviewed academic papers.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

export default async function GuidePage() {
  const lang = await detectLang();

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", color: "#1a1917" }}>
      <SiteHeader compact />

      <main style={{ maxWidth: "920px", margin: "0 auto", padding: "0 20px 60px" }}>
        {/* Kicker */}
        <div
          style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "11px",
            color: "#0A8B5C",
            letterSpacing: "0.18em",
            fontWeight: 600,
            marginTop: "40px",
            marginBottom: "20px",
          }}
        >
          {t(lang, "guide_hero_kicker")}
        </div>

        {/* Hero title */}
        <h1
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: "0 0 24px",
            whiteSpace: "pre-line",
          }}
        >
          {t(lang, "guide_hero_title")}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "clamp(18px, 2.4vw, 22px)",
            fontStyle: "italic",
            color: "#0A8B5C",
            margin: "0 0 28px",
            fontWeight: 400,
          }}
        >
          {t(lang, "guide_hero_subtitle")}
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: "17px",
            lineHeight: 1.7,
            color: "#3d3a36",
            maxWidth: "640px",
            margin: "0 0 40px",
          }}
        >
          {t(lang, "guide_hero_description")}
        </p>

        {/* Meta badges */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "48px",
            paddingBottom: "32px",
            borderBottom: "1px solid #e8e6e1",
          }}
        >
          <MetaBadge label={t(lang, "guide_meta_pages")} />
          <MetaBadge label={t(lang, "guide_meta_size")} />
          <MetaBadge label={t(lang, "guide_meta_lang")} />
        </div>

        {/* Bullets + Form grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "40px",
            marginBottom: "60px",
          }}
          className="guide-grid"
        >
          {/* Left : bullets */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display), Georgia, serif",
                fontSize: "22px",
                fontWeight: 600,
                margin: "0 0 24px",
              }}
            >
              {lang === "fr" ? "Ce qui se trouve dans le guide" : "What is inside the guide"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Bullet
                label={t(lang, "guide_bullet_1_label")}
                desc={t(lang, "guide_bullet_1_desc")}
              />
              <Bullet
                label={t(lang, "guide_bullet_2_label")}
                desc={t(lang, "guide_bullet_2_desc")}
              />
              <Bullet
                label={t(lang, "guide_bullet_3_label")}
                desc={t(lang, "guide_bullet_3_desc")}
              />
              <Bullet
                label={t(lang, "guide_bullet_4_label")}
                desc={t(lang, "guide_bullet_4_desc")}
              />
            </div>
          </div>

          {/* Right : form */}
          <GuideForm lang={lang} />
        </div>
      </main>

      {/* Responsive : grid 2 cols on desktop */}
      <style>{`
        @media (min-width: 768px) {
          .guide-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function MetaBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: "11px",
        color: "#6b6861",
        background: "#ffffff",
        border: "1px solid #e8e6e1",
        borderRadius: "100px",
        padding: "6px 14px",
        letterSpacing: "0.08em",
      }}
    >
      {label}
    </span>
  );
}

function Bullet({ label, desc }: { label: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
      <div
        style={{
          color: "#0A8B5C",
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "18px",
          fontWeight: 700,
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        \u2192
      </div>
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "15px",
            color: "#1a1917",
            marginBottom: "4px",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "14px", color: "#6b6861", lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}
