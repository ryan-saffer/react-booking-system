import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

import { Info } from "lucide-react";

export function HoverTag({
  color,
  text,
  tooltip,
}: {
  color: string;
  text: string;
  tooltip: string;
}) {
  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild tabIndex={0}>
        <div
          className="flex cursor-pointer items-center gap-2 text-nowrap font-semibold"
          style={{ color: color }}
        >
          {text}
          <Info className="h-4 w-4" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="max-w-[220px] text-center" side="top">
        <p>{tooltip}</p>
      </HoverCardContent>
    </HoverCard>
  );
}
