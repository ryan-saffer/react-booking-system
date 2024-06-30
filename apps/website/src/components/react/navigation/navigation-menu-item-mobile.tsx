import { cn } from "../lib/utils";

function NavigationMenuItemMobile({
  title,
  path,
  nested,
  italic = false,
}: {
  title: string;
  path: string;
  nested: boolean;
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
      </a>
    </div>
  );
}

export default NavigationMenuItemMobile;
