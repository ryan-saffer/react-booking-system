import { Button } from "../ui/button";

function NavigationMenuItem({ path, title }: { path: string; title: string }) {
  return (
    <Button variant="ghost" className="font-semibold justify-start">
      <a href={path}>{title}</a>
    </Button>
  );
}

export default NavigationMenuItem;
