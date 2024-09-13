import { Button } from "../ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import NavigationMenuItemDesktop from "./navigation-menu-item-desktop";
import { cn } from "../lib/utils";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

function NavigationMenuDropdown({
  title,
  subtitle,
  submenus,
  path,
  delay = 100,
  isBreadcrumb = false,
}: {
  title: string;
  path?: string;
  subtitle?: string;
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
    <Popover open={open} onOpenChange={setOpen}>
      {/* asChild ensures this isn't an anchor element, so no href is needed (improves lighthouse SEO score) */}
      <PopoverTrigger asChild>
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
            {title}
          </span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[999] flex w-fit flex-col p-3">
        {subtitle && (
          <Button
            variant="link"
            className={cn(
              "text-md group justify-start border border-[#9044E2] bg-[#9044E2] p-4 text-start font-gotham text-white hover:bg-[#9044E2]/70 hover:no-underline",
            )}
          >
            <a
              href={path}
              className="w-full p-3 text-start decoration-[#9044E2] decoration-2 underline-offset-4"
            >
              {subtitle}
            </a>
            <ArrowRight />
          </Button>
        )}
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
        })}
      </PopoverContent>
    </Popover>
  );
}

export default NavigationMenuDropdown;
