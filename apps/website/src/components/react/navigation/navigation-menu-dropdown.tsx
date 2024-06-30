import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import NavigationMenuItemDesktop from "./navigation-menu-item-desktop";
import { cn } from "../lib/utils";
import { useState } from "react";

function NavigationMenuDropdown({
  title,
  submenus,
  className = "",
  delay = 100,
}: {
  title: string;
  submenus: Readonly<{ title: string; path: string }[]>;
  delay?: number;
  className?: React.HTMLAttributes<any>["className"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard
      open={open}
      onOpenChange={setOpen}
      openDelay={delay}
      closeDelay={50}
    >
      {/* asChild ensures this isn't an anchor element, so no href is needed (improves lighthouse SEO score) */}
      <HoverCardTrigger>
        <Button
          variant="ghost"
          className={cn("font-gotham font-light", className)}
          onClick={() => setOpen(true)}
        >
          {title}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="flex flex-col p-3">
        {submenus.map((menu, idx) => (
          <NavigationMenuItemDesktop
            path={menu.path}
            title={menu.title}
            key={idx}
          />
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}

export default NavigationMenuDropdown;
