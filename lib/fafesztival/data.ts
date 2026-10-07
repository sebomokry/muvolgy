// Budapest Fafesztivál 2026 (2026-10-15..17) programme, transcribed from the
// organizers' public programme page (urbanum.hu/budapest-fafesztival).
//
// Location rule (deliberate — see CLAUDE.md): walk meeting points are only
// shared with registered participants, so a walk is placed on the map only
// at district level (`district`). An exact `venue` is given only where the
// public programme itself names one (the two indoor evenings and the
// non-registration tree planting). Exact venue coordinates were placed by
// hand (no geocoder reachable when this was written) — verify against the
// address if precision matters.

export const REGISTRATION_URL = "https://forms.gle/rRH5HkZZCXe8NzF97";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61574202975565";

export type Day = "2026-10-15" | "2026-10-16" | "2026-10-17";
export const DAYS: { id: Day; label: string; short: string; weekday: string }[] = [
  { id: "2026-10-15", label: "okt. 15.", short: "15", weekday: "csütörtök" },
  { id: "2026-10-16", label: "okt. 16.", short: "16", weekday: "péntek" },
  { id: "2026-10-17", label: "okt. 17.", short: "17", weekday: "szombat" },
];

export type Feature = "akadalymentes" | "kutyabarat" | "gyerekbarat" | "tomegkozlekedes";
export const FEATURES: Record<Feature, { label: string }> = {
  akadalymentes: { label: "Akadálymentes" },
  kutyabarat: { label: "Kutyabarát" },
  gyerekbarat: { label: "Gyerekbarát" },
  tomegkozlekedes: { label: "Tömegközlekedni kell útközben" },
};

export type Kind = "seta" | "beszelgetes" | "bemutato" | "kozossegi";
export const KINDS: Record<Kind, string> = {
  seta: "Séta",
  beszelgetes: "Beszélgetés, est",
  bemutato: "Bemutató",
  kozossegi: "Közösségi program",
};

export type District = { name: string; lat: number; lng: number };
// Approximate district centres — markers at this level are intentionally vague.
export const DISTRICTS: Record<string, District> = {
  I: { name: "I. kerület", lat: 47.4965, lng: 19.0365 },
  II: { name: "II. kerület", lat: 47.5305, lng: 18.9855 },
  III: { name: "III. kerület", lat: 47.5665, lng: 19.0315 },
  IV: { name: "IV. kerület", lat: 47.5665, lng: 19.0905 },
  VI: { name: "VI. kerület", lat: 47.5075, lng: 19.0635 },
  VII: { name: "VII. kerület", lat: 47.5015, lng: 19.0735 },
  VIII: { name: "VIII. kerület", lat: 47.4895, lng: 19.0855 },
  IX: { name: "IX. kerület", lat: 47.4745, lng: 19.0815 },
  X: { name: "X. kerület", lat: 47.4815, lng: 19.1505 },
  XI: { name: "XI. kerület", lat: 47.4625, lng: 19.0195 },
  XII: { name: "XII. kerület", lat: 47.5005, lng: 18.9855 },
  XIII: { name: "XIII. kerület", lat: 47.5355, lng: 19.0705 },
  XIV: { name: "XIV. kerület", lat: 47.5155, lng: 19.1105 },
  XVII: { name: "XVII. kerület", lat: 47.4835, lng: 19.2705 },
  XVIII: { name: "XVIII. kerület", lat: 47.4325, lng: 19.2155 },
  XXIII: { name: "XXIII. kerület", lat: 47.3955, lng: 19.1205 },
  Budaors: { name: "Budaörs", lat: 47.4615, lng: 18.9585 },
};

export type Venue = { name: string; address: string; lat: number; lng: number };
const ARKHE: Venue = { name: "ARKHÉ", address: "1066 Budapest, Dessewffy utca 18.", lat: 47.50585, lng: 19.05705 };
const ISON: Venue = { name: "ISON", address: "1074 Budapest, Hársfa utca 25.", lat: 47.50095, lng: 19.0668 };
const SZENT_ISTVAN_PARK: Venue = {
  name: "Szent István park",
  address: "1137 Budapest, Szent István park",
  lat: 47.51795,
  lng: 19.0465,
};

export type Program = {
  id: number;
  slug: string;
  day: Day;
  start: string; // "HH:MM"
  /** Duration in minutes when the programme states it; otherwise estimated (see `durationKnown`). */
  minutes: number;
  durationKnown: boolean;
  durationNote?: string;
  title: string;
  kind: Kind;
  leaders: { name: string; role?: string }[];
  leaderLabel?: string; // e.g. "Beszélgetnek"; defaults by kind
  description: string[];
  features: Feature[];
  district: keyof typeof DISTRICTS;
  /** Area name, only when the public programme text names one (park,
   *  neighbourhood) — shown, but not mapped precisely. Otherwise the
   *  district alone is shown. */
  area?: string;
  venue?: Venue;
  status: "open" | "full" | "noRegistration";
};

const P = (p: Omit<Program, "minutes" | "durationKnown"> & { minutes?: number }): Program => ({
  ...p,
  minutes: p.minutes ?? 120,
  durationKnown: p.minutes !== undefined,
});

