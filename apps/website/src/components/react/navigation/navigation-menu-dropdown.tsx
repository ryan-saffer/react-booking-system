import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import NavigationMenuItem from "./navigation-menu-item";

function NavigationMenuDropdown({
  title,
  path,
  submenus,
}: {
  title: string;
  path: string;
  submenus: { title: string; path: string }[];
}) {
  return (
    <HoverCard openDelay={100} closeDelay={50}>
      {/* asChild ensures this isn't an anchor element, so no href is needed (improves lighthouse SEO score */}
      <HoverCardTrigger asChild>
        <Button variant="ghost" className="font-gotham font-light">
          {title}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="flex flex-col p-3">
        {submenus.map((menu, idx) => (
          <NavigationMenuItem path={menu.path} title={menu.title} key={idx} />
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}

export default NavigationMenuDropdown;
