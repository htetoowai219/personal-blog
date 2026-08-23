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
          backgroundColor: "#f5efe6",
          border: "2px solid #d8cca6",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            display: "flex",
            border: "1px solid #d8cca6",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#a36b31",
            marginBottom: 20,
          }}
        >
          &mdash;&nbsp;&middot;&nbsp;&mdash;
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            color: "#1a1615",
          }}
        >
          Personal Blog
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 30,
            color: "#6e6259",
            fontStyle: "italic",
          }}
        >
          A quiet space for your thoughts
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 18,
            color: "#a36b31",
            textTransform: "uppercase",
            letterSpacing: 6,
          }}
        >
          Quiet reflections · Unhurried thoughts
        </div>
      </div>
    ),
    size
  );
}
