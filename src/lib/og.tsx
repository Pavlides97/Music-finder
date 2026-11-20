import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared 1200×630 social preview card (Latin text only — the bundled OG font has no Greek/Cyrillic). */
export function ogCard({ eyebrow, title, subtitle, chips = [] }: { eyebrow: string; title: string; subtitle: string; chips?: string[] }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#f5f2ec",
          backgroundColor: "#0b0d15",
          backgroundImage: "radial-gradient(circle at 0% 0%, rgba(255,122,26,.45), transparent 55%), radial-gradient(circle at 100% 100%, rgba(139,92,246,.5), transparent 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#ff7a1a,#ff4d8d 55%,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            {[14, 28, 40, 24, 10].map((h, i) => (
              <div key={i} style={{ width: 6, height: h, borderRadius: 3, background: "#07080d" }} />
            ))}
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, display: "flex" }}>
            Sound<span style={{ color: "#ff7a1a" }}>CY</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#ff9a4a", fontWeight: 700 }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 28 ? 72 : 92, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>{title}</div>
          <div style={{ fontSize: 34, color: "#c9cbd6" }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {chips.slice(0, 5).map((c) => (
            <div key={c} style={{ fontSize: 26, padding: "10px 22px", borderRadius: 999, border: "2px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)" }}>
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
