import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Personal Blog",
    template: "%s · Personal Blog",
  },
  description:
    "A private space for self-reflection. Write entries in Markdown, track your mood, and organize your thoughts with tags.",
  applicationName: "Personal Blog",
  keywords: [
    "personal blog",
    "journal",
    "journaling",
    "diary",
    "self-reflection",
    "markdown",
    "mood tracking",
  ],
  openGraph: {
    type: "website",
    siteName: "Personal Blog",
    locale: "en_US",
    url: siteUrl,
    title: "Personal Blog",
    description:
      "A quiet space for self-reflection — Markdown entries, mood tracking, and tags.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Blog",
    description:
      "A quiet space for self-reflection — Markdown entries, mood tracking, and tags.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0f0f0f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
