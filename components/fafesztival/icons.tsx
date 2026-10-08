// One icon family (Phosphor, outline/"regular" weight) for the whole
// Fafesztivál section — no emoji anywhere: they render differently per
// platform and can't follow the colour tokens. The `/ssr` entry has no React
// context, so it works in both server and client components.
import type { Icon } from "@phosphor-icons/react";
import { Baby, Bus, Dog, Wheelchair } from "@phosphor-icons/react/ssr";
import type { Feature } from "@/lib/fafesztival/data";

export {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Boot,
  CalendarPlus,
  CaretDown,
  CaretRight,
  Check,
  ClipboardText,
  Clock,
  CloudRain,
  HandHeart,
  List,
  MagnifyingGlass,
  MapPin,
  Plant,
  ShareNetwork,
  Signpost,
  Star,
  Warning,
  X,
} from "@phosphor-icons/react/ssr";

/** Shared icon sizes so inline icons keep one rhythm. */
export const ICON = { sm: 16, md: 20, lg: 24 } as const;

export const FEATURE_ICON: Record<Feature, Icon> = {
  akadalymentes: Wheelchair,
  kutyabarat: Dog,
  gyerekbarat: Baby,
  tomegkozlekedes: Bus,
};
