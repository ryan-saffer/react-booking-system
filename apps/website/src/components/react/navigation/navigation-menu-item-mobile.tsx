import { cn } from "../lib/utils";
import { Badge } from "../ui/badge";

function NavigationMenuItemMobile({
  title,
  path,
  nested,
  isNew = false,
  italic = false,
}: {
  title: string;
  path: string;
  nested: boolean;
  isNew?: boolean;
  italic?: boolean;
}) {
  return (
    <div
      className={cn("border-b px-12 py-4", {
        "border-0 px-4": nested,
      })}
    >
      <a
        href={path}
        className={cn("block w-full font-medium hover:underline", {
          italic: italic,
        })}
      >
        {title}
        {isNew && <Badge className="ml-2">New!</Badge>}
      </a>
    </div>
  );
}

export default NavigationMenuItemMobile;
