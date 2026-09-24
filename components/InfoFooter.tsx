"use client";

type Props = {
  onOpenInfo: () => void;
};

/**
 * Deliberately rendered as trailing content inside each view's own scroll
 * container, not as a persistent layout row — so it never eats into the
 * vertical space available to the actual content, and only comes into view
 * once you scroll all the way down.
 */
export function InfoFooter({ onOpenInfo }: Props) {
  return (
    <div className="mt-10 flex justify-center pt-4">
      <button
        onClick={onOpenInfo}
        className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink"
      >
        <span
          aria-hidden="true"
          className="flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-paper"
        >
          ⓘ
        </span>
        Információk
      </button>
    </div>
  );
}
