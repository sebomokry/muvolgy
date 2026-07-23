import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Művészetek Völgye – saját programtábla",
  description:
    "Nem hivatalos programtábla a Művészetek Völgye fesztiválhoz, ami mutatja a helyszínek közti időbeli fedéseket.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-paper text-ink font-body">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
