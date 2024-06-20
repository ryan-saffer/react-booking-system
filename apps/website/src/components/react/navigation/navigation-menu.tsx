import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../react/ui/accordion";

import { Button } from "../ui/button";
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
    title: "Fizz In Studio",
    type: "dropdown",
    items: [
      { title: "Birthday Parties", path: "/in-studio/birthday-parties" },
      { title: "Holiday Programs", path: "/in-studio/holiday-programs" },
      {
        title: "After School Program",
        path: "/in-studio/after-school-program",
      },
    ],
  },
  {
    title: "Fizz In Schools",
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
    title: "Fizz Activation and Events",
    type: "link",
    path: "/activations-and-events",
  },
  {
    title: "Fizz Franchising",
    type: "link",
    path: "/franchising",
  },
] as const;

function NavigationMenu() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMenu = () => {
    const mainDiv = document.getElementById("main")!;

    mainDiv.classList.toggle("block");
    mainDiv.classList.toggle("hidden");

    setShowMobileMenu((prev) => !prev);
  };

  return (
    <>
      <nav className="hidden min-[900px]:block">
        {menu.map((menuItem) => {
          if (menuItem.type === "link") {
            return (
              <NavigationMenuItemDesktop
                title={menuItem.title}
                path={menuItem.path}
              />
            );
          } else {
            return (
              <NavigationMenuDropdown
                title={menuItem.title}
                submenus={menuItem.items}
              />
            );
          }
        })}
      </nav>

      <nav className="min-[900px]:hidden">
        <Button variant="ghost" onClick={toggleMenu}>
          <Menu color="#E81070" className="h-6 w-6" />
        </Button>
        <div
          className={cn(
            "absolute hidden top-[65px] left-0 w-full h-[calc(100%-65px)] bg-white",
            {
              block: showMobileMenu,
            }
          )}
        >
          <ul>
            <Accordion type="multiple">
              {menu.map((menuItem) => {
                if (menuItem.type === "dropdown") {
                  return (
                    <AccordionItem value={menuItem.title} className="px-12">
                      <AccordionTrigger>{menuItem.title}</AccordionTrigger>
                      <AccordionContent className="w-full">
                        {menuItem.items.map((item) => (
                          <NavigationMenuItemMobile
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
    </>
  );
}

export default NavigationMenu;
