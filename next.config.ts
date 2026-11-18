import type { NextConfig } from "next";

// De app wordt een statische site (map out/). Staat hij op een subpad (bijv. GitHub Pages),
// zet dan NEXT_PUBLIC_BASE_PATH. Lokaal en op Cloudflare Pages is het basispad leeg.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
