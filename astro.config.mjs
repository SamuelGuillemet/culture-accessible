import { satteri } from "@astrojs/markdown-satteri";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import publicMediaPlugin from "./src/lib/rehype-public-media.mjs";

const base = process.env.VITE_BASE_URL || "/";
const normalizedBase = base === "/" ? "/" : base.replace(/\/+$/, "");

export default defineConfig({
  site: "https://podcast-culture-accessible.fr",
  base: normalizedBase,
  output: "static",
  integrations: [sitemap()],
  trailingSlash: "always",
  markdown: {
    processor: satteri({ hastPlugins: [publicMediaPlugin(normalizedBase)] }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
