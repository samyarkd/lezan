"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Flashcard } from "~/app/flashcards/[f_id]/flashcard";
import AnimatedSticker from "~/components/animated-stickers";
import Typography from "~/components/typography";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";
import { useGetRandomFlashcards } from "~/hooks/api.hooks";

const RandomFlashcardsPage: React.FC = () => {
  const randomQuery = useGetRandomFlashcards();
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const authedUser = useSession();

  useEffect(() => {
    if (!api) return;
    const updateStates = () => {
      setCanScrollNext(api.canScrollNext());
      setCanScrollPrev(api.canScrollPrev());
    };
    updateStates();
    api.on("select", updateStates);
    return () => {
      api.off("select", updateStates);
    };
  }, [api]);

  if (authedUser.status !== "authenticated") {
    return (
      <AnimatedSticker
        title="Sign In"
        desc="This feature requires you to SignIn for accessing it."
        data={{ src: "/ass/waving_dog.json" }}
      />
    );
  }

  if (randomQuery.isFetching) {
    return (
      <AnimatedSticker
        title="Fetching"
        desc="Loading random flashcards"
        data={{ src: "/ass/running_dog.json" }}
      />
    );
  }

  if (!randomQuery.data?.ok) {
    return null;
  }

  const items = randomQuery.data.output.items;

  return (
    <div className="isolate my-auto flex w-full max-w-2xl flex-col justify-center gap-4 px-4 pt-4">
      <Carousel setApi={setApi} className="relative w-full max-w-2xl">
        <CarouselContent>
          {items.map((i, idx) => (
            <CarouselItem key={idx}>
              <Flashcard content={i} flashcardId={i.id} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="mb-32 flex flex-col gap-4 text-center">
        <Typography variant="muted">Click to flip</Typography>
        <div className="flex flex-wrap justify-between">
          <Button
            variant="secondary"
            disabled={!canScrollPrev}
            onClick={() => api?.scrollPrev()}
          >
            Prev
          </Button>
          <Button disabled={!canScrollNext} onClick={() => api?.scrollNext()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RandomFlashcardsPage;

