import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/react-ui/accordion";

import { Button } from "@/react-ui/button";
import { Menu } from "lucide-react";
import NavigationMenuDropdown from "./navigation-menu-dropdown";
import NavigationMenuItemDesktop from "./navigation-menu-item-desktop";
import NavigationMenuItemMobile from "./navigation-menu-item-mobile";
import { cn } from "../lib/utils";
import { useState } from "react";

export type MenuItem =
  | { type: "link"; title: string; path: string }
  | ({
      type: "dropdown";
      title: string;
      items: Readonly<{ type: "link"; title: string; path: string }[]>;
    } & ({ clickable: true; path: string } | { clickable: false }));

export const menu = [
  {
    title: "Birthday Parties",
    clickable: true,
    path: "/birthday-parties",
    type: "dropdown",
    items: [
      {
        title: "Glitz and Glam Parties",
        path: "/birthday-parties/glam-parties",
        type: "link",
      },
      {
        title: "Science Parties",
        path: "/birthday-parties/science-parties",
        type: "link",
      },
      {
        title: "Slime Parties",
        path: "/birthday-parties/slime-parties",
        type: "link",
      },
      {
        title: "Safari Parties",
        path: "/birthday-parties/safari-parties",
        type: "link",
      },
      {
        title: "Unicorn Parties",
        path: "/birthday-parties/unicorn-parties",
        type: "link",
      },
      {
        title: "Tie Dye Parties",
        path: "/birthday-parties/tie-dye-parties",
        type: "link",
      },
      {
        title: "Taylor Swift Parties",
        path: "/birthday-parties/taylor-swift-parties",
        type: "link",
      },
      {
        title: "At Home Parties",
        path: "/birthday-parties/at-home-parties",
        type: "link",
      },
    ],
  },
  {
    type: "link",
    title: "Holiday Programs",
    path: "/holiday-programs",
  },
  {
    type: "dropdown",
    clickable: true,
    title: "After School Programs",
    path: "/after-school-programs",
    items: [
      {
        type: "link",
        title: "Science Program",
        path: "/after-school-programs/science-program",
      },
      {
        type: "link",
        title: "Art & Makers Program",
        path: "/after-school-programs/art-and-makers-program",
      },
    ],
  },
  {
    title: "In Schools",
    type: "dropdown",
    clickable: false,
    items: [
      {
        type: "link",
        title: "After School Program",
        path: "/in-schools/after-school-program",
      },
      { type: "link", title: "Incursions", path: "/in-schools/incursions" },
      {
        type: "link",
        title: "School Celebrations",
        path: "/in-schools/school-celebrations",
      },
    ],
  },
  {
    title: "Activations and Events",
    type: "link",
    path: "/activations-and-events",
  },
  {
    title: "Fizz Facts",
    type: "dropdown",
    clickable: false,
    items: [
      {
        type: "link",
        title: "Contact Us",
        path: "/contact-us",
      },
      { type: "link", title: "Meet the Team", path: "/the-team" },
      { type: "link", title: "Franchising", path: "/franchising" },
    ],
  },
] as const satisfies MenuItem[];

function NavigationMenu() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <nav className="hidden min-[1110px]:block">
        {menu.map((menuItem) => {
          if (menuItem.type === "link") {
            return (
              <NavigationMenuItemDesktop
                key={menuItem.title}
                title={menuItem.title}
                path={menuItem.path}
              />
            );
          } else if (menuItem.type === "dropdown") {
            return (
              <NavigationMenuDropdown
                key={menuItem.title}
                title={menuItem.title}
                path={menuItem.clickable ? menuItem.path : ""}
                submenus={menuItem.items}
              />
            );
          }
        })}
      </nav>

      <aside className="min-[1110px]:hidden">
        <nav>
          <Button
            variant="ghost"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label="hamburger menu"
          >
            <Menu color="#E81070" className="h-6 w-6" />
          </Button>
          <div
            className={cn(
              "absolute left-0 top-[64px] z-50 hidden h-screen w-full overflow-scroll border-t bg-white",
              {
                block: showMobileMenu,
              },
            )}
          >
            <ul>
              <Accordion type="multiple">
                {menu.map((menuItem) => {
                  if (menuItem.type === "dropdown") {
                    return (
                      <AccordionItem
                        value={menuItem.title}
                        className="px-12"
                        key={menuItem.title}
                      >
                        <AccordionTrigger>{menuItem.title}</AccordionTrigger>
                        <AccordionContent className="w-full">
                          {menuItem.items.map((item) => {
                            if (item.type === "link") {
                              return (
                                <NavigationMenuItemMobile
                                  key={item.title}
                                  title={item.title}
                                  path={item.path}
                                  nested
                                />
                              );
                            } else if (item.type === "dropdown") {
                              return (
                                <AccordionItem
                                  value={item.title}
                                  className="justify-start border-0"
                                  key={item.title}
                                >
                                  <AccordionTrigger className="justify-between gap-4 p-4 underline">
                                    <a href={item.path}>{item.title}</a>
                                  </AccordionTrigger>
                                  <AccordionContent className="ml-8 w-fit border-l p-0">
                                    {/* {item.map((nestedItem) => (
                                      <NavigationMenuItemMobile
                                        key={nestedItem.title}
                                        title={nestedItem.title}
                                        path={nestedItem.path}
                                        nested
                                        italic
                                      />
                                    ))} */}
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            }
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  } else {
                    return (
                      <NavigationMenuItemMobile
                        key={menuItem.title}
                        title={menuItem.title}
                        path={menuItem.path}
                        nested={false}
                      />
                    );
                  }
                })}
              </Accordion>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default NavigationMenu;
