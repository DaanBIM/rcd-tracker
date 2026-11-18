import type { MetadataRoute } from "next";
import { BASE } from "@/lib/base";
import { TEAM } from "@/lib/club";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${TEAM.name} Tracker`,
    short_name: TEAM.name,
    description: `Stand, programma, winkans en spelersstatistieken van ${TEAM.name}`,
    lang: "nl",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    background_color: "#0a0c0a",
    theme_color: "#033014",
    icons: [
      { src: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE}/icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
