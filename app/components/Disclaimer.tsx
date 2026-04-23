import { detectLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export default async function Disclaimer() {
  const lang = await detectLang();

  return (
    <div style={{ padding: "24px 0 16px" }}>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e8e6e1",
          borderRadius: "8px",
          padding: "14px 16px",
          fontSize: "11px",
          color: "#3d3a36",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "#1a1917", fontSize: "11px" }}>
          {t(lang, "disclaimer_title")}
        </strong>{" "}
        {t(lang, "disclaimer_body")}
      </div>
    </div>
  );
}
