import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://www.fizzkidz.com.au",
  output: "hybrid",
  adapter: netlify(),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.storyblok.com",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
    ],
  },
});
