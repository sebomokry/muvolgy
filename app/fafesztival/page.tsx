import type { Metadata } from "next";
import Link from "next/link";
import { FACEBOOK_URL, REGISTRATION_URL } from "@/lib/fafesztival/data";
import {
  ArrowRight,
  ArrowUpRight,
  Boot,
  ClipboardText,
  CloudRain,
  HandHeart,
  ICON,
  MapPin,
  Signpost,
} from "@/components/fafesztival/icons";

export const metadata: Metadata = {
  title: "Budapest Fafesztivál 2026 – Fától fáig a fővárosban",
};

// "Hasznos tudni" — the organizers' own wording, kept verbatim.
const TIPS = [
  [
    CloudRain,
    "Ahogy a fák, úgy mi nagyon szeretjük az esőt, főleg a csendes őszi esőt, ezért nincs esőnap. A programokat esős időjárás esetén is megtartjuk.",
  ],
  [ClipboardText, "A regisztráció október 1-jén kezdődik, addig javasoljuk, hogy böngészd a programokat!"],
  [
    MapPin,
    "A séták kezdőpontját a regisztrációt követően küldjük el minden résztvevőnek, a beltéri és egyéb programok helyszíne a programleírás mellett található.",
  ],
  [
    Signpost,
    "A programok Budapest egész területén valósulnak meg, arra kérünk, ha messzebbről jössz, tervezz előre, és érkezz időben!",
  ],
  [
    HandHeart,
    "A Budapest Fafesztivál programjai ingyenesek, de regisztrációhoz kötöttek. A Budapest Fafesztivál egy független, önkéntesek által szervezett rendezvény. Kérünk, tartsd tiszteletben a szervezők munkáját: akkor regisztrálj, ha tudod, hogy el is tudsz jönni!",
  ],
  [Boot, "Javasolt öltözék: időjárásnak megfelelő, könnyű túraruházat"],
] as const;

const ext = { target: "_blank", rel: "noreferrer" } as const;
const inlineLink = "font-semibold text-ff-olive underline underline-offset-2 hover:text-ff-ink";

const SUPPORTERS = [
  ["Agrofutura Magyarország Kft.", "https://www.agrofutura.hu/rolunk"],
  ["BKM FŐKERT", "https://fokert.budapestikozmuvek.hu/"],
  ["Duna-Ipoly Nemzeti Park", "https://www.dunaipoly.hu/hu/"],
  ["Jane Goodall Intézet", "https://www.janegoodall.hu/"],
  ["Levegő Munkacsoport", "https://www.levego.hu/"],
  ["MATE Budai Arborétum", "https://budaiarboretum.uni-mate.hu/"],
  ["MATE Soroksári Botanikus Kert", "https://soroksaribotanikuskert.uni-mate.hu/"],
  ["Magyar Faápolók Egyesülete", "https://faapolok.hu/"],
  ["Pannon Örökerdő Kft.", "https://pannonorokerdo.hu/"],
  ["Pilisi Parkerdő Zrt.", "https://parkerdo.hu/"],
  ["S-Tér Kft.", "https://s-ter.hu/"],
  ["VMSZKI Japánkert", "https://www.vmszki.hu/japankert/"],
  ["WWF Magyarország", "https://wwf.hu/"],
] as const;

function CtaButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={REGISTRATION_URL}
        {...ext}
        className="inline-flex min-h-12 items-center gap-2 bg-ff-mauve px-5 py-2.5 font-ff-display text-lg font-semibold tracking-wide text-white uppercase hover:opacity-90"
      >
        Regisztráció
        <ArrowUpRight size={ICON.md} weight="bold" aria-hidden />
        <span className="sr-only">(új lapon nyílik)</span>
      </a>
      <Link
        href="/fafesztival/program"
        className="inline-flex min-h-12 items-center gap-2 bg-ff-olive px-5 py-2.5 font-ff-display text-lg font-semibold tracking-wide text-white uppercase hover:opacity-90"
      >
        Programok
        <ArrowRight size={ICON.md} weight="bold" aria-hidden />
      </Link>
    </div>
  );
}

