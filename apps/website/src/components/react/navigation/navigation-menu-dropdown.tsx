import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  HybridHoverCard,
  HybridHoverCardContent,
  HybridHoverCardTrigger,
  TouchProvider,
} from "../ui/hybrid-hover-card";

import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import NavigationMenuItemDesktop from "./navigation-menu-item-desktop";
import { cn } from "../lib/utils";
import { useState } from "react";

function NavigationMenuDropdown({
  title,
  submenus,
  path,
  delay = 100,
  isBreadcrumb = false,
}: {
  title: string;
  path?: string;
  submenus: Readonly<
    (
      | { type: "link"; title: string; path: string }
      | {
          type: "dropdown";
          title: string;
          path?: string;
          items: Readonly<{ title: string; path: string }[]>;
        }
    )[]
  >;
  delay?: number;
  isBreadcrumb?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <TouchProvider>
      <HybridHoverCard
        open={open}
        onOpenChange={setOpen}
        openDelay={delay}
        closeDelay={50}
      >
        {/* asChild ensures this isn't an anchor element, so no href is needed (improves lighthouse SEO score) */}
        <HybridHoverCardTrigger asChild>
          <Button
            variant="ghost"
            className={cn("group relative font-gotham hover:bg-transparent", {
              "-ml-2 font-sans font-normal": isBreadcrumb,
            })}
            onClick={() => setOpen(true)}
          >
            <span
              className={cn(
                "text-base decoration-[#B34696] decoration-2 underline-offset-4 group-hover:underline",
                { "text-xs min-[350px]:text-sm": isBreadcrumb },
              )}
            >
              {path ? <a href={path}>{title}</a> : title}
            </span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </HybridHoverCardTrigger>
        <HybridHoverCardContent className="z-[999] flex w-fit flex-col p-3">
          {submenus.map((menu, idx) => {
            if (menu.type === "link") {
              return (
                <NavigationMenuItemDesktop
                  path={menu.path}
                  title={menu.title}
                  key={idx}
                  className={isBreadcrumb ? "text-sm sm:text-base" : ""}
                />
              );
            }

            if (menu.type === "dropdown") {
              return (
                <Accordion type="multiple" key={menu.title}>
                  <AccordionItem
                    value={menu.title}
                    className="border-none"
                    date-state="open"
                  >
                    <AccordionTrigger className="h-10 min-w-72 rounded-xl p-3 font-gotham text-lg hover:bg-gray-50 hover:no-underline">
                      {!!menu.path ? (
                        <a
                          href={menu.path}
                          className="decoration-[#B34696] underline-offset-4 hover:underline"
                        >
                          {menu.title}
                        </a>
                      ) : (
                        menu.title
                      )}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-0">
                      {menu.items.map((item, idx) => {
                        console.log(item.title);
                        return (
                          <AccordionItem
                            key={idx}
                            value={item.title}
                            className={cn(
                              "border-none p-2 font-gotham text-lg italic decoration-[#B34696] underline-offset-4",
                              { "text-md": isBreadcrumb },
                            )}
                          >
                            <a href={item.path} className="hover:underline">
                              {item.title}
                            </a>
                          </AccordionItem>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }
          })}
        </HybridHoverCardContent>
      </HybridHoverCard>
    </TouchProvider>
  );
}

export default NavigationMenuDropdown;
