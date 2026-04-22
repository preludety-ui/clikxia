import { Recommendation, recoLabel, recoClass } from "@/lib/api";

interface Props {
  recommendation: Recommendation;
}

export default function RecommendationBadge({ recommendation }: Props) {
  return (
    <span className={`reco-badge ${recoClass(recommendation)}`}>
      <span className="reco-dot" />
      {recoLabel(recommendation)}
    </span>
  );
}
