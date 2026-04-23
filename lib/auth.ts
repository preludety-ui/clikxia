import { cookies } from "next/headers";

/**
 * Verifie si le visiteur a un cookie clikxia_lead valide.
 * Appel uniquement cote serveur (Server Components, API routes).
 *
 * @returns true si le cookie est present et valide, false sinon
 */
export async function hasLeadAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  const leadCookie = cookieStore.get("clikxia_lead");
  return leadCookie?.value === "1";
}
