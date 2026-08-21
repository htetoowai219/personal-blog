import { ImageResponse } from "next/og";

export const alt = "Personal Blog — a quiet space for self-reflection";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0f0f",
          backgroundImage:
            "radial-gradient(circle at 50% 120%, rgba(167, 139, 250, 0.22), transparent 60%)",
          border: "2px solid #27272a",
          color: "#e4e4e7",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "#a78bfa",
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          Personal Blog
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 34,
            color: "#71717a",
          }}
        >
          A quiet space for your thoughts
        </div>
      </div>
    ),
    size
  );
}
