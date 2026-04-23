import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/contact
 *
 * Collecte un message dans la table `messages` (Supabase).
 * Body: { name?: string, email: string, message: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Validation
    if (!email || !email.includes("@") || email.length < 5) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ error: "Message trop court" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message trop long" }, { status: 400 });
    }

    // Metadata
    const userAgent = req.headers.get("user-agent") || null;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    const { error } = await supabaseAdmin
      .from("messages")
      .insert({
        name: name?.trim().slice(0, 120) || null,
        email: email.toLowerCase().trim(),
        message: message.trim().slice(0, 5000),
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) {
      console.error("Contact insert error:", error);
      return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
