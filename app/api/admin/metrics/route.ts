import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

/**
 * GET /api/admin/metrics
 * 
 * Retourne toutes les metriques admin depuis Supabase.
 * Protege par cookie clikxia_admin.
 * 
 * Source de donnees :
 *  - Table waitlist (inscrits)
 *  - Table messages (contacts)
 * 
 * Metriques calculees :
 *  1. Inscrits : total, aujourd hui, 7j, 30j
 *  2. Evolution 30 jours (par jour)
 *  3. Sources de trafic (ex: homepage, technical_AAPL)
 *  4. Repartition par pays
 *  5. Messages contact : total, 7j, non-repondus
 *  6. Liste 20 inscrits recents
 *  7. Liste 10 messages recents
 */

const FICTITIOUS_OFFSET = 247; // Compteur fictif initial pour social proof

type DayCount = { date: string; count: number };
type SourceCount = { source: string; count: number };
type CountryCount = { country: string; count: number };

export async function GET() {
  // Verification auth admin
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ========================================
    // 1. INSCRITS - Compteurs globaux
    // ========================================
    const { count: totalSignups } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true });

    const { count: todaySignups } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("signup_date", todayStart.toISOString());

    const { count: last7DaysSignups } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("signup_date", sevenDaysAgo.toISOString());

    const { count: last30DaysSignups } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("signup_date", thirtyDaysAgo.toISOString());

    // ========================================
    // 2. EVOLUTION 30 JOURS (par jour)
    // ========================================
    const { data: recentSignups } = await supabaseAdmin
      .from("leads")
      .select("signup_date")
      .gte("signup_date", thirtyDaysAgo.toISOString())
      .order("signup_date", { ascending: true });

    const byDay = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, 0);
    }

    if (recentSignups) {
      for (const row of recentSignups) {
        if (row.signup_date) {
          const key = new Date(row.signup_date).toISOString().slice(0, 10);
          if (byDay.has(key)) {
            byDay.set(key, (byDay.get(key) || 0) + 1);
          }
        }
      }
    }

    const evolution30d: DayCount[] = Array.from(byDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ========================================
    // 3. SOURCES DE TRAFIC
    // ========================================
    const { data: sourcesData } = await supabaseAdmin
      .from("leads")
      .select("source");

    const sourcesMap = new Map<string, number>();
    if (sourcesData) {
      for (const row of sourcesData) {
        const src = row.source || "direct";
        sourcesMap.set(src, (sourcesMap.get(src) || 0) + 1);
      }
    }

    const sources: SourceCount[] = Array.from(sourcesMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ========================================
    // 4. REPARTITION PAR PAYS
    // ========================================
    const { data: countriesData } = await supabaseAdmin
      .from("leads")
      .select("country");

    const countriesMap = new Map<string, number>();
    if (countriesData) {
      for (const row of countriesData) {
        const country = row.country || "Inconnu";
        countriesMap.set(country, (countriesMap.get(country) || 0) + 1);
      }
    }

    const countries: CountryCount[] = Array.from(countriesMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ========================================
    // 5. MESSAGES DE CONTACT
    // ========================================
    const { count: totalMessages } = await supabaseAdmin
      .from("messages")
      .select("*", { count: "exact", head: true });

    const { count: last7DaysMessages } = await supabaseAdmin
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    const { count: unreplied } = await supabaseAdmin
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("replied", false);

    // ========================================
    // 6. LISTE 20 INSCRITS RECENTS
    // ========================================
    const { data: recentList } = await supabaseAdmin
      .from("leads")
      .select("email, signup_date, source, country")
      .order("signup_date", { ascending: false })
      .limit(20);

    // ========================================
    // 7. LISTE 10 MESSAGES RECENTS
    // ========================================
    const { data: recentMessages } = await supabaseAdmin
      .from("messages")
      .select("id, name, email, message, created_at, replied")
      .order("created_at", { ascending: false })
      .limit(10);

    // ========================================
    // Response
    // ========================================
    return NextResponse.json({
      signups: {
        total_real: totalSignups || 0,
        total_displayed: (totalSignups || 0) + FICTITIOUS_OFFSET,
        today: todaySignups || 0,
        last_7_days: last7DaysSignups || 0,
        last_30_days: last30DaysSignups || 0,
      },
      evolution_30d: evolution30d,
      sources,
      countries,
      messages: {
        total: totalMessages || 0,
        last_7_days: last7DaysMessages || 0,
        unreplied: unreplied || 0,
      },
      recent_signups: recentList || [],
      recent_messages: recentMessages || [],
      generated_at: now.toISOString(),
    });
  } catch (error) {
    console.error("[admin-metrics] Error:", error);
    return NextResponse.json(
      { error: "Erreur calcul metriques" },
      { status: 500 }
    );
  }
}
