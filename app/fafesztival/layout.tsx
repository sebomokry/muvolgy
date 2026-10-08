import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Barlow_Condensed, Nunito_Sans } from "next/font/google";
import { FfNav } from "@/components/fafesztival/FfNav";

const display = Barlow_Condensed({
  variable: "--font-ff-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const body = Nunito_Sans({
  variable: "--font-ff-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Budapest Fafesztivál 2026 – program és térkép",
  description:
    "A Budapest Fafesztivál (2026. október 15–17.) programjai napok és idősávok szerint, térképpel, szűrőkkel és saját kedvenc listával.",
};

export default function FafesztivalLayout({ children }: { children: React.ReactNode }) {
  return (
    // The root layout locks <body> scrolling for the muvolgy grid, so this
    // section scrolls inside its own full-height container.
    <div
      className={`${display.variable} ${body.variable} ff-scope h-full scroll-pt-32 overflow-y-auto bg-ff-bg font-ff-body text-ff-ink`}
    >
      <header className="sticky top-0 z-[1100] bg-ff-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 pt-3 pb-2">
          <Link href="/fafesztival" aria-label="Budapest Fafesztivál – kezdőlap" className="shrink-0">
            <Image
              src="/fafesztival/logo.png"
              alt="Budapest Fafesztivál"
              width={736}
              height={385}
              priority
              className="h-11 w-auto sm:h-12"
            />
          </Link>
          <FfNav />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
      <footer className="mt-4 overflow-hidden">
        <Image
          src="/fafesztival/clouds.webp"
          alt=""
          width={1200}
          height={257}
          className="mx-auto h-auto w-full max-w-md opacity-70"
        />
        <div className="bg-ff-leaf-soft px-4 py-6 text-center text-sm text-ff-muted">
          <p>Budapest Fafesztivál · 2026. október 15–17.</p>
          <p className="mt-1">
            Ez az oldal nem a szervezők hivatalos felülete. A hivatalos program az{" "}
            <a
              className="underline hover:text-ff-ink"
              href="https://www.urbanum.hu/budapest-fafesztival/"
              target="_blank"
              rel="noreferrer"
            >
              urbanum.hu
            </a>{" "}
            oldalon érhető el.
          </p>
        </div>
      </footer>
    </div>
  );
}
