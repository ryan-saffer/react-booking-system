import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/react-ui/carousel";
import type { ReactNode } from "react";

import { Button } from "../ui/button";

type ImageSlot =
  "image1" | "image2" | "image3" | "image4" | "image5" | "image6";

type Props = {
  items: {
    imageSlot: ImageSlot;
    title: string;
    content: string;
    buttonText: string;
    buttonPath: string;
  }[];
} & Partial<Record<ImageSlot, ReactNode>>;

function CardCarousel({
  items,
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
}: Props) {
  const images: Record<ImageSlot, ReactNode> = {
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
  };

  return (
    <Carousel className="mx-12 my-4">
      <CarouselContent className="my-4">
        {items.map((item) => (
          <CarouselItem
            key={item.imageSlot}
            className="basis-full sm:basis-1/2 md:basis-1/3"
          >
            <div className="flex h-full min-h-[520px] flex-col rounded-2xl border bg-white shadow-sm">
              <div className="h-[250px] shrink-0 overflow-hidden rounded-t-2xl [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                {images[item.imageSlot]}
              </div>
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
