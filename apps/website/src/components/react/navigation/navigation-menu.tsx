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
    title: "Fizz Facts",
    type: "link",
    path: "/fizz-facts",
  },
  {
    title: "In Studios",
    type: "dropdown",
    items: [
      { title: "Birthday Parties", path: "/in-studios/birthday-parties" },
      { title: "Holiday Programs", path: "/in-studios/holiday-programs" },
      {
        title: "After School Program",
        path: "/in-studios/after-school-program",
      },
    ],
  },
  {
    title: "In Schools",
    type: "dropdown",
    items: [
      {
        title: "After School Program",
        path: "/in-schools/after-school-program",
      },
      { title: "Incursions", path: "/in-schools/incursions" },
      { title: "School Celebrations", path: "/in-schools/school-celebrations" },
    ],
  },
  {
    title: "Activation and Events",
    type: "link",
    path: "/activations-and-events",
  },
  {
    title: "Franchising",
    type: "link",
    path: "/franchising",
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
              "absolute left-0 top-[65px] z-50 hidden h-screen w-full bg-white",
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
                          {menuItem.items.map((item) => (
                            <NavigationMenuItemMobile
                              key={item.title}
                              title={item.title}
                              path={item.path}
                              isNested={true}
                            />
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  } else {
                    return (
                      <NavigationMenuItemMobile
                        key={menuItem.title}
                        title={menuItem.title}
                        path={menuItem.path}
                        isNested={false}
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
