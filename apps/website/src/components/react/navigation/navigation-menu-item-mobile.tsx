import { cn } from "../lib/utils";

function NavigationMenuItemMobile({
  title,
  path,
  isNested,
}: {
  title: string;
  path: string;
  isNested: boolean;
}) {
  return (
    <div className={cn("px-12 py-4 border-b", { "border-0 px-4": isNested })}>
      <a href={path} className="font-medium w-full block">
        {title}
      </a>
    </div>
  );
}

export default NavigationMenuItemMobile;
