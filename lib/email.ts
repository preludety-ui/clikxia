/**
 * Helper pour envoyer des emails via Brevo (ex-Sendinblue).
 *
 * Nécessite BREVO_API_KEY dans les variables d environnement.
 * Le domaine clikxia.com est authentifie sur Brevo (DKIM + DMARC).
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const FROM_EMAIL = "hello@clikxia.com";
export const FROM_NAME = "CLIKXIA";

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  replyTo?: string;
  replyToName?: string;
}

/**
 * Envoie un email via l API Brevo.
 * Retourne true si succes, false sinon (ne throw jamais).
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY absent - email non envoye");
    return false;
  }

  const payload: Record<string, unknown> = {
    sender: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    to: [
      {
        email: params.to,
        name: params.toName || params.to,
      },
    ],
    subject: params.subject,
    htmlContent: params.html,
  };

  if (params.replyTo) {
    payload.replyTo = {
      email: params.replyTo,
      name: params.replyToName || params.replyTo,
    };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[email] Brevo API error ${response.status}:`, errorText);
      return false;
    }

    const data = await response.json();
    console.log(`[email] Sent to ${params.to} - messageId: ${data.messageId || "n/a"}`);
    return true;
  } catch (error) {
    console.error("[email] Brevo fetch error:", error);
    return false;
  }
}
