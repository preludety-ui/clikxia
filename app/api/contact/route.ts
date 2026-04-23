import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

const NOTIFICATION_EMAIL = "preludety@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!email || !email.includes("@") || email.length < 5) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ error: "Message trop court" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message trop long" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || null;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    const cleanName = name?.trim().slice(0, 120) || null;
    const cleanEmail = email.toLowerCase().trim();
    const cleanMessage = message.trim().slice(0, 5000);

    const { error: dbError } = await supabaseAdmin
      .from("messages")
      .insert({
        name: cleanName,
        email: cleanEmail,
        message: cleanMessage,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (dbError) {
      console.error("Contact insert error:", dbError);
      return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
    }

    // Notification email via Brevo
    try {
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1917; font-size: 20px; margin-bottom: 16px;">Nouveau message CLIKXIA</h2>
          <div style="background: #faf9f7; border: 1px solid #e8e6e1; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0; color: #6b6861; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">De</p>
            <p style="margin: 0; color: #1a1917; font-size: 15px;"><strong>${cleanName || "Anonyme"}</strong></p>
            <p style="margin: 4px 0 0 0; color: #1a1917; font-size: 14px;"><a href="mailto:${cleanEmail}" style="color: #0A8B5C;">${cleanEmail}</a></p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e8e6e1; border-radius: 8px; padding: 16px;">
            <p style="margin: 0 0 8px 0; color: #6b6861; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Message</p>
            <p style="margin: 0; color: #1a1917; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${cleanMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
          <p style="margin-top: 16px; color: #6b6861; font-size: 12px;">
            IP: ${ipAddress || "inconnue"} &middot; Reponse directe au mail ${cleanEmail}
          </p>
        </div>
      `;

      await sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: `[CLIKXIA Contact] Message de ${cleanName || cleanEmail}`,
        html: html,
        replyTo: cleanEmail,
        replyToName: cleanName || cleanEmail,
      });
    } catch (emailError) {
      console.error("Contact notification email error:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
