import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/lang
 * Body: { lang: "fr" | "en" }
 * Pose le cookie clikxia_lang pour 1 an.
 */
export async function POST(req: NextRequest) {
  try {
    const { lang } = await req.json();
    if (lang !== "fr" && lang !== "en") {
      return NextResponse.json({ error: "Invalid lang" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set("clikxia_lang", lang, {
      httpOnly: false, // accessible cote client pour le switcher
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 an
    });

    return NextResponse.json({ success: true, lang });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
