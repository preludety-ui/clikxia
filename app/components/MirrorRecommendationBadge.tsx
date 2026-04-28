import { type MirrorRecommendation, mirrorRecoClass } from "@/lib/api";
import { translations, type Lang } from "@/lib/i18n";

interface Props {
  code: MirrorRecommendation;
  lang: Lang;
}

/**
 * Badge pour les 13 recommandations Mirror (matrice 24 regles).
 *
 * Reutilise le design system .reco-badge / .reco-dot du composant
 * RecommendationBadge (5 codes scanner) en mappant les 13 codes Mirror
 * vers les 5 classes CSS existantes via mirrorRecoClass().
 *
 * Vocabulaire trading FR valide Phase 0.3 :
 *   - Sources : IG, Cafe de la Bourse, AbcBourse, EasyBourse, Credit Agricole,
 *     Bourse de Montreal, Speculateurmalin (TradingView FR), AMF.
 *   - Differenciation semantique nette : HOLD_WATCH (passive) -> REVIEW (active)
 *     -> WARNING (avertissement formel).
 */
export default function MirrorRecommendationBadge({ code, lang }: Props) {
  const t = translations[lang];

  // Lookup i18n via cle dynamique mirror_reco_<CODE>
  const labelKey = `mirror_reco_${code}` as keyof typeof t;
  const label = (t[labelKey] as string) || code;

  return (
    <span className={`reco-badge ${mirrorRecoClass(code)}`}>
      <span className="reco-dot" />
      {label}
    </span>
  );
}
