import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/react-ui/breadcrumb";

import { Fragment } from "react/jsx-runtime";
import NavigationMenuDropdown from "./navigation/navigation-menu-dropdown";

export function BreadcrumbWrapper({
  items,
}: {
  items: (
    | { type: "link"; title: string; path: string }
    | { type: "not-link"; title: string }
    | {
        type: "dropdown";
        title: string;
        items: { title: string; path: string }[];
      }
  )[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {items.map((child, idx) => {
          let result;
          if (child.type === "link") {
            result = (
              <BreadcrumbItem>
                <BreadcrumbLink href={child.path}>{child.title}</BreadcrumbLink>
              </BreadcrumbItem>
            );
          } else if (child.type === "not-link") {
            result = (
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <span>{child.title}</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
            );
          } else {
            // child.type === 'dropwdown'
            result = (
              <BreadcrumbItem>
                <NavigationMenuDropdown
                  className="-ml-2 font-sans font-normal"
                  title={child.title}
                  submenus={child.items}
                  delay={400}
                />
              </BreadcrumbItem>
            );
          }
          return (
            <Fragment key={idx}>
              {result}
              {idx !== items.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
