import type { FriendFavorite } from "@/hooks/useFriendFavorites";

type OwnFavoritesPayload = {
  programIds: number[];
  venueIds: number[];
  friends?: FriendFavorite[];
  ownName?: string;
};

/** Builds a ?myprograms=&myvenues=&myfriends=&myname= link against the given base URL, omitting any param with nothing to carry. */
export function buildOwnFavoritesUrl(
  baseUrl: string,
  { programIds, venueIds, friends, ownName }: OwnFavoritesPayload,
): string {
  const url = new URL(baseUrl);
  url.search = "";
  if (programIds.length > 0) url.searchParams.set("myprograms", programIds.join(","));
  if (venueIds.length > 0) url.searchParams.set("myvenues", venueIds.join(","));
  if (friends && friends.length > 0) {
    url.searchParams.set("myfriends", JSON.stringify(friends));
  }
  if (ownName) url.searchParams.set("myname", ownName);
  return url.toString();
}
