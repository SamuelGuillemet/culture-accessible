import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import publicMediaPlugin from "./src/lib/rehype-public-media.mjs";

const base = process.env.VITE_BASE_URL || "/";
const normalizedBase = base === "/" ? "/" : base.replace(/\/+$/, "");

export default defineConfig({
  base: normalizedBase,
  output: "static",
  trailingSlash: "always",
  markdown: {
    processor: satteri({ hastPlugins: [publicMediaPlugin(normalizedBase)] }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
