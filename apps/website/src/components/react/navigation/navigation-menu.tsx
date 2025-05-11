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
    title: "Birthday parties",
    clickable: true,
    path: "/birthday-parties/",
    subTitle: "See All Packages",
    type: "dropdown",
    items: [
      {
        title: "Glam Parties",
        path: "/birthday-parties/glam-parties/",
        type: "link",
      },
      {
        title: "Science Parties",
        path: "/birthday-parties/science-parties/",
        type: "link",
      },
      {
        title: "Slime Parties",
        path: "/birthday-parties/slime-parties/",
        type: "link",
      },
      {
        title: "Fairy Parties",
        path: "/birthday-parties/fairy-parties",
        type: "link",
      },
      {
        title: "Fluid Bears Parties",
        path: "/birthday-parties/fluid-bears-parties",
        type: "link",
      },
      {
        title: "Safari Parties",
        path: "/birthday-parties/safari-parties/",
        type: "link",
      },
      {
        title: "Unicorn Parties",
        path: "/birthday-parties/unicorn-parties/",
        type: "link",
      },
      {
        title: "Tie Dye Parties",
        path: "/birthday-parties/tie-dye-parties/",
        type: "link",
      },
      {
        title: "Taylor Swift Parties",
        path: "/birthday-parties/taylor-swift-parties/",
        type: "link",
      },
      {
        title: "At Home Parties",
        path: "/birthday-parties/at-home-parties/",
        type: "link",
      },
    ],
  },
  {
    type: "link",
    title: "Holiday programs",
    path: "/holiday-programs/",
  },
  {
    type: "link",
    title: "Play lab (1.5 - 5 yrs)",
    path: "/play-lab",
  },
  // {
  //   type: "dropdown",
  //   clickable: true,
  //   title: "After School Programs",
  //   subTitle: "See All Programs",
  //   path: "/after-school-programs",
  //   items: [
  //     {
  //       type: "link",
  //       title: "Science Program",
  //       path: "/after-school-programs/science-program",
  //     },
  //     {
  //       type: "link",
  //       title: "Art & Makers Program",
  //       path: "/after-school-programs/art-and-makers-program",
  //     },
  //   ],
  // },
  {
    title: "In schools",
    type: "dropdown",
    clickable: false,
    items: [
      {
        type: "link",
        title: "After school programs",
        path: "/in-schools/after-school-programs/",
      },
      { type: "link", title: "Incursions", path: "/in-schools/incursions/" },
    ],
  },
  {
    title: "Activations and events",
    type: "link",
    path: "/activations-and-events/",
  },
  {
    title: "Locations",
    type: "dropdown",
    clickable: true,
    path: "/locations",
    subTitle: "See All Locations",
    items: [
      { type: "link", path: "/locations/balwyn", title: "Balwyn" },
      { type: "link", path: "/locations/cheltenham", title: "Cheltenham" },
      { type: "link", path: "/locations/essendon", title: "Essendon" },
      { type: "link", path: "/locations/kingsville", title: "Kingsville" },
      { type: "link", path: "/locations/malvern", title: "Malvern" },
    ],
  },

  // { title: "Franchising", type: "link", path: "/franchising/" },
  {
    title: "Fizz facts",
    type: "dropdown",
    clickable: false,
    items: [
      {
        type: "link",
        title: "Contact Us",
        path: "/contact-us/",
      },
      { type: "link", title: "Careers", path: "/careers/" },
      { type: "link", title: "Our Team", path: "/our-team/" },
      // { type: "link", title: "Franchising", path: "/franchising" },
      { type: "link", title: "Policies", path: "/policies/" },
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
      <nav className="hidden min-[1280px]:block">
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

      <aside className="min-[1280px]:hidden">
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
                              className="flex w-full items-center gap-4 p-3 text-start decoration-[#B14795] decoration-2 underline-offset-4"
                            >
                              {menuItem.subTitle}
                              <ArrowRight className="h-6 w-6" />
                            </a>
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
