import type { SeedData } from "@/lib/domain/seed";
import { TEAM } from "./club";
import o101 from "../../docs/seed/o10-2.json";
import o131 from "../../docs/seed/o13-1.json";

/** Beginstand per team (docs/seed/<team>.json, gemaakt met `npm run seed`). Bevat geen spelersnamen. */
const SEEDS: Record<string, SeedData> = {
  "o13-1": o131 as SeedData,
  "o10-2": o101 as SeedData,
};

export const SEED: SeedData = SEEDS[TEAM.key];
