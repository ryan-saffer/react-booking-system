import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

function InstagramImageCarousel({
  images,
}: {
  images: { src: string; alt: string; href: string }[];
}) {
  return (
    <Carousel className="m-12">
      <CarouselContent>
        {images.map((image, idx) => (
          <CarouselItem
            key={idx}
            className="flex basis-full justify-center sm:basis-1/3 lg:basis-1/5"
          >
            <a href={image.href}>
              <img
                src={image.src}
                alt={image.alt}
                className="h-60 w-60 rounded-md object-cover"
              />
            </a>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default InstagramImageCarousel;
