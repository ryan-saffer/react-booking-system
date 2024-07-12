import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

function ReviewsCarousel({
  reviews,
}: {
  reviews: { review: string; writtenBy: string; writtenYear: string }[];
}) {
  return (
    <Carousel className="m-12" opts={{ loop: true, align: "start" }}>
      <CarouselContent>
        {reviews.map((review, idx) => (
          <CarouselItem className="basis-full md:basis-1/2" key={idx}>
            <div className="flex h-auto flex-col justify-between rounded-lg border bg-white p-8 md:h-full">
              <p className="font-gotham text-sm italic">"{review.review}"</p>
              <p className="text-right text-sm font-semibold text-gray-500">
                - {review.writtenBy} | {review.writtenYear}
              </p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default ReviewsCarousel;
