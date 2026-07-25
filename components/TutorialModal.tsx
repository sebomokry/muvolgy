"use client";

import Image from "next/image";

type Props = {
  onClose: () => void;
};

type Step = {
  heading: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

const STEPS: Step[] = [
  {
    heading: "1. Csillagozd a kedvenc helyszíneidet",
    src: "/tutorial/01-csillagozas.png",
    alt: "Helyszín csillagozása a helyszín-info ablakban",
    width: 390,
    height: 844,
    caption:
      "Kattints egy helyszín nevére a rácson, majd nyomd meg a csillagos gombot, a csillagozott helyszín ezután mindig a lista tetején marad, nem kell mindig legörgetned hozzá.",
  },
  {
    heading: "2. Az Előadók fül",
    src: "/tutorial/02-eloadok.png",
    alt: "Az Előadók nézet listája",
    width: 390,
    height: 844,
    caption:
      "Itt ábécésorrendben, kereshetően megtalálod az összes fellépőt, egy névre kattintva megnyílik az előadó legközelebbi fellépése.",
  },
  {
    heading: "3. Szűrési lehetőségek",
    src: "/tutorial/03-szurok.png",
    alt: "Kategória- és településszűrők, Csak a Kedvenceim és Barátaim Kedvencei kapcsolók",
    width: 390,
    height: 844,
    caption:
      "Szűrhetsz műfaj (kategória) és település szerint, bekapcsolhatod a „Csak a Kedvenceim” vagy a „Barátaim Kedvencei” nézetet, mobilon pedig a „Kategóriák” gombbal nyithatod/csukhatod a szűrőlistát.",
  },
  {
    heading: "4. Miért van néhány helyszín a lista tetején csillag nélkül?",
    src: "/tutorial/04-felcsillag.png",
    alt: "Félcsillaggal jelölt, nem csillagozott, de kiemelt helyszín és az elválasztó sáv",
    width: 390,
    height: 844,
    caption:
      "Ha egy helyszínt magát nem csillagoztál be, de van ott egy már kiválasztott (Kedvenceim közé tett) programod aznapra, a helyszín akkor is felkerül a lista tetejére, ezt egy félig kitöltött csillag és egy elválasztó sáv jelzi, hogy a koncerted sose vesszen el lentebb.",
  },
  {
    heading: "5. Térkép és a hivatalos oldal",
    src: "/tutorial/05-program-navigacio.png",
    alt: "Program-info ablak a Megnyitás térképen és Program a hivatalos oldalon gombokkal",
    width: 390,
    height: 844,
    caption:
      "Egy programra kattintva megnyitod a részleteit, innen egy gombbal navigálhatsz a helyszínhez a térképalkalmazásoddal, egy másikkal pedig megnézheted a programot a fesztivál hivatalos oldalán.",
  },
  {
    heading: "6. Barátaim, kedvencek megosztása",
    src: "/tutorial/06-baratok.png",
    alt: "Barátaim fül QR-kód-beolvasóval és beillesztős linkmezővel",
    width: 390,
    height: 844,
    caption:
      "A Kedvenceim/Barátaim fülön a telefon kamerájával közvetlenül beolvashatod egy barátod megosztott QR-kódját, vagy beillesztheted a kapott linket, így az ő kedvenc programjai is megjelennek nálad, külön listázva.",
  },
  {
    heading: "7. Export/Import, kedvenceid átvitele",
    src: "/tutorial/07-export-import.png",
    alt: "Export/Import fül az Exportálás QR-kóddal és Importálás gombokkal",
    width: 390,
    height: 844,
    caption:
      "A Kedvenceim/Export/Import fülön QR-kóddal vagy linkkel átviheted a saját kedvenceidet (programok, helyszínek, Barátaim listád és a neved) egy másik böngészőbe vagy eszközre, beolvasással vagy linkbeillesztéssel az ottani kedvencekhez adódnak hozzá, nem írják felül azokat.",
  },
];

export function TutorialModal({ onClose }: Props) {
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
            Bemutató
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 font-mono text-ink/70 hover:text-ink"
            aria-label="Bezárás"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {STEPS.map((step) => (
            <div key={step.src}>
              <h3 className="font-display text-sm font-medium text-ink">
                {step.heading}
              </h3>
              <div className="mt-2 overflow-hidden rounded border border-line">
                <Image
                  src={step.src}
                  alt={step.alt}
                  width={step.width}
                  height={step.height}
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-2 text-sm text-ink/70">{step.caption}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          Bezárás
        </button>
      </div>
    </div>
  );
}
