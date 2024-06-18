import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import NavigationMenuItem from "./navigation-menu-item";
import { useState } from "react";

function NavigationMenuDropdown({
  title,
  path,
  submenus,
}: {
  title: string;
  path: string;
  submenus: { title: string; path: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard
      openDelay={200}
      closeDelay={100}
      open={open}
      onOpenChange={setOpen}
    >
      <HoverCardTrigger>
        <Button
          variant="ghost"
          className="font-semibold"
          onClick={() => setOpen(true)}
        >
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
