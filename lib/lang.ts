import { cookies, headers } from "next/headers";
import { Lang } from "./i18n";

const FR_COUNTRIES = ["FR", "CA", "BE", "CH", "SN", "CI", "CM", "MG", "HT", "MA", "TN", "DZ", "LU", "MC"];

/**
 * Detecte la langue a utiliser pour cet utilisateur.
 * Priorite :
 *   1. Cookie clikxia_lang (choix manuel)
 *   2. Header x-vercel-ip-country (geolocalisation)
 *   3. Fallback "fr"
 */
export async function detectLang(): Promise<Lang> {
  // 1. Cookie
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("clikxia_lang");
  if (langCookie?.value === "fr" || langCookie?.value === "en") {
    return langCookie.value;
  }

  // 2. Geo
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "CA";
  return FR_COUNTRIES.includes(country) ? "fr" : "en";
}
