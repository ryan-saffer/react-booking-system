import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/react-ui/carousel";

import { Button } from "../ui/button";
import type { GetImageResult } from "astro";

function CardCarousel({
  items,
}: {
  items: {
    image: GetImageResult;
    imageAlt: string;
    title: string;
    content: string;
    buttonText: string;
    buttonPath: string;
  }[];
}) {
  return (
    <Carousel className="mx-12 my-4">
      <CarouselContent className="my-4">
        {items.map((item, idx) => (
          <CarouselItem
            key={idx}
            className="basis-full sm:basis-1/2 md:basis-1/3"
          >
            <div className="flex h-full min-h-[520px] flex-col rounded-2xl border bg-white shadow-sm">
              <img
                className="h-[250px] w-full rounded-t-2xl object-cover"
                src={item.image.src}
                alt={item.imageAlt}
              />
              <div className="flex h-full flex-col justify-between p-6">
                <div>
                  <p className="mb-2 font-lilita text-2xl">{item.title}</p>
                  <p className="text-sm">{item.content}</p>
                </div>
                <Button
                  asChild
                  className="rounded-full bg-[#F6BA34] font-semibold uppercase hover:bg-[#9044E2]"
                >
                  <a href={item.buttonPath}>{item.buttonText}</a>
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default CardCarousel;
