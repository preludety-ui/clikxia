import ContactForm from "@/app/components/ContactForm";
import Disclaimer from "@/app/components/Disclaimer";
import Link from "next/link";
import { detectLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import SiteHeader from "@/app/components/SiteHeader";

export default async function ContactPage() {
  const lang = await detectLang();

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", color: "#1a1917" }}>
      <SiteHeader compact />

      <div className="contact-container">
        <style>{`
          .contact-container {
            max-width: 560px;
            margin: 0 auto;
            padding: 0 20px 40px;
          }
          @media (min-width: 768px) {
            .contact-container {
              max-width: 640px;
              padding: 0 32px 48px;
            }
          }
          .contact-header {
            text-align: center;
            margin-bottom: 32px;
            padding-top: 8px;
          }
          .contact-back {
            display: inline-block;
            color: #6b6861;
            font-size: 13px;
            margin-bottom: 16px;
            text-decoration: none;
          }
          .contact-back:hover { color: #1a1917; }
          .contact-title {
            font-family: var(--font-serif, "Fraunces", serif);
            font-size: 32px;
            font-weight: 600;
            letter-spacing: -0.02em;
            line-height: 1.1;
            margin-bottom: 8px;
            color: #1a1917;
          }
          @media (min-width: 768px) {
            .contact-title { font-size: 40px; }
          }
          .contact-subtitle {
            font-size: 15px;
            color: #6b6861;
            line-height: 1.5;
            max-width: 440px;
            margin: 0 auto;
          }
        `}</style>

        <div className="contact-header">
          <Link href="/" className="contact-back">&larr; {t(lang, "back")}</Link>
          <h1 className="contact-title">{t(lang, "contact_title")}</h1>
          <p className="contact-subtitle">{t(lang, "contact_subtitle")}</p>
        </div>

        <ContactForm lang={lang} />

        <Disclaimer />
      </div>
    </div>
  );
}
