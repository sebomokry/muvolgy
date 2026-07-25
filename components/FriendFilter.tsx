"use client";

import type { FriendFavorite } from "@/hooks/useFriendFavorites";

type Props = {
  friends: FriendFavorite[];
  excludedNames: Set<string>;
  onToggle: (name: string) => void;
};

export function FriendFilter({ friends, excludedNames, onToggle }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {friends.map((friend) => {
        const active = !excludedNames.has(friend.name);
        return (
          <button
            key={friend.name}
            onClick={() => onToggle(friend.name)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-transparent text-paper"
                : "border-line text-ink/70 hover:text-ink"
            }`}
            style={active ? { backgroundColor: "var(--friend)" } : undefined}
          >
            <span
              className={`h-2 w-2 rounded-full ${active ? "bg-paper" : ""}`}
              style={active ? undefined : { backgroundColor: "var(--friend)" }}
            />
            {friend.name}
          </button>
        );
      })}
    </div>
  );
}
