import type { Day } from "@/lib/fafesztival/data";

export const DAY_COLOR: Record<Day, string> = {
  "2026-10-15": "var(--ff-day15)",
  "2026-10-16": "var(--ff-day16)",
  "2026-10-17": "var(--ff-day17)",
};
// Hex copies for Leaflet, which styles SVG/HTML outside Tailwind.
export const DAY_HEX: Record<Day, string> = {
  "2026-10-15": "#a84a6e",
  "2026-10-16": "#4f8a3a",
  "2026-10-17": "#2f6fb0",
};
