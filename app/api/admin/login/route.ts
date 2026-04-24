import { NextRequest, NextResponse } from "next/server";
import { validateAdminPassword, setAdminCookie } from "@/lib/admin-auth";

/**
 * POST /api/admin/login
 * Body: { password: string }
 * 
 * Valide le password contre ADMIN_PASSWORD env var.
 * Si valide, pose le cookie clikxia_admin et retourne success.
 */
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password requis" }, { status: 400 });
    }

    const isValid = await validateAdminPassword(password);

    if (!isValid) {
      // On attend un peu pour ralentir les bruteforce
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json({ error: "Password invalide" }, { status: 401 });
    }

    await setAdminCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin-login] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
