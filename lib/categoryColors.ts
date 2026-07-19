/**
 * Hand-picked palette (mid-saturation "embroidery thread" hues) so the 16 official
 * program categories stay visually distinct — the API's own category colors are
 * mostly similar pale pastels and don't separate well in a dense grid.
 */
const CATEGORY_COLORS: Record<string, string> = {
  Könnyűzene: "#C7332B",
  Jazz: "#1F5C8A",
  Komolyzene: "#6B4A9E",
  "Népzene, Világzene": "#B8781E",
  Színház: "#A63A6C",
  Beszélgetések: "#3E7C8C",
  Irodalom: "#4B5FA6",
  Kiállítások: "#2E7D5B",
  "Családi programok": "#D68A2A",
  Mozgás: "#3E8E5A",
  "Zöld programok": "#5C8A2E",
  "Workshop, előadások": "#8A6D3E",
  Hagyományőrzés: "#9E5B2E",
  Filmművészet: "#2E3E8A",
  "Kortárs tánc": "#A6437A",
  Újcirkusz: "#C25B1E",
};

const FALLBACK_COLOR = "#5A5248";

export function categoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? FALLBACK_COLOR;
}
