import Link from "next/link";
import { detectLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

interface Props {
  compact?: boolean;
}

export default async function SiteHeader({ compact = false }: Props) {
  const lang = await detectLang();

  return (
    <div className={compact ? "site-header site-header-compact" : "site-header"}>
      <style>{`
        .site-header {
          position: relative;
          text-align: center;
          padding: 48px 20px 32px;
          background: #faf9f7;
        }
        .site-header-compact {
          padding: 28px 20px 20px;
        }
        @media (min-width: 768px) {
          .site-header {
            padding: 72px 32px 40px;
          }
          .site-header-compact {
            padding: 36px 32px 24px;
          }
        }

        .site-header-actions {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10;
        }
        @media (min-width: 768px) {
          .site-header-actions {
            top: 28px;
            right: 32px;
          }
        }

        .header-contact-link {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: #6b6861;
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 8px 10px;
          border-radius: 6px;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .header-contact-link:hover {
          color: #1a1917;
          background: #ffffff;
        }
        @media (max-width: 500px) {
          .header-contact-link {
            font-size: 10px;
            padding: 6px 7px;
            letter-spacing: 0.04em;
          }
        }
        @media (max-width: 360px) {
          .header-contact-link {
            display: none;
          }
        }

        .site-logo {
          font-family: var(--font-serif, "Fraunces", serif);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 10px;
          display: inline-block;
          text-decoration: none;
        }
        .site-header .site-logo {
          font-size: 44px;
        }
        .site-header-compact .site-logo {
          font-size: 28px;
          margin-bottom: 6px;
        }
        @media (min-width: 768px) {
          .site-header .site-logo { font-size: 56px; }
          .site-header-compact .site-logo { font-size: 32px; }
        }
        @media (min-width: 1024px) {
          .site-header .site-logo { font-size: 64px; }
        }
        .site-logo-clik { color: #1a1917; }
        .site-logo-xia { color: #0A8B5C; }

        .site-tagline {
          font-size: 12px;
          color: #6b6861;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-family: var(--font-mono, monospace);
          font-weight: 500;
        }
        .site-header-compact .site-tagline {
          font-size: 10px;
          letter-spacing: 0.14em;
        }
      `}</style>

      <div className="site-header-actions">
        <Link href="/guide" className="header-contact-link">
          {t(lang, "guide_link")}
        </Link>
        <Link href="/contact" className="header-contact-link">
          {t(lang, "contact_link")}
        </Link>
        <LanguageSwitcher initialLang={lang} />
      </div>

      <Link href="/" className="site-logo">
        <span className="site-logo-clik">CLIK</span><span className="site-logo-xia">XIA</span>
      </Link>
      <div className="site-tagline">{t(lang, "tagline")}</div>
    </div>
  );
}
