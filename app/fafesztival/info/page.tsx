import type { Metadata } from "next";
import { FACEBOOK_URL, REGISTRATION_URL } from "@/lib/fafesztival/data";

export const metadata: Metadata = { title: "Infó – Budapest Fafesztivál 2026" };

const TIPS = [
  [
    "🌧",
    "Nincs esőnap",
    "Ahogy a fák, úgy mi is nagyon szeretjük az esőt, főleg a csendes őszi esőt – a programokat esős időben is megtartjuk.",
  ],
  ["📝", "Regisztráció", "A programok ingyenesek, de regisztrációhoz kötöttek. A regisztráció október 1-jén indult."],
  [
    "📍",
    "Kezdőpontok",
    "A séták kezdőpontját a regisztrációt követően küldjük el minden résztvevőnek; a beltéri és egyéb programok helyszíne a programleírásnál található.",
  ],
  [
    "🚋",
    "Tervezz előre",
    "A programok Budapest egész területén valósulnak meg – ha messzebbről jössz, tervezz előre, és érkezz időben!",
  ],
  [
    "🤝",
    "Önkéntes szervezés",
    "A Budapest Fafesztivál független, önkéntesek által szervezett rendezvény. Kérünk, akkor regisztrálj, ha tudod, hogy el is tudsz jönni!",
  ],
  ["🥾", "Öltözék", "Időjárásnak megfelelő, könnyű túraruházat."],
] as const;

const ORGANIZERS = [
  ["Természet-Alapú Megoldások HUB", "https://www.facebook.com/TEAM.HUB.BURST/"],
  ["10 millió Fa", "https://10milliofa.hu/"],
  ["Urbanum Városkutatási Alapítvány", "https://www.urbanum.hu/"],
] as const;

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

export default function FafesztivalInfoPage() {
  return (
    <div className="pt-4">
      <h1 className="font-ff-display text-3xl font-bold sm:text-4xl">Másodszor is Budapest Fafesztivál</h1>
      <div className="mt-3 max-w-3xl space-y-3 text-[17px] leading-relaxed">
        <p>
          <b>2026. október 15–17. között ismét megvalósul a Budapest Fafesztivál</b>, amely idén második alkalommal
          hívja a körülöttünk lévő fák felfedezésre Budapest lakóit. Három napon keresztül, számos vezetett séta,
          előadás, bemutató, kiállítás, és egyéb izgalmas esemény során beszélgetünk arról, hogy mit jelentenek a
          környezetünkben élő vagy éppen halott fák.
        </p>
        <p>
          Egy városi fa egyszerre élőlény, infrastruktúra, közösségi térképző és tájalkotó elem, valamint a
          klímaváltozás okozta hatásokkal szemben egyik legfontosabb természetes szövetségesünk. A fesztivál célja, hogy
          a városi fákkal kapcsolatos szakmai és tudományos ismeretek ne csak a szakemberekhez, hanem a városlakókhoz is
          eljussanak.
        </p>
        <p>
          Az első napon, október 15-én este kiállításmegnyitóval, szakmai beszélgetéssel és előadóművészeti programmal
          nyitjuk meg a fesztivált. Október 16-án és 17-én Budapest utcái és fái válnak a fesztivál főszereplőivé: az
          ország legjobb szakértői városi séták során, különböző városrészekben, ökológiai, várostörténeti, faápolói és
          kulturális nézőpontból visznek közelebb a fák titkaihoz.
        </p>
      </div>

      <a
        href={REGISTRATION_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex rounded-full bg-ff-mauve px-5 py-2.5 font-ff-display text-lg font-semibold tracking-wide text-white uppercase hover:opacity-90"
      >
        Regisztráció →
      </a>

      <h2 className="mt-10 font-ff-display text-2xl font-bold">Hasznos tudni</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TIPS.map(([icon, title, text]) => (
          <div key={title} className="rounded-2xl bg-white p-4 ring-1 ring-ff-olive/10">
            <p className="font-ff-display text-xl font-bold">
              <span className="mr-1.5">{icon}</span>
              {title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ff-muted">{text}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-ff-display text-2xl font-bold">Szervezők</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {ORGANIZERS.map(([name, url]) => (
          <li key={name}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-ff-leaf-soft px-3.5 py-1.5 font-semibold text-ff-olive hover:bg-ff-leaf/50"
            >
              {name}
            </a>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-ff-display text-2xl font-bold">Támogatók</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {SUPPORTERS.map(([name, url]) => (
          <li key={name}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-ff-ink ring-1 ring-ff-olive/10 hover:ring-ff-olive/30"
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
