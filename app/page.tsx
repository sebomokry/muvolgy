import { FestivalApp } from "@/components/FestivalApp";
import type { FestivalData } from "@/lib/types";
import rawData from "@/data/festival-data-final.json";

// The festival ended 2026-08-02 — the data is now permanently historical, so
// this reads a committed static snapshot (see scripts/generate-data.ts)
// instead of calling getFestivalData() at request time. No more fetches means
// no more ISR revalidation at all, which is what was driving Vercel ISR
// write costs (every hourly revalidate produced genuinely different content,
// since the live API kept dropping elapsed programs — see lib/api.ts).
const data = rawData as FestivalData;

export default function Home() {
  return <FestivalApp data={data} />;
}
