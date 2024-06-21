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
    <div className={cn("border-b px-12 py-4", { "border-0 px-4": isNested })}>
      <a href={path} className="block w-full font-medium hover:underline">
        {title}
      </a>
    </div>
  );
}

export default NavigationMenuItemMobile;
