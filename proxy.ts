import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware Next.js - gating et redirection intelligente.
 *
 * Regles :
 * 1. Utilisateur SANS cookie sur /dashboard/* => redirige vers /
 * 2. Utilisateur AVEC cookie sur / => redirige vers /dashboard (experience fluide)
 * 3. Tout le reste : libre (landing, contact, API, etc.)
 *
 * Le cookie `clikxia_lead` est pose par POST /api/waitlist.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const leadCookie = request.cookies.get("clikxia_lead");
  const hasAccess = leadCookie?.value === "1";

  // Regle 1 : acces protege sur /dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!hasAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Regle 2 : redirection auto / -> /dashboard si utilisateur deja inscrit
  // Sauf si param ?home=1 explicite (permet de revenir sur la landing)
  if (pathname === "/" && hasAccess) {
    const homeParam = request.nextUrl.searchParams.get("home");
    if (homeParam !== "1") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
  ],
};
