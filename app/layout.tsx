import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vastframe.com"),
  title: {
    default: "VASTFRAME — Independent Game Studio",
    template: "%s — VASTFRAME",
  },
  description:
    "VASTFRAME is an independent game studio building strange worlds and the technology beneath them.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "VASTFRAME — Independent Game Studio",
    description:
      "Independent games, deeply built worlds, and the technology beneath them.",
    type: "website",
    siteName: "VASTFRAME",
  },
  twitter: {
    card: "summary",
    title: "VASTFRAME — Independent Game Studio",
    description:
      "Independent games, deeply built worlds, and the technology beneath them.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
