import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vastframe.com"),
  title: {
    default: "VASTFRAME — Real-Time Technology Studio",
    template: "%s — VASTFRAME",
  },
  description: "Integrated real-time technology for Unity.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "VASTFRAME — Real-Time Technology Studio",
    description: "Integrated real-time technology for Unity.",
    type: "website",
    siteName: "VASTFRAME",
  },
  twitter: {
    card: "summary",
    title: "VASTFRAME — Real-Time Technology Studio",
    description: "Integrated real-time technology for Unity.",
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
