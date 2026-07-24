"use client";

type Props = {
  onClose: () => void;
};

export function AppInfoModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded border border-line bg-paper p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-medium text-ink">
            Miről szól ez az oldal?
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 font-mono text-ink/70 hover:text-ink"
            aria-label="Bezárás"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-ink/70">
          Ez egy nem hivatalos, saját kis programböngésző a Művészetek Völgye
          fesztiválhoz.
        </p>
        <p className="mt-3 text-sm text-ink/70">
          Itt egy idő × helyszín rácsban látod az összes programot, hogy
          kiderüljön, mi mikor van, és mi hogyan fed át.
        </p>
        <p className="mt-3 text-sm text-ink/70">
          Csillagozhatod a kedvenc helyszíneidet a helyszínre kattintva, és
          akkor mindig a legfelső sorban jelennek meg, nem kell legörgetned
          minden alkalommal.
        </p>

        <p className="mt-3 text-sm text-ink/70">
          Kiválogathatod kedvenc koncerteidet, programjaidat az adott
          programra kattintva.
        </p>

        <p className="mt-3 text-sm text-ink/70">
          A Kedvenceim fülön megoszthatod a kedvenc programjaidat egy
          QR-kóddal a barátaiddal, ők beolvasva hozzáadhatják a saját
          &bdquo;Barátaim&rdquo; listájukhoz, és a rácson rá is szűrhetnek
          erre, akár a sajátjukkal együtt is.
        </p>

        <p className="mt-3 text-sm text-ink/70">
          Ha egyszer már megnyitottad a weboldalt, utána internet nélkül offline (pl. gyenge
          térerőnél a fesztiválon) is használható marad az egész oldal.
        </p>

        <p className="mt-3 text-sm text-ink/70">
          Bármikor bármelyik helyszínre vagy programra kattintva
          odanavigálhatsz a kedvenc térképalkalmazásoddal. Mindezt csak a
          böngésződ jegyzi meg, nincs mögötte fiók vagy szerver.
        </p>

        <button
          onClick={onClose}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          Értem
        </button>
      </div>
    </div>
  );
}
