"use client";

import { useEffect } from "react";
import { useSelectedPrograms } from "@/hooks/useSelectedPrograms";
import { useFavoriteVenues } from "@/hooks/useFavoriteVenues";
import { useFriendFavorites } from "@/hooks/useFriendFavorites";
import { useOwnName } from "@/hooks/useOwnName";
import { buildOwnFavoritesUrl } from "@/lib/ownFavoritesUrl";

const OLD_HOSTNAME = "muvolgy.vercel.app";
const NEW_ORIGIN = "https://muvolgyprogi.hu";

/**
 * Temporary bridge for the muvolgy.vercel.app -> muvolgyprogi.hu domain
 * move: localStorage is origin-scoped, so a plain redirect would silently
 * strip everyone's favorites. This only activates on the old hostname,
 * reads what's there client-side (before redirecting), and carries it
 * along via the same link scheme the manual export/import feature uses.
 * Safe to remove once traffic to the old domain drops to ~zero.
 */
export function DomainMigrationRedirect() {
  const { selectedIds } = useSelectedPrograms();
  const { favoriteIds } = useFavoriteVenues();
  const { friends } = useFriendFavorites();
  const { ownName } = useOwnName();

  const isOldDomain =
    typeof window !== "undefined" && window.location.hostname === OLD_HOSTNAME;

  const target = isOldDomain
    ? buildOwnFavoritesUrl(NEW_ORIGIN, {
        programIds: [...selectedIds],
        venueIds: [...favoriteIds],
        friends,
        ownName,
      })
    : null;

  useEffect(() => {
    if (target) window.location.href = target;
  }, [target]);

  if (!isOldDomain) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper p-4">
      <div className="max-w-sm text-center">
        <p className="font-display text-lg font-medium text-ink">
          Átköltöztünk a muvolgyprogi.hu domainre!
        </p>
        <p className="mt-2 text-sm text-ink/70">
          Átirányítunk, és átvisszük a kedvenceidet is egy pillanat.
        </p>
        {target && (
          <a href={target} className="mt-4 inline-block text-sm text-accent underline">
            Ha nem történne automatikusan, kattints ide
          </a>
        )}
      </div>
    </div>
  );
}
