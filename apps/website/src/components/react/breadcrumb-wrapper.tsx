import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/react-ui/breadcrumb";

export function BreadcrumbWrapper({
  items,
}: {
  items: (
    | { type: "link"; title: string; path: string }
    | { type: "not-link"; title: string }
  )[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {items.slice(0, -1).map((child) => {
          if (child.type === "link") {
            return (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={child.path}>
                    {child.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator />
              </>
            );
          } else {
            return (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <span>{child.title}</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator />
              </>
            );
          }
        })}
        <BreadcrumbItem>
          <BreadcrumbPage>{items[items.length - 1].title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
