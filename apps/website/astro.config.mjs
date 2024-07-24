import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: netlify(),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
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
