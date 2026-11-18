// Maakt de app-iconen (PWA, Apple, favicon) in public/icons/ uit het clubwapen (public/club-logo.png).
// Wit vlak met het wapen in het midden; `pad` geeft ruimte voor maskable iconen (veilige zone).
// Gebruik: node scripts/build-icons.mjs
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const logoPath = fileURLToPath(new URL("../public/club-logo.png", import.meta.url));
const out = new URL("../public/icons/", import.meta.url);
mkdirSync(out, { recursive: true });

async function icon(size, pad, name) {
  const inner = Math.round(size - pad * 2 - size * 0.14); // 7% lucht rondom het wapen
  const logo = await sharp(logoPath).resize({ width: inner, height: inner, fit: "inside" }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(fileURLToPath(new URL(name, out)));
}

await Promise.all([
  icon(192, 0, "icon-192.png"),
  icon(512, 0, "icon-512.png"),
  icon(512, 64, "maskable-512.png"),
  icon(180, 0, "apple-touch-icon.png"),
  icon(48, 0, "favicon-48.png"),
]);
console.log("Iconen gemaakt in public/icons/");
