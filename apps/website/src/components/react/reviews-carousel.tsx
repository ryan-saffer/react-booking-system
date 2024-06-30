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
          <CarouselItem
            className="basis-full justify-stretch md:basis-1/2"
            key={idx}
          >
            <div className="flex h-full min-h-60 flex-col items-stretch justify-between rounded-lg border p-8">
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
