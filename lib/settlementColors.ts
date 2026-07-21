/** Settlement signature colors, chosen directly by the user (light/dark pairs like the accent/pin/danger tokens). */
const SETTLEMENT_COLORS: Record<string, { solid: string; soft: string }> = {
  "Taliándörögd": { solid: "#FFB636", soft: "#FEE18D" },
  Kapolcs: { solid: "#56B1BA", soft: "#B4E1E9" },
  "Vigántpetend": { solid: "#BC7383", soft: "#DCBABF" },
};

const FALLBACK = { solid: "#9C9490", soft: "#EDEAE6" };

export function settlementColor(city: string | null): { solid: string; soft: string } {
  return (city && SETTLEMENT_COLORS[city]) || FALLBACK;
}
