import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({ applyBaseStyles: false }), react()],
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.storyblok.com",
      },
    ],
  },
});
