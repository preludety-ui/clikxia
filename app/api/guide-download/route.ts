import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

const PUBLIC_URL = process.env.NEXT_PUBLIC_URL || "https://clikxia.com";
const GUIDE_URL = `${PUBLIC_URL}/guide.pdf`;

/**
 * POST /api/guide-download
 * Body: { email: string, lang?: "fr" | "en" }
 *
 * 1. Valide l email
 * 2. Insere dans la table leads (avec source = guide_download_fr|en)
 * 3. Envoie un email de remerciement avec le lien du guide
 * 4. Retourne downloadUrl pour declencher le telechargement cote client
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, lang } = body;

    // Validation email
    if (!email || typeof email !== "string" || !email.includes("@") || email.length < 5) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const langCode: "fr" | "en" = lang === "en" ? "en" : "fr";
    const source = `guide_download_${langCode}`;

    // Metadata
    const userAgent = req.headers.get("user-agent") || null;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;
    const referrer = req.headers.get("referer") || null;

    // Insertion dans leads (on ignore silencieusement si deja present)
    const { error: insertError } = await supabaseAdmin
      .from("leads")
      .insert({
        email: emailLower,
        source,
        first_page: "/guide",
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer,
      });

    // Code 23505 = violation unique (email deja present), on laisse passer
    if (insertError && insertError.code !== "23505") {
      console.error("[guide-download] Insert error:", insertError);
      // On continue quand meme pour envoyer l email
    }

    // Envoi de l email de remerciement avec le guide
    const emailSent = await sendWelcomeEmail(emailLower, langCode);

    if (!emailSent) {
      console.warn("[guide-download] Email not sent for:", emailLower);
    }

    // Cookie lead pour tracker (meme usage que waitlist)
    const response = NextResponse.json({
      success: true,
      downloadUrl: "/guide.pdf",
    });

    response.cookies.set("clikxia_lead", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    return response;
  } catch (error) {
    console.error("[guide-download] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * Envoie un email HTML bilingue avec lien vers le guide.
 */
async function sendWelcomeEmail(to: string, lang: "fr" | "en"): Promise<boolean> {
  const subject = lang === "fr"
    ? "Votre guide CLIKXIA est pret"
    : "Your CLIKXIA guide is ready";

  const html = lang === "fr" ? frEmail() : enEmail();

  return sendEmail({ to, subject, html });
}

function frEmail(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1a1917; background: #faf9f7; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e8e6e1; border-radius: 12px; padding: 40px; }
    .logo { font-family: Georgia, serif; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
    .logo-clik { color: #1a1917; }
    .logo-xia { color: #0A8B5C; }
    h1 { font-family: Georgia, serif; font-size: 22px; margin: 24px 0 16px; color: #1a1917; }
    p { line-height: 1.6; color: #3d3a36; margin: 0 0 16px; }
    .btn { display: inline-block; background: #0A8B5C; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .meta { background: #faf9f7; padding: 16px; border-radius: 8px; margin: 24px 0; font-size: 13px; color: #6b6861; }
    .footer { font-size: 12px; color: #6b6861; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8e6e1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"><span class="logo-clik">CLIK</span><span class="logo-xia">XIA</span></div>
    <div style="font-size: 12px; color: #6b6861; letter-spacing: 0.1em;">COPILOTE DE D\u00c9CISION \u00b7 BOURSE \u00b7 CANADA</div>
    <h1>Votre guide est pret.</h1>
    <p>Merci de t\u00e9l\u00e9charger le guide CLIKXIA. 34 pages pour comprendre la bourse et interpr\u00e9ter chaque signal du produit.</p>
    <p><a href="${GUIDE_URL}" class="btn">T\u00e9l\u00e9charger le guide</a></p>
    <div class="meta">
      <strong>Au programme :</strong><br>
      \u2192 17 chapitres des bases aux ratios avanc\u00e9s<br>
      \u2192 Les 3 signaux CLIKXIA en d\u00e9tail<br>
      \u2192 Les 10 ratios financiers (P/E, ROE, IVOL\u2026)<br>
      \u2192 21 sources scientifiques peer-reviewed
    </div>
    <p>Des questions ? R\u00e9pondez directement \u00e0 cet email.</p>
    <p style="color: #0A8B5C; font-weight: 600;">Bonne lecture.</p>
    <div class="footer">
      CLIKXIA analyse 2 237 actions quotidiennement.<br>
      <a href="${PUBLIC_URL}" style="color: #0A8B5C;">${PUBLIC_URL.replace("https://", "")}</a>
    </div>
  </div>
</body>
</html>`;
}

function enEmail(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1a1917; background: #faf9f7; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e8e6e1; border-radius: 12px; padding: 40px; }
    .logo { font-family: Georgia, serif; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
    .logo-clik { color: #1a1917; }
    .logo-xia { color: #0A8B5C; }
    h1 { font-family: Georgia, serif; font-size: 22px; margin: 24px 0 16px; color: #1a1917; }
    p { line-height: 1.6; color: #3d3a36; margin: 0 0 16px; }
    .btn { display: inline-block; background: #0A8B5C; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .meta { background: #faf9f7; padding: 16px; border-radius: 8px; margin: 24px 0; font-size: 13px; color: #6b6861; }
    .footer { font-size: 12px; color: #6b6861; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8e6e1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"><span class="logo-clik">CLIK</span><span class="logo-xia">XIA</span></div>
    <div style="font-size: 12px; color: #6b6861; letter-spacing: 0.1em;">DECISION COPILOT \u00b7 STOCK MARKET \u00b7 CANADA</div>
    <h1>Your guide is ready.</h1>
    <p>Thank you for downloading the CLIKXIA guide. 34 pages to understand the stock market and interpret every signal in the product.</p>
    <p>Note: the guide is currently available in French only. An English version is in preparation.</p>
    <p><a href="${GUIDE_URL}" class="btn">Download the guide</a></p>
    <div class="meta">
      <strong>What you will find inside:</strong><br>
      \u2192 17 chapters from basics to advanced ratios<br>
      \u2192 The 3 CLIKXIA signals in detail<br>
      \u2192 The 10 financial ratios (P/E, ROE, IVOL\u2026)<br>
      \u2192 21 peer-reviewed scientific sources
    </div>
    <p>Questions? Just reply to this email.</p>
    <p style="color: #0A8B5C; font-weight: 600;">Happy reading.</p>
    <div class="footer">
      CLIKXIA analyzes 2,237 stocks daily.<br>
      <a href="${PUBLIC_URL}" style="color: #0A8B5C;">${PUBLIC_URL.replace("https://", "")}</a>
    </div>
  </div>
</body>
</html>`;
}
