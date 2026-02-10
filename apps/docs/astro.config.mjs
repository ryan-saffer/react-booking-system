import catppuccin from "@catppuccin/starlight";
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
      favicon: "/favicon.png",
      plugins: [catppuccin()],
      sidebar: [
        {
          label: "Services",
          items: [
            {
              label: "Birthday Parties",
              items: [
                {
                  label: "Customer Journey",
                  slug: "services/birthday-parties/customer-journey",
                },
                {
                  label: "Invitations & RSVP's",
                  slug: "services/birthday-parties/rsvp",
                },
              ],
            },
            {
              label: "Gift Cards",
              link: "services/gift-cards",
            },
          ],
        },
        {
          label: "Tools",
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: "Rostering / Sling",
              items: [
                {
                  label: "What is Sling",
                  slug: "tools/sling/sling-overview",
                },
                {
                  label: "Shifts and Payroll",
                  slug: "tools/sling/sling-payroll",
                },
                {
                  label: "Budgeting",
                  slug: "tools/sling/sling-budgeting",
                },
              ],
            },
            {
              label: "Acuity Scheduling",
              link: "tools/acuity",
            },
            {
              label: "Calendars",
              link: "tools/calendars",
            },
          ],
        },
      ],
    }),
  ],
});
