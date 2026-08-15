import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vastframe.com"),
  title: {
    default: "VASTFRAME — Real-Time Technology Studio",
    template: "%s — VASTFRAME",
  },
  description:
    "VASTFRAME builds rendering, atmosphere, scene-processing, and simulation technology for ambitious real-time worlds.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "VASTFRAME — Real-Time Technology Studio",
    description:
      "Rendering, atmosphere, scene-processing, and simulation technology for ambitious real-time worlds.",
    type: "website",
    siteName: "VASTFRAME",
  },
  twitter: {
    card: "summary",
    title: "VASTFRAME — Real-Time Technology Studio",
    description:
      "Rendering, atmosphere, scene-processing, and simulation technology for ambitious real-time worlds.",
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
