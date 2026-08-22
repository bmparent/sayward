import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const imageUrl = new URL("/og.png", origin).toString();

  return {
    title: "Sayward — Find the words. Keep your nerve.",
    description:
      "Build a clear, private script for the difficult conversation you have been avoiding.",
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
      title: "Sayward — Find the words. Keep your nerve.",
      description:
        "Build a clear, private script for the difficult conversation you have been avoiding.",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Sayward — Find the words. Keep your nerve.",
      description:
        "Build a clear, private script for the difficult conversation you have been avoiding.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
