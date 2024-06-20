import { Button } from "../ui/button";

function NavigationMenuItem({ path, title }: { path: string; title: string }) {
  return (
    <Button variant="link" className="font-light font-gotham justify-start p-0">
      <a href={path} className="w-full text-start p-3">
        {title}
      </a>
    </Button>
  );
}

export default NavigationMenuItem;
