// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Fizz Kidz Docs",
      logo: {
        light: "./src/assets/logo-stacked.png",
        dark: "./src/assets/logo-white.png",
      },
      sidebar: [
        {
          label: "Tools",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Rostering - Sling", slug: "tools/sling" },
          ],
        },
      ],
    }),
  ],
});
