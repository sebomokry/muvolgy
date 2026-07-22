/**
 * Manually verified city/address/coordinates for venues the festival's own
 * /api/v1/map (and, for city, /api/v1/programs) endpoints don't provide.
 * Sourced one by one (web search or user-confirmed on-site knowledge) rather
 * than guessed — only entries with a confirmed source are here; venues known
 * only by a festival-invented name with no independently verifiable location
 * are deliberately left out rather than filled with a guess.
 */
type LocationOverride = {
  city?: string;
  address?: string;
  coords?: [number, number];
};

export const LOCATION_OVERRIDES: Record<number, LocationOverride> = {
  1149: {
    city: "Kapolcs",
    coords: [46.955157462908964, 17.60602089993387],
  }, // MűvészVölgy Kúria — user-provided; API gives no city (city_id null), the muveszvolgykuria.eu address was wrong
  1185: { coords: [46.98723558813633, 17.570362680320088] }, // Klastrom (Szent András templomrom) — user-provided; the taliandorogd.hu address was wrong
  1153: {
    address: "Kapolcs, Jókai utca 15.",
    coords: [46.95696251870987, 17.602561134016206],
  }, // Hagyományok Háza – Fűz Népi Játéktér — address: hagyomanyokhaza.hu, coords: user-provided
  1193: { address: "Kapolcs, Fő tér" }, // Visa KözTér — absent from /api/v1/map entirely; it's actually Kapolcs's main square
  1023: {
    address: "Taliándörögd, Kiss János u. 9, 8295",
    coords: [46.97417177933702, 17.57001636111147],
  }, // Lőtér x Közlekedési Múzeum — user-provided
  1191: {
    address: "Taliándörögd, Kiss János u. 9, 8295",
    coords: [46.97417177933702, 17.57001636111147],
  }, // Zenélő busz — departs from the same Lőtér x Közlekedési Múzeum site — user-provided
  1165: {
    address: "Kapolcs, Jókai u., 8294",
    coords: [46.956118340304926, 17.600878473975982],
  }, // Gástya-árok — user-provided
  1201: {
    address: "Taliándörögd, Kossuth u. 30, 8295",
    coords: [46.97932181117087, 17.56863541304815],
  }, // Csipkebokor Katolikus Udvar — user-provided
  1196: {
    address: "Kapolcs, Kossuth u. 28, 8294",
    coords: [46.955035789506894, 17.6059630134901],
  }, // Evangéliumi Műhely — user-provided
  1114: {
    address: "Kapolcs, Jókai u. 8, 8294",
    coords: [46.95657587554614, 17.602391964417674],
  }, // KenderKert — user-provided
  1062: {
    address: "Vigántpetend, Kossuth u. 15, 8294",
    coords: [46.96356121227479, 17.62517617791164],
  }, // Petendi Pajta — user-provided
  1148: {
    address: "Vigántpetend, Kossuth u. 54, 8294",
    coords: [46.96535999004822, 17.628196891039156],
  }, // POKET Zsebkönyvek Udvara — user-provided
  1203: { coords: [46.95538578319162, 17.60867058871954] }, // Talentum Hungaricum Udvar — user-provided, no address found
  1205: { coords: [46.954827028613394, 17.60893168856743] }, // „ŐS” PORTA — user-provided, no address found
  1139: {
    address: "Kapolcs, Kossuth u. 42, 8294",
    coords: [46.95577503874396, 17.60656045337349],
  }, // Aktív Magyarország Színpad - Pajta Mozgó — user-provided
  1155: {
    address: "Taliándörögd, Táncsics u. 6, 8295",
    coords: [46.98076690397945, 17.568900360172123],
  }, // Analóg Udvar — user-provided
  1184: {
    address: "Kapolcs, Petőfi u. 1, 8294",
    coords: [46.95438424430109, 17.606702679759056],
  }, // Buda Udvar — user-provided
  1166: {
    address: "Taliándörögd, Somogyi Béla u. 2, 8295",
    coords: [46.97667154897274, 17.571477822211314],
  }, // Egyetemi Udvar — user-provided
  1207: {
    city: "Vigántpetend",
    address: "Vigántpetend, Kossuth u. 33, 8294",
    coords: [46.96432388263509, 17.626292788037457],
  }, // Kerékpáros Központ Vigántpetend — user-provided; API gives this venue no city at all (city_id null)
  1204: { coords: [46.95412437450454, 17.6039874045] }, // RetroVölgy Tanúasztal — user-provided, no address found
  1170: { coords: [46.96513948735758, 17.632247565205493] }, // Roma Udvar — user-provided, no address found
  1129: { coords: [46.95459133674728, 17.604904870661557] }, // Segítő Udvar — user-provided, no address found
  1020: {
    address: "Taliándörögd, Kossuth u. 26, 8295",
    coords: [46.978817664464934, 17.568948492328378],
  }, // Színház színpad - Templom — user-provided
  1058: {
    address: "Kapolcs, Kossuth u. 49, 8294",
    coords: [46.955510555086214, 17.608429177594235],
  }, // Tűzoltószertár Élő Galéria — user-provided
  1132: { coords: [46.95179365865621, 17.59966287057427] }, // Véradás — user-provided, no address found
};
