import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "clikxia_admin";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

/**
 * Verifie cote serveur si l utilisateur est authentifie comme admin.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  const expectedValue = process.env.ADMIN_SECRET;

  if (!expectedValue) {
    console.error("[admin-auth] ADMIN_SECRET env var is not set");
    return false;
  }

  return adminCookie?.value === expectedValue;
}

/**
 * Valide le password fourni contre la env var ADMIN_PASSWORD
 * et pose le cookie d authentification si valide.
 */
export async function validateAdminPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("[admin-auth] ADMIN_PASSWORD env var is not set");
    return false;
  }
  return password === expected;
}

/**
 * Pose le cookie admin apres authentification reussie.
 */
export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SECRET env var not set");
  }

  cookieStore.set(ADMIN_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
}

/**
 * Supprime le cookie admin (logout).
 */
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
