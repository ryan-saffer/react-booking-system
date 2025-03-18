import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

import type { CustomImage } from "@/types/types";

function ImageCarousel({
  images,
  loop = false,
}: {
  images: CustomImage[];
  loop?: boolean;
}) {
  return (
    <Carousel className="m-12" opts={{ loop }}>
      <CarouselContent>
        {images.map((image, idx) => (
          <CarouselItem
            key={idx}
            className="flex basis-full justify-center sm:basis-1/3 lg:basis-1/5"
          >
            <img
              src={image.image.src}
              alt={image.alt}
              className="h-60 w-60 rounded-md object-cover"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default ImageCarousel;
