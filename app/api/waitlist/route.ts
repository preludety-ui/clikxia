import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { getTop5 } from "@/lib/api";
import { sendEmail } from "@/lib/email";

const FR_COUNTRIES = ["FR", "CA", "BE", "CH", "SN", "CI", "CM", "MG", "HT", "MA", "TN", "DZ", "LU", "MC"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source, first_page } = body;

    if (!email || typeof email !== "string" || !email.includes("@") || email.length < 5) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || null;
    const referrer = req.headers.get("referer") || null;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    const headersList = await headers();
    const country = headersList.get("x-vercel-ip-country") || "CA";
    const lang: "fr" | "en" = FR_COUNTRIES.includes(country) ? "fr" : "en";

    const cleanEmail = email.toLowerCase().trim();

    const { error } = await supabaseAdmin
      .from("leads")
      .insert({
        email: cleanEmail,
        source: source || "unknown",
        first_page: first_page || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        country: country,
        marketing_consent: true,
      });

    const cookieStore = await cookies();
    cookieStore.set("clikxia_lead", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, already_registered: true });
      }
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Erreur d enregistrement" }, { status: 500 });
    }

    // Envoi email de bienvenue (non bloquant)
    try {
      const top5Data = await getTop5().catch(() => null);
      const top5 = top5Data?.top5 || [];

      const subject = lang === "fr"
        ? "Bienvenue sur CLIKXIA \u2014 Voici le top 5 d\u2019aujourd\u2019hui"
        : "Welcome to CLIKXIA \u2014 Here is today\u2019s top 5";

      const greeting = lang === "fr" ? "Bienvenue sur CLIKXIA !" : "Welcome to CLIKXIA!";

      const intro = lang === "fr"
        ? "Merci de vous \u00eatre inscrit. Voici les 5 actions que CLIKXIA a s\u00e9lectionn\u00e9es aujourd\u2019hui parmi 2 237 analys\u00e9es :"
        : "Thanks for signing up. Here are the 5 stocks CLIKXIA selected today out of 2,237 analyzed:";

      const ctaText = lang === "fr" ? "Voir l\u2019analyse compl\u00e8te" : "View full analysis";

      const footer = lang === "fr"
        ? "CLIKXIA est une aide \u00e0 la d\u00e9cision. Investir comporte des risques."
        : "CLIKXIA is a decision-support tool. Investing involves risks.";

      const rowsHtml = top5.map((stock) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e8e6e1;">
            <div style="font-family: Georgia, serif; font-size: 20px; font-weight: 600; color: #1a1917;">${stock.symbol}</div>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e8e6e1; text-align: right;">
            <span style="display: inline-block; padding: 3px 8px; background: #e8f3ea; color: #2d7a3e; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: monospace;">${stock.recommendation.replace("_", " ")}</span>
            <span style="margin-left: 10px; font-family: monospace; font-size: 14px; color: #1a1917;">${stock.composite_score.toFixed(1)}</span>
          </td>
        </tr>
      `).join("");

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; background: #faf9f7;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-family: Georgia, serif; font-size: 36px; font-weight: 700; letter-spacing: -0.02em;">
              <span style="color: #1a1917;">CLIK</span><span style="color: #0A8B5C;">XIA</span>
            </div>
          </div>
          <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 600; color: #1a1917; margin-bottom: 16px;">
            ${greeting}
          </h1>
          <p style="font-size: 15px; color: #3d3a36; line-height: 1.6; margin-bottom: 24px;">
            ${intro}
          </p>
          <table style="width: 100%; background: #ffffff; border: 1px solid #e8e6e1; border-radius: 8px; border-collapse: collapse; margin-bottom: 24px;">
            ${rowsHtml}
          </table>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://clikxia.com/dashboard" style="display: inline-block; padding: 14px 28px; background: #1a1917; color: #faf9f7; text-decoration: none; border-radius: 8px; font-family: monospace; font-size: 14px; font-weight: 600; letter-spacing: 0.02em;">
              ${ctaText} \u2192
            </a>
          </div>
          <p style="font-size: 11px; color: #6b6861; text-align: center; line-height: 1.6; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8e6e1;">
            ${footer}<br>
            <a href="https://clikxia.com" style="color: #6b6861;">clikxia.com</a>
          </p>
        </div>
      `;

      await sendEmail({
        to: cleanEmail,
        subject: subject,
        html: html,
      });
    } catch (emailError) {
      console.error("Welcome email error:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true });
    const realCount = count || 0;
    const fictionalOffset = 262;
    return NextResponse.json({
      count: realCount + fictionalOffset,
      real_count: realCount,
    });
  } catch (error) {
    console.error("Waitlist GET error:", error);
    return NextResponse.json({ count: 277 });
  }
}
