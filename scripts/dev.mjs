// Ontwikkelserver voor één team: node scripts/dev.mjs <team> [poort]
//   node scripts/dev.mjs o13-1 3100
// (Zet NEXT_PUBLIC_TEAM voor je, ook op Windows, en werkt vanuit elke map.)
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const [team = "o13-1", port = "3000"] = process.argv.slice(2);
const root = fileURLToPath(new URL("..", import.meta.url));
const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [next, "dev", "-p", port], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_TEAM: team },
});
child.on("exit", (code) => process.exit(code ?? 0));
