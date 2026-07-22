import type { Category } from "./types";

const KONNYUZENE: Category = {
  id: 1,
  name: "Könnyűzene",
  color: "#feb737",
  order: 300,
};

/**
 * Manually assigned categories for programs the festival's own data leaves
 * completely uncategorized, where the act is clearly identifiable live
 * music — only added with real confidence (never guessed), and only takes
 * effect when the API itself still provides zero categories for that
 * program id, so an eventual upstream fix supersedes it automatically.
 */
export const CATEGORY_OVERRIDES: Record<number, Category[]> = {
  3393: [KONNYUZENE], // STREET SIXTEEN — júl. 25., Lőtér x Közlekedési Múzeum
  3392: [KONNYUZENE], // Parno Graszt — júl. 29., Panoráma Színpad
};
