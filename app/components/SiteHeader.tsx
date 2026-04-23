import Link from "next/link";

interface Props {
  compact?: boolean;  // si true, plus petit (pour pages internes)
}

export default function SiteHeader({ compact = false }: Props) {
  return (
    <div className={compact ? "site-header site-header-compact" : "site-header"}>
      <style>{`
        .site-header {
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

      <Link href="/" className="site-logo">
        <span className="site-logo-clik">CLIK</span><span className="site-logo-xia">XIA</span>
      </Link>
      <div className="site-tagline">Copilote de decision &middot; Bourse &middot; Canada</div>
    </div>
  );
}
