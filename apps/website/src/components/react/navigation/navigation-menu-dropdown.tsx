import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import NavigationMenuItemDesktop from "./navigation-menu-item-desktop";

function NavigationMenuDropdown({
  title,
  submenus,
}: {
  title: string;
  submenus: Readonly<{ title: string; path: string }[]>;
}) {
  return (
    <HoverCard openDelay={100} closeDelay={50}>
      {/* asChild ensures this isn't an anchor element, so no href is needed (improves lighthouse SEO score */}
      <HoverCardTrigger asChild>
        <Button variant="ghost" className="font-gotham font-light">
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
