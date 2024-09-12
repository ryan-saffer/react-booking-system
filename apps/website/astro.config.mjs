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
  adapter: netlify({ imageCDN: false }),
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
  redirects: {
    "in-store-parties": "/birthday-parties",
    "glam-parties": "/birthday-parties/glam-parties",
    scienceparties: "/birthday-parties/science-parties",
    slimeparties: "/birthday-parties/slime-parties",
    safariparties: "/birthday-parties/safari-parties",
    "unicorn-parties": "/birthday-parties/unicorn-parties",
    tiedyeparties: "/birthday-parties/tie-dye-parties",
    "taylor-swift-party": "/birthday-parties/taylor-swift-parties",
    "mobile-parties": "/birthday-parties/at-home-parties",
    "in-studio-after-school-programs": "/after-school-programs",
    "in-studio-after-school-science-program":
      "/after-school-programs/science-program",
    "in-studio-after-school-art-program":
      "/after-school-programs/art-and-makers-program",
    "school-science": "/in-schools/after-school-programs",
    "school-science-incursions": "/in-schools/incursions",
    team: "/our-team",
    "terms-and-conditions": "/policies",
    "book-a-party": "/birthday-parties/book-a-party",
    "privacy-policy": "/policies#privacy",
    invitations: "https://bookings.fizzkidz.com.au/invitations",
    creations: "/birthday-parties/creations",
  },
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
