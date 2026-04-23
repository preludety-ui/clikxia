import ContactForm from "@/app/components/ContactForm";
import Disclaimer from "@/app/components/Disclaimer";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="clikxia-contact">
      <style>{`
        .clikxia-contact {
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink-900);
        }
        .contact-container {
          max-width: 560px;
          margin: 0 auto;
          padding: 48px 20px 24px;
        }
        @media (min-width: 768px) {
          .contact-container {
            max-width: 640px;
            padding: 72px 32px 32px;
          }
        }

        .contact-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .contact-back {
          display: inline-block;
          color: var(--ink-500);
          font-size: 13px;
          margin-bottom: 16px;
          text-decoration: none;
        }
        .contact-back:hover { color: var(--ink-900); }

        .contact-title {
          font-family: var(--font-serif, "Fraunces", serif);
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 8px;
        }
        @media (min-width: 768px) {
          .contact-title { font-size: 40px; }
        }
        .contact-subtitle {
          font-size: 15px;
          color: var(--ink-500);
          line-height: 1.5;
          max-width: 440px;
          margin: 0 auto;
        }
      `}</style>

      <div className="contact-container">
        <div className="contact-header">
          <Link href="/" className="contact-back">&larr; Retour</Link>
          <h1 className="contact-title">Me contacter</h1>
          <p className="contact-subtitle">
            Une question, une suggestion, un bug ? Laissez-moi un message, je reponds personnellement.
          </p>
        </div>

        <ContactForm />

        <Disclaimer />
      </div>
    </div>
  );
}
