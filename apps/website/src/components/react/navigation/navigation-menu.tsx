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

const menu = [
  {
    title: "In Studios",
    type: "dropdown",
    items: [
      {
        type: "dropdown",
        title: "Birthday Parties",
        path: "/in-studios/birthday-parties",
        items: [
          {
            title: "Glitz and Glam Parties",
            path: "/in-studios/birthday-parties/glitz-and-glam",
          },
          {
            title: "Science Parties",
            path: "/in-studios/birthday-parties/glitz-and-glam",
          },
          {
            title: "Slime Parties",
            path: "/in-studios/birthday-parties/glitz-and-glam",
          },
          {
            title: "Safari Parties",
            path: "/in-studios/birthday-parties/glitz-and-glam",
          },
          {
            title: "Unicorn Parties",
            path: "/in-studios/birthday-parties/glitz-and-glam",
          },
          {
            title: "Tie Dye Parties",
            path: "/in-studios/birthday-parties/glitz-and-glam",
          },
          {
            title: "Taylor Swift Parties",
            path: "/in-studios/birthday-parties/glitz-and-glam",
          },
          {
            title: "At Home Parties",
            path: "/at-home/birthday-parties",
          },
        ],
      },
      {
        type: "link",
        title: "Holiday Programs",
        path: "/in-studios/holiday-programs",
      },
      {
        type: "link",
        title: "After School Programs",
        path: "/in-studios/after-school-programs",
      },
    ],
  },
  {
    title: "At Home",
    type: "dropdown",
    items: [
      {
        type: "link",
        title: "Birthday Parties",
        path: "/at-home/mobile-parties",
      },
    ],
  },
  {
    title: "In Schools",
    type: "dropdown",
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
] as const;

function NavigationMenu() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <nav className="hidden min-[900px]:block">
        {menu.map((menuItem) => {
          if (menuItem.type === "link") {
            return (
              <NavigationMenuItemDesktop
                key={menuItem.title}
                title={menuItem.title}
                path={menuItem.path}
              />
            );
          } else {
            return (
              <NavigationMenuDropdown
                key={menuItem.title}
                title={menuItem.title}
                submenus={menuItem.items}
              />
            );
          }
        })}
      </nav>

      <aside className="min-[900px]:hidden">
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
              "absolute left-0 top-[65px] z-50 hidden h-screen w-full overflow-scroll bg-white",
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
                                    {item.items.map((nestedItem) => (
                                      <NavigationMenuItemMobile
                                        key={nestedItem.title}
                                        title={nestedItem.title}
                                        path={nestedItem.path}
                                        nested
                                        italic
                                      />
                                    ))}
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
