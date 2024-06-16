import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import NavigationMenuDropdown from "./navigation-menu-dropdown";
import NavigationMenuItem from "./navigation-menu-item";

function NavigationMenu() {
  return (
    <>
      <nav className="hidden min-[900px]:block">
        <NavigationMenuItem title="Fizz Facts" path="/fizz-facts" />
        <NavigationMenuDropdown
          title="Fizz In Studio"
          path="/studios"
          submenus={[
            { path: "/parties", title: "Parties" },
            { path: "/holiday-programs", title: "Holiday Programs" },
            { path: "/after-school-program", title: "After School Program" },
          ]}
        />
        <NavigationMenuDropdown
          title="Fizz In Schools"
          path="/schools"
          submenus={[
            { path: "/after-school-program", title: "After School Program" },
            { path: "/incursions", title: "Incursions" },
            { path: "/celebrations", title: "School Celebrations" },
          ]}
        />
        <NavigationMenuItem
          title="Fizz Activation and Events"
          path="/activations-and-events"
        />
        <NavigationMenuItem title="Fizz Family" path="/fizz-family" />
      </nav>

      <nav className="min-[900px]:hidden">
        <Button variant="ghost">
          <Menu color="#E81070" className="h-6 w-6" />
        </Button>
      </nav>
    </>
  );
}

export default NavigationMenu;
