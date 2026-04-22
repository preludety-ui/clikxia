import { getRegime, getTop5 } from "@/lib/api";
import RegimeBanner from "@/app/components/RegimeBanner";
import SearchBar from "@/app/components/SearchBar";
import StockCard from "@/app/components/StockCard";
import Disclaimer from "@/app/components/Disclaimer";

export const revalidate = 300; // cache 5 min

export default async function DashboardPage() {
  const [regime, top5Data] = await Promise.all([getRegime(), getTop5()]);

  // Format date FR
  const scanDate = new Date(top5Data.scan_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="clikxia-app">
      <div style={{ maxWidth: "440px", margin: "0 auto", minHeight: "100vh" }}>

        {/* Header */}
        <div
          style={{
            padding: "48px 20px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface)",
          }}
        >
          <div
            className="display-md"
            style={{
              color: "var(--brand-900)",
              letterSpacing: "-0.02em",
            }}
          >
            Clikxia<span style={{ color: "var(--brand-500)" }}>.</span>
          </div>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--r-pill)",
              background: "var(--ink-50)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-700)",
            }}
          >
            ⚙
          </div>
        </div>

        {/* Régime */}
        <RegimeBanner regime={regime.regime} description={regime.description} />

        {/* Recherche */}
        <SearchBar />

        {/* Titre Top 5 */}
        <div
          style={{
            padding: "28px 20px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2
            className="display-md"
            style={{ fontSize: "18px", color: "var(--ink-900)" }}
          >
            Top 5 du jour
          </h2>
          <span
            className="mono"
            style={{ fontSize: "12px", color: "var(--ink-500)" }}
          >
            {scanDate}
          </span>
        </div>

        {/* Liste Top 5 */}
        <div
          style={{
            padding: "0 20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {top5Data.top5.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>

        {/* Disclaimer */}
        <Disclaimer />
      </div>
    </div>
  );
}
