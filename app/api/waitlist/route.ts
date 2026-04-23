import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/waitlist
 *
 * Collecte un email dans la table `leads` (Supabase projet clikxia).
 * Pose un cookie "clikxia_lead" pour 30 jours (gating acces dashboard v2).
 *
 * Body: { email: string, source?: string, first_page?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source, first_page } = body;

    // Validation email basique
    if (!email || typeof email !== "string" || !email.includes("@") || email.length < 5) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Capture metadata
    const userAgent = req.headers.get("user-agent") || null;
    const referrer = req.headers.get("referer") || null;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    // Insertion dans la table leads
    const { error } = await supabaseAdmin
      .from("leads")
      .insert({
        email: email.toLowerCase().trim(),
        source: source || "unknown",
        first_page: first_page || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        marketing_consent: true,
      });

    if (error) {
      // Code 23505 = violation UNIQUE constraint (email deja inscrit)
      if (error.code === "23505") {
        // Email deja inscrit : on pose quand meme le cookie (acces autorise)
        const cookieStore = await cookies();
        cookieStore.set("clikxia_lead", "1", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 jours
        });
        return NextResponse.json({ success: true, already_registered: true });
      }
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Erreur d enregistrement" }, { status: 500 });
    }

    // Succes : pose le cookie d acces
    const cookieStore = await cookies();
    cookieStore.set("clikxia_lead", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * GET /api/waitlist
 *
 * Retourne le nombre total d inscrits dans la table `leads`.
 * Utilise par le compteur de la landing page.
 *
 * Note: on ajoute un offset fictif (247) tant qu on est en phase de lancement,
 * on retirera ce offset quand le compteur reel sera suffisant.
 */
export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true });

    const realCount = count || 0;
    const fictionalOffset = 262;  // 247 fictifs + 15 vrais emails ailleurs // a retirer quand realCount >= 300

    return NextResponse.json({
      count: realCount + fictionalOffset,
      real_count: realCount, // utile pour toi en interne
    });
  } catch (error) {
    console.error("Waitlist GET error:", error);
    return NextResponse.json({ count: 277 }); // fallback sur valeur actuelle
  }
}
