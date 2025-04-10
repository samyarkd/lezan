import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import AnimatedSticker from "~/components/animated-stickers";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";

export const CarouselSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="flex flex-col">
      <Carousel setApi={setApi} className="my-auto w-full">
        <CarouselContent>
          <CarouselItem>
            <AnimatedSticker
              title="Language Learning AI"
              desc="Learn new languages with AI-driven flashcards, quizzes, and interactive learning. Pick up a book/movie/lyric/etc and start reading it with Lezan."
              data={{ src: "/ass/flashcards.json" }}
            />
          </CarouselItem>
          <CarouselItem>
            <AnimatedSticker
              title="Phrase"
              desc="Enter a phrase in your target language to begin your learning journey."
              data={{ src: "/ass/phrase.json" }}
            />
          </CarouselItem>
          <CarouselItem>
            <AnimatedSticker
              title="Learn"
              desc="Review flashcards generated from your phrase to enhance your vocabulary."
              data={{ src: "/ass/learn.json" }}
            />
          </CarouselItem>
          <CarouselItem>
            <AnimatedSticker
              title="Quiz"
              desc="Evaluate your understanding with an AI-generated quiz tailored to your chosen phrase."
              data={{ src: "/ass/quiz.json" }}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
      <Button
        onClick={() => {
          if (current === count) {
            api?.scrollTo(0);
          } else {
            api?.scrollNext();
          }
        }}
        variant="secondary"
        className="mx-auto flex w-min"
      >
        Learn More <ChevronRight />
      </Button>
    </div>
  );
};