export default function FafesztivalHomePage() {
  return (
    <div className="pt-4">
      <section className="bg-ff-leaf-soft px-5 py-6 sm:px-8 sm:py-8">
        <p className="font-ff-display text-lg font-semibold tracking-wide text-ff-olive uppercase">
          2026. október 15–17.
        </p>
        <h1 className="mt-1 max-w-3xl font-ff-display text-4xl leading-[1.05] font-bold sm:text-5xl">
          Másodszor is Budapest Fafesztivál – Fától fáig a fővárosban
        </h1>
        <p className="mt-4 max-w-3xl text-[17px] leading-relaxed">
          <b>2026. október 15–17. között ismét megvalósul a Budapest Fafesztivál</b>, amely idén második alkalommal
          hívja a körülöttünk lévő fák felfedezésre Budapest lakóit. Három napon keresztül, számos vezetett séta,
          előadás, bemutató, kiállítás, és egyéb izgalmas esemény során beszélgetünk arról, hogy mit jelentenek a
          környezetünkben élő vagy éppen halott fák.
        </p>
        <div className="mt-6">
          <CtaButtons />
        </div>
      </section>

      <div className="mt-8 max-w-3xl space-y-4 text-[17px] leading-relaxed">
        <p>
          Az a szárazság, amivel idén nyáron küzdött a természet, rengeteg ember figyelmét felhívta a környezeti
          eseményekre; most valóban saját bőrünkön tapasztalhattuk meg a klímaváltozás közvetlen hatásait. Egy városi fa
          egyszerre élőlény, infrastruktúra, közösségi térképző és tájalkotó elem, valamint a klímaváltozás okozta
          hatásokkal szemben egyik legfontosabb természetes szövetségesünk. Árnyékot ad, hűti a környezetét, megköti a
          szén-dioxidot, élőhelyet biztosít, és meghatározza azt is, hogyan érzékeljük és használjuk a városi tereket —
          az utóbbi években mégis egyre nehezebb helyzetbe kerülnek. Jogosan merül fel a kérdés: tudunk valamit tenni?
          Ha igen, mit és hogyan? A Budapest Fafesztivál során ezekre a kérdésekre is keressük a válaszokat.
        </p>
        <p>
          A Budapest Fafesztivál célja, hogy a fent említett, sokszor magától értetődőnek tűnő, mégis egyre fontosabb
          kapcsolatról beszélgessünk, hogy a városi fákkal kapcsolatos szakmai és tudományos ismeretek ne csak a
          szakemberekhez, hanem a városlakókhoz is eljussanak.
        </p>

        <h2 className="!mt-10 font-ff-display text-2xl font-bold sm:text-3xl">
          Szakmai program, önkénteskedés, közös séták
        </h2>
        <p>
          Az első napon, október 15-én este egy kiállításmegnyitóval, szakmai beszélgetéssel és inspiráló
          előadóművészeti programmal nyitjuk meg a Budapest Fafesztivált.
        </p>
        <p>
          Október 16-án és 17-én Budapest utcái és fái válnak a fesztivál főszereplőivé. Az ország legjobb szakértői
          városi séták során különböző városrészekben, ökológiai, várostörténeti, faápolói, kulturális nézőpontból
          visznek minket közelebb a fák titkaihoz.
        </p>
        <p>
          A részletes program elérhető alább és a{" "}
          <a href={FACEBOOK_URL} {...ext} className={inlineLink}>
            Budapest Fafesztivál
          </a>{" "}
          felületein. A programok ingyenesek, azonban regisztrációhoz kötöttek. A regisztrációs felület{" "}
          <a href={REGISTRATION_URL} {...ext} className={inlineLink}>
            ERRE A LINKRE
          </a>{" "}
          kattintva érhető el.
        </p>
        <p className="font-semibold">Szeretettel várunk minden érdeklődőt!</p>
        <p>
          A Budapest Fafesztivál számos önkéntes szakértő,{" "}
          <a href="https://www.facebook.com/TEAM.HUB.BURST/" {...ext} className={inlineLink}>
            Természet-Alapú Megoldások HUB
          </a>
          , a{" "}
          <a href="https://10milliofa.hu/" {...ext} className={inlineLink}>
            10 millió fa
          </a>{" "}
          és az{" "}
          <a href="https://www.urbanum.hu/" {...ext} className={inlineLink}>
            Urbanum Városkutatási Alapítvány
          </a>{" "}
          szervezésében valósul meg.
        </p>
      </div>

      <div className="mt-8">
        <CtaButtons />
      </div>

      <h2 className="mt-12 font-ff-display text-2xl font-bold sm:text-3xl">Hasznos tudni</h2>
      <ul className="mt-3 grid border-t border-ff-olive/15 sm:grid-cols-2">
        {TIPS.map(([Icon, text]) => (
          <li key={text} className="flex gap-3 border-b border-ff-olive/15 py-4 sm:odd:pr-6 sm:even:pl-6">
            <Icon size={ICON.lg} className="mt-0.5 shrink-0 text-ff-olive" aria-hidden />
            <p className="leading-relaxed">{text}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-ff-display text-2xl font-bold">Támogatók</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {SUPPORTERS.map(([name, url]) => (
          <li key={name}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center bg-white px-3.5 py-1.5 text-sm font-semibold text-ff-ink ring-1 ring-ff-olive/10 hover:ring-ff-olive/30"
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-ff-muted">
        Továbbá számos önkéntes várostörténész, művész, faápoló, favizsgáló, zöldfelületekkel foglalkozó szakember.
        Köszönjük!
      </p>

      <h2 className="mt-8 font-ff-display text-2xl font-bold">Kapcsolat</h2>
      <p className="mt-1">
        <a href="tel:+36202912414" className="font-semibold text-ff-olive underline">
          +36 20 291 2414
        </a>
        {" · "}
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="font-semibold text-ff-olive underline">
          Facebook
        </a>
      </p>
    </div>
  );
}
