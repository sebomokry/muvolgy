import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Művészetek Völgye – saját programtábla",
    short_name: "MűVölgy",
    description:
      "Nem hivatalos programtábla a Művészetek Völgye fesztiválhoz, ami mutatja a helyszínek közti időbeli fedéseket.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7ff",
    theme_color: "#023047",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
