import { writeFileSync } from "node:fs";
import path from "node:path";
import { getFestivalData } from "../lib/api";

/**
 * One-off/manual snapshot generator — the festival ended 2026-08-02, so
 * app/page.tsx no longer calls getFestivalData() (or the live festival API)
 * at request time (see CLAUDE.md's "Static final snapshot" section). This
 * script exists only in case the data ever needs a fresh pull by hand (e.g.
 * if the festival runs again next year and this app gets reused) — run it
 * with `npx tsx scripts/generate-data.ts` and review/commit the diff
 * deliberately, don't run it reflexively.
 */
async function main() {
  const data = await getFestivalData();
  const outDir = path.join(process.cwd(), "data");
  const outPath = path.join(outDir, "festival-data-final.json");
  writeFileSync(outPath, JSON.stringify(data));
  console.log(`Wrote ${data.programs.length} programs to ${outPath}`);
}

main();
