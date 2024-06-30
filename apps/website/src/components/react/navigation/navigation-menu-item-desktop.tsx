import { Button } from "../ui/button";

function NavigationMenuItemDesktop({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  return (
    <Button variant="link" className="justify-start p-0 font-gotham font-light">
      <a href={path} className="w-full p-3 text-start">
        {title}
      </a>
    </Button>
  );
}

export default NavigationMenuItemDesktop;
