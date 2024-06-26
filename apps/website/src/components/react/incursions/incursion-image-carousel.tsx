import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

import type { GetImageResult } from "astro";

function IncursionImageCarousel({ images }: { images: GetImageResult[] }) {
  return (
    <Carousel className="m-12">
      <CarouselContent>
        {images.map((image, idx) => (
          <CarouselItem
            key={idx}
            className="flex basis-full justify-center sm:basis-1/3 lg:basis-1/5"
          >
            <img
              src={image.src}
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

export default IncursionImageCarousel;
