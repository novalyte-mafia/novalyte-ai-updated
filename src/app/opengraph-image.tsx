import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Novalyte AI - men's health discovery and care navigation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#f8fafc",
          background:
            "linear-gradient(135deg, #071a22 0%, #0b3b43 54%, #0f766e 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "34px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              background: "#2dd4bf",
              color: "#071a22",
            }}
          >
            N
          </div>
          Novalyte AI
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div
            style={{
              maxWidth: "940px",
              fontSize: "68px",
              lineHeight: 1.04,
              fontWeight: 750,
              letterSpacing: "-0.045em",
            }}
          >
            Find and navigate men&apos;s health care with confidence.
          </div>
          <div
            style={{
              maxWidth: "820px",
              fontSize: "28px",
              lineHeight: 1.35,
              color: "#ccfbf1",
            }}
          >
            Verified discovery, care navigation, and connected healthcare
            workflows.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
