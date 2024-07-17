import { Button } from "../ui/button";
import type { HTMLAttributes } from "react";
import { cn } from "../lib/utils";

function NavigationMenuItemDesktop({
  path,
  title,
  className = "",
}: {
  path: string;
  title: string;
  className?: HTMLAttributes<any>["className"];
}) {
  return (
    <Button
      variant="link"
      className={cn(
        "text-md group justify-start p-0 font-gotham hover:no-underline",
        className,
      )}
    >
      <a
        href={path}
        className="w-full p-3 text-start decoration-[#B14795] decoration-2 underline-offset-4 group-hover:underline"
      >
        {title}
      </a>
    </Button>
  );
}

export default NavigationMenuItemDesktop;
