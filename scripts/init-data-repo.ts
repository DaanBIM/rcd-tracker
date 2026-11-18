// Maakt de inhoud van de privé data-repository van het gekozen team (NEXT_PUBLIC_TEAM, standaard o13-1):
// beginstand uit docs/seed/<team>.json, de ophaal-Action en een README.
//   npx tsx scripts/init-data-repo.ts <map>
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TEAM } from "../src/lib/club";
import type { SeedData } from "../src/lib/domain/seed";
import { initialData } from "../src/lib/store/initial";
import { DATA_FILES } from "../src/lib/store/schema";

const target = process.argv[2];
if (!target) {
  console.error("Gebruik: tsx scripts/init-data-repo.ts <map>");
  process.exit(2);
}
if (existsSync(join(target, "data", "matches.json"))) {
  console.error(`${target}/data bestaat al; niets overschreven.`);
  process.exit(1);
}

const fill = (t: string) =>
  t.replaceAll("__TEAM__", TEAM.key).replaceAll("__NAME__", TEAM.name).replaceAll("__REPO__", TEAM.dataRepo.repo);

const seed = JSON.parse(readFileSync(`${__dirname}/../docs/seed/${TEAM.key}.json`, "utf-8")) as SeedData;
const data = initialData(seed);

mkdirSync(join(target, "data"), { recursive: true });
for (const f of DATA_FILES) writeFileSync(join(target, "data", f), JSON.stringify(data[f], null, 2) + "\n");

mkdirSync(join(target, ".github", "workflows"), { recursive: true });
writeFileSync(
  join(target, ".github", "workflows", "sync.yml"),
  fill(readFileSync(`${__dirname}/./data-repo/sync.yml`, "utf-8")),
);
writeFileSync(join(target, "README.md"), fill(readFileSync(`${__dirname}/./data-repo/README.md`, "utf-8")));

console.log(`Data-repository klaargezet in ${target}`);