export const PROGRAMS: Program[] = [
  // --- október 15. ---
  P({
    id: 1,
    slug: "faapokalipszis-2026",
    day: "2026-10-15",
    start: "18:00",
    minutes: 90,
    title: "Faapokalipszis 2026?",
    kind: "beszelgetes",
    area: "ARKHÉ",
    district: "VI",
    venue: ARKHE,
    status: "open",
    leaderLabel: "Beszélgetnek",
    leaders: [
      { name: "Bojár Iván András", role: "a 10 millió Fa vezetője" },
      { name: "Kállai Márton", role: "fotográfus" },
      { name: "Koncz Péter", role: "ökológus" },
      { name: "Litkai Gergely", role: "környezetvédelmi aktivista (kérdez)" },
    ],
    description: [
      "Október 15-én a Budapest Fafesztivál nyitóeseményén izgalmas, elgondolkodtató – és szép – dolgokkal készülünk. Szakmai beszélgetés és kiállításmegnyitó a Matuzsálemek alatt.",
      "A fesztivál alkalmából Kállai Márton famatuzsálemekről készült fotósorozataiból válogatunk, a képek történeteiről pedig maga az alkotó is mesél majd. Az estét Cserna Hajnalka, a FŐKERT V–XIII. kerület Belváros üzemvezető főkertésze előadásával nyitjuk meg.",
      "Mi történik körülöttünk a fákkal? Valóban fák nélkül fogunk élni néhány évtized múlva? A beszélgetésen különböző területek képviselőivel járjuk körül a városi fák jelenlegi helyzetét, a legfontosabb konfliktusokat és a lehetséges válaszokat. Szó lesz klímaváltozásról, fakivágásokról és faültetésekről, fenntartásról, tervezésről és felelősségről – és arról is, hogyan juthat el a szakmai tudás a városlakókhoz. Mit tehetünk ma azért, hogy évtizedek múlva is fák árnyékában hűsölhessünk nyáron?",
    ],
    features: [],
  }),
  P({
    id: 2,
    slug: "legendak-tortenetek-mesemondas",
    day: "2026-10-15",
    start: "19:30",
    title: "Legendák, történetek, élőszavas mesemondás és zenehallgatás a fákról",
    kind: "beszelgetes",
    area: "ARKHÉ",
    district: "VI",
    venue: ARKHE,
    status: "open",
    leaderLabel: "Közreműködnek",
    leaders: [
      { name: "Szabó Ágnes", role: "mesemondó, kert- és tájépítész (famesék)" },
      { name: "Viczián Zsófia", role: "helytörténész, újságíró, a Budapesti fák könyv szerzője (falegendák)" },
      { name: "Bajcsay Zsófia", role: "hárfaművész" },
    ],
    description: [
      "Az estét hárfaszóval, fákról szóló legendákkal és mesékkel zárjuk – egy kicsit csendesebben, közelebb húzódva azokhoz a történetekhez, amelyeket az emberek évszázadok óta a fák köré szőnek.",
    ],
    features: [],
  }),
  // --- október 16. ---
  P({
    id: 3,
    slug: "rakoskert-platansor",
    day: "2026-10-16",
    start: "09:00",
    title: "A Rákoskert sugárúti platánsor története és ápolása",
    kind: "seta",
    area: "Rákoskert sugárút",
    district: "XVII",
    status: "open",
    leaders: [{ name: "Donáczi Szilárd", role: "Minősített Favizsgáló és faápoló szakmérnök, Minősített Faápoló" }],
    description: [
      "A platánsor a XVII. kerület legmeghatározóbb védett fasora. Közel száz éves, szorosan ültetett, hatalmas fák zárt sora. A sűrű beépítettség és az intenzív területhasználat ellenére jó állapotú fasor boltívként borul az út fölé és az egyenként is hatalmas és tiszteletet parancsoló fák összképe egyszerre szép és jelentős természeti érték. Növeli a kerület zöldfelületét, a környezetében épült házak értékét és az itt lakók életminőségét. Gazdasági, ökológiai, társadalmi és esztétikai szerepe megkérdőjelezhetetlen.",
      "Az önkormányzat előremutató gondolkodásának köszönhetően a szakszerű favizsgálat és faápolás, valamint a fák biológiai növényvédelme is megtörtént. Sétánk során, a fasor ismert történetét, fejlődését és a kezelés során szerzett tapasztalataimat szeretném bemutatni.",
    ],
    features: ["akadalymentes", "kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 4,
    slug: "duna-parti-kozpark-16",
    day: "2026-10-16",
    start: "09:00",
    title: "Egy új 12 hektáros Duna-parti közpark Budapesten",
    kind: "seta",
    area: "Nemzeti Atlétikai Központ",
    district: "IX",
    status: "open",
    leaders: [
      { name: "Sándor Tamás", role: "S-Tér Kft. cégvezető" },
      { name: "Tóth Csaba", role: "Levegő Munkacsoport projektvezető" },
    ],
    description: [
      "A Nemzeti Atlétikai Központ környezetrendezésének keretében áradástűrő fatelepítés és partrendezés valósult meg a Duna mentén. A legnagyobb kihívást a part fásítása jelentette, ahol egyedi műszaki kialakítással („kútgyűrűs fák”) közel 100 db fa ártéri telepítése valósult meg. A fák azóta több áradás során is igazolták a módszer sikerességét.",
      "A zöldterület idővel kifejlett ártéri ligeterdővé fejlődik, miközben már most is szabadon látogatható, a városlakók nagy örömére. Tekintsük meg őket együtt!",
    ],
    features: ["akadalymentes", "tomegkozlekedes", "gyerekbarat"],
  }),
  P({
    id: 5,
    slug: "nepliget-16",
    day: "2026-10-16",
    start: "10:00",
    title: "Városi fákról, lényeg és érdekességek a Népligetben",
    kind: "seta",
    area: "Népliget",
    district: "X",
    status: "open",
    leaders: [{ name: "Szabó József Kristóf", role: "erdőmérnök, faápoló-favizsgáló szakmérnök, gombaszakellenőr" }],
    description: [
      "Előhelyünket, környzetünket atalakítjuk, szegényítjük, romboljuk. A fák segítenek ennek tompításaban, kedélyünk javításában. De károkat is okozhatnak sűrűn lakott- épített környezetben. Hogyan teremthetünk összhangot? Gyere velünk sétálni, és hallgasd meg!",
    ],
    features: ["akadalymentes", "gyerekbarat", "kutyabarat"],
  }),
  P({
    id: 6,
    slug: "sasad-miyawaki",
    day: "2026-10-16",
    start: "10:00",
    minutes: 120,
    durationNote: "1,5–2 óra, 5 km, 88 m emelkedő",
    title: "Séta Sasadon: A 10 millió Fa 4 Miyawaki Erdejének a bemutatása",
    kind: "seta",
    area: "Sasad",
    district: "XI",
    status: "open",
    leaders: [{ name: "Haraszti Mihály", role: "10 millió Fa kertész önkéntese" }],
    description: [
      "Fedezd fel velünk, hogyan születhet élő, sokszínű mini erdő a város szívében! A tematikus sétán négy budapesti Miyawaki erdőt járunk be: megnézzük, miként támogatják a biodiverzitást, hűtik környezetüket és adnak otthont számtalan élőlénynek. Találkozz azzal a szemlélettel, amely szerint minden négyzetméter zöld számít.",
      "A séta 5 km hosszú, 88 m emelkedővel, 66 m lejtéssel. 1,5–2 óra hosszú.",
    ],
    features: ["kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 7,
    slug: "budai-arboretum",
    day: "2026-10-16",
    start: "10:00",
    title: "Vezetett séták a Budai Arborétumban",
    kind: "seta",
    area: "Budai Arborétum",
    district: "XI",
    status: "open",
    leaders: [
      { name: "Sütöriné dr. Diószegi Magdolna", role: "egyetemi docens" },
      { name: "Dr. Kohut Ildikó", role: "egyetemi docens" },
    ],
    description: [
      "A Budai Arborétum hazánk egyik leggazdagabb gyűjteményes kertje a főváros szívében, 7,5 hektáron, a Gellért-hegy déli lábánál öleli körül Magyar Agrár- és Élettudományi Egyetem Budai Campusának épületeit. Az első növényeket 1893–94-ben telepítették, a legidősebb fák több mint 130 esztendősek.",
      "A növénygyűjtemény oktatási, kutatási, nemesítési, honosítási célokat szolgál. A vezetett séták során bejárjuk az arborétum Alsó és Felső Kertjét, felkeressük legérdekesebb növényeit.",
    ],
    features: ["akadalymentes"],
  }),
  P({
    id: 8,
    slug: "farkas-erdo-16",
    day: "2026-10-16",
    start: "11:00",
    title: "Séta a Farkas-erdőben (Természetvédelmi szempontú fafajcserés erdőátalakítás)",
    kind: "seta",
    area: "Farkas-erdő",
    district: "IV",
    status: "open",
    leaders: [
      {
        name: "Bajor Zoltán",
        role: "BKM Nonprofit Zrt. FŐKERT Főigazgatóság Természetvédelmi és Erdőkezelési Osztályvezető",
      },
    ],
    description: [
      "Hazánk több mint 20%-a erdősült terület. Ez az érték ha lassan is, de az utóbbi években növekedést mutat. Azt azonban kevesen tudják, hogy ezeknek az erdőknek csak elenyésző része mutat természetes állapotokat, sok erdőtag intenzíven kezelt, vagy egy fajból álló erdőültetvény, amelyek természetvédelmi értéke csekély.",
      "A séta során megismerkedhetünk egy olyan fehér akác-ültetvénnyel, amelyet a FŐKERT szakemberei fokozatosan alakítanak át természetes erdővé, tájra jellemző fásszárúak felhasználásával. Fény derül arra is, hogy miért fontos az erdeinket ismét természetessé tenni, ezenkívül pedig megismerhetünk számos praktikát, melyek segítségével a hazai erdőültetvényeink újra tájra jellemző erdővé válhatnak.",
    ],
    features: ["gyerekbarat"],
  }),
  P({
    id: 9,
    slug: "faapolo-bemutato",
    day: "2026-10-16",
    start: "11:00",
    title:
      "Ezt én is meg tudom csinálni – mit csinál a faápoló, és ez miért jó az embereknek, a fáknak, sőt az állatoknak is?",
    kind: "bemutato",
    district: "XI",
    status: "open",
    leaders: [{ name: "Bubnó Márk", role: "faápoló" }],
    leaderLabel: "Bemutatót tart",
    description: [
      "A faápolás Magyarországon még mindig relatíve új mesterség, és ezáltal sokak előtt ismeretlen fogalom. A FaKultúra Faápolási Társulás faápolói egy kis famászó bemutatót követően lehetőséget adnak arra az összesereglett nagyérdemű részére, hogy a faápolói tevékenység bizonyos aspektusait kipróbálhassák.",
      "Nem korosztályos program, sőt, nagyon is gyerekbarát, de a sorrakerülés okán türelmet igényel.",
    ],
    features: ["gyerekbarat"],
  }),
  P({
    id: 10,
    slug: "gellert-hegyi-anzix",
    day: "2026-10-16",
    start: "13:00",
    minutes: 120,
    durationNote: "kb. 2 óra",
    title: "Gellért-hegyi anzix",
    kind: "seta",
    area: "Gellért-hegy",
    district: "XI",
    status: "open",
    leaders: [{ name: "Cserna Hajnalka", role: "FŐKERT V–XIII. kerület Belváros – üzemvezető főkertész" }],
    description: [
      "A Gellérthegy egyedülálló, különös, népszerű hely csavargásra, romantikus sétákra vagy csak úgy kiszakadni kicsit, felülről nézni a város forgatagát. A kb. 2 órás séta során megismerjük a legrégebbi, kelta és a germán hagyományokat, a boszorkányokat, a füvesembereket, a filozófusokat és Szent Gellért püspök történetét.",
      "Mindeközben pedig árnyas fák között sétálunk. Megnézzük mely fajok bírják a klímát, és melyek nem, megnézzük a ligeterdőt a Kelenhegyi lejtőn, a mandulákat, fügéket a rózsakertet, és az egyéb fatelepítési kísérleteket. Igyekszünk megtalálni a védett növényeket és madarakat, útba ejtjük a televényszigeteket és természetesen a legszebb kilátópontokat is. Tarts velünk!",
    ],
    features: ["kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 11,
    slug: "szivacsvaros-viii",
    day: "2026-10-16",
    start: "13:30",
    title: "Szivacsváros a VIII. kerületben",
    kind: "seta",
    area: "Horváth Mihály tér – Lovassy utca",
    district: "VIII",
    status: "open",
    leaders: [{ name: "Szőllősi Gábor", role: "ügyvezető, Agrofutura Magyarország Kft." }],
    description: [
      "Szivacsváros megoldások egyszerre jelentenek csapadék helyben tartást, élhető növény életteret és épített városi infrastruktúrát. Összetett problémákra összetett megoldást nyújt a Stockholm Faültetési Rendszer, amelynek változatos példáit mutatjuk be a sétán. A Horváth Mihály téren kezdünk és a Lovassy utcába sétálunk át.",
    ],
    features: ["akadalymentes", "kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 12,
    slug: "kaan-karoly-kilato-hars-hegy",
    day: "2026-10-16",
    start: "15:00",
    minutes: 60,
    durationNote: "kb. 1 óra",
    title: "Pillantás a városra a Kaán Károly-kilátóból: remeték, Pálosok, örökerdők és szentélyerdők a Hárs-hegyen",
    kind: "seta",
    area: "Hárs-hegy",
    district: "II",
    status: "open",
    leaders: [{ name: "Rittling István", role: "Erdészetvezető, Pilisi Parkerdő Budapesti Erdészet" }],
    description: [
      "Az erdő és az ember évszázadokra visszanyúló együttélésének nyomai ma is felfedezhetők a Budapest II. kerületében található Hárs-hegy lombjai alatt. A pálos kolostor romjai és a Bátori-barlang régmúlt idők emlékeit őrzik.",
      "Erdész szemmel azonban a közelmúlt története is velünk él: a szentélyerdők 150 éves fái arról mesélnek, hogyan kerestek válaszokat az erdészek saját koruk kérdéseire és kihívásaira. Az erdész elődök munkája így a mai erdőképben él tovább, amelyet napjaink erdészei formálnak tovább. Egy közös séta során Rittling István, a Pilisi Parkerdő Budapesti Erdészetének vezetője tolmácsolja az érdeklődők számára ezt a csendes, de annál izgalmasabb történetet.",
    ],
    features: ["kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 13,
    slug: "zugloi-japankert",
    day: "2026-10-16",
    start: "15:00",
    title: "A 100 éves Zuglói Japánkert különleges fái",
    kind: "seta",
    area: "Zuglói Japánkert",
    district: "XIV",
    status: "full",
    leaders: [{ name: "Kaszab László", role: "mérnöktanár" }],
    description: [
      "A séta során megismerkedhetünk a Varga Márton Kertészeti és Földmérési Technikum 100 éves kertjével. Felfedezzük a Japánkertet és megismerkedünk néhány idős fával, akik „mesélnek” majd nekünk az elmúlt évszázad történéseiről: a kertész-csemetékről akik gondozták őket, a gyerekekről, akik azóta nagymamák és nagypapák lettek, a japánok hercegéről, a Dűnéről, a Fűszerről és még sok minden másról…",
    ],
    features: ["akadalymentes", "kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 14,
    slug: "peterhalmi-erdo",
    day: "2026-10-16",
    start: "15:00",
    minutes: 60,
    durationNote: "kb. 1 óra",
    title: "Egy erdő, ezer szempont – erdész szemmel a Péterhalmi-erdőben",
    kind: "seta",
    area: "Péterhalmi-erdő",
    district: "XVIII",
    status: "open",
    leaders: [
      { name: "Monori András", role: "kerületvezető erdész" },
      { name: "Karácsonyi Vivien", role: "műszaki vezető" },
    ],
    description: [
      "Az erdő ugyanaz, mégis sokféleképpen tekintünk a szerepére, állapotára és jövőjére. A számtalan nézőpont és vélemény között azonban még jó szándék mellett is könnyű elveszni.",
      "A Pilisi Parkerdő Budapesti Erdészetének munkatársai, Karácsonyi Vivien humánökológus és Monori András kerületvezető erdész egy közös séta során megmutatják, mit jelent a Budapest XVIII. kerületében található Péterhalmi-erdőben alkalmazott városi erdőkezelés, hogyan tehetnek felelősen az erdőért az erdőlátogatók és a helyi lakosok, és hogyan függ össze mindez a klímaváltozással.",
    ],
    features: ["kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 15,
    slug: "varosliget-fasor",
    day: "2026-10-16",
    start: "15:00",
    title: "Városliget fasor fái",
    kind: "seta",
    area: "Városligeti fasor",
    district: "VII",
    status: "open",
    leaders: [
      { name: "Farkas Ágnes", role: "favizsgáló szakmérnök" },
      { name: "Hajagos Antal", role: "faápoló" },
    ],
    description: [
      "Városi fák életkörülményeinek terepi bemutatása, a Városliget fasor története, a fasoron végig sétálva érünk el a Magonc óvoda kertjéig, ahol faápoló mutatja be, hogy miképp kell idős fák ápolási munkáit.",
    ],
    features: ["akadalymentes"],
  }),
  P({
    id: 16,
    slug: "margitsziget-16",
    day: "2026-10-16",
    start: "16:00",
    title: "Fától fáig a Margitszigeten",
    kind: "seta",
    area: "Margitsziget",
    district: "XIII",
    status: "open",
    leaders: [{ name: "Viczián Zsófia", role: "helytörténész" }],
    description: [
      "Kivételes természeti értéktárat rejt a Margitsziget: évszázados fákat, amelyek már akkor is ott nőttek, amikor a három város még nem is egyesült. Mindegyikükhöz történetek sora kapcsolódik: beszélünk majd József nádorról, a faültetési divatokról, élő őskövületekről, háborúk és árvizek utáni újjászületésről, tiszteletet parancsoló nagyságról és finom levélerezdülésekről. Várnak a margitszigeti fák!",
    ],
    features: ["akadalymentes", "kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 17,
    slug: "jokai-fai",
    day: "2026-10-16",
    start: "16:00",
    title: "Jókai fái – botanikai és kerttörténeti séta",
    kind: "seta",
    area: "Svábhegy",
    district: "XII",
    status: "open",
    leaders: [{ name: "Lovranits Júlia", role: "környezeti nevelő" }],
    description: [
      "1853-ban, a mai Költő utcában Jókai Mór egy elhagyatott, köves területet vásárolt meg, ahol szívós munkával buja mintagazdaságot és irodalmi menedéket teremtett. Szakvezetéses sétánkon az író egykori, szeretettel gondozott svábhegyi birtokának növényvilágát, valamint a 19. századi kertkultúra világát mutatjuk be a látogatóknak.",
      "Megismerhetjük a hatalmas gesztenye-, juhar-, dió- és hársfákat, valamint a gyümölcsös és a szőlősorok történetét. A séta során feltárul, hogyan jelentek meg Jókai kerti tapasztalatai és növénylistái a regényeiben és a mindennapjaiban.",
    ],
    features: [],
  }),
  P({
    id: 18,
    slug: "vizafogo-zold-oroksege",
    day: "2026-10-16",
    start: "16:00",
    minutes: 150,
    durationNote: "kb. 2–2,5 óra",
    title: "Vizafogó zöld öröksége",
    kind: "seta",
    area: "Vizafogó",
    district: "XIII",
    status: "open",
    leaders: [{ name: "Kovács Orsolya", role: "botanikus, faápoló" }],
    description: [
      "Melyek a Vizafogó legmagasabb és legidősebb fái? Merre folyhatott régen a Duna a kerületben és mi őrzi ma is az emlékét? Milyen lehetett a kerület „ősföldrajza”? Milyen volt a Duna-part a rakpartok megépítése előtt? Mely fák a leggyakoribbak és legjellemzőbbek a Vizafogón, és miért – és melyek a legritkábbak és legkülönlegesebbek? Milyen kihívásokkal szembesülnek a városi fák napjainkban? Milyen lehetett a kerület története – a névadó vizák szemszögéből? És mi indult az indóházból?",
      "Ilyen és ehhez hasonló kérdésekre próbál választ adni ez a vezetett séta, amely elsősorban a házak és utcák mögött (alatt, között) megbúvó, élő természetet és természeti emlékeket próbálja meg bemutatni.",
    ],
    features: ["akadalymentes", "kutyabarat"],
  }),
  P({
    id: 19,
    slug: "varosliget-beszelgetes",
    day: "2026-10-16",
    start: "17:00",
    title: "Beszélgessünk a fákról a Városligetben",
    kind: "seta",
    area: "Városliget",
    district: "XIV",
    status: "open",
    leaders: [{ name: "Ócsvári Gábor", role: "favizsgáló" }],
    description: [
      "Mi a fák szerepe az életünkben? Hogyan működnek? Miért szeretjük őket? Mit lát egy fán egy hozzáértő? Mindezt megtudhatod Ócsvári Gábor városligeti sétáján a Budapest Fafesztiválon!",
    ],
    features: ["kutyabarat"],
  }),
  P({
    id: 20,
    slug: "faultetes-esotanc",
    day: "2026-10-16",
    start: "18:00",
    minutes: 60,
    title: "Közös faültetés és esőtánc a Szent István parkban",
    kind: "kozossegi",
    area: "Szent István park",
    district: "XIII",
    venue: SZENT_ISTVAN_PARK,
    status: "noRegistration",
    leaders: [],
    description: ["Nem regisztrációhoz kötött program – gyere el bátran!"],
    features: [],
  }),
  // --- október 17. ---
  P({
    id: 21,
    slug: "faoriasok-a-normafan",
    day: "2026-10-17",
    start: "09:00",
    title: "Faóriások a Normafán",
    kind: "seta",
    area: "Normafa",
    district: "XII",
    status: "open",
    leaders: [{ name: "Dr. Gálhidy László", role: "WWF Magyarország, Erdő programvezető" }],
    description: [
      "A túra során megismerjük a Normafa történetét, és hogy miért pont itt jött létre az ország egyik első városi erdeje. Mi jellemzi az öreg fákból álló szentélyerdőket, amelyekből nagyon kevés akad hazánkban? Erdei élőhelyekről, klímaváltozásról, erdőgazdálkodásról, nagyragadozókról és még sok minden másról is szót ejtünk a bejárás során, miközben hatalmas idős tölgy- és bükkfák, kisebb és nagyobb rétek mellett haladunk el.",
      "Az idei aszályos év megrendítő és elgondolkodtató nyomokat hagyott az erdő arcán. Mivel az életünk fontos színterei, ilyenkor érthetjük meg igazán, hogy mindent meg kell tennünk azért, hogy további terheket ne kapjanak, ellenállóképességük megmaradjon.",
    ],
    features: ["gyerekbarat"],
  }),
  P({
    id: 22,
    slug: "jane-goodall-nyomaban",
    day: "2026-10-17",
    start: "09:00",
    title: "Séta Dr. Jane Goodall nyomában",
    kind: "seta",
    area: "Jane Goodall Tanösvény, Vörös-kővár",
    district: "II",
    status: "open",
    leaders: [{ name: "Kádár András", role: "Jane Goodall Intézet, főtitkár" }],
    description: [
      "A Jane Goodall Tanösvényen való séta célja, hogy bemutassa a Vörös-kővár és környékének különleges természeti értékeit, és felhívja a figyelmet azok védelmére. A területet egyre erősebb urbanizációs és rekreációs nyomás éri, ezért különösen fontos a természet iránti felelősség erősítése.",
      "A túra során megismerhetőek lesznek az itt élő ritka növény- és állatfajok, és a helyszínhez kapcsolódó Jane Goodall történetek.",
    ],
    features: ["kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 23,
    slug: "farkas-erdo-17",
    day: "2026-10-17",
    start: "09:00",
    title: "Séta a Farkas-erdőben (Természetvédelmi szempontú fafajcserés erdőátalakítás)",
    kind: "seta",
    area: "Farkas-erdő",
    district: "IV",
    status: "open",
    leaders: [
      {
        name: "Bajor Zoltán",
        role: "BKM Nonprofit Zrt. FŐKERT Főigazgatóság Természetvédelmi és Erdőkezelési Osztályvezető",
      },
    ],
    description: [
      "Hazánk több mint 20%-a erdősült terület. Ez az érték ha lassan is, de az utóbbi években növekedést mutat. Azt azonban kevesen tudják, hogy ezeknek az erdőknek csak elenyésző része mutat természetes állapotokat, sok erdőtag intenzíven kezelt, vagy egy fajból álló erdőültetvény amelyek természetvédelmi értéke csekély.",
      "A séta során megismerkedhetünk egy olyan fehér akác-ültetvénnyel, amelyet a FŐKERT szakemberei fokozatosan alakítanak át természetes erdővé, tájra jellemző fásszárúak felhasználásával. A séta során ezt a munkát lesz lehetőség megtekinteni, amelynek során fény derül arra, hogy miért fontos az erdeinket ismét természetessé tenni, ezen kívül pedig megismerhetünk számos praktikát, amelyek segítségével a hazai erdőültetvényeink újra tájra jellemző erdővé válhatnak.",
    ],
    features: ["gyerekbarat"],
  }),
  P({
    id: 24,
    slug: "lombkorona-seta",
    day: "2026-10-17",
    start: "09:30",
    title: "Lombkorona-séta – a növényvakságon túl mit üzennek nekünk a fák?",
    kind: "seta",
    district: "IX",
    status: "open",
    leaders: [{ name: "Bozzay Balázs", role: "favizsgáló és faápoló szakmérnök, EU Éghajlati Paktum Nagykövet" }],
    description: [
      "A fáink fontosságát sokszor csak akkor vesszük észre, amikor eltűnnek (növényvakság). Sokszor, ha már látjuk is őket, akkor sem értjük mit mondanak számunkra. Pedig ők beszélnek hozzánk azzal, ahogy nőnek, ahogy formálódik a lombkoronájuk vagy éppen ahogy a sérüléseiket megmutatják.",
      "A résztvevőknek lefordítjuk ezt a nyelvet, hogy értsük, mit kínálnak nekünk és mit kérnek tőlünk, hogy sokáig velünk lehessenek. A séta végén garantáljuk, hogy a résztvevők más szemmel néznek a fákra. A séta végén oktatással egybekötött faültetés bemutató várható!",
    ],
    features: ["akadalymentes", "gyerekbarat"],
  }),
  P({
    id: 25,
    slug: "hidegkuti-fak",
    day: "2026-10-17",
    start: "10:00",
    durationNote: "2 vagy 3,5 km",
    title: "Hidegkúti fák – nem csak hidegkútiaknak",
    kind: "seta",
    area: "Pesthidegkút",
    district: "II",
    status: "open",
    leaders: [{ name: "Gadó György Pál", role: "erdőmérnök, természetvédelmi szakmérnök" }],
    description: [
      "Budapesten érdemes a fákra figyelve sétálni. Pesthidegkúton is. A Klebelsberg Kastély kertje igazi csemege. A Bosnyák temetőben kevesebb fafaj található, de ez is izgalmas helyszín. A történetek és a helyek a pesthidegkútiak számára ismerősek lesznek, de botanikai ismeretekkel ők is gyarapodhatnak.",
      "Láttak már Önök Pesthidegkúton császárfát? Itt vannak, de ez nem biztos, hogy jó hír. A séta hossza az időjárástól és a résztvevők lelkesedésétől függően 2 vagy 3,5 kilométer lesz.",
    ],
    features: ["akadalymentes", "kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 26,
    slug: "romai-part",
    day: "2026-10-17",
    start: "10:00",
    title: "A Római part és környéke (emberek és fák találkozása)",
    kind: "seta",
    area: "Római part",
    district: "III",
    status: "open",
    leaders: [{ name: "Tóth Fasordoki Zsolt", role: "Fasordoki" }],
    description: [
      "A Római part változása, az emberek hozzáállása a fákhoz, kapcsolatuk a fákkal. Jó gyakorlatok és rosszak.",
    ],
    features: ["akadalymentes", "kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 27,
    slug: "nepliget-17",
    day: "2026-10-17",
    start: "10:00",
    title: "Városi fákról, lényeg és érdekességek a Népligetben",
    kind: "seta",
    area: "Népliget",
    district: "X",
    status: "open",
    leaders: [{ name: "Szabó József Kristóf", role: "erdőmérnök, faápoló-favizsgáló szakmérnök, gombaszakellenőr" }],
    description: [
      "Előhelyünket, környzetünket atalakítjuk, szegényítjük, romboljuk. A fák segítenek ennek tompításaban, kedélyünk javításában. De károkat is okozhatnak sűrűn lakott- épített környezetben. Hogyan teremthetünk összhangot?",
    ],
    features: ["akadalymentes", "gyerekbarat", "kutyabarat"],
  }),
  P({
    id: 28,
    slug: "margitsziget-17",
    day: "2026-10-17",
    start: "11:00",
    title: "Fától fáig a Margitszigeten",
    kind: "seta",
    area: "Margitsziget",
    district: "XIII",
    status: "open",
    leaders: [{ name: "Viczián Zsófia", role: "helytörténész" }],
    description: [
      "Kivételes természeti értéktárat rejt a Margitsziget: évszázados fákat, amelyek már akkor is ott nőttek, amikor a három város még nem is egyesült. Mindegyikükhöz történetek sora kapcsolódik: beszélünk majd József nádorról, a faültetési divatokról, élő őskövületekről, háborúk és árvizek utáni újjászületésről, tiszteletet parancsoló nagyságról és finom levélerezdülésekről. Várnak a margitszigeti fák!",
    ],
    features: ["akadalymentes", "kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 29,
    slug: "soroksari-botanikus-kert",
    day: "2026-10-17",
    start: "11:00",
    title: "Tobozba zárt történetek – fenyők között a Soroksári Botanikus Kertben",
    kind: "seta",
    area: "Soroksári Botanikus Kert",
    district: "XXIII",
    status: "open",
    leaders: [{ name: "Dr. Höhn Mária", role: "egyetemi tanár, PhD" }],
    description: [
      "A fenyők a Föld legősibb és legváltozatosabb fái közé tartoznak, történetük millió éveken ível át. A séta során megismerkedünk különleges fenyőfajokkal, tobozaik és tűleveleik titkaival, valamint azzal, hogyan alkalmazkodtak a hegyvidékek, a szárazság és a klímaváltozás kihívásaihoz. Egy izgalmas botanikai kalandozás, ahol a fenyőkre egészen új szemmel tekinthetünk.",
    ],
    features: ["akadalymentes", "gyerekbarat"],
  }),
  P({
    id: 30,
    slug: "torokugrato-budaors",
    day: "2026-10-17",
    start: "15:00",
    minutes: 150,
    durationNote: "2–2,5 óra, kb. 2,5 km",
    title: "Kiszáradó ékszerdoboz – A budaörsi Törökugrató Parkerdő története, jelene és jövője",
    kind: "seta",
    area: "Törökugrató Parkerdő, Budaörs",
    district: "Budaors",
    status: "open",
    leaders: [{ name: "Lomniczi Gergely", role: "erdőmérnök" }],
    description: [
      "Ki gondolná ma, hogy ötven éve még szántók és szőlők voltak az M1-M7 autópálya budaörsi csomópontja mellett? Mára házak szorításában lévő parkerdő áll a területen tanösvényekkel, tornapályával, játszótérrel, amely az elmúlt években fontos kikapcsolódási helyszínné vált a helyiek életében. Csodás a panoráma, izgalmasak az ösvények, különleges a növényállomány. De meddig?",
      "A két és fél kilométeres séta során nemcsak megismerjük ezt a kis ékszerdobozt, amelyet távolról mindannyian látunk a Balaton felé autózva. Hanem a mélyére ásunk annak, milyen jövője van a városi erdőknek a felforrósodó és kiszáradó településeken, és mit tehetünk azért, hogy egy-egy ilyen zöld sziget ne süllyedjen el nyomtalanul a városok óceánjában, hanem árnyalásával, vízvisszatartó képességével, párologtatásával az eddigi turisztikai szerepénél is fontosabb feladatot tölthessen be: enyhítse a településen a klímaváltozás negatív hatásait.",
    ],
    features: ["kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 31,
    slug: "taban-fuge-platan-torokszeder",
    day: "2026-10-17",
    start: "15:00",
    title: "Füge, platán, törökszeder – ágról-ágra a Tabánban",
    kind: "seta",
    area: "Tabán",
    district: "I",
    status: "open",
    leaders: [
      { name: "Saly Noémi", role: "várostörténész" },
      { name: "Zakar András", role: "Budavári Önkormányzat főkertésze" },
    ],
    description: [
      "A Tabán valaha Buda legsűrűbben lakott negyede volt. Történetéről a növényei is mesélnek. Óriás füge és óriás platán a hegy lábánál, törökmogyorók, nyárfák, a domboldalban Budapest egyik legérdekesebb matuzsáleme, a vénséges törökszeder, a fiatalságot pedig a főváros első Miyawaki-erdeje képviseli.",
    ],
    features: ["kutyabarat", "gyerekbarat"],
  }),
  P({
    id: 32,
    slug: "rakos-mezeje",
    day: "2026-10-17",
    start: "16:00",
    minutes: 150,
    durationNote: "kb. 2–2,5 óra",
    title: "Rákos-mezeje különleges fái",
    kind: "seta",
    area: "Rákos-patak",
    district: "XIII",
    status: "open",
    leaders: [{ name: "Kovács Orsolya", role: "botanikus, faápoló" }],
    description: [
      "A Rákos-patak Észak-Pest egyik legfontosabb zöldfolyosójaként évszázados fák, izgalmas történetek és természeti emlékek otthona is. Sétánkon barangolunk a környék legidősebb platánjai és nyárfái között, megnézzük, hogyan formálta a patak a környező utcákat és az itt élők életét, és kicsit eltűnődünk, milyen lehetett a régi vízi világ, és milyen lenne ma a Rákos-patak, ha kiszabadulhatna a beton fogságából.",
    ],
    features: ["akadalymentes", "kutyabarat"],
  }),
  P({
    id: 33,
    slug: "amig-a-fak-az-erdoben",
    day: "2026-10-17",
    start: "19:00",
    minutes: 120,
    durationNote: "kb. 2 óra, kapunyitás 19:00",
    title: "Amíg a fák az erdőben csinálják, nem zavarnak senkit!",
    kind: "beszelgetes",
    area: "ISON",
    district: "VII",
    venue: ISON,
    status: "open",
    leaderLabel: "Beszélgetőtársak",
    leaders: [
      { name: "Bubnó Márk", role: "faápoló" },
      { name: "Gazsó György", role: "Jászai Mari-díjas színművész, erdőmérnök" },
      { name: "Juhász Gábor", role: "Budapestért díjas jazzgitáros" },
      { name: "Ragula Zoltán", role: "faápoló, a Magyar Faápolók Egyesületének alelnöke" },
      { name: "G. Tóth Ilda", role: "a Forbes főszerkesztő-helyettese (vezeti a beszélgetést)" },
    ],
    description: [
      "Beszélgetés a magyar ember fakultúrájáról, különböző faproblémáiról, illetve arról, hogy vajon ezek a problémák exponenciálisan megugranak-e, ha az inkriminált fás szárú a szomszédé (önkormányzaté, esetleg „a menyemék kertjében áll”, stb.).",
      "A beszélgetés után Juhász Gábor rövid koncertet és hangszerbemutatót tart, utóbbi főszereplője egy több mint százéves, Schunda József hangszerészmester által készített gitár. A beszélgetésnek és a koncertnek az ISON kultúrnappali ad otthont.",
    ],
    features: [],
  }),
];

export const programBySlug = new Map(PROGRAMS.map((p) => [p.slug, p]));
export const programById = new Map(PROGRAMS.map((p) => [p.id, p]));

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function endTime(p: Program) {
  const m = toMinutes(p.start) + p.minutes;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
export function dayInfo(day: Day) {
  return DAYS.find((d) => d.id === day)!;
}
export function placeLabel(p: Program) {
  if (p.venue) return `${p.venue.name}, ${p.venue.address}`;
  return p.area ? `${p.area} · ${DISTRICTS[p.district].name}` : DISTRICTS[p.district].name;
}

/** Programs that overlap in time on the same day (using stated or ~estimated durations). */
export function conflictingIds(programs: Program[]): Set<number> {
  const out = new Set<number>();
  for (let i = 0; i < programs.length; i++)
    for (let j = i + 1; j < programs.length; j++) {
      const a = programs[i],
        b = programs[j];
      if (a.day !== b.day) continue;
      const as = toMinutes(a.start),
        bs = toMinutes(b.start);
      if (as < bs + b.minutes && bs < as + a.minutes) {
        out.add(a.id);
        out.add(b.id);
      }
    }
  return out;
}

/** Same leader's other appearances (matched by name). */
export function otherByLeaders(p: Program): Program[] {
  const names = new Set(p.leaders.map((l) => l.name));
  return PROGRAMS.filter((q) => q.id !== p.id && q.leaders.some((l) => names.has(l.name)));
}
