// app/layout.tsx
import type { Metadata } from "next";
import { Space_Mono, DM_Sans, Inter, Outfit } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ScaleCards — See the numbers. Feel the scale.",
    template: "%s — ScaleCards",
  },
  description:
    "Unit-based data visualizations that make big numbers tangible. Each dot tells a story.",
  keywords: [
    "data visualization",
    "infographics",
    "scalecards",
    "data cards",
    "real-time data",
    "statistics",
    "unit-based visualization",
  ],
  authors: [{ name: "ScaleCards" }],
  creator: "ScaleCards",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://scalecards.vercel.app"
  ),
  openGraph: {
    type: "website",
    siteName: "ScaleCards",
    title: "ScaleCards — See the numbers. Feel the scale.",
    description:
      "Unit-based data visualizations that make big numbers tangible. Each dot tells a story.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScaleCards — See the numbers. Feel the scale.",
    description:
      "Unit-based data visualizations that make big numbers tangible. Each dot tells a story.",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${inter.variable} ${outfit.variable} ${spaceMono.variable} font-outfit bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
