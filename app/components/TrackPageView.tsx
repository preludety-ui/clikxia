"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/**
 * Client component qui envoie un custom event a Vercel Analytics au montage.
 *
 * Utilisation :
 *   <TrackPageView event="dashboard_viewed" />
 *   <TrackPageView event="stock_viewed" properties={{ symbol: "AAPL", lang: "fr" }} />
 */
export default function TrackPageView({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, string | number | boolean | null>;
}) {
  useEffect(() => {
    track(event, properties);
  }, [event, properties]);

  return null;
}
