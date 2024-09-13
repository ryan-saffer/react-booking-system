import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/react-ui/accordion";

import { Button } from "@/react-ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import NavigationMenuDropdown from "./navigation-menu-dropdown";
import NavigationMenuItemDesktop from "./navigation-menu-item-desktop";
import NavigationMenuItemMobile from "./navigation-menu-item-mobile";
import { cn } from "../lib/utils";
import { useEffect, useRef, useState } from "react";

export type MenuItem =
  | { type: "link"; title: string; path: string }
  | ({
      type: "dropdown";
      title: string;
      items: Readonly<{ type: "link"; title: string; path: string }[]>;
    } & (
      | { clickable: true; path: string; subTitle: string }
      | { clickable: false }
    ));

export const menu = [
  {
    title: "Birthday Parties",
    clickable: true,
    path: "/birthday-parties",
    subTitle: "See All Packages",
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
    subTitle: "See All Programs",
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
        title: "After School Programs",
        path: "/in-schools/after-school-programs",
      },
      { type: "link", title: "Incursions", path: "/in-schools/incursions" },
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
      { type: "link", title: "Locations", path: "/locations" },
      { type: "link", title: "Our Team", path: "/our-team" },
      { type: "link", title: "Careers", path: "/careers" },
      { type: "link", title: "Franchising", path: "/franchising" },
      { type: "link", title: "Policies", path: "/policies" },
    ],
  },
] as const satisfies MenuItem[];

function NavigationMenu() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const scrollPosition = useRef(0);

  useEffect(() => {
    if (showMobileMenu) {
      scrollPosition.current = window.scrollY;
      document.getElementById("main")?.classList.add("no-scroll");
      document.getElementById("footer")?.classList.add("no-scroll");
    } else {
      document.getElementById("main")?.classList.remove("no-scroll");
      document.getElementById("footer")?.classList.remove("no-scroll");
      window.scrollTo({
        top: scrollPosition.current,
        left: 0,
        behavior: "instant",
      });
    }

    return () => {
      document.getElementById("main")?.classList.remove("no-scroll");
      document.getElementById("footer")?.classList.remove("no-scroll");
    };
  }, [showMobileMenu]);

  useEffect(() => {
    let currentWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== currentWidth) {
        currentWidth = window.innerWidth;
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <nav className="hidden min-[1125px]:block">
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
                subtitle={menuItem.clickable ? menuItem.subTitle : ""}
                submenus={menuItem.items}
              />
            );
          }
        })}
      </nav>

      <aside className="min-[1125px]:hidden">
        <nav>
          <Button
            className="border-[#8F44E1]"
            variant="outline"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label="hamburger menu"
          >
            {showMobileMenu ? (
              <X color="#8F44E1" className="h-6 w-6" />
            ) : (
              <Menu color="#8F44E1" className="h-6 w-6" />
            )}
          </Button>
          <div
            className={cn(
              "absolute left-0 right-0 top-[64px] z-50 h-[calc(100vh-64px)] w-screen overflow-y-auto border-t bg-white",
              {
                block: showMobileMenu,
                hidden: !showMobileMenu,
              },
            )}
          >
            <Accordion type="multiple">
              <NavigationMenuItemMobile title="Home" path="/" nested={false} />
              {menu.map((menuItem) => {
                if (menuItem.type === "dropdown") {
                  return (
                    <AccordionItem
                      value={menuItem.title}
                      className="px-12"
                      key={menuItem.title}
                    >
                      <AccordionTrigger className="hover:no-underline">
                        {menuItem.title}
                      </AccordionTrigger>
                      <AccordionContent className="w-full">
                        {menuItem.clickable && (
                          <Button
                            variant="link"
                            className={cn(
                              "group w-full justify-start border border-[#9044E2] bg-[#9044E2] p-4 font-gotham text-lg text-white hover:bg-[#9044E2]/70 hover:no-underline",
                            )}
                          >
                            <a
                              href={menuItem.path}
                              className="p-3 text-start decoration-[#B14795] decoration-2 underline-offset-4"
                            >
                              {menuItem.subTitle}
                            </a>
                            <ArrowRight className="h-6 w-6" />
                          </Button>
                        )}
                        {menuItem.items.map((item) => (
                          <NavigationMenuItemMobile
                            key={item.title}
                            title={item.title}
                            path={item.path}
                            nested
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
                      nested={false}
                    />
                  );
                }
              })}
            </Accordion>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default NavigationMenu;
